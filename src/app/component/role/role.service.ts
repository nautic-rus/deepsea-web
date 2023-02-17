import {Injectable, OnInit} from '@angular/core';
import * as props from "../../props";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Roles} from "../../domain/interfaces/roles";
import {LanguageService} from "../../domain/language.service";
import {Users} from "../../domain/interfaces/users";
import {DynamicDialogConfig} from "primeng/dynamicdialog";

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  private usersUrl = `${props.http}/adminRoles`;  // URL to web api

  constructor(private http: HttpClient) { }

  getRoles() {
    return this.http.get<any>(this.usersUrl);
  }

  getRoleDetails(name: string): Observable<Roles>{
    return this.http.get<Roles>(props.http + '/roleDetails', {params: {name}})
  }

  startRole(role: Roles) {
    return this.http.post<string>(props.http + '/startRole', JSON.stringify(role))
  }
}
