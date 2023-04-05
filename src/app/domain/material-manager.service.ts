import { Injectable } from '@angular/core';
import * as props from "../props";
import {CookieService} from "ngx-cookie-service";
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import {MessageService} from "primeng/api";
import {Material} from "./classes/material";
import {Project} from "./classes/project";
import {MaterialNode} from "./classes/material-node";

@Injectable({
  providedIn: 'root'
})
export class MaterialManagerService {

  constructor(private cookie: CookieService, private http: HttpClient, private router: Router, private messageService: MessageService) { }
  async getProjects() {
    return await this.http.get<Project[]>(props.http + '/projects').toPromise();
  }
  async getMaterials(project: string) {
    return await this.http.get<Material[]>(props.http + '/materials', {params: {project}}).toPromise();
  }
  async getMaterialsSummary(projects: string[], kinds: string[]) {
    return await this.http.get<Material[]>(props.httpSpec + '/materialsSummary', {params: {projects, kinds}}).toPromise();
  }
  async getMaterialNodes(project: string) {
    return await this.http.get<MaterialNode[]>(props.http + '/materialNodes', {params: {project}}).toPromise();
  }
  async updateMaterialNode(project: string, data: string, label: string, user: string, remove: number) {
    return await this.http.get<MaterialNode[]>(props.http + '/updateMaterialNode', {params: {project, data, label, user, remove}}).toPromise();
  }
  async updateMaterial(material: Material, user: string, remove = 0) {
    console.log(material);
    return await this.http.get<string>(props.http + '/updateMaterial', {params: {material: JSON.stringify(material), user, remove}}).toPromise();
  }
  async getWeightControl() {
    return await this.http.get<any[]>(props.http + '/weightControl').toPromise();
  }
  async setWeightControl(control: any) {
    return await this.http.post<string>(props.http + '/setWeightControl', JSON.stringify(control)).toPromise();
  }
  async removeWeightControl(control: any, user: String) {
    // @ts-ignore
    return await this.http.post<string>(props.http + '/removeWeightControl', JSON.stringify(control), {params: {user}}).toPromise();
  }
  async getWCDrawings() {
    return await this.http.get<any[]>(props.http + '/wcDrawings').toPromise();
  }
  async getWCZones() {
    return await this.http.get<any[]>(props.http + '/wcZones').toPromise();
  }
  async createMaterialCloudDirectory(project: string, code: string) {
    return await this.http.get<string>(props.http + '/createMaterialCloudDirectory', {params: {project, code}}).toPromise();
  }
  getMaterialsDetails(project: string, code: string) {
    return this.http.get<any>(props.http + '/materialsCode', {params: {project, code}});
  }
}
