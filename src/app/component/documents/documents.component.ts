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
import {MessageService, PrimeNGConfig} from "primeng/api";
import {ActivatedRoute, Router} from "@angular/router";
import JSZip from "jszip";

import {DeviceDetectorService} from "ngx-device-detector";

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent implements OnInit {
  projects: string[] = ['NR002', 'NR004', '01701-ORION', '03070-CRABBER', '01701-LEV', '03095-ANDROMEDA'];
  department = 'Hull';
  project = '';
  issues: Issue[] = [];
  filters:  { status: any[],  revision: any[], department: any[] } = { status: [], revision: [], department: [] };
  waitForZipFiles = false;
  selectedView: string = 'list';
  noResult = false;
  projectNames: any[] = [];


  constructor(public device: DeviceDetectorService, private config: PrimeNGConfig, public issueManager: IssueManagerService, public l: LanguageService, private dialogService: DialogService, public auth: AuthManagerService, private router: Router, private messageService: MessageService, public route: ActivatedRoute) { }

  // @ts-ignore
  @ViewChild('table') table: Table;
  showWithFilesOnly = true;
  ngOnInit(): void {
    this.projects = this.projects.filter(x => this.auth.getUser().visible_projects.includes(x));
    this.route.queryParams.subscribe(params => {
      if (params.project != null && this.projects.find(x => x == params.project) != null){
        this.project = params.project;
      }
      else {
        this.project = this.projects[0];
      }
      this.showWithFilesOnly = params.showWithFilesOnly == null || +params.showWithFilesOnly == 1;
      this.department = params.department != null ? params.department : 'Hull';
      if (this.department == 'Pipe' || this.department == 'System'){
        this.department = 'System';
        //this.project = 'NR004';
        //this.showWithFilesOnly = false;
      }
      this.fillIssues();
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

  projectChanged(showWithFilesChange: boolean = false) {
    this.issues.splice(0, this.issues.length);
    this.router.navigate([], {queryParams: {project: this.project, department: this.department, showWithFilesOnly: this.showWithFilesOnly ? (showWithFilesChange ? 0 : 1) : (showWithFilesChange ? 1 : 0) }});
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
      case 'Electric': window.open(`/electric-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}`, '_blank'); break;
      case 'Accommodation': window.open(`/accommodation-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}`, '_blank'); break;
      default: break;
    }
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
  copyUrl(issueId: number, project: string, docNumber: string, department: string){
    let foranProject = project.replace('NR', 'N');
    navigator.clipboard.writeText(location.origin + `/esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}`);
    this.messageService.add({key:'task', severity:'success', summary:'Copied', detail:'You have copied document url.'});
  }
  downloadDocFiles(issue: Issue){
    this.issueManager.getIssueDetails(issue.id).then(details => {
      let files = details.revision_files.filter(x => x.revision == details.revision && x.group == 'Drawings');
      if (files.length == 0){
        this.messageService.add({key:'task', severity:'error', summary:'No files', detail:'There are no files for this document.'});
      }
      else{
        let zipped: string[] = [];
        this.waitForZipFiles = true;
        Promise.all(files.map(x => fetch(x.url))).then(blobs => {
          let zip = new JSZip();
          blobs.forEach(blob => {
            // @ts-ignore
            let name: string = blob.url.split('/').pop();
            while (zipped.includes(name)){
              name = name.split('.').reverse().pop() + '$.' + name.split('.').pop();
            }
            zipped.push(name);
            zip.file(name, blob.blob());
          });
          zip.generateAsync({type:"blob"}).then(res => {
            this.waitForZipFiles = false;
            saveAs(res, issue.doc_number + '-' + new Date().getTime() + '.zip');
          });
        });
      }
    });
  }
  trim(input: string, length: number = 3): string {
    if (input.length <= length) {
      return input;
    } else {
      return input.substr(0, length) + '.';
    }
  }

  fillIssues() {
    this.noResult = false;
    this.issueManager.getIssues('op').then(data => {
      this.issueManager.getNestingFiles().then(nestingFiles => {
        this.noResult = true;

        if (this.department == 'Hull'){
          this.issueManager.getProjectNames().then(projectNames => {
            this.projectNames = projectNames;
            console.log(this.projectNames);
            console.log(this.project);
            let findProject = projectNames.find((x: any) => x.pdsp == this.project);
            if (findProject == null){
              findProject = projectNames.find((x: any) => x.name == this.project);
            }
            if (findProject != null){
              console.log(findProject);
              this.issueManager.getCloudFiles(findProject.cloudRkd + '/Documents/Hull').then(docs => {
                console.log('docs received');
                this.issues = data.filter(x => x.issue_type.includes('RKD')).filter(x => x.project == this.project).filter(issue => !this.showWithFilesOnly || docs.find(d => d.url.includes(issue.doc_number)) != null);
                this.issues = this.issues.filter(x => x.department == this.department || x.assistant == this.department);
                this.issues = _.sortBy(this.issues, x => x.doc_number);
                console.log(this.issues);
              });
            }
          });
        }
        else if (this.department == 'System'){
          this.issueManager.getRevisionFiles().then(revFiles => {
            this.issues = data.filter(x => x.issue_type.includes('RKD')).filter(x => x.project == this.project).filter(issue => !this.showWithFilesOnly || revFiles.find((x: any) => issue.id == x.issue_id) != null);
            this.issues = this.issues.filter(x => x.department == this.department || x.assistant == this.department);
            this.issues = _.sortBy(this.issues, x => x.doc_number);
          });
        }
        else if (this.department == 'Devices'){
          this.issueManager.getRevisionFiles().then(revFiles => {
            this.issues = data.filter(x => x.issue_type.includes('RKD')).filter(x => x.project == this.project).filter(issue => !this.showWithFilesOnly || revFiles.find((x: any) => issue.id == x.issue_id) != null);
            this.issues = this.issues.filter(x => x.department == this.department || x.assistant == this.department);
            this.issues = _.sortBy(this.issues, x => x.doc_number);
          });
        }
        else if (this.department == 'Trays'){
          this.showWithFilesOnly = false;
          this.issueManager.getRevisionFiles().then(revFiles => {
            this.issues = data.filter(x => x.issue_type.includes('RKD')).filter(x => x.project == this.project).filter(issue => !this.showWithFilesOnly || revFiles.find((x: any) => issue.id == x.issue_id) != null);
            this.issues = this.issues.filter(x => (x.department == 'Electric' || x.assistant == 'Electric') && x.doc_number.includes("-871-") && !x.doc_number.includes("200101-871-001Э4"));
            this.issues = _.sortBy(this.issues, x => x.doc_number);
          });
        }
        else if (this.department == 'Electric'){
          this.issueManager.getRevisionFiles().then(revFiles => {
            this.issues = data.filter(x => x.issue_type.includes('RKD')).filter(x => x.project == this.project).filter(issue => !this.showWithFilesOnly || revFiles.find((x: any) => issue.id == x.issue_id) != null);
            this.issues = this.issues.filter(x => x.department == this.department || x.assistant == this.department);
            this.issues = _.sortBy(this.issues, x => x.doc_number);
          });
        }
        else if (this.department == 'Accommodation'){
          this.issueManager.getRevisionFiles().then(revFiles => {
            this.issues = data.filter(x => x.issue_type.includes('RKD')).filter(x => x.project == this.project).filter(issue => !this.showWithFilesOnly || revFiles.find((x: any) => issue.id == x.issue_id) != null);
            this.issues = this.issues.filter(x => x.department == this.department || x.assistant == this.department);
            this.issues = _.sortBy(this.issues, x => x.doc_number);
          });
        }
        // this.issues.forEach(issue => {
        //   if (issue.status == issue.closing_status){
        //     issue.status = 'Completed';
        //   }
        //   else{
        //     issue.status = 'In Work';
        //   }
        // });
        // this.filters.status = this.getFilters(this.issues, 'status');
        // this.filters.revision = this.getFilters(this.issues, 'revision');
        // this.filters.department = this.getFilters(this.issues, 'department');
        //this.issues.forEach(issue => issue.delivered_date = new Date(issue.delivered_date));
        this.issues = this.issues.filter(x => x.department == this.department);
        this.issues = _.sortBy(this.issues, x => x.doc_number);
        for (let x = 0; x < 10; x ++){
          // @ts-ignore
          this.issues.push(null);
        }
      });
    });
  }
  isDesktop() {
    return this.device.isDesktop() && window.innerWidth > 1296;
  }
}
