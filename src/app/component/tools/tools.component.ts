import { Component, OnInit } from '@angular/core';
import {LanguageService} from "../../domain/language.service";
import {IssueManagerService} from "../../domain/issue-manager.service";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {SpecManagerService} from "../../domain/spec-manager.service";
import {TaskComponent} from "../task/task.component";
import {DialogService} from "primeng/dynamicdialog";
import {TraysByZonesAndSystemsComponent} from "./trays-by-zones-and-systems/trays-by-zones-and-systems.component";
import {Router} from "@angular/router";

@Component({
  selector: 'app-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.css']
})
export class ToolsComponent implements OnInit {
  taskProject = '';
  taskProjects: string[] = [];
  wait: string[] = [];
  billOfMaterials: string = '';
  traysByZonesAndSystems: any = [];

  constructor(public auth: AuthManagerService, public issues: IssueManagerService, public t: LanguageService, private s: SpecManagerService, private dialogService: DialogService, private router: Router) { }

  ngOnInit(): void {
    this.issues.getIssueProjects().then(projects => {
      this.taskProjects = projects.filter(x => this.auth.getUser().visible_projects.includes(x)).filter(x => x != '-');
      if (this.taskProjects.length > 0) {
        this.taskProject = this.taskProjects[this.taskProjects.length - 1];
      }
    });
  }

  getBillOfMaterials() {
    this.wait.push('bill-of-materials');
    this.issues.getForanParts(this.taskProject).then(res => {
      this.billOfMaterials = res;
      this.wait.splice(this.wait.indexOf('bill-of-materials'), 1);
    });
  }
  getTraysByZonesAndSystems(){
    this.wait.push('trays-by-zones-and-systems');
    this.s.getTraysByZonesAndSystems("P701", "5318", "884-6009").then(res => {
      this.traysByZonesAndSystems = res;
      this.wait.splice(this.wait.indexOf('trays-by-zones-and-systems'), 1);
    });
  }

  download(url: string) {
    window.open(url, '_blank');
  }

  openTraysByZonesAndSystems() {
    this.router.navigate(['trays-by-zones-and-systems'], {queryParams: {trays: this.traysByZonesAndSystems}});
    // this.dialogService.open(TraysByZonesAndSystemsComponent, {
    //   showHeader: false,
    //   modal: true,
    //   data: this.traysByZonesAndSystems
    // });
  }
}
