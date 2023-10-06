import {Component, OnInit, ViewChild} from '@angular/core';
import {IssueManagerService} from "../../domain/issue-manager.service";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {TimeControlInterval} from "../../domain/classes/time-control-interval";
import _ from "underscore";
import {Router} from "@angular/router";

@Component({
  selector: 'app-time-control',
  templateUrl: './time-control.component.html',
  styleUrls: ['./time-control.component.css']
})
export class TimeControlComponent implements OnInit {

  tc: TimeControlInterval[] = [];
  tcTable: any[] = [];

  basicData: any;
  basicOptions: any;
  @ViewChild('chart') chart: any;


  constructor(public auth: AuthManagerService, public issueManager: IssueManagerService, private router: Router) { }

  ngOnInit(): void {
    this.basicData = {
      labels: [],
      datasets: [
        {
          label: 'Продуктивность',
          data: [],
          fill: false,
          borderColor: '#FF6384',
          tension: .4
        },
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

    //this.issueManager.getTimeControl(this.auth.getUser().tcid).then(res => {
    //  console.log(res);
    this.issueManager.getTimeControl(this.auth.getUser().tcid).then(res => {
      this.tc = res;
      let days: string[] = [];
      let sets: any[] = [];
      this.getPrevDays().forEach(d => {
        days.push(this.getDate(d));
        let overWork = this.getOverWorkTime(d) / 60 / 60 / 1000;
        if ([0, 6].includes(new Date(d).getDay()) && overWork < 0){
          overWork = 0;
        }
        sets.push(overWork);
      });
      this.basicData.labels = days;
      this.basicData.datasets[0].data = sets;
      this.chart.refresh();

      this.getPrevDays().forEach(d => {
        this.tcTable.push({
          date: this.getDate(d),
          work: this.formatTime(this.getWorkedTime(d)),
          overWork: this.formatTime(this.getOverWorkTime(d), true, true)
        })
        this.tcTable = [...this.tcTable];
      });
    });
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
      if (t.getMonth() == now.getMonth()){
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
    console.log(timeSpent)
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
    let h = Math.floor(Math.abs(input) / 1000 / 60 / 60);
    let m = Math.floor((Math.abs(input) / 1000 / 60 / 60 - h) * 60);
    if (h == 0 && m == 0){
      return '--.--';
    }
    else{
      if (double){
        return (input < 0 ? '-' : '') + ('0' + (h).toString()).slice(-2) + '.' + ('0' + m.toString()).slice(-2);
      }
      else{
        return h.toString() + ' ч. ' + ('0' + m.toString()).slice(-2) + ' м.';
      }
    }
  }
  getTotalOverWork(){
    let timeSpent = 0;
    this.getPrevDays().forEach(d => {
      timeSpent += this.getWorkedTime(d);
    });
    return this.getTotalWork() - this.getTotalNorm();
  }

}
