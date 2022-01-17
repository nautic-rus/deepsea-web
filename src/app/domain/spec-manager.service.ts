import { Injectable } from '@angular/core';
import {CookieService} from "ngx-cookie-service";
import {HttpClient} from "@angular/common/http";
import * as props from "../props";

@Injectable({
  providedIn: 'root'
})
export class SpecManagerService {
  constructor(private cookie: CookieService, private http: HttpClient) { }
  async getTrayBundles(project: string) {
    return await this.http.get<any>(props.httpSpec + '/trayBundles', {params: {project}}).toPromise();
  }
  async getTraysByZonesAndSystems(project: string, docNumber: string) {
    return await this.http.get<any>(props.httpSpec + '/traysByZonesAndSystems', {params: {project, docNumber}}).toPromise();
    //return await this.http.get<any>('assets/test.json', {params: {project, docNumber}}).toPromise();
  }
  async getTraySpec(project: string, docNumber: string, revision: string) {
    return await this.http.get<any>(props.httpSpec + '/traySpec', {params: {project, docNumber, revision}}).toPromise();
  }
  async getHullPatList(project: string, docNumber: string) {
    return await this.http.get<any>(props.httpSpec + '/hullPartList', {params: {project, docNumber}}).toPromise();
  }
  async fixTrayBundle(project: string, docNumber: string) {
    return await this.http.get<any>(props.httpSpec + '/fixTrayBundle', {params: {project, docNumber}}).toPromise();
  }
}
