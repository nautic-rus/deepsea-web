import { Component, OnInit } from '@angular/core';
import {IssueManagerService} from "../../domain/issue-manager.service";
import _ from "underscore";
import {Issue} from "../../domain/classes/issue";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {zipAll} from "rxjs/operators";
import {forkJoin, zip} from "rxjs";
import {MessageService} from "primeng/api";
import {LanguageService} from "../../domain/language.service";
import {DailyTask} from "../../domain/interfaces/daily-task";
import * as XLSX from "xlsx";

@Component({
  selector: 'app-labor',
  templateUrl: './labor.component.html',
  styleUrls: ['./labor.component.css']
})
export class LaborComponent implements OnInit {

  projects: string[] = ['N002', 'N004', 'P701', 'P707'];
  project = '';
  departments: string[] = [];
  department = '';
  stages: string[] = [];
  stage = '';
  statuses: string[] = [];
  status = '';
  taskTypes: string[] = [];
  taskType = '';
  issues: Issue[] = [];
  issuesSrc: any[] = [];
  labor: number = 10;
  laborUpdates: any = Object();
  issueSpentTime: DailyTask[] = [];

  constructor(public issueManagerService: IssueManagerService, public auth: AuthManagerService, private messageService: MessageService, public t: LanguageService) { }

  ngOnInit(): void {
    this.issueManagerService.getDailyTasks().then(res => {
      this.issueSpentTime = res;
      this.issueManagerService.getIssues('op').then(res => {
        this.issuesSrc = res;
        this.issues = res;
        this.issues = _.sortBy(this.issues, x => x.doc_number);
        this.stages = _.sortBy(_.uniq(this.issues.map(x => x.period)).filter(x => x != ''), x => x);
        this.statuses = _.sortBy(_.uniq(this.issues.map(x => this.issueManagerService.localeStatus(x.status, false))).filter(x => x != ''), x => x);
        this.taskTypes = _.sortBy(_.uniq(this.issues.map(x => x.issue_type)).filter(x => x != ''), x => x);
        this.issues.forEach(issue => issue.labor = issue.plan_hours == 0 ? 0 : Math.round(this.getConsumedLabor(issue.id, issue.doc_number) / issue.plan_hours * 100));
        this.issues.forEach(issue => {
          this.laborUpdates[issue.id] = Object({planHours: issue.plan_hours, locked: issue.plan_hours_locked});
        });
        this.statuses = ['-'].concat(this.statuses);
        this.taskTypes = ['-'].concat(this.taskTypes);
        console.log(this.issues);
      });
    });
    this.issueManagerService.getIssueProjects().then(projects => {
      this.projects = projects;
      this.projects.forEach((x: any) => x.label = this.getProjectName(x));
    });
    this.issueManagerService.getIssueDepartments().then(departments => {
      this.departments = departments;
    });
  }
  getProjectName(project: any){
    let res = project.name;
    if (project.rkd != ''){
      res += ' (' + project.rkd + ')';
    }
    return res;
  }
  filterIssues(){
    this.issues = [...this.issuesSrc];
    this.issues = this.issues.filter(x => x.project == this.project || this.project == '' || this.project == '-' || this.project == null);
    this.issues = this.issues.filter(x => x.department == this.department || this.department == '' || this.department == '-' || this.department == null);
    this.issues = this.issues.filter(x => x.period == this.stage || this.stage == '' || this.stage == '-' || this.stage == null);
    this.issues = this.issues.filter(x => x.issue_type == this.taskType || this.taskType == '' || this.taskType == '-' || this.taskType == null);
    this.issues = this.issues.filter(x => this.issueManagerService.localeStatus(x.status, false) == this.issueManagerService.localeStatus(this.status, false) || this.status == '' || this.status == '-' || this.status == null);
    this.issues = _.sortBy(this.issues, x => x.doc_number);
  }

  projectChanged() {
    this.filterIssues();
  }
  departmentChanged() {
    this.filterIssues();
  }
  stageChanged() {
    this.filterIssues();
  }
  taskTypeChanged() {
    this.filterIssues();
  }
  statusChanged() {
    this.filterIssues();
  }

  getConsumedLabor(id: number, doc_number: string) {
    let sum = 0;
    this.issueSpentTime.filter(x => x.issueId == id).forEach(spent => {
      sum += spent.time;
    });
    return sum;
  }

  saveLabor() {
    forkJoin(this.issues.filter(issue => issue.plan_hours != this.laborUpdates[issue.id].planHours).map(issue => this.issueManagerService.setPlanHours(issue.id, this.auth.getUser().login, this.laborUpdates[issue.id].planHours))).subscribe(res => {
      this.messageService.add({
        severity: 'success',
        summary: 'Сохранено',
        detail: 'Внесённые данные успешно сохранены'
      });
      this.issues.filter(issue => issue.plan_hours != this.laborUpdates[issue.id].planHours).forEach(issue => issue.plan_hours = this.laborUpdates[issue.id].planHours);
      this.issues.forEach(issue => issue.labor = Math.round(this.getConsumedLabor(issue.id, issue.doc_number) / issue.plan_hours * 100));
    });
  }

  lockLabor(id: number, state: number) {
    this.laborUpdates[id].locked = state;
    this.issueManagerService.lockPlanHours(id, state).then(res => {
      this.messageService.add({
        severity: 'success',
        summary: 'Сохранено',
        detail: 'Внесённые данные успешно сохранены'
      });
    });
  }
  replaceStage(input: string) {
    return input.replace('Stage ', '');
  }
  getDateOnly(dateLong: number): string {
    if (dateLong == 0){
      return '--/--/--';
    }
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
    // let date = new Date(dateLong);
    // let ye = new Intl.DateTimeFormat('ru', { year: '2-digit' }).format(date);
    // let mo = new Intl.DateTimeFormat('ru', { month: '2-digit' }).format(date);
    // let da = new Intl.DateTimeFormat('ru', { day: '2-digit' }).format(date);
    // return da + '.' + mo + '.' + ye;
  }


  openIssue(issue: Issue) {
    window.open('/?taskId=' + issue.id, '_blank');
  }

  getSumConsumed() {
    let sum = 0;
    this.issues.forEach(x => sum += this.getConsumedLabor(x.id, x.doc_number));
    return sum;
  }

  getSumPlan() {
    let sum = 0;
    this.issues.forEach(x => sum += x.plan_hours);
    return sum;
  }

  lockAll() {
    forkJoin(this.issues.map(issue => this.issueManagerService.lockPlanHours(issue.id, 1))).subscribe(res => {
      this.messageService.add({
        severity: 'success',
        summary: 'Сохранено',
        detail: 'Внесённые данные успешно сохранены'
      });
      this.issues.forEach(issue => {
        this.laborUpdates[issue.id].locked = 1;
        issue.plan_hours_locked = this.laborUpdates[issue.id].locked;
      });
    });
  }
  round(input: number, digit = 100) {
    return Math.round(input * digit) / digit;
  }

  exportXls() {
    let fileName = 'export_' + this.generateId(8) + '.xlsx';
    let data: any[] = [];

    this.issues.forEach(issue => {
      data.push({
        type: issue.issue_type,
        name: issue.name,
        doc_number: issue.doc_number,
        period: issue.period,
        contract_due_date: this.getDateOnly(issue.contract_due_date),
        start: this.getDateOnly(issue.start_date),
        due: this.getDateOnly(issue.due_date),
        status: this.issueManagerService.localeStatus(issue.status, false),
        manHours: this.getConsumedLabor(issue.id, issue.doc_number),
        plan: this.laborUpdates[issue.id].planHours})
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = {Sheets: {'data': worksheet}, SheetNames: ['data']};
    //worksheet['!cols'] = [{wch:13},{wch:13},{wch:10},{wch:10},{wch:10},{wch:10},{wch:8},{wch:14},{wch:10},{wch:10},{wch:10}];

    XLSX.writeFile(workbook, fileName);
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
}
