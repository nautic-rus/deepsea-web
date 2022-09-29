import { Component, OnInit } from '@angular/core';
import {User} from "../../domain/classes/user";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {DeleteComponent} from "../task/delete/delete.component";
import {DialogService} from "primeng/dynamicdialog";
import {UserCardComponent} from "./user-card/user-card.component";
import {DayCalendar} from "../../domain/classes/day-calendar";
import {IssueManagerService} from "../../domain/issue-manager.service";
import _ from "underscore";
import {LanguageService} from "../../domain/language.service";
import {DailyTask} from "../../domain/interfaces/daily-task";

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
  selectedDepartments: string[] = [];
  users: User[] = [];
  dailyTasks: DailyTask[] = [];
  userStats: any = Object();
  selectedView: string = 'month';

  constructor(public t: LanguageService, public auth: AuthManagerService, private dialogService: DialogService, public issues: IssueManagerService) { }

  ngOnInit(): void {
    this.fill();
  }
  fill(){
    let days = this.getDaysInMonth();
    this.issues.getDailyTasks().then(res => {
      this.dailyTasks = res;

      this.auth.getUsers().then(res =>{
        this.users = res.filter(x => x.visibility.includes('k'));
        this.users.forEach(user => user.userName = this.auth.getUserName(user.login));
        // this.users.forEach(d => d.department = this.issues.localeUserDepartment(d.department))
        this.users = _.sortBy(this.users.filter(x => x.surname != 'surname'), x => x.userName);
        this.departments = _.uniq(this.users.map(x => x.department).filter(x => x != null && x != 'IT' && x != 'Management'));
        this.departments = _.sortBy(this.departments, x => x);
        this.selectedDepartments = [...this.departments];
        this.departments = _.sortBy(this.departments, x => this.getOrder(x));

        this.users.forEach(user => {
          let tasks = this.dailyTasks.filter(x => x.userLogin == user.login);
          let daysSum = Object({});
          let tasksByDay = Object({});

          let totalSum = 0;
          days.forEach(d => {
            let sum = 0;
            let date = new Date(this.currentYear, this.currentMonth, d).getTime();
            tasks.filter(t => this.sameDay(date, t.date)).forEach(x => sum += x.time);
            tasksByDay[d] = tasks.filter(t => this.sameDay(date, t.date));
            daysSum[d] = Object({hours: this.getHours(sum, this.getMinutes(sum)), minutes: this.getMinutes(sum)});
            totalSum += sum;
          });


          this.userStats[user.login] = Object({tasks: tasks, tasksByDay: tasksByDay, days: daysSum, totalSum:  Object({hours: this.getHours(totalSum), minutes: this.getMinutes(totalSum)})});
        });
        console.log(this.userStats);


      });
    });
  }
  getHours(time: number, minutes: string = '') {
    let hours = Math.floor(time).toString();
    return hours == '0' && minutes == '' ? '-' : hours;
  }
  getMinutes(time: number){
    let minutes = Math.round((time - Math.floor(time)) * 60).toString();
    if (minutes.length == 1){
      minutes = '0' + minutes;
    }
    return minutes == '00' ? '' : minutes;
  }
  sameDay(dLong1: number, dLong2: number) {
    let d1 = new Date(dLong1);
    let d2 = new Date(dLong2);
    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
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
    return this.users.filter(x => x.visibility.includes('k')).filter(x => this.selectedDepartments.includes(x.department));
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
    this.fill();
  }

  nextMonth() {
    this.today = new Date(this.currentYear, this.currentMonth + 1, this.today.getDate());
    this.currentMonth = this.today.getMonth();
    this.currentYear = this.today.getFullYear();
    this.fill();
  }

  setToday(){
    this.today = new Date();
    this.currentMonth = this.today.getMonth();
    this.currentYear = this.today.getFullYear();
  }

  getMonth() {
    switch (this.currentMonth){
      case 0: return this.t.tr('Январь');
      case 1: return this.t.tr('Февраль');
      case 2: return this.t.tr('Март');
      case 3: return this.t.tr('Апрель');
      case 4: return this.t.tr('Май');
      case 5: return this.t.tr('Июнь');
      case 6: return this.t.tr('Июль');
      case 7: return this.t.tr('Август');
      case 8: return this.t.tr('Сентябрь');
      case 9: return this.t.tr('Октябрь');
      case 10: return this.t.tr('Ноябрь');
      case 11: return this.t.tr('Декабрь');
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


  selectDepartment(department: string) {
    if (this.selectedDepartments.includes(department)){
      this.selectedDepartments.splice(this.selectedDepartments.indexOf(department), 1);
    }
    else{
      this.selectedDepartments.push(department);
    }
  }

  getDay(day: number) {
    return 'D' + day + 'M' + this.currentMonth + 'Y' + this.currentYear;
  }

  getPic(dep: string, selected: boolean) {
    switch (dep){
      case 'Design department': return selected ? 'paintbrushw' : 'paintbrush';
      case 'Devices department': return selected ? 'hookw' : 'hookg';
      case 'Electrical department': return selected ? 'elec' : 'elecg';
      case 'Hull department': return selected ? 'hull' : 'hullg';
      case 'Outfitting department': return selected ? 'outfittingw' : 'outfittingg';
      case 'Stability department': return selected ? 'paintbrush' : 'paintbrush';
      case 'System department': return selected ? 'pipew' : 'pipeg';
      default: return 'plus';
    }
  }
  getOrder(dep: string) {
    switch (dep){
      case 'Design department': return 6;
      case 'Devices department': return 3;
      case 'Electrical department': return 2;
      case 'Hull department': return 0;
      case 'Outfitting department': return 4;
      case 'Stability department': return 5;
      case 'System department': return 1;
      default: return 100;
    }
  }

  changeView() {
    this.selectedView = this.selectedView == 'month' ? 'day' : 'month';
  }

  getUserTasksOfSelectedDay(tasks: any[]) {
    return tasks.filter(t => this.sameDay(t.date, this.today.getTime()));
  }

  prevDay() {
    this.today = new Date(this.today.getTime() - 24 * 60 * 60 * 1000);
    this.currentMonth = this.today.getMonth();
    this.currentYear = this.today.getFullYear();
    this.fill();
  }

  nextDay() {
    this.today = new Date(this.today.getTime() + 24 * 60 * 60 * 1000);
    this.currentMonth = this.today.getMonth();
    this.currentYear = this.today.getFullYear();
    this.fill();
  }

  getCurrentDay() {
    return this.today.getDate();
  }
  trimText(input: string, length = 10){
    let res = input;
    if (res.length > length){
      res = res.substr(0, length) + '..';
    }
    return res;
  }

  getTaskMinutes(time: number){
    let minutes = Math.round((time - Math.floor(time)) * 60).toString();
    if (minutes.length == 1){
      minutes = '0' + minutes;
    }
    return minutes;
  }
}
