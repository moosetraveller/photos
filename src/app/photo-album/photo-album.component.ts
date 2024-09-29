import { HttpClient } from '@angular/common/http';
import { Component, effect, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { JsonPipe } from '@angular/common';

type RequestResult = {
  total: number,
  images: Array<string>,
  folder: string,
  page: number,
  pageSize: number,
  totalPages: number,
  nextPages: Array<number>,
  previousPages: Array<number>,
};

@Component({
  selector: 'app-photo-album',
  standalone: true,
  imports: [JsonPipe],
  templateUrl: './photo-album.component.html',
  styleUrl: './photo-album.component.scss'
})
export class PhotoAlbumComponent {

  @ViewChild('photoAlbum')
  photoAlbum: ElementRef = null!

  @ViewChild('photoDialog')
  photoDialog: ElementRef = null!;

  page = signal(1);
  pageSize = signal(10);

  selectedFolder = signal('');

  photos = signal<RequestResult>({
    total: 0,
    images: [],
    folder: this.selectedFolder(),
    page: this.page(),
    pageSize: this.pageSize(),
    totalPages: 1,
    nextPages: [],
    previousPages: [],
  });

  openedPhoto = signal<number>(null!);

  folders = signal<Array<string>>([]);

  httpClient = inject(HttpClient);

  constructor() {
    
    this.httpClient.get('api/folders.php')
      .subscribe(folders => {
        this.folders.set(folders as Array<string>);
        this.selectedFolder.set(this.folders()[0]);
      });

    effect(() => {

      const element = this.photoAlbum.nativeElement as HTMLElement;
      element.classList.add('loading');
      
      const queryString = `folder=${this.selectedFolder()}&page=${this.page()}&pageSize=${this.pageSize()}`;
      
      this.httpClient.get(`api/photos.php?${queryString}`)
        .subscribe(photos => {

          this.photos.set(photos as RequestResult);
          element.classList.remove('loading');

          if (this.photoDialog.nativeElement?.open) {
            if (this.openedPhoto() == 0) {
              this.openedPhoto.set(this.photos().images.length-1);
            }
            else {
              this.openedPhoto.set(0);
            }
          }

        });
  
    });

  }

  onFolderChanged(folder: string): void {
    this.selectedFolder.set(folder);
  }

  onPageSizeChanged(pageSize: string): void {
    this.pageSize.set(parseInt(pageSize));
    this.page.set(1);
  }

  changePage(page: number): void {
    this.page.set(page);
  }

  onImageLoaded(event: Event) {
    const element = event.target as HTMLImageElement;
    element.style.opacity = '1'
  }

  download(photo: string, event: MouseEvent): void {
    
    event.preventDefault();
    event.stopPropagation();
    
    console.log('download');

  }

  open(photoIndex: number): void {
    this.openedPhoto.set(photoIndex);
    this.photoDialog.nativeElement?.showModal();
  }

  hasNextPhoto(): boolean {
    return this.openedPhoto() < this.photos().images.length-1 || this.page() < this.photos().totalPages;
  }

  nextPhoto(): void {
    if (this.photoDialog.nativeElement?.open) {
      const index = this.openedPhoto();
      if (index == this.photos().images.length-1) {
        if (this.page() < this.photos().totalPages) {
          this.page.set(this.page()+1);
        }
        return;
      }
      this.openedPhoto.set(index+1);
    }
  }

  hasPreviousPhoto(): boolean {
    return this.openedPhoto() > 0 || this.page() > 1;
  }

  previousPhoto(): void {
    if (this.photoDialog.nativeElement?.open) {
      const index = this.openedPhoto();
      if (index == 0) {
        if (this.page() != 1) {
          this.page.set(this.page()-1);
        }
        return;
      }
      this.openedPhoto.set(index-1);
    }
  }

  navigate(event: KeyboardEvent): void {

    switch (event.key) {
      case 'ArrowRight':
        this.nextPhoto();
        return;
      case 'ArrowLeft':
        this.previousPhoto();
        return
    }
  }
  
}
