import {Injectable, OnInit} from '@angular/core';
import * as props from "../../../props";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Roles} from "../../../domain/interfaces/roles";
import {LanguageService} from "../../../domain/language.service";
import {Users} from "../../../domain/interfaces/users";
import {DynamicDialogConfig} from "primeng/dynamicdialog";

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  constructor(private http: HttpClient) { }

  getRoles() {
    return this.http.get<any>(props.http + '/adminRoles');
  }

  getRoleDetails(name: string) {
    console.log(name);
    return this.http.get<any>(props.http + '/roleDetails', {params: {name}});
  }

  getRoleRights(name: string) {
    console.log(name);
    return this.http.get<any>(props.http + '/roleRights', {params: {name}});
  }

  startRole(role: Roles) {
    console.log(role);
    return this.http.post<string>(props.http + '/startRole', JSON.stringify(role));
  }

  setRoleForAll(name: string) {
    console.log(name);
    return this.http.get<any>(props.http + '/setRoleForAll', {params: {name}});
  }

  deleteRole(name: string) {
    console.log(name);
    return this.http.get<string>(props.http + '/deleteRole', {params: {name}});
  }

  saveRole(role: Roles, name: string) {
    console.log(role)
    console.log(name)
    return this.http.post<string>(props.http + '/editRole', JSON.stringify(role), {params: {name}});
  }
}
