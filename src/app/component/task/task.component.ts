import { Component, OnInit } from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {Issue} from "../../domain/classes/issue";
import * as _ from 'underscore';
import {IssueManagerService} from "../../domain/issue-manager.service";
import {AuthManagerService} from "../../domain/auth-manager.service";

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit {

  issue: Issue = new Issue();
  monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
  ];
  constructor(public ref: DynamicDialogRef, public conf: DynamicDialogConfig, private issueManager: IssueManagerService, private auth: AuthManagerService) { }

  ngOnInit(): void {
    this.issue = this.conf.data as Issue;
  }
  getDate(dateLong: number): string{
    let date = new Date(dateLong);
    return date.getDay() + " " + this.monthNames[date.getMonth()] + " " + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes();
  }

  getMessages(issue: Issue) {
    return _.sortBy(issue.messages, x => x.date);
  }

  getAvailableStatuses(issue: Issue) {
    const res = [];
    if (!issue.availableStatuses.includes(issue.status)){
      res.push(issue.status);
    }
    issue.availableStatuses.forEach(x => res.push(x));
    return res;
  }

  statusChanged() {
    this.issueManager.setIssueStatus(this.issue.id, this.auth.getUser().login, this.issue.status).then(issue => {
      this.issue = issue;
    });
  }
}
