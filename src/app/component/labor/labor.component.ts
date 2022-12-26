import { Component, OnInit } from '@angular/core';
import {IssueManagerService} from "../../domain/issue-manager.service";
import _ from "underscore";

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
  issues: any[] = [];
  issuesSrc: any[] = [];
  labor: number = 10;

  constructor(public issueManagerService: IssueManagerService) { }

  ngOnInit(): void {
    this.issueManagerService.getIssues('op').then(res => {
      this.issuesSrc = res.filter(x => x.issue_type == 'RKD');
      this.issues = res.filter(x => x.issue_type == 'RKD');
      this.issues = _.sortBy(this.issues, x => x.doc_number);
      this.stages = _.sortBy(_.uniq(this.issues.map(x => x.period)).filter(x => x != ''), x => x);
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
    this.issues = this.issues.filter(x => x.project == this.project || this.project == '');
    this.issues = this.issues.filter(x => x.department == this.department || this.department == '');
    this.issues = this.issues.filter(x => x.period == this.stages || this.stage == '');
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
}
