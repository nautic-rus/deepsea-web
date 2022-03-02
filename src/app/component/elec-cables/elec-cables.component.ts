import { Component, OnInit } from '@angular/core';
import {LanguageService} from "../../domain/language.service";
import {IssueManagerService} from "../../domain/issue-manager.service";
import {AuthManagerService} from "../../domain/auth-manager.service";
import _ from "underscore";
import {SpecManagerService} from "../../domain/spec-manager.service";
import {DeviceDetectorService} from "ngx-device-detector";

@Component({
  selector: 'app-elec-cables',
  templateUrl: './elec-cables.component.html',
  styleUrls: ['./elec-cables.component.css']
})
export class ElecCablesComponent implements OnInit {

  cables: any[] = [];

  trayBundlesProject = 'P701';
  trayBundlesProjects = ['P701', 'P707'];
  selectedTrayBundle: any;
  trayBundles: any[] = [];
  availableViews = ['demo', 'production'];
  currentView = 'demo';
  productionView = false;
  loading = false;
  noResult = false;
  tooltips: string[] = [];

  constructor(public device: DeviceDetectorService, public t: LanguageService, public issues: IssueManagerService, public auth: AuthManagerService, private s: SpecManagerService) { }

  ngOnInit(): void {
    if (this.auth.hasPerms('cables-production-view-only')){
      this.availableViews.splice(0, 1);
    }
    this.currentView = this.availableViews[0];
    this.trayBundleProjectChanged();
  }
  trayBundleProjectChanged(){
    this.s.getTrayBundles(this.trayBundlesProject).then(res => {
      this.trayBundles = _.sortBy(res.filter((x: any) => x.drawingId != null && x.drawingId != ''), x => x.drawingId);
      if (this.trayBundles.length > 0){
        this.selectedTrayBundle = this.trayBundles[0].drawingId;
      }
    });
  }

  getCables(number: number = 0) {
    this.loading = true;
    this.s.getCables(this.trayBundlesProject, this.selectedTrayBundle, number).then(res => {
      console.log(res);
      this.cables = res;
      this.loading = false;
    });
  }

  changeView() {
    this.currentView = this.currentView == 'demo' ? 'production' : 'demo';
  }

  copyTrmCode(code: string, index: string) {
    navigator.clipboard.writeText(code);
    this.tooltips.push(index);
    setTimeout(() => {
      this.tooltips.splice(this.tooltips.indexOf(index), 1);
    }, 1500);
    //this.messageService.add({key:'task', severity:'success', summary:'Copied', detail:'You have copied issue url.'});
  }

  showTooltip(index: string) {
    return this.tooltips.includes(index);
  }
  isDesktop() {
    return this.device.isDesktop() && window.innerWidth > 1078;
  }
}
