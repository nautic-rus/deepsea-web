import { Injectable } from '@angular/core';
import * as props from "../../props";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private usersUrl = `${props.http}/projectNames`;  // URL to web api


  constructor(private http: HttpClient) { }

  getProjects() {
    return this.http.get<any>(this.usersUrl);
  }
}
