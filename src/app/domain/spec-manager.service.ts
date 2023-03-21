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
  async getPipeEspFiles(docNumber: string, revision: string, bySpool: string, lang: string) {
    return await this.http.get<any>(props.httpSpec + '/pipeEspFiles', {params: {docNumber, revision, bySpool, lang}}).toPromise();
  }
  async getDevicesEspFiles(docNumber: string, revision: string, lang: string) {
    return await this.http.get<any>(props.httpSpec + '/devicesEspFiles', {params: {docNumber, revision, lang}}).toPromise();
  }
  async getAccommodationsEspFiles(docNumber: string, revision: string, lang: string) {
    return await this.http.get<any>(props.httpSpec + '/accommodationsEspFiles', {params: {docNumber, revision, lang}}).toPromise();
  }
  async getElecEspFiles(project: string, docNumber: string, docName: string, revision: string) {
    return await this.http.get<any>(props.httpSpec + '/elecEspFiles', {params: {project, docNumber, docName, revision}}).toPromise();
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
  async getHullNestingByProjectPlates(project: string) {
    return await this.http.get<any>(props.httpSpec + '/hullNestingByProjectPlates', {params: {project}}).toPromise();
  }
  async getHullNestingByProjectProfiles(project: string) {
    return await this.http.get<any>(props.httpSpec + '/hullNestingByProjectProfiles', {params: {project}}).toPromise();
  }
  async createCNC(lines: string[], user: string) {
    return await this.http.post<string[]>(props.httpSpec + '/createCNC', JSON.stringify(lines), {params: {user}}).toPromise();
  }
  async createESSI(lines: string[], user: string) {
    return await this.http.post<string[]>(props.httpSpec + '/createESSI', JSON.stringify(lines), {params: {user}}).toPromise();
  }
  async createTAP(lines: string[], user: string) {
    return await this.http.post<string[]>(props.httpSpec + '/createTAP', JSON.stringify(lines), {params: {user}}).toPromise();
  }
  async insertNestLock(project: string, nestId: string, user: string) {
    return await this.http.get<string>(props.httpSpec + '/insertNestLock', {params: {project, nestId, user}}).toPromise();
  }
  async getBsDesignNodes(project: string) {
    return await this.http.get<any[]>(props.httpSpec + '/bsDesignNodes', {params: {project}}).toPromise();
  }
  async getHullSystems(project: string) {
    return await this.http.get<any[]>(props.httpSpec + '/hullSystems', {params: {project}}).toPromise();
  }
  async getPipeSegs(docNumber: string) {
    return await this.http.get<any[]>(props.httpSpec + '/pipeSegs', {params: {docNumber}}).toPromise();
  }
  async getSpoolFiles(docNumber: string, spool: string, isom: number) {
    return await this.http.get(props.httpSpec + '/spoolFiles', {responseType: 'arraybuffer', params: {docNumber, spool, isom}}).toPromise();
  }
  async getSpoolLocks(docNumber: string) {
    return await this.http.get<any[]>(props.httpSpec + '/spoolLocks', {params: {docNumber}}).toPromise();
  }
  async setSpoolLock(spoolLock: any) {
    return await this.http.post<any[]>(props.httpSpec + '/setSpoolLock', JSON.stringify(spoolLock)).toPromise();
  }
  async getPipeSegsByProject(project: string) {
    return await this.http.get<any[]>(props.httpSpec + '/pipeSegsByProject', {params: {project}}).toPromise();
  }
  async getPipeSegsBilling(project: string) {
    return await this.http.get<any[]>(props.httpSpec + '/pipeSegs', {params: {project}}).toPromise();
  }
  async getDevices(docNumber: string) {
    return await this.http.get<any[]>(props.httpSpec + '/devices', {params: {docNumber}}).toPromise();
  }
  async getAccommodations(docNumber: string) {
    return await this.http.get<any[]>(props.httpSpec + '/accommodations', {params: {docNumber}}).toPromise();
  }
  async addDeviceToSystem(docNumber: string, stock: string, units: string, count: string, label: string, forLabel: string) {
    return await this.http.get<any[]>(props.httpSpec + '/addDeviceToSystem', {params: {docNumber, stock, units, count, label, forLabel}}).toPromise();
  }
  async removeDeviceFromSystem(docNumber: string, stock: string, units: string, count: string, label: string, forLabel: string) {
    return await this.http.get<any[]>(props.httpSpec + '/removeDeviceFromSystem', {params: {docNumber, stock, units, count, label, forLabel}}).toPromise();
  }
  async addGroupToSystem(docNumber: string, stock: string, userId: string) {
    return await this.http.get<any>(props.httpSpec + '/addGroupToSystem', {params: {docNumber, stock, userId}}).toPromise();
  }
  async setAccommodationLabel(docNumber: string, userId: string, oid: number) {
    return await this.http.get<any>(props.httpSpec + '/setAccommodationLabel', {params: {docNumber, userId, oid}}).toPromise();
  }
  async getEqFoundations(project: string) {
    return await this.http.get<any[]>(props.httpSpec + '/eqFoundations', {params: {project}}).toPromise();
  }
  async updateStatusEqFoundations(project: string, id: number, user: string) {
    return await this.http.get<any[]>(props.httpSpec + '/eqFoundationsUpdateStatus', {params: {project, id, user}}).toPromise();
  }
  async getElecInfo(project: string) {
    return await this.http.get<any[]>(props.httpSpec + '/elecInfo', {params: {project}}).toPromise();
  }
  createHullEsp(project: string, docNumber: string, rev: string, user: string, kind: string, taskId: number){
    return this.http.get<string>(props.httpSpec + '/createHullEsp', {params: {project, docNumber, rev, user, kind, taskId}});
  }
}
