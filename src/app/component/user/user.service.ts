import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import * as props from "../../props";
import {User} from "../../domain/classes/user";
import {Users} from "../../domain/interfaces/users";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usersUrl = `${props.http}/users`;  // URL to web api

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient) { }

  getUsers() {
    console.log("fetch users")
    return this.http.get<any>(this.usersUrl);
  }

  getUserDetails(id: number): Observable<Users>{
    return this.http.get<Users>(props.http + '/userDetails', {params: {id}})
  }
}
