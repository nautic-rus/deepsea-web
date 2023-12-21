import { Component, OnInit } from '@angular/core';
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {LanguageService} from "../../../domain/language.service";
import {LV} from "../../../domain/classes/lv";

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
}
