import { Component, OnInit } from '@angular/core';
import {DailyTask} from "../../../domain/interfaces/daily-task";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {Issue} from "../../../domain/classes/issue";
import _ from "underscore";
import {DynamicDialogRef} from "primeng/dynamicdialog";
import {LanguageService} from "../../../domain/language.service";

@Component({
  selector: 'app-daily-tasks',
  templateUrl: './daily-tasks.component.html',
  styleUrls: ['./daily-tasks.component.css']
})
export class DailyTasksComponent implements OnInit {

  calendarDay = new Date();
  amountOfHours = 8;
  amountOfHoursToAdd = 1;
  tasks: DailyTask[] = [];
  tasksSrc: DailyTask[] = [];

  projects: string[] = ['NR002', 'NR004', 'OTHER'];

  docNumbers: string[] = ['200101-222-101'];
  actions: string[] = ['Drawing', 'Model', 'OTHER']


  issues: Issue[] = [];
  error = '';

  constructor(public auth: AuthManagerService, public issue: IssueManagerService, public ref: DynamicDialogRef, public issueManager: IssueManagerService, public t: LanguageService) { }

  ngOnInit(): void {
    this.issue.getIssues('op').then(res => {
      this.issues = res;
      this.docNumbers = _.sortBy(this.issues.filter(x => x.project == 'NR002' && x.issue_type == 'RKD').map(x => x.doc_number), x => x);
      this.docNumbers.push('OTHER');
      //this.addHoursToList();
    });
    this.issue.getDailyTasks().then(res => {
      this.tasksSrc = res;
      this.changeDay();
    });
  }
  changeDay(){
    this.tasks = this.tasksSrc.filter(x => this.sameDay(x.date, this.calendarDay.getTime()));
    this.tasks.forEach(x => {
      if (!this.projects.includes(x.project)){
        x.projectValue = x.project;
        x.project = 'OTHER';
        x.docNumberValue = x.docNumber;
        x.docNumber = 'OTHER';
        x.actionValue = x.action;
        x.action = 'OTHER';
      }
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
      time: this.amountOfHoursToAdd,
      action: 'Drawing',
      projectValue: '',
      docNumberValue: '',
      actionValue: '',
      id: this.generateId(20)
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
    if (this.sumOfHours() != this.amountOfHours){
      this.error = 'The amount of hours you worked doesnt equal sum of tasks you entered';
      return;
    }
    this.tasks.forEach(t => {
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
      if (t.details.trim() == ''){
        this.error = 'You didnt specify details for task #' + (this.tasks.indexOf(t) + 1).toString();
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

  sumOfHours() {
    let sum = 0;
    this.tasks.forEach(t => sum += t.time);
    return sum;
  }

  deleteTask(task: DailyTask) {
    this.issueManager.deleteDailyTask(task.id).then(() => {

    });
    this.tasks = this.tasks.filter(x => x.id != task.id);
  }
  close() {
    this.ref.close();
  }
}
