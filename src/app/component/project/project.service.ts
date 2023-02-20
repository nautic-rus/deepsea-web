import { Injectable } from '@angular/core';
import * as props from "../../props";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Projects} from "../../domain/interfaces/project";

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  constructor(private http: HttpClient) { }

  getProjects() {
    return this.http.get<any>(props.http + '/issueProjects');
  }

  getProjectDetails(id: number): Observable<Projects> {
    console.log(id);
    return this.http.get<Projects>(props.http + '/projectDetails', {params: {id}});
  }

  startProject(project: Projects) {
    console.log(project);
    return this.http.post<string>(props.http + '/startProject', JSON.stringify(project));
  }

  deleteProject(id: number) {
    console.log(id);
    return this.http.get<string>(props.http + '/deleteProject', {params: {id}});
  }

  saveProject(project: Projects, id: number) {
    return this.http.post<string>(props.http + '/editProject', JSON.stringify(project), {params: {id}})
  }
}
