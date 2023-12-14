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
import {Issue} from "../../domain/classes/issue";
import {Observable, Subject} from "rxjs";

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent implements OnInit {

  departments: any[] = [];
  department = '';
  today = new Date();
  todayStatic = new Date();
  currentMonth = this.today.getMonth();
  currentYear = this.today.getFullYear();
  selectedDepartments: string[] = [];
  usersSrc: User[] = [];
  users: User[] = [];
  userDiary: any[] = [];
  userStats: any = Object();
  selectedView: string = 'month';
  issuesSrc: Issue[] = [];
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

    Object({day: 1, month: 1, year: 2024, hours: 0}),
    Object({day: 2, month: 1, year: 2024, hours: 0}),
    Object({day: 3, month: 1, year: 2024, hours: 0}),
    Object({day: 4, month: 1, year: 2024, hours: 0}),
    Object({day: 5, month: 1, year: 2024, hours: 0}),
    Object({day: 8, month: 1, year: 2024, hours: 0}),
    Object({day: 22, month: 2, year: 2024, hours: 7}),
    Object({day: 23, month: 2, year: 2024, hours: 0}),
    Object({day: 7, month: 3, year: 2024, hours: 7}),
    Object({day: 8, month: 3, year: 2024, hours: 0}),
    Object({day: 27, month: 4, year: 2024, hours: 8}),
    Object({day: 29, month: 4, year: 2024, hours: 0}),
    Object({day: 30, month: 4, year: 2024, hours: 0}),
    Object({day: 1, month: 5, year: 2024, hours: 0}),
    Object({day: 8, month: 5, year: 2024, hours: 7}),
    Object({day: 9, month: 5, year: 2024, hours: 0}),
    Object({day: 10, month: 5, year: 2024, hours: 0}),
    Object({day: 11, month: 6, year: 2024, hours: 7}),
    Object({day: 12, month: 6, year: 2024, hours: 0}),
    Object({day: 2, month: 11, year: 2024, hours: 7}),
    Object({day: 4, month: 11, year: 2024, hours: 0}),
    Object({day: 28, month: 12, year: 2024, hours: 8}),
    Object({day: 30, month: 12, year: 2024, hours: 0}),
    Object({day: 31, month: 12, year: 2024, hours: 0}),
  ];
  workingHours = 0;
  loading = true;
  todaysPlan: any;

  constructor(public t: LanguageService, public auth: AuthManagerService, private dialogService: DialogService, public issues: IssueManagerService) { }

  ngOnInit(): void {
    this.fill();
  }
  fill(){
    this.auth.getUsers().then(resUsers => {
      this.usersSrc = resUsers.filter(x => x.removed == 0);
      this.usersSrc.forEach(u => u.userName = this.auth.getUserName(u.login));
      this.issues.getDepartments().subscribe(departments => {
        this.departments = departments.filter(x => x.visible_man_hours == 1);
        this.selectedDepartments = this.departments.map(x => x.name);

        let selectedDepartmentsStorage = localStorage.getItem('employees-departments');
        if (selectedDepartmentsStorage != null){
          this.selectedDepartments = JSON.parse(localStorage.getItem('employees-departments')!)
        }


        this.users = this.usersSrc.filter(x => this.selectedDepartments.includes(x.department));

        this.getTodaysPlan().subscribe(todaysPlan => {
          console.log(todaysPlan);
          this.todaysPlan = todaysPlan;
        });

        let days = this.getDaysInMonth();
        this.auth.getConsumedPlanHours(0).subscribe(consumed => {
          this.issues.getIssuesAll().subscribe(resIssues => {
            this.issuesSrc = resIssues;
            this.users.forEach(user => {
              let tasks = consumed.filter(x => x.user_id == user.id);
              let tasksByDay = Object({});

              let tasksThisMonth: any[] = [];
              days.forEach(d => {
                let date = new Date(this.currentYear, this.currentMonth, d).getTime();
                tasks.filter(t => this.sameDay(date, t.date_consumed)).forEach(t => tasksThisMonth.push(t));
              });

              let totalSum = 0;
              days.forEach(d => {
                let sum = 0;
                let date = new Date(this.currentYear, this.currentMonth, d).getTime();
                let tasksOfDay = tasks.filter(t => this.sameDay(date, t.date_consumed));
                tasksOfDay.forEach(t => {
                  sum += t.amount;
                  t.task = this.issuesSrc.find(x => x.id == t.task_id);
                });
                tasksByDay[d] = Object({
                  tasks: tasksOfDay,
                  sum: sum
                });

                if (!this.sameDay(this.today.getTime(), date)){
                  totalSum += sum;
                }
              });

              this.userStats[user.login] = Object({
                tasks: tasks,
                tasksThisMonth: tasksThisMonth,
                tasksByDay: tasksByDay,
                totalSum: totalSum
              });
            });

          });
          this.workingHours = this.getMonthWorkingHours();
          this.loading = false;
        });
      });
    });
  }
  filterUsers(){
    localStorage.setItem('employees-departments', JSON.stringify(this.selectedDepartments));
    this.users = this.usersSrc.filter(x => this.selectedDepartments.includes(x.department));
    this.fill();
  }
  getTodaysPlan(): Observable<any>{
    return new Observable((subscriber) => {
      let day = new Date(this.currentYear, this.currentMonth, 1, 1, 0, 0);
      this.auth.getPlanNotOrdinary(day.getTime()).subscribe(planNotOrdinary => {
        console.log(planNotOrdinary);
        let usersPlan = Object();
        this.users.forEach(u => {
          let findPlan = planNotOrdinary.find(x => x.userId == u.id);
          if (findPlan != 0){
            usersPlan[u.id] = findPlan.plan;
          }
          else{
            usersPlan[u.id] = 0;
          }
          // let sum = 0;
          // let day = new Date(this.currentYear, this.currentMonth, 1, 1, 0, 0);
          // let now = new Date().getTime();
          // while (!this.sameDay(day.getTime(), this.today.getTime()) && day.getTime() <= now){
          //   let special = this.specialDays.find(x => x.day == day.getDate() && (x.month - 1) == day.getMonth() && x.year == day.getFullYear());
          //   if (special != null){
          //     sum += special.hours;
          //   }
          //   else{
          //     sum += (day.getDay() == 0 || day.getDay() == 6) ? 0 : 8;
          //   }
          //   day = new Date(day.getTime() + 24 * 60 * 60 * 1000);
          // }
          // let planExclude = 0;
          // planNotOrdinary.filter(x => x.userId == u.id).map(x => x.hours_amount).forEach(x => planExclude += x);
          // usersPlan[u.id] = sum - planExclude;
        });
        subscriber.next(usersPlan);
      });
    });
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
    return this.users.filter(x => x.visibility.includes('k')).filter(x => this.selectedDepartments.includes(x.department));
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
    this.userStats = [];
    this.today = new Date(this.currentYear, this.currentMonth - 1, this.today.getDate());
    this.currentMonth = this.today.getMonth();
    this.currentYear = this.today.getFullYear();
    this.fill();
  }

  nextMonth() {
    this.userStats = [];
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
  getTaskExtraColor(taskId: number){
    switch (taskId){
      case -5:{ //УЧЁБА
        return 'repeating-linear-gradient(0deg, #F7F7F8, #F7F7F8 2px, #8DB6FA 2px, #8DB6FA 4px)';
      }
      case -4:{ //ОТГУЛ
        return 'repeating-linear-gradient(0deg, #F7F7F8, #F7F7F8 2px, #96A1B0 2px, #96A1B0 4px)';
      }
      case -3:{ //ОПЕРГРУППА
        return 'rgb(53,50,54)';
      }
      case -2:{ //ОТПУСК
        return 'repeating-linear-gradient(0deg, #F7F7F8, #F7F7F8 2px, #86DE5E 2px, #86DE5E 4px)';
      }
      case -1:{ //БОЛЬНИЧНЫЙ
        return 'repeating-linear-gradient(0deg, #F7F7F8, #F7F7F8 2px, #F37878 2px, #F37878 4px)';
      }
      default:{
        let eq1 = Math.pow(taskId, 1);
        let eq2 = Math.pow(taskId, 2);
        let eq3 = Math.pow(taskId, 3);
        let r = eq1 % 255;
        let g = eq2 % 255;
        let b = eq3 % 255;
        let tr = 0.68
        return `rgba(${r}, ${g}, ${b}, ${tr})`;
      }
    }
  }
  getTaskStyle(task: any, sum: any) {
    let widthFull = 44;
    let width = widthFull / sum * task.amount;
    return {
      height: '44px',
      width: width + 'px',
      'background': width == 0 ? 'transparent' : this.getTaskExtraColor(task.task_id),
    };
  }

  protected readonly open = open;

  openTask(task: any) {
    window.open('/?taskId=' + task.task_id, '_blank');
  }

  getTaskTooltip(task: any) {
    let hours = task.amount;
    let docNumber = task.task.docNumber;
    let docName = task.task.issue_name;
    return hours + 'h ' + [docNumber, docName].filter(x => x != null && x != '').join(' ');
  }

  openChart(user: User) {
    window.open('/man-hours-chart?user=' + user.login + '&period=curMonth', '_blank');
  }
}
