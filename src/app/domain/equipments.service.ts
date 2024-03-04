import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {IEquipment} from "./interfaces/equipments";
import { Observable } from 'rxjs';
import * as props from "../props";

@Injectable({
  providedIn: 'root'
})
export class EquipmentsService {

  //equipments:any[] = [];
  constructor(private http: HttpClient) {
  }

  getEquipments(): Observable<IEquipment[]> {
    return this.http.get<IEquipment[]>(props.http + '/equipments');
  }
}
