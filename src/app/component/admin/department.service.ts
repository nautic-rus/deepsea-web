import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import * as props from "../../props";
import {Observable} from "rxjs";
import {Users} from "../../domain/interfaces/users";
import {Departments} from "../../domain/interfaces/departments";

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {

  constructor(private http: HttpClient) { }

  getDepartments() {
    console.log("fetch departments")
    return this.http.get<any>(props.http + '/departments');
  }

  getDepartmentDetails(id: number): Observable<Departments>{
    console.log(id);
    return this.http.get<Departments>(props.http + '/departmentDetails', {params: {id}})
  }

  getDepartmentsNames() {
    return this.http.get<any>(props.http + '/issueDepartments')
  }
}
