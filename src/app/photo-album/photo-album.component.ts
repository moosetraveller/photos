import { HttpClient } from '@angular/common/http';
import { Component, computed, effect, ElementRef, inject, signal, ViewChild } from '@angular/core';
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
  
}
