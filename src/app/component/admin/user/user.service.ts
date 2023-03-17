import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import * as props from "../../../props";
import {User} from "../../../domain/classes/user";
import {Users} from "../../../domain/interfaces/users";
import {Projects} from "../../../domain/interfaces/project";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  getUsers() {
    console.log("fetch users")
    return this.http.get<any>(props.http + '/users');
  }

  getUserDetails(id: number): Observable<Users>{
    console.log(id);
    return this.http.get<Users>(props.http + '/userDetails', {params: {id}})
  }

  startUser(user: Users) {
    console.log(user);
    return this.http.post<string>(props.http + '/startUser', JSON.stringify(user));
  }

  deleteUser(id: number) {
    console.log(id);
    return this.http.get<string>(props.http + '/deleteUser', {params: {id}});
  }

  sendLogPass(id: number) {
    console.log(id);
    return this.http.get<string>(props.http + '/sendLogPass', {params: {id}});
  }

  saveUser(user: Users, id: number) {
    console.log(user);
    return this.http.post<string>(props.http + '/editUser', JSON.stringify(user), {params: {id}})
  }

  saveUsersProject(idUsers: number[], idProject: number) {
    console.log(idUsers);
    return this.http.post<string>(props.http + '/editUsersProject', {params: {idUsers: {idUsers}, idProject: {idProject}}})
  }
}
