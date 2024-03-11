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

  eqId: string;
  waitingCreateEqFiles: any = [];
  createEqFiles: EquipmentsFiles[] = [];
  constructor(private http: HttpClient) {
  }

  setEqID(eqId: string) {
    this.eqId = eqId;
  }

  setWaitingCreateEqFiles(waitingCreateEqFiles:any[]) {
    this.waitingCreateEqFiles = waitingCreateEqFiles;
  }

  getWaitingCreateEqFiles() {
    return(this.waitingCreateEqFiles);
  }

  setCreateEqFiles(createEqFiles:any[]) {
    this.createEqFiles = createEqFiles;
  }

  getCreateEqFiles() {
    return(this.createEqFiles);
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
    // @ts-ignore
    return this.http.delete(`${props.http} + '/equipment}/${id}`)
  }

  addEquipmentFiles(jsonValue: string) :  Observable<string> {
    return this.http.post<string>(props.http + '', jsonValue);
  }

  addSupplier(jsonValue: string) :  Observable<string> {
    return this.http.post<string>(props.http + '/supplier', jsonValue);
  }

}
