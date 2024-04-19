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
  getNewStorageUnit() {
    return this.http.get<any>(props.http + '/newStorageUnit');
  }
  getStorageFiles() {
    return this.http.get<any>(props.http + '/storageFiles');
  }
  getStorageLocations() {
    return this.http.get<any>(props.http + '/storageLocations');
  }
  updateStorageLocation(value: any) {
    return this.http.post<any>(props.http + '/updateStorageLocation', value);
  }
  updateStorageFile(storageFile: any) {
    return this.http.post<any>(props.http + '/updateStorageFile', storageFile);
  }
  updateStorageUnit(storageUnit: any) {
    return this.http.post<any>(props.http + '/updateStorageUnit', storageUnit);
  }
  uploadFile(file: File, fileName: string = file.name) {
    const formData: FormData = new FormData();
    formData.append('file', file, fileName);
    return this.http.post<any>(props.http + '/store-file', formData);
  }
}
