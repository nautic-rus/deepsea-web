import { Component, OnInit } from '@angular/core';
import {IssueManagerService} from "../../domain/issue-manager.service";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {TimeControlInterval} from "../../domain/classes/time-control-interval";
import _ from "underscore";

@Component({
  selector: 'app-time-control',
  templateUrl: './time-control.component.html',
  styleUrls: ['./time-control.component.css']
})
export class TimeControlComponent implements OnInit {

  constructor(private auth: AuthManagerService, public issueManager: IssueManagerService) { }
  tc: TimeControlInterval[] = [];

  basicData: any;
  basicOptions: any;

  ngOnInit(): void {
    // this.issueManager.getTimeControl(this.auth.getUser().tcid).then(res => {
    this.issueManager.getTimeControl(13).then(res => {
      this.tc = res;
    });
    this.basicData = {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [
        {
          label: 'First Dataset',
          data: [65, 59, 80, 81, 56, 55, 40],
          fill: false,
          borderColor: '#42A5F5',
          tension: .4
        },
        {
          label: 'Second Dataset',
          data: [28, 48, 40, 19, 86, 27, 90],
          fill: false,
          borderColor: '#FFA726',
          tension: .4
        }
      ]
    };
    this.basicOptions = {
      plugins: {
        legend: {
          labels: {
            color: '#495057'
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#495057'
          },
          grid: {
            color: '#ebedef'
          }
        },
        y: {
          ticks: {
            color: '#495057'
          },
          grid: {
            color: '#ebedef'
          }
        }
      }
    };
  }
  getDateIntervals(t = new Date()){
    return _.sortBy(this.tc.filter(x => {
      let d = new Date(x.startDate);
      return (t.getFullYear() == d.getFullYear() && t.getMonth() == d.getMonth() && t.getDate() == d.getDate());
    }), x => x.startTime);
  }
  getDate(value: number){
    let date = new Date(value);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
  }
  formatDate(date: Date){
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
  }
  getTime(value: number){
    let date = new Date(value);
    return ('0' + date.getHours()).slice(-2) + "." + ('0' + date.getMinutes()).slice(-2);
  }
  getPrevDays(count = 40){
    let res = [];
    let now = new Date();
    let t = new Date();
    for (let x = 0; x < count; x ++){
      t.setDate(t.getDate() - 1);
      if (t.getMonth() == now.getMonth() - 1){
        res.push(t.getTime());
      }
    }
    return res.reverse();
  }

  getWorkedTime(date: number) {
    let intervals = this.getDateIntervals(new Date(date));
    let timeSpent = 0;
    intervals.forEach(x => {
      timeSpent += (x.endTime - x.startTime);
    });
    return timeSpent;
  }
  isOnline(){
    return this.getDateIntervals().find(x => x.closeDoor == 0) != null;
  }

  getOverWorkTime(date: number, norm: number = 8) {
    let intervals = this.getDateIntervals(new Date(date));
    let timeSpent = 0;
    intervals.forEach(x => {
      timeSpent += (x.endTime - x.startTime);
    });
    timeSpent -= norm * 60 * 60 * 1000;
    return timeSpent;
  }
  getTotalWork(){
    let timeSpent = 0;
    this.getPrevDays().forEach(d => {
      timeSpent += this.getWorkedTime(d);
    });
    return timeSpent;
  }

  getTotalNorm() {
    let timeSpent = 0;
    this.getPrevDays().forEach(d => {
      if (![0, 6].includes(new Date(d).getDay())){
        timeSpent += 8 * 60 * 60 * 1000;
      }
    });
    return timeSpent;
  }

  formatTime(input: number, allowZero = false, allowZeroWeekends = false, double = true){
    if (!allowZero && input < 0){
      return '--.--';
    }
    if (!allowZeroWeekends && input < 0 && [0, 6].includes(new Date(input).getDay())){
      return '--.--';
    }
    let h = Math.floor(input / 1000 / 60 / 60);
    let m = Math.floor((input / 1000 / 60/ 60 - h) * 60);
    if (h == 0 && m == 0){
      return '--.--';
    }
    else{
      if (double){
        return (h < 0 ? '-' : '') + ('0' + ( h < 0 ? -1 * h : h ).toString()).slice(-2) + '.' + ('0' + m.toString()).slice(-2);
      }
      else{
        return h.toString() + ' ч. ' + ('0' + m.toString()).slice(-2) + ' м.';
      }
    }
  }
  getTotalOverWork(){
    return this.getTotalWork() - this.getTotalNorm();
  }
}
