import {Component, OnInit, ViewChild} from '@angular/core';
import {Material} from "../../domain/classes/material";
import {MaterialManagerService} from "../../domain/material-manager.service";
import {Issue} from "../../domain/classes/issue";
import {IssueManagerService} from "../../domain/issue-manager.service";
import {LanguageService} from "../../domain/language.service";
import {Table} from "primeng/table";
import {TaskComponent} from "../task/task.component";
import {DialogService} from "primeng/dynamicdialog";
import {ViewDocumentComponent} from "./view-document/view-document.component";
import * as _ from "underscore";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {any, object} from "underscore";
import {PrimeNGConfig} from "primeng/api";
import {Router} from "@angular/router";

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent implements OnInit {
  projects: string[] = [];
  project = '';
  issues: Issue[] = [];
  filters:  { status: any[],  revision: any[], department: any[] } = { status: [], revision: [], department: [] };

  constructor(private config: PrimeNGConfig, public issueManager: IssueManagerService, public l: LanguageService, private dialogService: DialogService, private auth: AuthManagerService, private router: Router) { }

  // @ts-ignore
  @ViewChild('table') table: Table;
  ngOnInit(): void {
    this.issueManager.getIssueProjects().then(projects => {
      this.projects = projects.filter(x => this.auth.getUser().visible_projects.includes(x));
      this.project = this.projects[0];
      if (this.project == '-'){
        this.project = this.projects[this.projects.length - 1];
      }
      this.projectChanged();
    });
    if (this.l.language == 'ru'){
      this.config.setTranslation({
        clear: "Очистить",
        apply: "Принять",
        removeRule: "Удалить условие",
        addRule: "Добавить условие",
        dateIs: "Выбраная дата",
        dateIsNot: "Кроме даты",
        matchAll: "Все условия",
        matchAny: "Любое условие",
        dateBefore: "До выбраной даты",
        dateAfter: "После выбраной даты",
        monthNames: ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"],
      });
    }
  }
  getFilters(issues: any[], field: string): any[] {
    let res: any[] = [];
    let uniq = _.uniq(issues, x => x[field]);
    uniq.forEach(x => {
      res.push({
        label: this.localeFilter(field, x[field]),
        value: x[field]
      })
    });
    return _.sortBy(res, x => x.label);
  }
  localeFilter(column: string, field: string): string {
    switch (column) {
      case 'issue_type':
        return this.issueManager.localeTaskType(field);
      case 'started_by':
        return this.auth.getUserName(field);
      case 'assigned_to':
        return this.auth.getUserName(field);
      case 'priority':
        return this.issueManager.localeTaskPriority(field);
      case 'status':
        return this.getDeliveredStatus(field, false);
      default:
        return field;
    }
  }
  getDeliveredDate(s: string) {
    return '-';
  }

  projectChanged() {
    this.issueManager.getIssues('op').then(data => {
      this.issues = data.filter(x => x.issue_type.includes('RKD')).filter(x => x.project == this.project);
      this.issues.forEach(issue => {
        if (issue.status == issue.closing_status){
          issue.status = 'Completed';
        }
        else{
          issue.status = 'In Work';
        }
      })
      this.filters.status = this.getFilters(this.issues, 'status');
      this.filters.revision = this.getFilters(this.issues, 'revision');
      this.filters.department = this.getFilters(this.issues, 'department');
      this.issues.forEach(issue => issue.delivered_date = new Date(issue.delivered_date));
      this.issues = _.sortBy(this.issues, x => x.doc_number);
    });
  }
  viewTask(issueId: number, project: string, docNumber: string, department: string) {
    let foranProject = project.replace('NR', 'N');
    window.open(`/esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}`, '_blank');
    // this.router.navigate(['esp'], {queryParams: {issueId, foranProject, docNumber, department}});
    // this.issueManager.getIssueDetails(id).then(res => {
    //   console.log(res);
    //   if (res.id != null){
    //     this.dialogService.open(ViewDocumentComponent, {
    //       showHeader: false,
    //       modal: true,
    //       data: res
    //     });
    //   }
    // });
  }
  getDeliveredStatus(status: string, styled = true): any {
    let tr = this.localeStatus(status);
    switch (status){
      case 'Completed': return styled ? '<span style="color: #256029; background-color: #c8e6c9; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">' + tr + '</span>' : tr;
      case 'In Work': return styled ? '<span style="color: #805b36; background-color: #ffd8b2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">' + tr + '</span>' : tr;
      default: return status;
    }
  }
  localeStatus(status: string){
    if (this.l.language == 'ru'){
      switch (status) {
        case 'Completed' : return 'Завершён';
        case 'In Work': return 'В работе';
        default: return status;
      }
    }
    else{
      return status;
    }
  }
  getDate(dateLong: number): string{
    if (dateLong == 0){
      return '--/--/----';
    }
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
  }
}
