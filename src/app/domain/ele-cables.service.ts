import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {IEquipment} from "./interfaces/equipments";
import * as props from "../props";
import {EleCablesApiService} from "./api/ele-cables.api.service";

@Injectable({
  providedIn: 'root'
})
export class EleCablesService {

  cables = [];

  constructor(
    private readonly eleCablesApi: EleCablesApiService,
    private http: HttpClient
  ) { }

  // getCables() {
  //   this.eleCablesApi.getCables().subscribe(res => {
  //     this.cables = res;
  //     console.log(this.cables)
  //   })
  // }

  getCables(): Observable<any> {
    return this.http.get(props.httpD + '/cables');
  }


}
