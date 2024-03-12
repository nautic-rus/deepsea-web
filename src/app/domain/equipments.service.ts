import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {IEquipment} from "./interfaces/equipments";
import { Observable } from 'rxjs';
import * as props from "../props";
import {Isfi} from "./interfaces/sfi";
import {EquipmentsFiles} from "./classes/equipments-files";


@Injectable({
  providedIn: 'root'
})
export class EquipmentsService {


  waitingCreateFiles: any = [];
  createFiles: EquipmentsFiles[] = [];
  constructor(private http: HttpClient) {
  }


  // setWaitingCreateSupplierFiles(waitingCreateEqFiles:any[]) {
  //   this.waitingCreateFiles = waitingCreateEqFiles;
  // }
  //
  // getWaitingCreateSupplierFiles() {
  //   return(this.waitingCreateFiles);
  // }
  //
  // setCreateSupplierFiles(createEqFiles:any[]) {
  //   this.createFiles = createEqFiles;
  // }
  //
  // getCreateSupplierFiles() {
  //   return(this.createFiles);
  // }

  setWaitingCreateFiles(waitingCreateFiles:any[]) {
    this.waitingCreateFiles = waitingCreateFiles;
  }

  getWaitingCreateFiles() {
    return(this.waitingCreateFiles);
  }

  setCreateFiles(createFiles:any[]) {
    this.createFiles = createFiles;
  }

  getCreateFiles() {
    return(this.createFiles);
  }

  getEquipments(): Observable<IEquipment[]> {
    return this.http.get<IEquipment[]>(props.http + '/equipments');
  }

  getSfis() :  Observable<Isfi[]> {
    return this.http.get<Isfi[]>(props.http + '/sfis');
  }


  addEquipment(jsonValue: string) :  Observable<string> {
    return this.http.post<string>(props.http + '/equipment', jsonValue);
  }

  deleteEquipment(id: number) :  Observable<string> {
    return this.http.get<string>(props.http + '/deleteEquipment', {params: {id}});
  }

  addEquipmentFiles(jsonValue: string) :  Observable<string> {
    return this.http.post<string>(props.http + '/addEquipFile', jsonValue);
  }

  addSupplier(jsonValue: string) :  Observable<string> {
    return this.http.post<string>(props.http + '/supplier', jsonValue);
  }

}
