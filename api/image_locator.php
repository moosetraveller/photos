<?php

require_once 'config.php';

/**
 * Get folder names (categories).
 * 
 * @return string[] folder names
 */
function get_folders() 
{
    $folders = glob(IMAGE_FOLDER . '/*', GLOB_ONLYDIR);

    if ($folders)
    {
        $folder_names = array_map('basename', $folders);
        sort($folder_names);
        return $folder_names;
    }

    return [];
}

/**
 * Returns `true` if the folder exists.
 * 
 * @param string|null $folder folder name
 * @return bool `true` if the folder exists or no folder is given
 */
function does_folder_exists($folder) {
    if (!isset($folder) || $folder == '') {
        return true;
    }
    return file_exists(IMAGE_FOLDER . '/' . $folder);
}

/**
 * Gets all images from the folder.
 * 
 * @param string $folder folder name
 * @param int $page
 * @param int $page_size
 * @return array
 */
function get_images($folder, $page, $page_size) 
{
    $path = IMAGE_FOLDER . (isset($folder) && $folder != '' ? "/$folder" : '');

    $images = glob("$path/*.{jpg,jpeg,png,gif,bmp}", GLOB_BRACE);

    usort($images, function($a, $b) {
        return filectime($a) - filectime($b);
    });

    $total = count($images);

    $page = $page < 1 ? 1 : $page;

    if ($total == 0)
    {
        return [
            'total' => 0, 
            'images' => [], 
            'folder' => $folder, 
            'page' => $page, 
            'pageSize' => $page_size,
            'totalPages' => 1,
            'previousPages' => [],
            'nextPages' => [],
        ];
    }

    $total_pages = ceil($total / $page_size);
    $page = min($page, $total_pages);

    $previous_pages = range($page - PAGINATOR_SIZE, $page);
    $previous_pages = array_filter($previous_pages, function($value) use ($page) {
        return $value >= 1 && $value != $page;
    });

    $next_pages = range($page, $page + PAGINATOR_SIZE);
    $next_pages = array_filter($next_pages, function($value) use ($page, $total_pages) {
        return $value <= $total_pages && $value != $page;
    });

    return [
        'total' => $total,
        'images' => array_slice($images, ($page-1)*$page_size, $page_size),
        'folder' => $folder, 
        'page' => $page, 
        'pageSize' => $page_size,
        'totalPages' => $total_pages,
        'previousPages' => array_values($previous_pages),
        'nextPages' => array_values($next_pages),
    ];
}