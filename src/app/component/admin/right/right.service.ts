import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import * as props from "../../../props";
import {Roles} from "../../../domain/interfaces/roles";
import {Rights} from "../../../domain/interfaces/rights";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class RightService {

  constructor(private http: HttpClient) { }

  getRights() {
    console.log("fill rights")
    return this.http.get<any>(props.http + '/adminRights');
  }
  getRightDetails(name: string): Observable<Rights> {
    console.log(name);
    return this.http.get<Rights>(props.http + '/adminRightDetails', {params: {name}})
  }
  startRight(right: Rights) {
    console.log(right);
    return this.http.post<string>(props.http + '/startRight', JSON.stringify(right));
  }

  deleteRight(name: string) {
    console.log(name);
    return this.http.get<string>(props.http + '/deleteAdminRight', {params: {name}});
  }

  saveRight(right: Rights, name: string) {
    console.log(right);
    console.log(name);
    return this.http.post<string>(props.http + '/editAdminRight', JSON.stringify(right), {params: {name}});
  }


}
