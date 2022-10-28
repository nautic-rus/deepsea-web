import { Component, OnInit } from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import _ from "underscore";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {TimeControlInterval} from "../../../domain/classes/time-control-interval";

@Component({
  selector: 'app-user-tasks',
  templateUrl: './user-tasks.component.html',
  styleUrls: ['./user-tasks.component.css']
})
export class UserTasksComponent implements OnInit {

  tasks: any[] = [];
  tasksGrouped: any[] = [];
  userLogin: string = '';
  userName: string = '';
  currentMonth = 0;
  totalSum: any = Object({hours: 0, minutes: 0});
  totalSumEnglish: any = Object({hours: 0, minutes: 0});
  tc: TimeControlInterval[] = [];
  tcTime = 0;
  userTcId = 0;
  currentYear = new Date().getFullYear();

  constructor(public auth: AuthManagerService, public ref: DynamicDialogRef, public conf: DynamicDialogConfig, public issueManager: IssueManagerService) { }

  ngOnInit(): void {
    this.userLogin = this.conf.data[0];
    this.tasks = this.conf.data[1];
    this.currentMonth = this.conf.data[2];
    this.totalSum = this.conf.data[3];
    this.totalSumEnglish = this.conf.data[4];
    this.userTcId = this.conf.data[5];

    this.userName = this.auth.getUserName(this.userLogin);

    _.forEach(_.groupBy(_.sortBy(this.tasks, x => x.docNumber), x => x.docNumber), group => {
      let time = 0;
      group.forEach(x => time += x.time);
      this.tasksGrouped.push(Object({tasks: group, time: time, docNumber: group[0].docNumber}));
      console.log(this.tasksGrouped);
    });


    console.log(this.userTcId);
    this.issueManager.getTimeControl(this.userTcId).then(res => {
      this.tc = res;
      this.getDaysInMonth().forEach(day => {
        let date = new Date(this.currentYear, this.currentMonth, day);
        this.tcTime += this.getWorkedTime(date.getTime());
      });
    });

  }
  roundHours(ms: number){
    return Math.round(ms / 1000 / 60 / 60);
  }
  getDaysInMonth() {
    let daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    let array = [];
    for (let x = 0; x < daysInMonth; x++){
      array.push(x + 1);
    }
    return array;
  }
  getWorkedTime(date: number) {
    let intervals = this.getDateIntervals(new Date(date));
    let timeSpent = 0;
    intervals.forEach(x => {
      timeSpent += (x.endTime - x.startTime);
    });
    return timeSpent;
  }
  getDateIntervals(t = new Date()){
    return _.sortBy(this.tc.filter(x => {
      let d = new Date(x.startDate);
      return (t.getFullYear() == d.getFullYear() && t.getMonth() == d.getMonth() && t.getDate() == d.getDate());
    }), x => x.startTime);
  }
  close(){
    this.ref.close('exit');
  }
  getHours(time: number, minutes: string = '') {
    let hours = Math.floor(time).toString();
    return hours == '0' && minutes == '' ? '-' : hours;
  }
  getMinutes(time: number){
    let minutes = Math.round((time - Math.floor(time)) * 60).toString();
    if (minutes.length == 1){
      minutes = '0' + minutes;
    }
    return minutes == '00' ? '' : minutes;
  }

}
