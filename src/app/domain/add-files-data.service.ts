import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AddFilesDataService {
  title: string;
  filesTypeArray: string[];
  revList: string[]

  setData(title: string, filesTypeArray: string[], revList: string[]) {
    this.title = title;
    this.filesTypeArray = filesTypeArray;
    this.revList = revList;
  }

  getFilesTypeArray() {
    return this.filesTypeArray;
  }

  getRevList() {
    return this.revList;
  }

  getTitle() {
    return this.title;
  }
}
