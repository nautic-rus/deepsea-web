import { Injectable } from '@angular/core';
import * as props from "../../../props";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class PageService {

  constructor(private http: HttpClient) { }

  getPages() {
    return this.http.get<any>(props.http + '/pages');
  }
}
