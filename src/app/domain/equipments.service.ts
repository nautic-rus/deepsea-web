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
  constructor(private http: HttpClient) {}

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

  getSupplierNames() : Observable<any> {
    return  this.http.get<string>(props.http + '/supNames');
  }

  addSupplierName(jsonValue: string) :  Observable<string> {  //добавление в таблицу suppliers_name
    return this.http.post<string>(props.http + '/addSupName', jsonValue);
  }

  addSupplier(jsonValue: string) :  Observable<string> {
    return this.http.post<string>(props.http + '/supplier', jsonValue);
  }

  deleteSupplier(id: number) : Observable<any> {
    return this.http.get<string>(props.http + '/deleteSupplier', {params: {id}});
  }

  getRelatedTasks(id: number): Observable<any> {  //передаем индекс поставщика
    return this.http.get<string>(props.http + '/relatedTasks', {params: {id}});
  }

  addRelatedSupplierTasks(jsonValue: string): Observable<any> {
    return this.http.post<string>(props.http + '/supTaskAdd', jsonValue);
  }

  deleteRelatedTask(id: number) :  Observable<any> {  //передаем уникальный айди и удаляем связь из таблицы sup_task_relation
    return this.http.get<string>(props.http + '/delRelatedTask', {params: {id}});
  }

  getRelatedMaterials(supId: number): Observable<any> {  //передаем индекс поставщика
    return this.http.get<string>(props.http + '/eqSupMatRelations', {params: {supId}});
  }

  getSupplierStatuses(): Observable<any> {
    return this.http.get<string>(props.http + '/supStatuses');
  }

  getSupplierHistory(id: number): Observable<any> {
    return this.http.get<string>(props.http + '/supHistory', {params: {id}});
  }

  addSupplierHistory(jsonValue: string) :  Observable<string> {
    return this.http.post<string>(props.http + '/addSupHistory', jsonValue);
  }

  addEquipmentFiles(jsonValue: string) :  Observable<string> {
    return this.http.post<string>(props.http + '/addEquipFile', jsonValue);
  }


  getEquipmentFiles(id: number): Observable<any> {  //получаем файлы оборудования по id
    return this.http.get<string>(props.http + '/equipFiles', {params: {id}});
  }

  deleteEquipmentFile(id: number) :  Observable<string> {
    return this.http.get<string>(props.http + '/delEquipFile', {params: {id}});
  }

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
}
