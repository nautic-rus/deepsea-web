import {Component, OnInit, ViewChild} from '@angular/core';
import {LanguageService} from "../../../domain/language.service";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import _ from "underscore";
import {Issue} from "../../../domain/classes/issue";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {DailyTask} from "../../../domain/interfaces/daily-task";
import {Table} from "primeng/table";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {User} from "../../../domain/classes/user";
import {PlanDay, PlanHour} from "../work-hours.component";

@Component({
  selector: 'app-task-assign',
  templateUrl: './task-assign.component.html',
  styleUrls: ['./task-assign.component.css']
})
export class TaskAssignComponent implements OnInit {

  issues: Issue[] = [];
  issue = '';
  issuesSrc: any[] = [];
  projects: string[] = ['N002', 'N004', 'P701', 'P707'];
  project = '';
  departments: string[] = [];
  department = '';
  stages: string[] = [];
  stage = '';
  taskTypes: string[] = [];
  taskType = '';
  statuses: string[] = [];
  status = '';
  laborUpdates: any = Object();
  issueSpentTime: DailyTask[] = [];
  searchValue = '';
  selectedIssue: Issue;
  user: User;
  pDay: PlanDay;
  userPDays: PlanHour;
  allowMove: boolean = false;
  @ViewChild('table') table: Table;

  constructor(public t: LanguageService, public ref: DynamicDialogRef, public conf: DynamicDialogConfig, public issueManagerService: IssueManagerService, public auth: AuthManagerService) { }


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

        this.pDay = this.conf.data[0];
        this.user = this.conf.data[1];
        this.userPDays = this.conf.data[2];

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
  close() {
    this.ref.close();
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
    this.issues = this.issues.filter(x => this.issueManagerService.localeStatus(x.status, false) == this.issueManagerService.localeStatus(this.stage, false) || this.status == '' || this.status == '-' || this.status == null);
    this.issues = _.sortBy(this.issues, x => x.doc_number);
    if (this.searchValue.trim() != ''){
      this.issues = this.issues.filter(x => (x.name + x.doc_number).trim().toLowerCase().includes(this.searchValue.trim().toLowerCase()));
    }
  }

  selectIssue(issue: any) {
    this.selectedIssue = issue;
  }
  assignTaskToUser(){
    //this.auth.planUserTask()
  }

  cancel() {
    this.close();
  }

  save() {
    let planHours = this.pDay.planHours;
    let freeHour = _.sortBy(planHours, x => x.hour_type).find(x => x.hour_type == 1 && (x.task_id == 0 || this.allowMove));
    if (freeHour == null){
      freeHour = planHours[0];
    }
    this.auth.planUserTask(this.user.id, this.selectedIssue.id, freeHour.id, this.selectedIssue.plan_hours, this.allowMove ? 1 : 0).subscribe({
      next: () => {
        this.close();
      }
    });
  }

}
