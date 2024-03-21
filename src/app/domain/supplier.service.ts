import { Injectable } from '@angular/core';
import {EquipmentsFiles} from "./classes/equipments-files";
import {HttpClient} from "@angular/common/http";
import {SupplierFiles} from "./classes/supplier-files";
import {Observable} from "rxjs";
import * as props from "../props";

@Injectable({
  providedIn: 'root'
})
export class SupplierService {

  waitingCreateFiles: any = [];
  createFiles: SupplierFiles[] = [];
  constructor(private http: HttpClient) {
  }

  setWaitingCreateFiles(waitingCreateEqFiles:any[]) {
    this.waitingCreateFiles = waitingCreateEqFiles;
  }

  getWaitingCreateFiles() {
    return(this.waitingCreateFiles);
  }

  setCreateFiles(createEqFiles:any[]) {
    this.createFiles = createEqFiles;
  }

  getCreateFiles() {
    return(this.createFiles);
  }

  addSupplierFiles(jsonValue: string) :  Observable<string> {
    return this.http.post<string>(props.http + '/addSupFile', jsonValue);
  }

  deleteSupplierFile(id: number) :  Observable<string> {
    return this.http.get<string>(props.http + '/delSupFile', {params: {id}});
  }

  getEquipmentFiles(id: number): Observable<any> {  //получаем файлы оборудования по id
    return this.http.get<string>(props.http + '/supFiles', {params: {id}});
  }
}
