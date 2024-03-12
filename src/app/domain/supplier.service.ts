import { Injectable } from '@angular/core';
import {EquipmentsFiles} from "./classes/equipments-files";
import {HttpClient} from "@angular/common/http";
import {SupplierFiles} from "./classes/supplier-files";

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
}
