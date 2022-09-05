import { Component, OnInit } from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {DailyTask} from "../../../../domain/interfaces/daily-task";
import {IssueManagerService} from "../../../../domain/issue-manager.service";
import {AuthManagerService} from "../../../../domain/auth-manager.service";

@Component({
  selector: 'app-show-task',
  templateUrl: './show-task.component.html',
  styleUrls: ['./show-task.component.css']
})
export class ShowTaskComponent implements OnInit {

  task: any;

  constructor(public ref: DynamicDialogRef, public issueManager: IssueManagerService, public auth: AuthManagerService, public conf: DynamicDialogConfig) { }

  ngOnInit(): void {
    this.task = this.conf.data;
  }

  close() {
    this.ref.close();
  }
  getHours(time: number) {
    let hours = Math.floor(time).toString();
    if (hours.length == 1){
      hours = '0' + hours;
    }
    return hours;
  }
  getMinutes(time: number){
    let minutes = Math.round((time - Math.floor(time)) * 60).toString();
    if (minutes.length == 1){
      minutes = '0' + minutes;
    }
    return minutes;
  }

}
