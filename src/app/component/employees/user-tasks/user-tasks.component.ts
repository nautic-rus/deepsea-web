import { Component, OnInit } from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import _ from "underscore";
import {AuthManagerService} from "../../../domain/auth-manager.service";

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
  constructor(public auth: AuthManagerService, public ref: DynamicDialogRef, public conf: DynamicDialogConfig) { }

  ngOnInit(): void {
    this.userLogin = this.conf.data[0];
    this.tasks = this.conf.data[1];
    this.currentMonth = this.conf.data[2];

    this.userName = this.auth.getUserName(this.userLogin);

    _.forEach(_.groupBy(_.sortBy(this.tasks, x => x.docNumber), x => x.docNumber), group => {
      let time = 0;
      group.forEach(x => time += x.time);
      this.tasksGrouped.push(Object({tasks: group, time: time, docNumber: group[0].docNumber}));
    });


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
