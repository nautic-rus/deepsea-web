import {Component, OnInit, ViewChild} from '@angular/core';
import {Issue} from "../../domain/classes/issue";
import {Router} from "@angular/router";
import {LanguageService} from "../../domain/language.service";
import {IssueManagerService} from "../../domain/issue-manager.service";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {MessageService} from "primeng/api";
import _ from "underscore";
import {Table} from "primeng/table";

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
  departments: string[] = [];
  issuesSrc: Issue[] = [];
  issues: Issue[] = [];
  filters:  { status: any[],  revision: any[], department: any[] } = { status: [], revision: [], department: [] };
  projectNames: any[] = [];
  taskType = '';
  taskTypes: string[] = ['-', 'RKD', 'PDSP'];
  statuses: string[] = [];
  status = '';
  showWithFilesOnly = true;
  revisionFiles: any[] = [];
  constructor(private router: Router, public l: LanguageService, public issueManager: IssueManagerService, public auth: AuthManagerService, private messageService: MessageService) { }


  @ViewChild('table') table: Table;
  ngOnInit(): void {
    this.issueManager.getIssueProjects().then(projects => {
      this.projects = projects;
      this.projects.forEach((x: any) => x.label = this.getProjectName(x));
      this.projects = this.projects.filter(x => this.auth.getUser().visible_projects.includes(x.name));
    });
    this.issueManager.getIssues('op').then(res => {
      this.issuesSrc = res.filter(x => x.issue_type == 'RKD' || x.issue_type == 'PDSP');
      this.issues = this.issuesSrc;
      this.issueManager.getRevisionFiles().then(revisionFiles => {
        this.revisionFiles = revisionFiles;
        this.filterIssues();
      });
    });
    this.issueManager.getDepartments().subscribe(departments => {
      this.departments = departments.filter(x => x.visible_documents == 1);
    });
  }


  getProjectName(project: any){
    let res = project.name;
    if (project.rkd != ''){
      res += ' (' + project.rkd + ')';
    }
    return res;
  }
  projectChanged() {
    this.filterIssues();
  }

  viewTask(issueId: number, project: string, docNumber: string, department: string, assistant: string) {
    let foranProject = project.replace('NR', 'N');
    let findProject = this.projectNames.find((x: any) => x != null && (x.name == project || x.pdsp == project || x.rkd == project));
    if (findProject != null){
      foranProject = findProject.foran;
    }
    console.log(department);
    console.log(project);
    switch (department) {
      case 'Hull': window.open(`/hull-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
      case 'System': window.open(`/pipe-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
      case 'Devices': window.open(`/device-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
      case 'Trays': window.open(`/trays?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
      case 'Cables': window.open(`/cables?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
      case 'Electric': window.open(`/electric-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
      case 'Accommodation': window.open(`/accommodation-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
      case 'Design': window.open(`/design-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
      default: break;
    }
  }
  filterIssues(){
    this.issues = [...this.issuesSrc];
    this.issues = this.issues.filter(issue => !this.showWithFilesOnly || this.revisionFiles.find((x: any) => issue.id == x.issue_id) != null);
    this.issues = this.issues.filter(x => this.project == null || x.project == this.project.name || this.project.name == '' || this.project.name == '-');
    this.issues = this.issues.filter(x => this.department == null || x.department == this.department || this.department == '' || this.department == '-');
    this.issues = this.issues.filter(x => this.taskType == null || x.issue_type == this.taskType || this.taskType == '' || this.taskType == '-');
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

  getDate(dateLong: number): string {
    if (dateLong == 0) {
      return '--/--/----';
    }
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
  }
}
