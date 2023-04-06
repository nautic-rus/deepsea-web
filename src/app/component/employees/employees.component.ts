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
import {UserTasksComponent} from "./user-tasks/user-tasks.component";

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
  workingHours = 0;

  constructor(public t: LanguageService, public auth: AuthManagerService, private dialogService: DialogService, public issues: IssueManagerService) { }

  ngOnInit(): void {
    this.fill();
  }
  fill(){
    let days = this.getDaysInMonth();
    this.issues.getDailyTasks().then(res => {
      this.dailyTasks = res;

      this.auth.getUsers().then(res =>{
        this.users = res.filter(x => x.visibility.includes('k') && !x.login.includes('isaev') && !x.login.includes('kokovin') );
        this.users.forEach(user => user.userName = this.auth.getUserName(user.login));
        this.users.forEach(user => user.props = Object({department: (user.visibility.includes('r') ? '6' : '')}));
        // this.users.forEach(d => d.department = this.issues.localeUserDepartment(d.department))
        this.users = _.sortBy(this.users.filter(x => x.surname != 'surname'), x => x.userName);

        if (this.departments.length == 0){
          this.departments = _.uniq(this.users.map(x => x.department).filter(x => x != null && x != '6' && x != '0'));
          this.departments = _.sortBy(this.departments, x => x);
          // this.departments.push('6');
          this.departments = this.departments.filter(x => ['Hull', 'System', 'Electric', 'Devices', 'Accommodation', 'Design'].includes(x));
          this.selectedDepartments = [...this.departments];
          this.departments = _.sortBy(this.departments, x => this.getOrder(x));

        }


        this.users.forEach(user => {
          let tasks = this.dailyTasks.filter(x => x.userLogin == user.login);
          let daysSum = Object({});
          let tasksByDay = Object({});
          let tasksOperationsGroupCount = Object({});
          let tasksEnglishCount = Object({});

          let tasksThisMonth: any[] = [];
          days.forEach(d => {
            let date = new Date(this.currentYear, this.currentMonth, d).getTime();
            tasks.filter(t => this.sameDay(date, t.date)).forEach(t => tasksThisMonth.push(t));
          });

          let totalSum = 0;
          let totalSumEnglish = 0;
          days.forEach(d => {
            let sum = 0;
            let date = new Date(this.currentYear, this.currentMonth, d).getTime();
            tasks.filter(t => this.sameDay(date, t.date)).forEach(x => sum += x.time);
            tasksByDay[d] = tasks.filter(t => this.sameDay(date, t.date));
            tasksOperationsGroupCount[d] = tasks.filter(t => this.sameDay(date, t.date) && t.project == 'Operations group').length;

            tasksEnglishCount[d] = 0;
            tasks.filter(t => this.sameDay(date, t.date) && t.project == 'English' && t.details == 'English Lesson').forEach(x => tasksEnglishCount[d] += x.time);
            if (tasksEnglishCount[d] > 0) {
              tasksEnglishCount[d] = Object({
                hours: this.getHours(sum, this.getMinutes(sum)),
                minutes: this.getMinutes(sum)
              });
            }
            totalSumEnglish += tasksEnglishCount[d];

            daysSum[d] = Object({hours: this.getHours(sum, this.getMinutes(sum)), minutes: this.getMinutes(sum)});
            totalSum += sum;
          });


          this.userStats[user.login] = Object({
            tasks: tasks, tasksThisMonth: tasksThisMonth, tasksByDay: tasksByDay,
            tasksOperationsGroupCount: tasksOperationsGroupCount, tasksEnglishCount: tasksEnglishCount,
            days: daysSum,
            totalSum: Object({hours: this.getHours(totalSum, this.getMinutes(totalSum)), minutes: this.getMinutes(totalSum)}),
            totalSumEnglish: Object({hours: this.getHours(totalSumEnglish, this.getMinutes(totalSumEnglish)), minutes: this.getMinutes(totalSumEnglish)})
          });


        });


      });
    });
    this.workingHours = this.getMonthWorkingHours();
  }
  getMonthWorkingHours(){
    let hours = 0;
    this.getDaysInMonth().forEach(day => {
      let date = new Date(this.currentYear, this.currentMonth, day);
      let dayOfWeek = date.getDay();

      let findSpecial = this.specialDays.find(x => x.day == day && (x.month - 1) == this.currentMonth && x.year == this.currentYear);
      if (findSpecial != null){
        hours += findSpecial.hours;
      }
      else if (dayOfWeek != 0 && dayOfWeek != 6){
        hours += 8;
      }

    });
    return hours;
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
    return this.users.filter(x => x.visibility.includes('k')).filter(x => this.selectedDepartments.includes(x.department) && (x.props?.department == '' || this.selectedDepartments.includes(x.props?.department)));
  }
  isWeekend(day: number) {
    let date = new Date(this.currentYear, this.currentMonth, day).getDay();
    return date == 0 || date == 6 || this.specialDays.find(x => x.day == day && (x.month - 1) == this.currentMonth && x.year == this.currentYear)?.hours == 0;
  }
  isShorter(day: number){
    let special = this.specialDays.find(x => x.day == day && (x.month - 1) == this.currentMonth && x.year == this.currentYear);
    return special != null && special.hours != 0;
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
    this.fill();
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
      case 'Hull': return selected ? 'hull' : 'hullg';
      case 'System': return selected ? 'pipew' : 'pipeg';
      case 'Electric': return selected ? 'elec' : 'elecg';
      case 'Devices': return selected ? 'hookw' : 'hookg';
      case 'Accommodation': return selected ? 'outfittingw' : 'outfittingg';
      case '6': return selected ? 'manager' : 'managerg';
      case 'Design': return selected ? 'paintbrushw' : 'paintbrush';
      case 'IT': return selected ? 'code' : 'codeg';
      case 'Nautic Is': return selected ? 'iceland' : 'icelandg';
      default: return selected ? 'manager' : 'managerg';
    }
  }
  getOrder(dep: string) {
    switch (dep){
      case 'Hull department': return 0;
      case 'System department': return 1;
      case 'Electrical department': return 2;
      case 'Devices department': return 3;
      case 'Accommodation department': return 4;
      case 'Design department': return 6;
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

  getDepartment() {
    return this.departments.filter(x => x != 'IT');
  }

  getDep(dep: string){
    if (this.t.language == 'ru'){
      switch (dep) {
        case '7': return 'Отдел дизайна';
        case '4': return 'Отдел устройств';
        case '3': return 'Электротехнический отдел';
        case '1': return 'Корпусный отдел';
        case '5': return 'Отдел достройки';
        case '2': return 'Системный отдел';
        case '6': return 'Руководители';
        default: return dep;
      }
    }
    else{
      switch (dep) {
        case '7': return 'Design department';
        case '4': return 'Devices department';
        case '3': return 'Electrical department';
        case '1': return 'Hull department';
        case '5': return 'Accommodation department';
        case '2': return 'System department';
        case '6': return 'Managers';
        default: return dep;
      }
    }
  }

  showUserTasks(login: string, tasks: any[], totalSum: any, totalSumEnglish: any, tcid: any) {
    this.dialogService.open(UserTasksComponent, {
      showHeader: false,
      modal: true,
      data: [login, tasks, this.currentMonth, totalSum, totalSumEnglish, tcid]
    }).onClose.subscribe(res => {

    });
  }
}
