<?php

require_once 'image_locator.php';

$folder = $_GET['folder'];

if (!does_folder_exists($folder)) {
    echo json_encode(['success'=> false, 'error' => 'Folder does not exist.']);
    exit(0);
}

$page = (int)($_GET['page'] ?: 1);
$page_size = (int)($_GET['pageSize'] ?: 10);

$result = get_images($folder, $page, $page_size);
$result['success'] = true;

echo json_encode($result);