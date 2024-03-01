import { Component, OnInit } from '@angular/core';
import {LV} from "../../domain/classes/lv";
import {IssueManagerService} from "../../domain/issue-manager.service";
import {AuthManagerService} from "../../domain/auth-manager.service";
import { TableModule } from 'primeng/table';
import {EquipmentsService} from "../../domain/equipments.service";
import {IEquipment} from "../../domain/interfaces/equipments";
import {stringify} from "uuid";
import _ from "underscore";
import {Issue} from "../../domain/classes/issue";

@Component({
  selector: 'app-equipments',
  templateUrl: './equipments.component.html',
  styleUrls: ['./equipments.component.css']
})
export class EquipmentsComponent implements OnInit {
  projects: any[] = [];
  selectedProjects: string[] = [];
  departments: LV[] = [];
  selectedDepartments: string[] = [];
  equipments: IEquipment[] = [];
  issues: Issue[] = [];
  issuesSrc: any[] = [];

  constructor(public issueManagerService: IssueManagerService, public auth: AuthManagerService, public eqService: EquipmentsService) {
  }

  ngOnInit(): void {
    this.issueManagerService.getIssues('op').then(res => {
      this.issuesSrc = res;
      this.issues = res;
      this.issues = _.sortBy(this.issues, x => x.doc_number);
      });
    this.issueManagerService.getIssueProjects().then(projects => {
      this.projects = projects;
      this.projects.forEach((x: any) => x.label = this.getProjectName(x));
      this.projects = this.projects.filter(x => this.auth.getUser().visible_projects.includes(x.name));
      this.selectedProjects = ['NR002'];
    });
    this.issueManagerService.getDepartments().subscribe(departments => {
      this.departments = departments.filter(x => x.visible_task == 1).map(x => new LV(x.name));
      this.selectedDepartments = ['Hull'];
    });
    this.eqService.getEquipments().subscribe(equipments => {
      this.equipments = equipments;
    });


  }

  getProjectName(project: any) {
    let res = project.name;
    if (project.rkd != '') {
      res += ' (' + project.rkd + ')';
    }
    return res;
  }

  filterIssues(){
    this.issues = [...this.issuesSrc];

    this.issues = this.issues.filter(x => this.selectedDepartments.includes(x.department));
    this.issues = _.sortBy(this.issues, x => x.doc_number);
  }

  departmentChanged() {
    console.log(' departmentChanged()');
    this.filterIssues();
  }


}
