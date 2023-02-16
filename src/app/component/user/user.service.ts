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
    return this.http.get<any>(this.usersUrl);
  }

  getUserDetails(id: number) {
    return this.http.get<any>(props.http + '/userDetails', {params: {id}})
  }



  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  /** Log a HeroService message with the MessageService */
  private log(message: string) {
    console.log(`HeroService: ${message}`);
  }
}
