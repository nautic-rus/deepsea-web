import {Component, OnInit, ViewChild} from '@angular/core';
import {Issue} from "../../domain/classes/issue";
import {Router} from "@angular/router";
import {LanguageService} from "../../domain/language.service";
import {IssueManagerService} from "../../domain/issue-manager.service";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {MessageService} from "primeng/api";
import _ from "underscore";
import {Table} from "primeng/table";
import * as XLSX from "xlsx";
import {LV} from "../../domain/classes/lv";
import {UntieComponent} from "../task/untie/untie.component";
import {DownloadAllDocsComponent} from "./download-all-docs/download-all-docs.component";
import {DialogService} from "primeng/dynamicdialog";

@Component({
  selector: 'app-doclist',
  templateUrl: './doclist.component.html',
  styleUrls: ['./doclist.component.css']
})
export class DoclistComponent implements OnInit {

  projects: any[] = [];
  project: any;
  department: string = '';
  //departments: string[] = ['Hull', 'System', 'Devices', 'Trays', 'Cables', 'Electric', 'Accommodation' ];
  departments: any[] = [];
  selectedDepartments: string[] = [];
  selectedTaskTypes: string[] = [];
  selectedProjects: string[] = [];
  selectedTaskStages: string[] = [];
  issuesSrc: Issue[] = [];
  issues: Issue[] = [];
  filters:  { status: any[],  revision: any[], department: any[] } = { status: [], revision: [], department: [] };
  projectNames: any[] = [];
  taskType = '';
  taskTypes: LV[] = ['-', 'RKD', 'PDSP', 'ED'].map(x => new LV(x));
  taskStages: LV[] = [];
  statuses: string[] = [];
  status = '';
  showWithFilesOnly = true;
  loading = false;
  revisionFiles: any[] = [];
  zipDocsUrl = '';
  searchValue = '';
  constructor(private router: Router, public l: LanguageService, public issueManager: IssueManagerService, public auth: AuthManagerService, private messageService: MessageService, private dialogService: DialogService) { }


  @ViewChild('table') table: Table;


  ngOnInit(): void {
    this.selectedTaskTypes = this.taskTypes.map(x => x.value);
    // this.issueManager.getIssueProjects().then(projects => {
    //   this.projects = projects;
    //   this.projects.forEach((x: any) => x.label = this.getProjectName(x));
    //   this.projects = this.projects.filter(x => this.auth.getUser().visible_projects.includes(x.name));
    //   this.selectedProjects = [...this.projects.map(x => x.name)];
    //   this.selectedProjects = localStorage.getItem('selectedProjects') != null ? JSON.parse(localStorage.getItem('selectedProjects')!) : this.selectedProjects;
    //   this.showWithFilesOnly = localStorage.getItem('showWithFilesOnly') != null ? localStorage.getItem('showWithFilesOnly')! == 'true' : this.showWithFilesOnly;
    // });
    this.loading = true;
    this.issueManager.getIssues('op').then(res => {
      this.issuesSrc = res.filter(x => x.issue_type == 'RKD' || x.issue_type == 'PDSP' || x.issue_type == 'ED');
      this.issues = this.issuesSrc;
      this.issueManager.getRevisionFiles().then(revisionFiles => {
        this.revisionFiles = revisionFiles;
        this.filterIssues();
        this.loading = false;
      });

      this.projects = _.sortBy(_.uniq(this.issues.map(x => x.project)), x => x).map(x => new LV(x));
      this.projects = this.projects.filter(x => this.auth.getUser().visible_projects.includes(x.label));

      this.selectedProjects = localStorage.getItem('selectedProjects') != null ? JSON.parse(localStorage.getItem('selectedProjects')!) : this.selectedProjects;
      this.showWithFilesOnly = localStorage.getItem('showWithFilesOnly') != null ? localStorage.getItem('showWithFilesOnly')! == 'true' : this.showWithFilesOnly;

      this.departments = _.sortBy(_.uniq(this.issues.map(x => x.department)), x => x).map(x => new LV(x));
      this.selectedDepartments = [...this.departments.map(x => x.name)];
      this.selectedDepartments = localStorage.getItem('selectedDepartments') != null ? JSON.parse(localStorage.getItem('selectedDepartments')!) : this.selectedDepartments;


      this.taskStages = _.sortBy(_.uniq(this.issues.map(x => x.period)), x => this.getNumber(x)).map(x => new LV(x));
      this.selectedTaskStages = this.taskStages.map(x => x.value);
      this.selectedTaskStages = localStorage.getItem('selectedTaskStages') != null ? JSON.parse(localStorage.getItem('selectedTaskStages')!) : this.selectedTaskStages;
    });
    // this.issueManager.getDepartments().subscribe(departments => {
    //   this.departments = departments.filter(x => x.visible_documents == 1);
    //   this.selectedDepartments = [...this.departments.map(x => x.name)];
    //   this.selectedDepartments = localStorage.getItem('selectedDepartments') != null ? JSON.parse(localStorage.getItem('selectedDepartments')!) : this.selectedDepartments;
    // });
  }

  getNumber(text: string){
    let r = new RegExp('\\d+');
    let res = r.test(text) ? r.exec(text)![0] : '0';
    while (res.length < 4){
      res = '0' + res;
    }
    return res;
  }
  getProjectName(project: any){
    let res = project.name;
    if (project.rkd != ''){
      res += ' (' + project.rkd + ')';
    }
    return res;
  }
  projectChanged() {
    localStorage.setItem('selectedProjects', JSON.stringify(this.selectedProjects));
    localStorage.setItem('showWithFilesOnly', this.showWithFilesOnly ? 'true' : 'false');
    this.filterIssues();
  }
  exportXLS() {
    let fileName = 'export_' + this.generateId(8) + '.xlsx';
    let data: any[] = [];
    this.issues.filter((x: any) => x != null).forEach(issue => {
      data.push({
        'Doc number': issue.doc_number,
        'Title': issue.name,
        'Department': issue.department,
        'Stage': issue.period,
        'Contract due date': this.getDateOnly(issue.contract_due_date),
        'Last update': this.getDateOnly(issue.last_update),
        'Comment': issue.issue_comment
      })
    });
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = {Sheets: {'data': worksheet}, SheetNames: ['data']};
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
  getDateOnly(dateLong: number): string {
    if (dateLong == 0){
      return '--/--/--';
    }
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
  }
  viewTask(issueId: number, project: string, docNumber: string, department: string, assistant: string) {
    let foranProject = project.replace('NR', 'N');
    let findProject = this.projectNames.find((x: any) => x != null && (x.name == project || x.pdsp == project || x.rkd == project));
    if (findProject != null){
      foranProject = findProject.foran;
    }
    console.log(department);
    console.log(project);
    // let hullTasks = ['03070-532-0001', '200101-525-007'];
    // if (hullTasks.includes(docNumber)){
    //   department = 'Hull';
    // }
    if (this.selectedDepartments.includes(assistant)){
      department = assistant;
    }

    switch (department) {
      case 'Hull': window.open(`/hull-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
      case 'System': window.open(`/pipe-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
      case 'Devices': window.open(`/device-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
      case 'Trays': window.open(`/trays?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
      case 'Cables': window.open(`/cables?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
      case 'Electric': window.open(`/electric-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
      case 'Accommodation': window.open(`/accommodation-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
      case 'Design': window.open(`/design-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
      case 'General': window.open(`/general-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
      default: break;
    }
  }
  filterIssues(){
    this.selectedProjects = localStorage.getItem('selectedProjects') != null ? JSON.parse(localStorage.getItem('selectedProjects')!) : this.selectedProjects;
    this.selectedDepartments = localStorage.getItem('selectedDepartments') != null ? JSON.parse(localStorage.getItem('selectedDepartments')!) : this.selectedDepartments;
    this.selectedTaskTypes = localStorage.getItem('selectedTaskTypes') != null ? JSON.parse(localStorage.getItem('selectedTaskTypes')!) : this.selectedTaskTypes;
    this.selectedTaskStages = localStorage.getItem('selectedTaskStages') != null ? JSON.parse(localStorage.getItem('selectedTaskStages')!) : this.selectedTaskStages;
    this.showWithFilesOnly = localStorage.getItem('showWithFilesOnly') != null ? localStorage.getItem('showWithFilesOnly')! == 'true' : this.showWithFilesOnly;


    this.issues = [...this.issuesSrc];
    this.issues = this.issues.filter(issue => !this.showWithFilesOnly || this.revisionFiles.find((x: any) => issue.id == x.issue_id) != null);
    this.issues = this.issues.filter(x => this.selectedProjects.includes(x.project));

    this.issues = this.issues.filter(x => this.selectedDepartments.includes(x.department) || this.selectedDepartments.includes(x.assistant));
    this.issues = this.issues.filter(x => this.selectedTaskTypes.includes(x.issue_type));
    this.issues = this.issues.filter(x => this.selectedTaskStages.includes(x.period));
    this.issues = this.issues.filter(x => (x.id + x.doc_number + x.name))
    this.issues = _.sortBy(this.issues, x => x.doc_number);

    setTimeout(() => {
      this.table.filterGlobal(this.searchValue, 'contains');
    }, 100);
  }

  copyUrl(issueId: number, project: string, docNumber: string, department: string){
    let foranProject = project.replace('NR', 'N');
    navigator.clipboard.writeText(location.origin + `/esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}`);
    this.messageService.add({key:'doclist', severity:'success', summary:'Copied', detail:'You have copied document url.'});
  }

  departmentChanged() {
    localStorage.setItem('selectedDepartments', JSON.stringify(this.selectedDepartments));
    this.filterIssues();
  }

  taskTypeChanged() {
    localStorage.setItem('selectedTaskTypes', JSON.stringify(this.selectedTaskTypes));
    this.filterIssues();
  }

  getDate(dateLong: number): string {
    if (dateLong == 0) {
      return '--/--/----';
    }
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
  }

  taskStagesChanged() {
    localStorage.setItem('selectedTaskStages', JSON.stringify(this.selectedTaskStages));
    this.filterIssues();
  }

  hasFiles(issue: Issue) {
    return this.revisionFiles.filter(x => x.issue_id == issue.id).length;
  }

  // downloadAllDocsOld() {
  //   this.loading = true;
  //   this.zipDocsUrl = '';
  //   this.issueManager.downloadAllDocs(this.issues.map(x => x.id)).subscribe(res => {
  //     this.loading = false;
  //     this.zipDocsUrl = res;
  //   });
  // }

  downloadAllDocs() {
    this.dialogService.open(DownloadAllDocsComponent, {
      showHeader: false,
      modal: true,
      data: [this.issues.map(x => x.id)]
    }).onClose.subscribe(res => {
      if (res == 'success'){
        this.messageService.add({key:'doclist', severity:'success', summary:'Please wait.', detail:'Your operation is being processed, please wait for email.'});
      }
    });
  }

  openUrl(url: string) {
    window.open(url);
  }
}
