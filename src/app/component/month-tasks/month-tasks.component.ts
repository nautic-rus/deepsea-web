import { Component, OnInit } from '@angular/core';
import _ from "underscore";
import {IssueManagerService} from "../../domain/issue-manager.service";
import {Issue} from "../../domain/classes/issue";
import {DailyTask} from "../../domain/interfaces/daily-task";
import {DailyTasksComponent} from "../navi/daily-tasks/daily-tasks.component";
import {DialogService} from "primeng/dynamicdialog";
import {AuthManagerService} from "../../domain/auth-manager.service";

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

  constructor(public issueManager: IssueManagerService, public dialogService: DialogService, public auth: AuthManagerService) { }

  ngOnInit(): void {
    this.issueManager.getDailyTasks().then(res => {
      this.tasksSrc = res.filter(x => x.userLogin == this.auth.getUser().login);
      this.tasks = res.filter(x => x.userLogin == this.auth.getUser().login);
      this.fillDays();
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
      if (d.tasks.length > 0){
        this.daysInMonth.push(d);
      }
    }
    this.showError = true;
  }
  getTasksOfDay(day: number){
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
    console.log(new Date().getDate());
    this.dialogService.open(DailyTasksComponent, {
      showHeader: false,
      modal: true,
      data: [day.number == -1 ? new Date() : new Date(this.date.getFullYear(), this.date.getMonth(), day.number), day.sum]
    }).onClose.subscribe(res => {
      this.issueManager.getDailyTasks().then(res => {
        this.tasksSrc = res.filter(x => x.userLogin == this.auth.getUser().login);
        this.tasks = res.filter(x => x.userLogin == this.auth.getUser().login);
        this.fillDays();
      });
    });
  }

  deleteDailyTask(task: any) {
    this.issueManager.deleteDailyTask(task.id).then(() => {
    });
    this.tasks = this.tasks.filter(x => x.id != task.id);
    this.fillDays();
  }

  changeMonth(value: number) {
    this.showError = false;
    this.date = new Date(this.date.getFullYear(), this.date.getMonth() + value, 1);
    this.issueManager.getDailyTasks().then(res => {
      this.tasksSrc = res.filter(x => x.userLogin == this.auth.getUser().login);
      this.tasks = res.filter(x => x.userLogin == this.auth.getUser().login);
      this.fillDays();
    });
  }

  getTime(time: number){
    return this.getHours(time) + ':' + this.getMinutes(time);
  }
  getHours(time: number) {
    let hours = Math.round(time).toString();
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
