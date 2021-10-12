import { Component, OnInit } from '@angular/core';
import {User} from "../../domain/classes/user";
import {AuthManagerService} from "../../domain/auth-manager.service";

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent implements OnInit {
  users: User[] = [];
  departments: string[] = ['Корпусный отдел', 'Системный отдел', 'Электротехнический отдел', 'IT-отдел', 'Отдел дизайна'];
  department = this.departments[1];

  constructor(private auth: AuthManagerService) { }

  ngOnInit(): void {
    this.users = this.getUsersEmployees();
  }
  getUsersEmployees() {
    return this.auth.users.filter(x => x.visibility.includes('a') || x.visibility.includes('k'));
  }

}
