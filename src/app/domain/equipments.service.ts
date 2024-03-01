import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {IEquipment} from "./interfaces/equipments";
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EquipmentsService {

  constructor(private http: HttpClient) {
  }

  private jsonUrl = 'https://deep-sea.ru/rest';

  getEquipments(): Observable<IEquipment[]> {
    return this.http.get<IEquipment[]>('https://deep-sea.ru/rest/equipments');
  }
}
