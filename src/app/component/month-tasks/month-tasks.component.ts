import { Component, OnInit } from '@angular/core';
import _ from "underscore";
import {IssueManagerService} from "../../domain/issue-manager.service";
import {Issue} from "../../domain/classes/issue";
import {DailyTask} from "../../domain/interfaces/daily-task";
import {DailyTasksComponent} from "../navi/daily-tasks/daily-tasks.component";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {CalendarDay} from "../../domain/classes/calendar-day";
import {DeleteComponent} from "../task/delete/delete.component";
import {ShowTaskComponent} from "../navi/daily-tasks/show-task/show-task.component";

@Component({
  selector: 'app-month-tasks',
  templateUrl: './month-tasks.component.html',
  styleUrls: ['./month-tasks.component.css']
})
export class MonthTasksComponent implements OnInit {

  date = new Date();
  daysInMonth: any[] = [];
  monthName = '';
  monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  issues: Issue[] = [];
  issuesRkd: Issue[] = [];
  tasksSrc: DailyTask[] = [];
  tasks: DailyTask[] = [];
  projects: string[] = ['NR002', 'NR004', 'OTHER'];
  showError = false;
  options = {
    initialDate : '2019-01-01',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    editable: true,
    selectable:true,
    selectMirror: true,
    dayMaxEvents: true
  };


  calendar = this.getCalendar();
  dayOfWeek = {
    opacity: '1',
    transition: 'opacity 4s'
  };

  constructor(public issueManager: IssueManagerService, public dialogService: DialogService, public auth: AuthManagerService, public ref: DynamicDialogRef) { }

  getDay(): number{
    return this.date.getDate();
  }
  getMonth(){
    return this.date.getMonth();
  }
  getYear(){
    return this.date.getFullYear();
  }
  getDaysOfTheMonth(month = this.getMonth(), year = this.getYear()){
    return new Date(year, month + 1, 0).getDate();
  }
  getDays(change = 0){
    return this.getDaysOfTheMonth(this.date.getMonth() + change, this.date.getFullYear());
  }
  getDayOfWeek(day: number, month: number = this.getMonth(), year: number = this.getYear()){
    return new Date(year, month, day).getDay();
  }
  getWeekNumber(day: number, monthChange = 0){
    let date = new Date(this.getYear(), this.getMonth() + monthChange, day);
    let firstJan = new Date(date.getFullYear(), 0, 1);
    return Math.ceil((((date.getTime() - firstJan.getTime()) / 86400000) + firstJan.getDay() + 1) / 7) - 1;
  }
  toArray42(length: number){
    let result = [];
    result.push('s');
    let additionalDays = this.getDayOfWeek(0, this.getMonth(), this.getYear());
    let daysOfPrevMonth = this.getDaysOfTheMonth(this.getMonth() - 1);
    for (let x = additionalDays; x > 0; x --){
      result.push('hb' + (daysOfPrevMonth - x + 1));
      if (result.length % 8 == 0){
        result.push('s');
      }
    }
    for (let x = 0; x < length; x++){
      result.push(x + 1);
      if (result.length % 8 == 0){
        result.push('s');
      }
    }
    additionalDays = 48 - result.length;
    for (let x = 1; x <= additionalDays; x ++){
      result.push('ha' + x);
      if (result.length % 8 == 0){
        result.push('s');
      }
    }
    return result.slice(0, 48);
  }
  isDayWeekEnd(day: number, monthChange = 0){
    let result = false;
    let date = new Date(this.getYear(), this.getMonth() + monthChange, day);
    let dayOfWeek = date.getDay();
    if (dayOfWeek == 0 || dayOfWeek == 6){
      result = true;
    }
    return result;
  }
  isDayCurrent(day: number, month: number = this.getMonth(), year: number = this.getYear()) {
    let date = new Date();
    return date.getDate() == day && date.getMonth() == month && date.getFullYear() == year;
  }
  isDaySunday(day: number, monthChange = 0){
    let result = false;
    let date = new Date(this.getYear(), this.getMonth() + monthChange, day);
    let dayOfWeek = date.getDay();
    if (dayOfWeek == 0){
      result = true;
    }
    return result;
  }
  getCalendar(){
    let calendar: CalendarDay[] = [];
    this.monthName = this.monthNames[this.date.getMonth()];
    let days = this.toArray42(this.getDays());
    let index = 0;
    days.forEach(day => {
      if (day == null) {
        calendar.push(new CalendarDay());
      }
      else {
        let cDay = new CalendarDay();
        cDay.number = day;
        if (!(day.toString().includes('s') || day.toString().includes('h'))){
          cDay.isSunday = this.isDaySunday(+day);
          cDay.isWeekend = this.isDayWeekEnd(+day);
          cDay.isCurrent = this.isDayCurrent(+day);
        }
        if (!isNaN(cDay.number)){
          //console.log(cDay.number);
          cDay.tasks = this.getTasksOfDay(cDay.number);
          cDay.tasks.forEach((t: any) => {
            cDay.sum += t.time;
          });
        }
        if (day.toString().includes('s')){
          let monthChange = 0;
          if (days[index + 1].toString().includes('b')){
            monthChange = -1;
          }
          if (days[index + 1].toString().includes('a')){
            monthChange = 1;
          }
          cDay.weekNumber = this.getWeekNumber(+days[index + 1].toString().replace('h', '').replace('s', '').replace('b', '').replace('a', ''), monthChange);
        }
        calendar.push(cDay);
      }
      index++;
    });
    return calendar;
  }

  ngOnInit(): void {
    this.issueManager.getDailyTasks().then(res => {
      this.tasksSrc = res.filter(x => x.userLogin == this.auth.getUser().login);
      this.tasks = res.filter(x => x.userLogin == this.auth.getUser().login);
      //this.fillDays();
      this.calendar = this.getCalendar();
    });
  }
  fillDays(){
    this.showError = false;
    this.tasks.forEach(t => {
      if (t.action == 'OTHER'){
        t.action = t.actionValue;
      }
      if (t.project == 'OTHER'){
        t.project = t.projectValue;
      }
      if (t.docNumber == 'OTHER'){
        t.docNumber = t.docNumberValue;
      }
    });
    let days = new Date(this.date.getFullYear(), this.date.getMonth() + 1, 0).getDate();
    this.monthName = this.monthNames[this.date.getMonth()];
    this.daysInMonth.splice(0, this.daysInMonth.length);
    for (let x = 0; x < days; x++){
      let d = Object({number: x + 1, tasks: [], sum: 0});
      d.tasks = this.getTasksOfDay(d.number);
      d.tasks.forEach((t: any) => {
        d.sum += t.time;
      });
      this.daysInMonth.push(d);
      // if (d.tasks.length > 0){
      //   this.daysInMonth.push(d);
      // }
    }
    this.showError = true;
  }
  getTasksOfDay(day: number){
    console.log(day + '-' + this.tasks.filter(x => this.sameDay(x.date, new Date(this.date.getFullYear(), this.date.getMonth(), day).getTime())).length);
    return this.tasks.filter(x => this.sameDay(x.date, new Date(this.date.getFullYear(), this.date.getMonth(), day).getTime()));
  }
  sameDay(dLong1: number, dLong2: number) {
    let d1 = new Date(dLong1);
    let d2 = new Date(dLong2);
    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
  }
  trimText(input: string, length = 10){
    let res = input;
    if (res.length > length){
      res = res.substr(0, length) + '..';
    }
    return res;
  }
  addDayTask(day: any) {
    this.dialogService.open(DailyTasksComponent, {
      showHeader: false,
      modal: true,
      data: [day.number == -1 ? new Date() : new Date(this.date.getFullYear(), this.date.getMonth(), day.number), day.sum]
    }).onClose.subscribe(res => {
      setTimeout(() => {
        this.issueManager.getDailyTasks().then(res => {
          this.tasksSrc = res.filter(x => x.userLogin == this.auth.getUser().login);
          this.tasks = res.filter(x => x.userLogin == this.auth.getUser().login);
          this.calendar = this.getCalendar();
        });
      }, 500);
    });
  }
  openTask(task: any){
    this.dialogService.open(ShowTaskComponent, {
      showHeader: false,
      modal: true,
      data: task,
    }).onClose.subscribe(res => {
      if (res == 'success'){
        this.ref.close();
      }
    });
  }

  deleteDailyTask(task: any) {
    this.issueManager.deleteDailyTask(task.id).then(() => {
    });
    this.tasks = this.tasks.filter(x => x.id != task.id);
    this.calendar = this.getCalendar();
  }

  changeMonth(value: number) {
    this.showError = false;
    this.date = new Date(this.date.getFullYear(), this.date.getMonth() + value, 1);
    this.issueManager.getDailyTasks().then(res => {
      this.tasksSrc = res.filter(x => x.userLogin == this.auth.getUser().login);
      this.tasks = res.filter(x => x.userLogin == this.auth.getUser().login);
      this.calendar = this.getCalendar();
    });
  }

  getTime(time: number){
    return this.getHours(time) + ':' + this.getMinutes(time);
  }
  getHours(time: number) {
    let hours = Math.floor(time).toString();
    if (hours.length == 1){
      hours = '0' + hours;
    }
    return hours;
  }
  getMinutes(time: number){
    let minutes = Math.round((time - Math.floor(time)) * 60).toString();
    if (minutes.length == 1){
      minutes = '0' + minutes;
    }
    return minutes;
  }
}
