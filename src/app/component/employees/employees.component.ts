import { Component, OnInit } from '@angular/core';
import {User} from "../../domain/classes/user";

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent implements OnInit {
  users: User[] = [];
  departments: string[] = ['Корпусный отдел', 'Системный отдел', 'Электротехнический отдел', 'IT-отдел', 'Отдел дизайна'];
  department = this.departments[1];

  constructor() { }

  ngOnInit(): void {
  }

}
