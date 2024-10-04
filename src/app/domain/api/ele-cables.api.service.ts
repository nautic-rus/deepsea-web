import { Injectable } from '@angular/core';
import * as props from "../../props";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class EleCablesApiService {

  constructor(private http: HttpClient) { }
  getCables(): Observable<any> {
    return this.http.get(props.httpD + '/cables');
  }
}
