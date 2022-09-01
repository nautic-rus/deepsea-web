import { Component, OnInit } from '@angular/core';
import {DailyTask} from "../../../domain/interfaces/daily-task";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {Issue} from "../../../domain/classes/issue";
import _ from "underscore";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {LanguageService} from "../../../domain/language.service";

@Component({
  selector: 'app-daily-tasks',
  templateUrl: './daily-tasks.component.html',
  styleUrls: ['./daily-tasks.component.css']
})
export class DailyTasksComponent implements OnInit {

  calendarDay = new Date();
  amountOfHours = 8;
  initialHours = 0;
  amountOfHoursToAdd = 1;
  amountOfMinutesToAdd = 0;
  tasks: DailyTask[] = [];
  tasksSrc: DailyTask[] = [];

  projects: string[] = ['NR002', 'NR004', 'OTHER'];

  docNumbers: string[] = ['200101-222-101'];
  actions: string[] = ['Drawing', 'Model', 'OTHER']


  issues: Issue[] = [];
  error = '';

  constructor(public auth: AuthManagerService, public issue: IssueManagerService, public ref: DynamicDialogRef, public issueManager: IssueManagerService, public t: LanguageService, public conf: DynamicDialogConfig) { }

  ngOnInit(): void {
    this.calendarDay = this.conf.data[0];
    this.initialHours = this.conf.data[1];
    this.issue.getIssues('op').then(res => {
      this.issues = res;
      this.docNumbers = _.sortBy(this.issues.filter(x => x.project == 'NR002' && x.issue_type == 'RKD').map(x => x.doc_number), x => x);
      this.docNumbers.push('OTHER');
    });
  }
  sameDay(dLong1: number, dLong2: number) {
    let d1 = new Date(dLong1);
    let d2 = new Date(dLong2);
    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
  }
  addHoursToList() {
    this.tasks.push({
      date: this.calendarDay,
      userLogin: this.auth.getUser().login,
      userName: this.auth.getUserName(this.auth.getUser().login),
      dateCreated: new Date(),
      project: 'NR002',
      docNumber: '200101-222-101',
      details: '',
      time: 0,
      action: 'Drawing',
      projectValue: '',
      docNumberValue: '',
      actionValue: '',
      id: this.generateId(20),
      hours: 1,
      minutes: 0
    });
  }

  onProjectChanged(task: DailyTask) {
    if (task.project == 'OTHER'){
      this.docNumbers = ['OTHER'];
      task.docNumber = 'OTHER';
      task.action = 'OTHER';
    }
    else{
      this.docNumbers = _.sortBy(this.issues.filter(x => x.project == task.project && x.issue_type == 'RKD').map(x => x.doc_number), x => x);
      this.docNumbers.push('OTHER');
      task.docNumber = this.docNumbers[0];
      task.action = 'Drawing';
    }
  }

  cancel() {
    this.ref.close();
  }
  generateId(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() *
        charactersLength));
    }
    return result;
  }
  sendHours() {
    this.error = '';
    this.tasks.forEach(t => {
      t.time = t.hours + t.minutes / 60;
      console.log(t.time);
      if (t.project == 'OTHER' && t.projectValue.trim() == ''){
        this.error = 'You didnt specify project for task #' + (this.tasks.indexOf(t) + 1).toString();
        return;
      }
      if (t.docNumber == 'OTHER' && t.docNumberValue.trim() == ''){
        this.error = 'You didnt specify docNumber for task #' + (this.tasks.indexOf(t) + 1).toString();
        return;
      }
      if (t.action == 'OTHER' && t.actionValue.trim() == ''){
        this.error = 'You didnt specify action for task #' + (this.tasks.indexOf(t) + 1).toString();
        return;
      }
      // if (t.details.trim() == ''){
      //   this.error = 'You didnt specify details for task #' + (this.tasks.indexOf(t) + 1).toString();
      //   return;
      // }
      if (t.time == 0){
        this.error = 'You didnt specified time for task #' + (this.tasks.indexOf(t) + 1).toString();
        return;
      }
    });
    if (this.error == ''){
      this.tasks.forEach(t => {
        if (typeof (t.date) != "number"){
          t.date = t.date.getTime();
        }
        if (typeof (t.dateCreated) != "number"){
          t.dateCreated = t.dateCreated.getTime();
        }
        if (t.action == 'OTHER'){
          t.action = t.actionValue;
        }
        if (t.project == 'OTHER'){
          t.project = t.projectValue;
        }
        if (t.docNumber == 'OTHER'){
          t.docNumber = t.docNumberValue;
        }
        if (this.tasksSrc.find(x => x.id == t.id) == null){
          this.issueManager.addDailyTask(JSON.stringify(t));
        }
      });
      this.cancel();
    }
  }

  deleteTask(task: DailyTask) {
    this.issueManager.deleteDailyTask(task.id).then(() => {

    });
    this.tasks = this.tasks.filter(x => x.id != task.id);
  }
  close() {
    this.ref.close();
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
  getSum(){
    let sum = this.initialHours;
    this.tasks.forEach(t => {
      t.time = t.hours + t.minutes / 60;
      sum += t.time;
    });
    return sum;
  }
}
