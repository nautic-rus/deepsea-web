import { Injectable } from '@angular/core';
import {CookieService} from "ngx-cookie-service";
import {HttpClient} from "@angular/common/http";
import * as props from "../props";

@Injectable({
  providedIn: 'root'
})
export class SpecManagerService {
  constructor(private cookie: CookieService, private http: HttpClient) { }
  async getTraysByZonesAndSystems(project: string, zones: string[], systems: string[]) {
    return await this.http.get<any>(props.httpSpec + '/traysByZonesAndSystems', {params: {project, zones: JSON.stringify(zones), systems: JSON.stringify(systems)}}).toPromise();
  }
}