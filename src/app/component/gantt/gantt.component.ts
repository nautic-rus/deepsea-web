import { Component, OnInit } from '@angular/core';
import {GANTT_GLOBAL_CONFIG} from "@worktile/gantt";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {IssueManagerService} from "../../domain/issue-manager.service";
import _ from "underscore";
import {Issue} from "../../domain/classes/issue";

@Component({
  selector: 'app-gantt',
  templateUrl: './gantt.component.html',
  styleUrls: ['./gantt.component.css'],
  providers: [
    {
      provide: GANTT_GLOBAL_CONFIG,
      useValue: {
        dateFormat: {
          yearQuarter: `QQQ 'of' yyyy`,
          month: 'LLLL',
          yearMonth: `LLLL yyyy'(week' w ')'`
        }
      }
    }
  ]
})
export class GanttComponent implements OnInit {
  project: string = 'NR002';
  projects: string[] = ['NR002', 'NR004'];
  assignee: string = 'all';
  assignees: any[] = [];
  issueType = 'RKD';
  sourceIssues: any[] = [];
  issues: any[] = [];
  constructor(private auth: AuthManagerService, private issueManager: IssueManagerService) { }

  ngOnInit(): void {
    this.issueManager.getIssues('op').then(res => {
      this.sourceIssues = res;
      this.fillIssues();
    });
    this.assignees.push({
      label: 'All',
      value: 'All'
    });
    this.assignee = 'All';
    this.auth.getUsers().then(res => {
      _.sortBy(res.filter(x => x.visibility.includes('c')), x => this.auth.getUserName(x.login)).forEach(user => {
        this.assignees.push({
          label: this.auth.getUserName(user.login),
          value: user.login
        })
      });
    });
  }

  fillIssues(){
    this.issues.splice(0, this.issues.length);
    this.sourceIssues.filter(x => this.isIssueVisible(x)).forEach(value => {
      this.issues.push({
        id: value.id.toString(),
        title: value.name,
        doc_number: value.doc_number,
        start: value.start_date,
        end: value.due_date,
        assigned_to: this.auth.getUserName(value.assigned_to)
      });
    });
    this.issues = [...this.issues];
  }
  isIssueVisible(issue: Issue){
    let res = true;
    if (this.project != issue.project){
      res = false;
    }
    if (this.assignee != 'All' && this.assignee != issue.assigned_to){
      res = false;
    }
    return res;
  }

  projectChanged() {
    this.fillIssues();
  }

  assigneeChanged() {
    this.fillIssues();
  }
}
