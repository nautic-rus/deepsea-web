import { Component, OnInit } from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {Issue} from "../../domain/classes/issue";
import * as _ from 'underscore';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit {

  issue: Issue = new Issue();
  constructor(public ref: DynamicDialogRef, public conf: DynamicDialogConfig) { }

  ngOnInit(): void {
    this.issue = this.conf.data as Issue;
  }
  getDate(dateLong: number): string{
    let date = new Date(dateLong);
    return date.toDateString() + " " + date.toLocaleTimeString();
  }

  getMessages(issue: Issue) {
    return _.sortBy(issue.messages, x => x.date);
  }
}
