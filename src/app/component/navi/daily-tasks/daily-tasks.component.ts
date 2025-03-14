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
import {MessageService} from "primeng/api";

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
  checked: boolean = false;

  projects: string[] = ['NR002', 'NR004', 'P701', 'P707', 'English', 'Operations group', 'Other'];
  filteredProjects: string[] = [...this.projects];

  docNumbers: string[] = [];
  filteredDocNumbers: string[] = [...this.docNumbers];


  actions: string[] = ['Drawing', 'Model'];
  filteredActions: string[] = [...this.actions];


  issues: Issue[] = [];
  error = '';

  form = new FormArray([]);

  constructor(private messageService: MessageService, public auth: AuthManagerService, public issue: IssueManagerService, public ref: DynamicDialogRef, public issueManager: IssueManagerService, public t: LanguageService, public conf: DynamicDialogConfig) { }

  ngOnInit(): void {
    this.calendarDay = this.conf.data[0];
    this.initialHours = this.conf.data[1];
    this.issue.getIssues('op').then(res => {
      this.issues = res;
      //this.docNumbers = _.sortBy(this.issues.filter(x => x.project == 'NR002' && x.issue_type == 'RKD').map(x => x.doc_number), x => x);
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

    let newTask = new DailyTask(
      0,
      this.calendarDay.getTime(),
      new Date().getTime(),
      this.auth.getUser().login,
      '',
      '',
      timeUsed,
      0,
      this.auth.getUserName(this.auth.getUser().login),
      '',
      '',
      Math.floor(timeUsed),
      Math.round((timeUsed - Math.floor(timeUsed)) * 60),
      '',
      '',
      '',
      false
    );
    this.tasks.push(newTask);

    this.form.push(new FormGroup({
      project: new FormControl(newTask.project, [Validators.required]),
      docNumber: new FormControl(newTask.project, [Validators.required]),
    }));

  }
  onProjectChanged(task: DailyTask) {
    this.docNumbers = _.sortBy(this.issues.filter(x => x.project == task.project && x.issue_type == 'RKD').map(x => x.doc_number), x => x);
    this.filteredDocNumbers = [...this.docNumbers];

    if (task.project == 'Operations group' || task.project == 'English' || task.project == 'Other'){
      this.docNumbers = ['-'];
      task.docNumber = '-';
      task.action = '-';
      if (task.project == 'English'){
        task.details = 'English Lesson';
      }
      if (task.project == 'Operations group'){
        task.details = 'Operations group';
      }
    }
    // else{
    //   this.docNumbers = _.sortBy(this.issues.filter(x => x.project == task.project && x.issue_type == 'RKD').map(x => x.doc_number), x => x);
    //   this.docNumbers.push('Other');
    //   task.docNumber = this.docNumbers[0];
    //   task.action = 'Drawing';
    // }
    // this.filteredDocNumbers = [...this.docNumbers];
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
        if (t.docNumber != '-' && t.docNumber != ''){
          let findIssue = this.issues.find(x => x.doc_number == t.docNumber);
          if (findIssue != null){
            t.issueId = findIssue.id;
            this.auth.getConsumedPlanHours(this.auth.getUser().id).subscribe(consumed => {
              let consumedIds = consumed.map(x => x.hour_id);
              let today: Date = new Date();
              this.auth.getUsersPlanHours(this.auth.getUser().id, 0, 1).subscribe(userPlanHours => {
                let userPlanHoursToday = userPlanHours.filter(x => x.day == today.getDate() && x.month == today.getMonth() && x.year == today.getFullYear() && x.hour_type == 1);
                let availableToday = userPlanHoursToday.filter(x => !consumedIds.includes(x.id));
                if (availableToday.length >= t.hours){
                  let consume = _.sortBy(availableToday, x => x.id).slice(0, t.hours);
                  this.auth.consumePlanHours(consume, this.auth.getUser().id, t.issueId, t.details).subscribe(res => {
                    this.close();
                  });
                }
                else{
                  this.messageService.add({key:'month-tasks', severity:'error', summary:'Ошибка', detail:'На хватает свободных часов для списания на сегодня'});
                  return;
                }
              });
            });
          }
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
      // if (t.action.trim() == ''){
      //   this.invalid.push(t.id + '-a');
      //   this.error = 'You didnt specify action for task #' + (this.tasks.indexOf(t) + 1).toString();
      //   //return;
      // }
      if (t.details.trim() == '' && t.project == 'Other'){
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
    let filtered: string[] = [];
    this.projects.forEach(p => {
      if (p.trim().toLowerCase().includes(event.query.trim().toLowerCase())) {
        filtered.push(p);
      }
    });
    this.filteredProjects = filtered;
  }
  filterDocNumbers(event: any) {
    let filtered: string[] = [];
    this.docNumbers.forEach(p => {
      if (p.trim().toLowerCase().includes(event.query.trim().toLowerCase())) {
        filtered.push(p);
      }
    });
    this.filteredDocNumbers = filtered;
  }
  filterActions(event: any) {
    let filtered: string[] = [];
    this.actions.forEach(p => {
      if (p.trim().toLowerCase().includes(event.query.trim().toLowerCase())) {
        filtered.push(p);
      }
    });
    this.filteredActions = filtered;
  }

  createOpTask() {
    if (this.checked){
      let timeUsed = 0;
      this.tasks.forEach(t => timeUsed += t.time);
      timeUsed = timeUsed < 8 ? 8 - timeUsed : 0;

      let newTask = new DailyTask(
        0,
        this.calendarDay,
        new Date().getTime(),
        this.auth.getUser().login,
        'Operations group',
        'Operations group',
        timeUsed,
        -3,
        this.auth.getUserName(this.auth.getUser().login),
        '-',
        '-',
        Math.floor(timeUsed),
        Math.round((timeUsed - Math.floor(timeUsed)) * 60),
        '',
        '',
        '',
        false
      );
      this.tasks = [newTask];
    }
    else{
      this.tasks = [];
    }
  }
}
