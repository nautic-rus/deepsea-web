import { Component, OnInit } from '@angular/core';
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {LanguageService} from "../../../domain/language.service";
import {LV} from "../../../domain/classes/lv";
import DataLabelsPlugin from "chartjs-plugin-datalabels";
import {tr} from "date-fns/locale";

@Component({
  selector: 'app-project-progress-chart',
  templateUrl: './project-progress-chart.component.html',
  styleUrls: ['./project-progress-chart.component.css']
})
export class ProjectProgressChartComponent implements OnInit {

  constructor(public auth: AuthManagerService, public issueManager: IssueManagerService, public t: LanguageService) { }
  projects: LV[] = [];
  project: string = '';
  docTypes: LV[] = ['RKD', 'PDSP'].map(x => new LV(x));
  docType = '';
  projectStats: any;
  loading = true;
  chartPlugins = [DataLabelsPlugin];


  generalProgressChartDataDocs: any;
  generalProgressChartOptionsDocs =  {
    responsive: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Documents'
      },
      datalabels: {
        display: true,
        color: 'white',
        formatter: function (value: any, ctx: any) {
          return value + '%';
        },
      }
    }
  };

  generalProgressChartDataManHours: any;
  generalProgressChartOptionsManHours =  {
    responsive: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Man hours'
      },
      datalabels: {
        display: true,
        color: 'white',
        formatter: function (value: any, ctx: any) {
          let sum = 0;
          let dataArr = ctx.chart.data.datasets[0].data;
          dataArr.map((data: any) => {
            sum += data;
          });
          let percentage = Math.round(value * 100 / sum) + '%';
          return percentage;
        },
      }
    }
  };

  progressByDepartmentChartDataDocuments: any;
  progressByDepartmentChartOptionsDocuments =  {
    scales: {
      x: {
        stacked: true,
        grid: {
          color: 'transparent'
        },
      },
      y: {
        stacked: true,
        grid: {
          color: 'transparent'
        },
        ticks: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Documents'
      },
      datalabels: {
        display: true,
        color: 'white',
        font: {
          size: 12,
        },
        formatter: function (value: any, ctx: any) {
          return value == 0 ? '' : (value + '%');
        }
      }
    },
    responsive: false,
    maintainAspectRatio: false,
  };

  progressByDepartmentChartDataManHours: any;
  progressByDepartmentChartOptionsManHours =  {
    scales: {
      x: {
        stacked: true,
        grid: {
          color: 'transparent'
        },
      },
      y: {
        stacked: true,
        grid: {
          color: 'transparent'
        },
        ticks: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Man hours'
      },
      datalabels: {
        display: true,
        color: 'white',
        font: {
          size: 12,
        },
        formatter: function (value: any, ctx: any) {
          return value == 0 ? '' : (value + '%');
        }
      }
    },
    responsive: false,
    maintainAspectRatio: false,
  };

  stageProgressChartData: any;
  stageProgressChartOptions =  {
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Stage Progress'
      },
      datalabels: {
        display: true,
        color: 'white',
        font: {
          size: 12,
        },
        formatter: function (value: any, ctx: any) {
          return value == 0 ? '' : (value);
        }
      }
    },
    responsive: false,
    maintainAspectRatio: false,
  };
  ngOnInit(): void {
    this.issueManager.getIssueProjects().then(res => {
      this.projects = res.filter(x => x.name != '-').map(x => new LV(x.name));
      this.project = this.projects[0].value;
      this.docType = this.docTypes[0].value;
      this.getProjectStats();
    });
  }
  getProjectStats(){
    if (this.project == '' || this.docType == ''){
      return;
    }
    this.issueManager.getProjectStats(this.project, this.docType).subscribe(res => {
      this.projectStats = res;
      this.loading = false;
      console.log(res);
      this.setChartData(res);
    });
  }
  changedProject() {

  }

  getPlanHoursForDepartment(manHoursProgress: any[], dep: any) {
    return manHoursProgress.find(x => x.department == dep).plan;
  }

  getActualHoursForDepartment(manHoursProgress: any[], dep: any) {
    return manHoursProgress.find(x => x.department == dep).actual;
  }
  getPercantageHoursForDepartment(manHoursProgress: any[], dep: any) {
    return manHoursProgress.find(x => x.department == dep).percentage;
  }

  getDocsWithStatus(documentProgress: any[], dep: any, status: any) {
    return documentProgress.find(x => x.department == dep).docProgressStatus.find((x: any) => x.status == status).value;
  }

  getDocsWithStatusPercantage(documentProgress: any, dep: any) {
    let del = this.getDocsWithStatus(documentProgress, dep, 'Delivered');
    let all = this.getDocsWithStatus(documentProgress, dep, 'All');
    let res = Math.round(del / all * 100);
    return res;
  }

  getDocsWithStage(stageProgress: any[], dep: any, stage: string) {
    return stageProgress.find(x => x.department == dep).stages.find((x: any) => x.stage == stage);
  }
  setChartData(projectStats: any){

    let docDelivered = projectStats.documentProgress.find((x: any) => x.department == 'Total').docProgressStatus.find((x: any) => x.status == 'Delivered').value;
    let docAll = projectStats.documentProgress.find((x: any) => x.department == 'Total').docProgressStatus.find((x: any) => x.status == 'All').value;
    let docDeliveredPercentage = Math.round(docDelivered / docAll * 100);
    let docAllPercentage = 100 - docDeliveredPercentage;
    this.generalProgressChartDataDocs = {
      labels: ['Not Delivered','Delivered'],
      datasets: [
        {
          data: [docAllPercentage, docDeliveredPercentage],
          backgroundColor: [
            "#42A5F5",
            "#66BB6A",
          ],
          hoverBackgroundColor: [
            "#64B5F6",
            "#81C784",
          ]
        }
      ],
    };



    let manHoursPlan = projectStats.manHoursProgress.find((x: any) => x.department == 'Total').plan;
    let manHoursActual = projectStats.manHoursProgress.find((x: any) => x.department == 'Total').actual;
    let manHoursActualPercentage = Math.round(manHoursActual / manHoursPlan * 100);
    let manHoursPlanPercentage = 100 - manHoursActualPercentage;
    this.generalProgressChartDataManHours = {
      labels: ['Plan','Actual'],
      datasets: [
        {
          data: [manHoursPlanPercentage, manHoursActualPercentage],
          backgroundColor: [
            "#42A5F5",
            "#66BB6A",
          ],
          hoverBackgroundColor: [
            "#64B5F6",
            "#81C784",
          ]
        }
      ],
    };



    let projectByDepartmentDocs: any[] = [];
    projectStats.departments.forEach((dep: any) => {
      let docDelivered = projectStats.documentProgress.find((x: any) => x.department == dep).docProgressStatus.find((x: any) => x.status == 'Delivered').value;
      let docAll = projectStats.documentProgress.find((x: any) => x.department == dep).docProgressStatus.find((x: any) => x.status == 'All').value;
      projectByDepartmentDocs.push(Object({
        label: dep,
        data: [docDelivered, docAll]
      }));
    });
    let projectByDepartmentDocsDataSets: any[] = [];
    projectByDepartmentDocsDataSets.push(Object({
      label: 'Delivered',
      data: projectByDepartmentDocs.map(x => Math.round(x.data[0] / x.data[1] * 100)),
      backgroundColor: '#42A5F5',
    }));
    projectByDepartmentDocsDataSets.push(Object({
      label: 'Not Delivered',
      data: projectByDepartmentDocs.map(x => 100 - Math.round(x.data[0] / x.data[1] * 100)),
      backgroundColor: '#66BB6A'
    }));
    this.progressByDepartmentChartDataDocuments = {
      labels: projectStats.departments,
      datasets: projectByDepartmentDocsDataSets,
    };


    let projectByDepartmentManHours: any[] = [];
    projectStats.departments.forEach((dep: any) => {
      let plan = projectStats.manHoursProgress.find((x: any) => x.department == dep).plan;
      let actual = projectStats.manHoursProgress.find((x: any) => x.department == dep).actual;
      projectByDepartmentManHours.push(Object({
        label: dep,
        data: [actual, plan]
      }));
    });
    let projectByDepartmentManHoursDataSets: any[] = [];
    projectByDepartmentManHoursDataSets.push(Object({
      label: 'Actual',
      data: projectByDepartmentManHours.map(x => Math.round(x.data[0] / x.data[1] * 100)),
      backgroundColor: '#42A5F5',
    }));
    projectByDepartmentManHoursDataSets.push(Object({
      label: 'Plan',
      data: projectByDepartmentManHours.map(x => 100 - Math.round(x.data[0] / x.data[1] * 100)),
      backgroundColor: '#66BB6A'
    }));
    this.progressByDepartmentChartDataManHours = {
      labels: projectStats.departments,
      datasets: projectByDepartmentManHoursDataSets,
    };


    let stageProgress: any[] = [];
    projectStats.periods.forEach((period: any) => {
      let all = 0;
      let delivered = 0;
      projectStats.stageProgress.filter((x: any) => x.department != 'Total').forEach((sP: any) => {
        let findStage = sP.stages.find((x: any) => x.stage == period);
        if (findStage != null){
          all += findStage.all;
          delivered += findStage.delivered;
        }
      });
      stageProgress.push(Object({
        label: period,
        data: [delivered, all]
      }));
    });
    let stageProgressDataSets: any[] = [];
    stageProgressDataSets.push(Object({
      label: 'All',
      data: stageProgress.map(x => x.data[1]),
      backgroundColor: '#42A5F5',
    }));
    stageProgressDataSets.push(Object({
      label: 'Delivered',
      data: stageProgress.map(x => x.data[0]),
      backgroundColor: '#66BB6A'
    }));
    this.stageProgressChartData = {
      labels: projectStats.periods,
      datasets: stageProgressDataSets,
    };
  }
}
