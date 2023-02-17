import { Injectable } from '@angular/core';
import * as props from "../../props";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private usersUrl = `${props.http}/adminRoles`;  // URL to web api

  constructor(private http: HttpClient) { }

  getRoles() {
    return this.http.get<any>(this.usersUrl);
  }
}
