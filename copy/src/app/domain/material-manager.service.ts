import { Injectable } from '@angular/core';
import * as props from "../props";
import {CookieService} from "ngx-cookie-service";
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import {MessageService} from "primeng/api";
import {Material} from "./classes/material";

@Injectable({
  providedIn: 'root'
})
export class MaterialManagerService {

  constructor(private cookie: CookieService, private http: HttpClient, private router: Router, private messageService: MessageService) { }
  async getMaterials(project: string) {
    return await this.http.get<Material[]>(props.http + '/materials', {params: {project}}).toPromise();
  }
  async updateMaterial(material: Material) {
    return await this.http.post<string>(props.http + '/updateMaterial', JSON.stringify(material)).toPromise();
  }
}
