import { Component, OnInit } from '@angular/core';
import {Issue} from "../../domain/classes/issue";
import {Router} from "@angular/router";
import {LanguageService} from "../../domain/language.service";
import {IssueManagerService} from "../../domain/issue-manager.service";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {MessageService} from "primeng/api";
import _ from "underscore";

@Component({
  selector: 'app-doclist',
  templateUrl: './doclist.component.html',
  styleUrls: ['./doclist.component.css']
})
export class DoclistComponent implements OnInit {

  projects: string[] = ['NR002', 'NR004', '01701-ORION', '03070-CRABBER', '01701-LEV', '03095-ANDROMEDA'];
  project = '';
  department = '';
  departments: string[] = [];
  issues: Issue[] = [];
  filters:  { status: any[],  revision: any[], department: any[] } = { status: [], revision: [], department: [] };
  projectNames: any[] = [];
  issuesSrc: any[] = [];
  taskType = '';
  taskTypes: string[] = [];
  statuses: string[] = [];
  status = '';

  constructor(private router: Router, public l: LanguageService, public issueManager: IssueManagerService, public auth: AuthManagerService, private messageService: MessageService) { }

  ngOnInit(): void {
  }

  projectChanged(showWithFilesChange: boolean = false) {
    this.issues.splice(0, this.issues.length);
    this.router.navigate([], {queryParams: {project: this.project, department: this.department}});
  }

  viewTask(issueId: number, project: string, docNumber: string, department: string, assistant: string) {
    let foranProject = project.replace('NR', 'N');
    let findProject = this.projectNames.find((x: any) => x.pdsp == project || x.rkd == project);
    if (findProject != null){
      foranProject = findProject.foran;
    }
    switch (this.department) {
      case 'Hull': window.open(`/hull-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}`, '_blank'); break;
      case 'System': window.open(`/pipe-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}`, '_blank'); break;
      case 'Devices': window.open(`/device-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}`, '_blank'); break;
      case 'Trays': window.open(`/trays?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}`, '_blank'); break;
      case 'Cables': window.open(`/cables?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}`, '_blank'); break;
      case 'Electric': window.open(`/electric-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}`, '_blank'); break;
      case 'Accommodation': window.open(`/accommodation-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}`, '_blank'); break;
      default: break;
    }
  }
  filterIssues(){
    this.issues = [...this.issuesSrc];
    this.issues = this.issues.filter(x => x.project == this.project || this.project == '' || this.project == '-' || this.project == null);
    this.issues = this.issues.filter(x => x.department == this.department || this.department == '' || this.department == '-' || this.department == null);
    this.issues = this.issues.filter(x => x.issue_type == this.taskType || this.taskType == '' || this.taskType == '-' || this.taskType == null);
    this.issues = this.issues.filter(x => this.issueManager.localeStatus(x.status, false) == this.issueManager.localeStatus(this.status, false) || this.status == '' || this.status == '-' || this.status == null);
    this.issues = _.sortBy(this.issues, x => x.doc_number);
  }

  copyUrl(issueId: number, project: string, docNumber: string, department: string){
    let foranProject = project.replace('NR', 'N');
    navigator.clipboard.writeText(location.origin + `/esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}`);
    this.messageService.add({key:'task', severity:'success', summary:'Copied', detail:'You have copied document url.'});
  }

  departmentChanged() {
    this.filterIssues();
  }

  taskTypeChanged() {
    this.filterIssues();
  }

}
