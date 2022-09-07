import { Component, OnInit } from '@angular/core';
import {DailyTask} from "../../../domain/interfaces/daily-task";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {Issue} from "../../../domain/classes/issue";
import _ from "underscore";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {LanguageService} from "../../../domain/language.service";
import {DeleteDailyTaskComponent} from "./show-task/delete-daily-task/delete-daily-task.component";
import {AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators} from "@angular/forms";
import {LV} from "../../../domain/classes/lv";

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
  invalid: string[] = [];
  dayHoursToWork = 23;


  projects: LV[] = [new LV('NR002') , new LV('NR004'), new LV('P701') ,new LV('P707') , new LV('English')];
  filteredProjects: LV[] = [...this.projects];

  docNumbers: LV[] = [];
  filteredDocNumbers: LV[] = [...this.docNumbers];


  actions: LV[] = [new LV('Drawing'), new LV('Model')];
  filteredActions: LV[] = [...this.actions];


  issues: Issue[] = [];
  error = '';

  form = new FormArray([]);

  constructor(public auth: AuthManagerService, public issue: IssueManagerService, public ref: DynamicDialogRef, public issueManager: IssueManagerService, public t: LanguageService, public conf: DynamicDialogConfig) { }

  ngOnInit(): void {
    this.calendarDay = this.conf.data[0];
    this.initialHours = this.conf.data[1];
    this.issue.getIssues('op').then(res => {
      this.issues = res;
      this.docNumbers = _.sortBy(this.issues.filter(x => x.project == 'NR002' && x.issue_type == 'RKD').map(x => new LV(x.doc_number)), x => x);
      this.setInitial();
    });
  }
  setInitial(){
    this.initialHours = 0;
    this.issueManager.getDailyTasks().then(res => {
      res.forEach(t => {
        t.hidden = true;
        t.hours = Math.floor(t.time);
        t.minutes = Math.round((t.time - Math.floor(t.time)) * 60);
      });
      this.tasks = res.filter(x => x.userLogin == this.auth.getUser().login && this.sameDay(x.date, this.calendarDay.getTime()));
      this.dayHoursToWork = 23 - Math.ceil(this.getSum());
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
    let timeUsed = 0;
    this.tasks.forEach(t => timeUsed += t.time);
    timeUsed = timeUsed < 8 ? 8 - timeUsed : 0;

    let newTask = {
      date: this.calendarDay,
      userLogin: this.auth.getUser().login,
      userName: this.auth.getUserName(this.auth.getUser().login),
      dateCreated: new Date(),
      project: 'NR002',
      docNumber: '200101-222-101',
      details: '',
      time: timeUsed,
      action: 'Drawing',
      id: this.generateId(20),
      hours: Math.floor(timeUsed),
      minutes: Math.round((timeUsed - Math.floor(timeUsed)) * 60),
      projectValue: '',
      docNumberValue: '',
      actionValue: '',
      hidden: false
    };
    this.tasks.push(newTask);

    this.form.push(new FormGroup({
      project: new FormControl(newTask.project, [Validators.required]),
      docNumber: new FormControl(newTask.project, [Validators.required]),
    }));

  }
  onProjectChanged(task: DailyTask) {
    if (task.project == 'English'){
      this.docNumbers = [new LV('-')];
      task.docNumber = '-';
      task.action = '-';
    }
    else{
      this.docNumbers = _.sortBy(this.issues.filter(x => x.project == task.project && x.issue_type == 'RKD').map(x => new LV(x.doc_number)), x => x);
      this.docNumbers.push(new LV('Other'));
      task.docNumber = this.docNumbers[0].value;
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
   this.check();
    if (this.error == ''){
      this.tasks.filter(t => !t.hidden).forEach(t => {
        if (typeof (t.date) != "number"){
          t.date = t.date.getTime();
        }
        if (typeof (t.dateCreated) != "number"){
          t.dateCreated = t.dateCreated.getTime();
        }
        if (this.tasksSrc.find(x => x.id == t.id) == null){
          this.issueManager.addDailyTask(JSON.stringify(t));
        }
      });
      this.cancel();
    }
  }
  check(){
    this.invalid.splice(0, this.invalid.length);
    this.error = '';
    this.tasks.filter(t => !t.hidden).forEach(t => {
      t.time = t.hours + t.minutes / 60;
      if (t.project.trim() == ''){
        this.invalid.push(t.id + '-p');
        this.error = 'You didnt specify project for task #' + (this.tasks.indexOf(t) + 1).toString();
        //return;
      }
      if (t.docNumber.trim() == ''){
        this.invalid.push(t.id + '-dN');
        this.error = 'You didnt specify docNumber for task #' + (this.tasks.indexOf(t) + 1).toString();
        //return;
      }
      if (t.action.trim() == ''){
        this.invalid.push(t.id + '-a');
        this.error = 'You didnt specify action for task #' + (this.tasks.indexOf(t) + 1).toString();
        //return;
      }
      if (t.details.trim() == ''){
        this.invalid.push(t.id + '-d');
        this.error = 'You didnt specify details for task #' + (this.tasks.indexOf(t) + 1).toString();
        //return;
      }
      if (t.time == 0){
        this.invalid.push(t.id + '-t');
        this.error = 'You didnt specified time for task #' + (this.tasks.indexOf(t) + 1).toString();
        //return;
      }
    });
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

  dayChanged() {
    this.setInitial();
  }

  isInvalid(value: string) {
    return this.invalid.includes(value);
  }

  deleteDailyTask(task: any) {
    this.issueManager.deleteDailyTask(task.id).then(() => {
    });
    this.tasks = this.tasks.filter(x => x.id != task.id);
  }

  filterProjects(event: any) {
    let filtered: LV[] = [];
    this.projects.forEach(p => {
      if (p.value.trim().toLowerCase().includes(event.query.trim().toLowerCase())) {
        filtered.push(p);
      }
    });
    this.filteredProjects = filtered;
  }
  filterDocNumbers(event: any) {
    let filtered: LV[] = [];
    this.docNumbers.forEach(p => {
      if (p.value.trim().toLowerCase().includes(event.query.trim().toLowerCase())) {
        filtered.push(p);
      }
    });
    this.filteredDocNumbers = filtered;
  }
  filterActions(event: any) {
    let filtered: LV[] = [];
    this.actions.forEach(p => {
      if (p.value.trim().toLowerCase().includes(event.query.trim().toLowerCase())) {
        filtered.push(p);
      }
    });
    this.filteredActions = filtered;
  }
}
