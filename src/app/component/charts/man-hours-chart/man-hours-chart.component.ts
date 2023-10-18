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
  userRowHeight = 60;
  dateFrom: Date = new Date();
  dateTo: Date = new Date();
  chartPlugins = [DataLabelsPlugin];
  showOnlyEngineers = true;
  departments: string[] = [];
  selectedDepartments: string[] = [];
  usersStats: any[] = [];
  selectedPeriod: string = 'curWeek';
  selectedUser: User;
  userStats: any;
  loading = false;

  options = {
    indexAxis: 'y',
    plugins: {
      tooltip: {
        enabled: false
      },
      legend: {
        display: false,
      },
      datalabels: {
        display: true,
        color: 'black',
        font: {
          size: 10
        },
        anchor: 'end',
        align: 'left',
        offset: 0,
        formatter: function (value: any, index: any, values: any[]) {
          return value > 0 ? value : '';
        },
      }
    }
  };
  ngOnInit(): void {
    if (!this.auth.filled){
      this.auth.usersFilled.subscribe(res => {
        this.fillUsers();
        this.setPeriod('curWeek');
      });
    }
    else{
      this.fillUsers();
      this.setPeriod('curWeek');
    }
    this.auth.getDepartments().subscribe(res => {
      this.departments = res.map(x => x.name);
      this.selectedDepartments = res.map(x => x.name);
      this.filterUsers();
    });
  }
  fillUsers(){
    this.usersSrc = this.auth.users.filter(x => x.visibility.includes('k'));
  }
  filterUsers(){
    this.users = this.usersSrc
      .filter(x => this.selectedDepartments.includes(x.department))
      .filter(x => !this.showOnlyEngineers || x.groups.find(x => x.includes('Engineers')) != null);
    if (this.users.length > 0){
      this.auth.getStatsUserDetails(this.dateFrom.getTime(), this.dateTo.getTime(), this.users.map(x => x.id)).subscribe(res => {
        console.log(res);
        this.usersStats = res;
        this.fillChartData();
      });
    }
  }
  fillChartData(){
    if (this.users.length > 0){
      let labels = this.users.map(x => this.auth.getUserTrimName(x.login));
      let planData = this.users.map(u => {
        let findUserStat = this.usersStats.find(x => x.id == u.id);
        if (findUserStat != null){
          return findUserStat.plan;
        }
        else{
          return 0;
        }
      });
      let officeData = this.users.map(u => {
        let findUserStat = this.usersStats.find(x => x.id == u.id);
        if (findUserStat != null){
          return findUserStat.office;
        }
        else{
          return 0;
        }
      });
      let tasksData = this.users.map(u => {
        let findUserStat = this.usersStats.find(x => x.id == u.id);
        if (findUserStat != null){
          return findUserStat.tasks;
        }
        else{
          return 0;
        }
      });

      this.usersHeight = this.users.length * this.userRowHeight + 'px';
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
        this.loading = false;
      }, 100);
    }
    else{
      this.data = {};
    }
  }
  filterChanged() {
    this.filterUsers();
  }

  setPeriod(period: string) {
    this.loading = true;
    this.selectedPeriod = period;
    switch (this.selectedPeriod){
      case 'today': {
        this.dateFrom = new Date();
        this.dateTo = new Date();
        break;
      }
      case 'curWeek': {
        let dateFrom = new Date();
        while (dateFrom.getDay() != 1){
          dateFrom.setDate(dateFrom.getDate() - 1);
        }
        let dateTo = new Date();
        // while (dateTo.getDay() != 0){
        //   dateTo.setDate(dateTo.getDate() + 1);
        // }
        this.dateFrom = dateFrom;
        this.dateTo = dateTo;
        break;
      }
      case 'curMonth': {
        let dateFrom = new Date();
        let daysInMonth = new Date(dateFrom.getFullYear(), dateFrom.getMonth() + 1, 0).getDate();
        while (dateFrom.getDate() != 1){
          dateFrom.setDate(dateFrom.getDate() - 1);
        }
        let dateTo = new Date();
        while (dateTo.getDate() != daysInMonth){
          dateTo.setDate(dateTo.getDate() + 1);
        }
        this.dateFrom = dateFrom;
        this.dateTo = dateTo;
        break;
      }
      case 'yesterday': {
        let dateFrom = new Date();
        dateFrom.setDate(dateFrom.getDate() - 1);
        let dateTo = new Date();
        dateTo.setDate(dateTo.getDate() - 1);
        this.dateFrom = dateFrom;
        this.dateTo = dateTo;
        break;
      }
      case 'prevWeek': {
        let dateFrom = new Date();
        dateFrom.setDate(dateFrom.getDate() - 7);
        while (dateFrom.getDay() != 1){
          dateFrom.setDate(dateFrom.getDate() -1);
        }
        let dateTo = new Date();
        dateTo.setDate(dateTo.getDate() - 7);
        while (dateTo.getDay() != 0){
          dateTo.setDate(dateTo.getDate() + 1);
        }
        this.dateFrom = dateFrom;
        this.dateTo = dateTo;
        break;
      }
      case 'prevMonth': {
        let dateFrom = new Date();
        dateFrom.setDate(dateFrom.getDate() - dateFrom.getDate() - 1);
        let daysInMonth = new Date(dateFrom.getFullYear(), dateFrom.getMonth() + 1, 0).getDate();
        while (dateFrom.getDate() != 1){
          dateFrom.setDate(dateFrom.getDate() - 1);
        }
        let dateTo = new Date();
        dateTo.setDate(dateTo.getDate() - dateTo.getDate() - 1);
        while (dateTo.getDate() != daysInMonth){
          dateTo.setDate(dateTo.getDate() + 1);
        }
        this.dateFrom = dateFrom;
        this.dateTo = dateTo;
        break;
      }
      default:{
        break;
      }
    }
    this.filterUsers();
  }
  selectUser(user: any){
    this.selectedUser = user;
    this.userStats = this.usersStats.find(x => x.id == this.selectedUser.id);
    console.log(this.userStats);
  }

  chartClick(event: MouseEvent) {
    this.selectUser(this.users[Math.floor(event.offsetY / this.userRowHeight)]);
  }
}
