import { Component, OnInit } from '@angular/core';
import {LanguageService} from "../../domain/language.service";
import {IssueManagerService} from "../../domain/issue-manager.service";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {SpecManagerService} from "../../domain/spec-manager.service";
import {TaskComponent} from "../task/task.component";
import {DialogService} from "primeng/dynamicdialog";
import {TraysByZonesAndSystemsComponent} from "./trays-by-zones-and-systems/trays-by-zones-and-systems.component";
import {Router} from "@angular/router";
import _ from "underscore";
import {MessageService} from "primeng/api";
import {DeviceDetectorService} from "ngx-device-detector";

@Component({
  selector: 'app-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.css']
})
export class ToolsComponent implements OnInit {

  wait: string[] = [];
  billOfMaterials: string = '';
  materialsProject = '';



  trayBundlesProject = 'P701';
  trayBundlesProjects = ['P701', 'P707'];
  selectedTrayBundle: any;
  trayBundles: any[] = [];

  projects: string[] = ['P701', 'N002', 'N004'];


  projectsBsDesign: string[] = ['P701'];
  projectBsDesign = this.projectsBsDesign[0];



  constructor(public device: DeviceDetectorService, public auth: AuthManagerService, public issues: IssueManagerService, public t: LanguageService, private s: SpecManagerService, private dialogService: DialogService, private router: Router, private messageService: MessageService) { }

  ngOnInit(): void {
    this.issues.getIssueProjects().then(projects => {
      if (this.projects.length > 0) {
        this.materialsProject = this.projects[this.projects.length - 1];
      }
    });
    this.trayBundleProjectChanged();
  }
  isDesktop() {
    return this.device.isDesktop() && window.innerWidth > 1296;
  }
  getBillOfMaterials() {
    this.wait.push('bill-of-materials');
    this.materialsProject = this.materialsProject.replace('NR', 'N');
    this.issues.getForanParts(this.materialsProject).then(res => {
      this.billOfMaterials = res;
      this.wait.splice(this.wait.indexOf('bill-of-materials'), 1);
    });
  }
  getTraysByZonesAndSystems(){
    this.router.navigate(['trays-by-zones-and-systems'], {queryParams: {project: this.trayBundlesProject, docNumber: this.selectedTrayBundle}});
  }

  download(url: string) {
    window.open(url, '_blank');
  }
  trayBundleProjectChanged(){
    this.s.getTrayBundles(this.trayBundlesProject).then(res => {
      this.trayBundles = _.sortBy(res.filter((x: any) => x.drawingId != null && x.drawingId != ''), x => x.drawingId);
      if (this.trayBundles.length > 0){
        this.selectedTrayBundle = this.trayBundles[0].drawingId;
      }
    });
  }
  fixTrayBundle(){
    this.s.fixTrayBundle(this.trayBundlesProject, this.selectedTrayBundle);
    this.messageService.add({key:'task', severity:'success', summary:'Fix Bundle', detail:'You have successfully fixed bundle ' + this.selectedTrayBundle + '.'});
  }

  openBsDesignNodes() {
    this.router.navigate(['bsDesignNodes'], {queryParams: {project: this.projectBsDesign}});
  }
}
