import { Component, OnInit } from '@angular/core';
import {LanguageService} from "../../domain/language.service";
import {User} from "../../domain/classes/user";
import _, {any} from "underscore";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {UserCardComponent} from "../employees/user-card/user-card.component";
import {DialogService} from "primeng/dynamicdialog";
import {TaskAssignComponent} from "./task-assign/task-assign.component";
import {IssueManagerService} from "../../domain/issue-manager.service";
import {MenuItem} from "primeng/api";

@Component({
  selector: 'app-work-hours',
  templateUrl: './work-hours.component.html',
  styleUrls: ['./work-hours.component.css']
})
export class WorkHoursComponent implements OnInit {

  departments: string[] = [];
  department = '';
  today = new Date();
  todayStatic = new Date();
  currentMonth = this.today.getMonth();
  currentYear = this.today.getFullYear();
  issues: any[] = [];
  specialDays = [
    Object({day: 3, month: 11, year: 2022, hours: 7}),
    Object({day: 4, month: 11, year: 2022, hours: 0}),
    Object({day: 2, month: 1, year: 2023, hours: 0}),
    Object({day: 3, month: 1, year: 2023, hours: 0}),
    Object({day: 4, month: 1, year: 2023, hours: 0}),
    Object({day: 5, month: 1, year: 2023, hours: 0}),
    Object({day: 6, month: 1, year: 2023, hours: 0}),
    Object({day: 22, month: 2, year: 2023, hours: 7}),
    Object({day: 23, month: 2, year: 2023, hours: 0}),
    Object({day: 24, month: 2, year: 2023, hours: 0}),
    Object({day: 7, month: 3, year: 2023, hours: 7}),
    Object({day: 8, month: 3, year: 2023, hours: 0}),
    Object({day: 1, month: 5, year: 2023, hours: 0}),
    Object({day: 8, month: 5, year: 2023, hours: 0}),
    Object({day: 9, month: 5, year: 2023, hours: 0}),
    Object({day: 12, month: 6, year: 2023, hours: 0}),
    Object({day: 3, month: 11, year: 2023, hours: 7}),
    Object({day: 6, month: 11, year: 2023, hours: 0}),
  ];
  users: User[] = [];
  selectedDepartments: string[] = [];
  items: MenuItem[] = [];
  selectedDay: any = null;
  dayHover: any = null;
  userHover: any = null;
  hoverEnabled = true;

  constructor(public t: LanguageService, public auth: AuthManagerService, private dialogService: DialogService, private issueManagerService: IssueManagerService) { }

  ngOnInit(): void {
    this.fill();
    this.items = [
      {
        label: 'Add task',
        icon: 'pi pi-fw pi-external-link',
        command: (event: any) => this.openTaskAssign()
      },
      {
        label: 'Clear task',
        icon: 'pi pi-fw pi-trash',
      }
    ];
  }
  fill(){
    this.auth.getUsers().then(res => {
      this.users = res.filter(x => x.visibility.includes('k'));
      this.users.forEach(user => user.userName = this.auth.getUserName(user.login));
      this.users = _.sortBy(this.users.filter(x => x.surname != 'surname'), x => x.userName);
    });
    this.issueManagerService.getIssueDepartments().then(departments => {
      this.departments = departments;
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
  isWeekend(day: number) {
    let date = new Date(this.currentYear, this.currentMonth, day).getDay();
    return date == 0 || date == 6 || this.specialDays.find(x => x.day == day && (x.month - 1) == this.currentMonth && x.year == this.currentYear)?.hours == 0;
  }
  isCurrentDay(day: any) {
    return day == this.todayStatic.getDate() && this.currentMonth == this.todayStatic.getMonth();
  }
  isShorter(day: number){
    let special = this.specialDays.find(x => x.day == day && (x.month - 1) == this.currentMonth && x.year == this.currentYear);
    return special != null && special.hours != 0;
  }
  getUsers(){
    return this.users;
  }
  selectDay(day: any) {
    this.hoverEnabled = false;
    this.selectedDay = day;
  }

  openTaskAssign() {
    this.dialogService.open(TaskAssignComponent, {
      showHeader: false,
      modal: true,
      data: any
    });
  }


  setHover(day: any, user: User) {
    if (!this.hoverEnabled){
      return;
    }
    this.dayHover = day;
    this.userHover = user;
  }

  resetHover() {
    if (!this.hoverEnabled){
      return;
    }
    this.userHover = null;
    this.dayHover = null;
  }
}
