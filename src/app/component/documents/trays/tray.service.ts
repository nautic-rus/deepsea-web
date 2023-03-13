import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import * as props from "../../../props";

@Injectable({
  providedIn: 'root'
})
export class TrayService {

  constructor(private http: HttpClient) { }

  getTraysBySystems(project: string, docNumber: string) {
    return this.http.get<any>(props.httpSpec + '/traysBySystems', { params: {project, docNumber}});
  }

  getCableBoxesBySystems(project: string, docNumber: string) {
    return this.http.get<any>(props.httpSpec + '/cableBoxesBySystems', { params: {project, docNumber}});
  }
}
