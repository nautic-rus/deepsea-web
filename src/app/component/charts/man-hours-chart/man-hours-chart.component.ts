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
  usersSrc: User[] = [];
  data = {};
  usersHeight: string = '0px';
  startDate: Date = new Date();
  dueDate: Date = new Date();
  today: Date = new Date();
  chartPlugins = [DataLabelsPlugin];
  showOnlyEngineers = true;
  departments: string[] = [];
  selectedDepartments: string[] = [];


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
    this.fillUsers();
    this.filterUsers();
    this.fillChartData();
    if (!this.auth.filled){
      this.auth.usersFilled.subscribe(res => {
        this.fillUsers();
        this.filterUsers();
        this.fillChartData();
      });
    }
    this.auth.getDepartments().subscribe(res => {
      this.departments = res.map(x => x.name);
      this.selectedDepartments = res.map(x => x.name);
      this.filterUsers();
      this.fillChartData();
    });
  }
  fillUsers(){
    this.usersSrc = this.auth.users.filter(x => x.visibility.includes('k'));
  }
  filterUsers(){
    this.users = this.usersSrc
      .filter(x => this.selectedDepartments.includes(x.department))
      .filter(x => !this.showOnlyEngineers || x.groups.find(x => x.includes('Engineers')) != null);
  }
  fillChartData(){
    let labels = this.users.map(x => this.auth.getUserTrimName(x.login));
    let planData = labels.map(x => 168);
    let officeData = labels.map(x => 150);
    let tasksData = labels.map(x => 160);

    this.usersHeight = this.users.length * 60 + 'px';
    setTimeout(() => {
     this.data = {
       labels: labels,
       datasets: [
         {
           label: 'Plan',
           backgroundColor: '#CCCAD4',
           borderColor: '#718dfa',
           data: planData
         },
         {
           label: 'Office',
           backgroundColor: '#E5C0C4',
           borderColor: '#fdd21f',
           data: officeData
         },
         {
           label: 'Tasks',
           backgroundColor: '#83ABD7',
           borderColor: '#26771d',
           data: tasksData
         }
       ]
     };
   }, 100);
  }
  filterChanged() {
    this.filterUsers();
    this.fillChartData();
  }
}
