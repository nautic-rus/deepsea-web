import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {IEquipment} from "./interfaces/equipments";
import * as props from "../props";
import {Isfi} from "./interfaces/sfi";

@Injectable({
  providedIn: 'root'
})
export class ProjectsManagerService{
  projects: any[] = [];
  departments: any[] = [];
  constructor(private http: HttpClient) {}

  getProjects() {
    this.http.get<any[]>(props.http + '/issueProjects').subscribe(projects => {
      this.projects = projects;
    });
  }

  getProjectsDelails() {
    return this.http.get<Isfi[]>(props.http + '/issueProjects');

  }

  getDepartments() {
    this.http.get<any[]>(props.http + '/departments').subscribe(departments => {
      this.departments = departments;
    });
  }
}
