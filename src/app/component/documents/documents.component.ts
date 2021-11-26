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

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent implements OnInit {
  projects: string[] = [];
  project = this.projects[0];
  issues: Issue[] = [];
  filters:  { status: any[],  revision: any[] } = { status: [], revision: [] };

  constructor(public issueManager: IssueManagerService, public l: LanguageService, private dialogService: DialogService, private auth: AuthManagerService) { }

  // @ts-ignore
  @ViewChild('table') table: Table;
  ngOnInit(): void {
    this.issueManager.getIssueProjects().then(projects => {
      this.projects = projects;
      if (projects.length > 1){
        this.project = projects[1];
        this.issueManager.getIssues('op').then(data => {
          this.issues = data.filter(x => x.issue_type.includes('RKD')).filter(x => x.project == this.project);
          this.filters.status = this.getFilters(this.issues, 'status');
          this.filters.revision = this.getFilters(this.issues, 'revision');
          this.issues.forEach(issue => issue.delivered_date = new Date(issue.delivered_date));
        });
      }
    });
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
        return this.issueManager.localeStatus(field, false);
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
    });
  }
  viewTask(id: number) {
    this.issueManager.getIssueDetails(id).then(res => {
      console.log(res);
      if (res.id != null){
        this.dialogService.open(ViewDocumentComponent, {
          showHeader: false,
          modal: true,
          data: res
        });
      }
    });
  }
  getDeliveredStatus(status: string): any {
    if (status == 'Delivered' && this.l.language == 'en'){
      return '<span style="color: #256029; background-color: #c8e6c9; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Completed</span>'
    }
    else if (status == 'Delivered' && this.l.language == 'ru'){
      return '<span style="color: #256029; background-color: #c8e6c9; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Завершён</span>'
    }
    else if (status != 'Delivered' && this.l.language == 'en'){
      return '<span style="color: #805b36; background-color: #ffd8b2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Not completed</span>'
    }
    else if (status != 'Delivered' && this.l.language == 'ru'){
      return '<span style="color: #805b36; background-color: #ffd8b2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">В работе</span>'
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
