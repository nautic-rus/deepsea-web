import { Injectable } from '@angular/core';
import {FileAttachment} from "./classes/file-attachment";
import * as props from "../props";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class StorageManagerService {

  constructor(private http: HttpClient) { }

  getStorageUnits() {
    return this.http.get<any>(props.http + '/storageUnits');
  }
  getStorageFiles() {
    return this.http.get<any>(props.http + '/storageFiles');
  }
  updateStorageFile(storageFile: any) {
    return this.http.post<any>(props.http + '/updateStorageFile', storageFile);
  }
  uploadFile(file: File, fileName: string = file.name) {
    const formData: FormData = new FormData();
    formData.append('file', file, fileName);
    return this.http.post<any>(props.http + '/store-file', formData);
  }
}
