import { Component, OnInit } from '@angular/core';
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {User} from "../../../domain/classes/user";
import {LanguageService} from "../../../domain/language.service";
import DataLabelsPlugin from 'chartjs-plugin-datalabels';
@Component({
  selector: 'app-man-hours-chart',
  templateUrl: './man-hours-chart.component.html',
  styleUrls: ['./man-hours-chart.component.css']
})
export class ManHoursChartComponent implements OnInit {

  constructor(public auth: AuthManagerService, public t: LanguageService) { }

  users: User[] = [];
  data = {};
  usersHeight: string = '0px';
  startDate: Date = new Date();
  dueDate: Date = new Date();
  today: Date = new Date();
  chartPlugins = [DataLabelsPlugin];

  options = {
    indexAxis: 'y',
    plugins: {
      tooltip: {
        enabled: false
      },
      legend: {
        display: false
      },
      datalabels: {
        display: true,
        color: 'black',
        font: {
          size: 10
        },
        anchor: 'end',
        align: 'left',
        offset: 0
      }
    }
  };
  ngOnInit(): void {
    this.users = this.auth.users.filter(x => x.visibility.includes('k'));
    this.fillChartData();
    if (!this.auth.filled){
      this.auth.usersFilled.subscribe(res => {
        this.users = this.auth.users.filter(x => x.visibility.includes('k'));
        this.fillChartData();
      });
    }
  }
  fillChartData(){
    let labels = this.users.map(x => this.auth.getUserTrimName(x.login));
    let planData = labels.map(x => 168);
    let officeData = labels.map(x => 150);
    let tasksData = labels.map(x => 160);

    this.usersHeight = this.users.length * 60 + 'px';
    this.data = {
      labels: labels,
      datasets: [
        {
          label: 'Plan',
          backgroundColor: 'rgba(113,141,250,0.6)',
          borderColor: '#718dfa',
          data: planData
        },
        {
          label: 'Office',
          backgroundColor: 'rgba(253,210,31,0.6)',
          borderColor: '#fdd21f',
          data: officeData
        },
        {
          label: 'Tasks',
          backgroundColor: 'rgba(38,119,29,0.6)',
          borderColor: '#26771d',
          data: tasksData
        }
      ]
    };
  }

}
