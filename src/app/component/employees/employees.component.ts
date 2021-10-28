import { Component, OnInit } from '@angular/core';
import {User} from "../../domain/classes/user";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {DeleteComponent} from "../task/delete/delete.component";
import {DialogService} from "primeng/dynamicdialog";
import {UserCardComponent} from "./user-card/user-card.component";
import {DayCalendar} from "../../domain/classes/day-calendar";
import {IssueManagerService} from "../../domain/issue-manager.service";
import _ from "underscore";

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent implements OnInit {

  departments: string[] = [];
  department = '';
  today = new Date();
  todayStatic = new Date();
  currentMonth = this.today.getMonth();
  currentYear = this.today.getFullYear();
  days: DayCalendar[] = [];
  selectedStatus = '';
  users: User[] = [];

  constructor(public auth: AuthManagerService, private dialogService: DialogService, public issues: IssueManagerService) { }

  ngOnInit(): void {
    this.issues.getCalendar().then(res =>{
      this.days = res;
    });
    this.auth.getUsers().then(res =>{
      this.users = res;
      this.users.forEach(user => user.userName = this.auth.getUserName(user.login));
      this.users = _.sortBy(this.users.filter(x => x.surname != 'surname'), x => x.userName);
      this.departments = _.uniq(this.users.map(x => x.department).filter(x => x != null));
      this.departments = _.sortBy(this.departments, x => x).reverse();
      this.departments.push('Все');
      this.departments = this.departments.reverse();
      this.department = 'Все';
    });
  }
  getDaysInMonth() {
    let daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    let array = [];
    for (let x = 0; x < daysInMonth; x++){
      array.push(x + 1);
    }
    return array;
  }
  getUsers(){
    return this.users.filter(x => x.visibility.includes('k')).filter(x => x.department == this.department || this.department == 'Все');
  }
  isWeekend(day: number) {
    let date = new Date(this.currentYear, this.currentMonth, day).getDay();
    return date == 0 || date == 6;
  }

  isCurrentDay(day: any) {
    return day == this.todayStatic.getDate() && this.currentMonth == this.todayStatic.getMonth();
  }

  prevMonth() {
    this.today = new Date(this.currentYear, this.currentMonth - 1, this.today.getDate());
    this.currentMonth = this.today.getMonth();
    this.currentYear = this.today.getFullYear();
  }

  nextMonth() {
    this.today = new Date(this.currentYear, this.currentMonth + 1, this.today.getDate());
    this.currentMonth = this.today.getMonth();
    this.currentYear = this.today.getFullYear();
  }

  setToday(){
    this.today = new Date();
    this.currentMonth = this.today.getMonth();
    this.currentYear = this.today.getFullYear();
  }

  getMonth() {
    switch (this.currentMonth){
      case 0: return 'Январь';
      case 1: return 'Февраль';
      case 2: return 'Март';
      case 3: return 'Апрель';
      case 4: return 'Май';
      case 5: return 'Июнь';
      case 6: return 'Июль';
      case 7: return 'Август';
      case 8: return 'Сентябрь';
      case 9: return 'Октябрь';
      case 10: return 'Ноябрь';
      case 11: return 'Декабрь';
      default: return this.currentMonth;
    }
  }

  showUserCard(user: User) {
    this.dialogService.open(UserCardComponent, {
      showHeader: false,
      modal: true,
      data: user.login
    });
  }

  setDayCalendar(user: string, day: string, status: string){
    this.issues.setDayCalendar(user, day, status).then(() => {
      this.issues.getCalendar().then(res => {
        this.days = res;
      });
    });
  }

  getDayStyle(user: string, day: string) {
    let find = this.days.find(x => x.day == day && x.user == user);
    if (find != null){
      switch (find.status) {
        case 'sick': return { background: 'rgba(166, 0, 255, 0.1)', 'border-radius': '5px', 'cursor': 'default','font-weight': '600', 'color': '#323130' };
        case 'vacation': return { background: 'rgba(80, 200, 120, 0.27)', 'border-radius': '5px', 'cursor': 'default', 'font-weight': '600', 'color': '#323130' };
        case 'off': return { background: 'rgba(255, 0, 0, 0.15)', 'border-radius': '5px', 'cursor': 'default', 'font-weight': '600', 'color': '#323130' };
        default: return {};
      }
    }
    else {
      return {};
    }
  }
  getDayLetter(user: string, day: string) {
    let find = this.days.find(x => x.day == day && x.user == user);
    if (find != null){
      switch (find.status) {
        case 'sick': return 'Б';
        case 'vacation': return 'О';
        case 'off': return 'В';
        default: return '';
      }
    }
    else {
      return '';
    }
  }

  selectStatus(status: string) {
    this.selectedStatus = status;
  }

  getDay(day: number) {
    return 'D' + day + 'M' + this.currentMonth + 'Y' + this.currentYear;
  }
}
