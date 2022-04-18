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
  async getHullBillPlates(project: string) {
    return await this.http.get<any>(props.httpSpec + '/hullBillPlates', {params: {project}}).toPromise();
  }
  async getHullBillProfiles(project: string) {
    return await this.http.get<any>(props.httpSpec + '/hullBillProfiles', {params: {project}}).toPromise();
  }
  async fixTrayBundle(project: string, docNumber: string) {
    return await this.http.get<any>(props.httpSpec + '/fixTrayBundle', {params: {project, docNumber}}).toPromise();
  }

  async getHullEspFiles(project: string, docNumber: string, docName: string, revision: string) {
    return await this.http.get<any>(props.httpSpec + '/hullEspFiles', {params: {project, docNumber, docName, revision}}).toPromise();
  }

  async hullPlates(project: string, material: string, thickness: number) {
    return await this.http.get<any>(props.httpSpec + '/hullPlates', {params: {project, material, thickness}}).toPromise();
  }
  async hullProfiles(project: string, material: string, kse: number) {
    return await this.http.get<any>(props.httpSpec + '/hullProfiles', {params: {project, material, kse}}).toPromise();
  }
  async hullPlatesWastage(project: string, kpl: number) {
    return await this.http.get<any>(props.httpSpec + '/hullPlatesWastage', {params: {project, kpl}}).toPromise();
  }
  async getCables(project: string, bundle: string, magistral: number): Promise<any[]> {
    return await this.http.get<any[]>(props.httpSpec + '/elecCables', {params: {project, bundle, magistral}}).toPromise();
    // return await this.http.get<any[]>('assets/test/cables.json', {params: {project, bundle, magistral}}).toPromise();
  }
  async getHullNesting(project: string) {
    return await this.http.get<any>(props.httpSpec + '/hullNesting', {params: {project}}).toPromise();
  }
  async getHullNestingBlocks(project: string) {
    return await this.http.get<any>(props.httpSpec + '/hullNestingBlocks', {params: {project}}).toPromise();
  }
  async getHullNestingMaterials(project: string, blocks: string) {
    return await this.http.post<any>(props.httpSpec + '/hullNestingMaterials', blocks, {params: {project}}).toPromise();
  }
  async getHullNestingByMaterials(project: string, materials: string) {
    return await this.http.post<any>(props.httpSpec + '/hullNestingByMaterials', materials,{params: {project}}).toPromise();
  }
  async createCNC(lines: string[], user: string) {
    return await this.http.post<string[]>(props.httpSpec + '/createCNC', JSON.stringify(lines), {params: {user}}).toPromise();
  }
  async insertNestLock(project: string, nestId: string, user: string) {
    return await this.http.get<string>(props.httpSpec + '/insertNestLock', {params: {project, nestId, user}}).toPromise();
  }
}
