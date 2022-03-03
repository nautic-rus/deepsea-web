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
  cablesSource: any = [];
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
  search: string = '';

  constructor(public device: DeviceDetectorService, public t: LanguageService, public issues: IssueManagerService, public auth: AuthManagerService, private s: SpecManagerService) { }

  ngOnInit(): void {
    if (this.auth.hasPerms('cables-production-view-only')){
      this.availableViews.splice(0, 1);
    }
    this.currentView = this.availableViews[0];
    this.trayBundleProjectChanged();
  }
  searchChanged() {
    if (this.search.trim() == ''){
      this.cables = this.cablesSource;
    }
    else{
      this.cables = this.cablesSource.filter((x: any) => {
        return x == null || (x.CODE + x.ws.name + x.SCHEME + x.FROM_N + x.TO_N + x.FROM_N_ROOM + x.TO_N_ROOM + x.FROM_E_ROOM + x.TO_E_ROOM + x.FROM_E_USERID + x.TO_E_USERID + x.STOCKCODE).trim().toLowerCase().includes(this.search.trim().toLowerCase())
      });
    }
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
    this.cables = [];
    this.openedPath = [];
    this.loading = true;
    this.s.getCables(this.trayBundlesProject, this.selectedTrayBundle, number).then(res => {
      console.log(res);
      this.cables = res;
      this.cables.push(null);
      this.cables.push(null);
      this.cables.push(null);
      this.cables.push(null);
      this.cables.push(null);
      this.loading = false;
      this.cablesSource = this.cables;
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

  pointsHovered: any[] = [];
  openedPath: any[] = [];
  sortValues: any[] = [
    'Not sorted',
    'By Index A-Z',
    'By Index Z-A',
    'By System A-Z',
    'By System Z-A',
  ];
  sortValue = this.sortValues[0];
  openPath(path: string){
    if (!this.openedPath.includes(path)){
      this.openedPath.push(path);
    }
    else{
      this.openedPath.splice(this.openedPath.indexOf(path), 1);
    }
  }
  hoverPoint(point: string){
    if (!this.pointsHovered.includes(point)){
      this.pointsHovered.push(point);
    }
    else{
      this.pointsHovered.splice(this.pointsHovered.indexOf(point), 1);
    }
  }
  getPointStyle(s: string, col: string) {
    if (this.pointsHovered.includes(s)){
      return {
        'background-color': col
      };
    }
    else{
      return {};
    }
  }

  getPath(cablepath: string) {
    return cablepath.split(' ').filter(x => x.length < 16 && x != '');
  }

  sortChanged() {
    this.cablesSource = this.cablesSource.filter((x: any) => x != null);
    switch (this.sortValues.indexOf(this.sortValue)) {
      case 0:{
        this.cables = this.cablesSource;
        break;
      }
      case 1:{
        this.cables = _.sortBy(this.cablesSource, x => x.CODE);
        break;
      }
      case 2:{
        this.cables = _.sortBy(this.cablesSource, x => x.CODE).reverse();
        break;
      }
      case 3:{
        this.cables = _.sortBy(this.cablesSource, x => x.SCHEME);
        break;
      }
      case 4:{
        this.cables = _.sortBy(this.cablesSource, x => x.SCHEME).reverse();
        break;
      }
    }
    for (let x = 0; x < 10; x ++){
      this.cables.push(null);
      this.cablesSource.push(null);
    }
  }
}
