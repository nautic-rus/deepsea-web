import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import * as props from "../../../props";

@Injectable({
  providedIn: 'root'
})
export class CableService {

  constructor(private http: HttpClient) { }

  getCablesBySystems(project: string, docNumber: string) {
    return this.http.get<any>(props.httpSpec + '/cablesBySystems', { params: {project, docNumber}});
  }
}
