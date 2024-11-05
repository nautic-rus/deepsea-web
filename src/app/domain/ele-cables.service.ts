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

  getPdfUrl(): Observable<any> {
    return this.http.get(props.httpD + '/cablesPdfUrl');
  }

  getPdfFileByUrl(url: string): Observable<any> {
    // let fullUrl = 'https://${origin}/rest-d' + url
    // return this.http.get(props.httpD + '/files', {params: {url}});
    const fullUrl = `${props.httpD}${url}`;
    return this.http.get(fullUrl)
  }

}
