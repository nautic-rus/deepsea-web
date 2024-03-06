import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {IEquipment} from "./interfaces/equipments";
import { Observable } from 'rxjs';
import * as props from "../props";
import {Isfi} from "./interfaces/sfi";


@Injectable({
  providedIn: 'root'
})
export class EquipmentsService {

  constructor(private http: HttpClient) {
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
  // postEquipment(): {
  //
  // }
}
