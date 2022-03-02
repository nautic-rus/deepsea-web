import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {SpecManagerService} from "../../../domain/spec-manager.service";
import {LanguageService} from "../../../domain/language.service";
import _ from "underscore";
import {UploadRevisionFilesComponent} from "../../documents/hull-esp/upload-revision-files/upload-revision-files.component";
import {DialogService} from "primeng/dynamicdialog";
import {GenerationWaitComponent} from "./generation-wait/generation-wait.component";
import {group} from "@angular/animations";
import {DeviceDetectorService} from "ngx-device-detector";
import {MessageService} from "primeng/api";

@Component({
  selector: 'app-trays-by-zones-and-systems',
  templateUrl: './trays-by-zones-and-systems.component.html',
  styleUrls: ['./trays-by-zones-and-systems.component.css']
})
export class TraysByZonesAndSystemsComponent implements OnInit {
  collapsed: string[] = [];
  trays: any = [];
  equipment: any = [];
  bundle: any = Object();
  grouped: any = [];
  selectedTab: string = 'Trays';
  project: string = '';
  docNumber: string = '';
  waitingForResponse = false;
  search = '';
  source: any = Object();
  sortValue = '';
  sortReverse = false;
  expanded: string[] = [];
  tooltips: string[] = [];
  trayBundlesProject = 'P701';
  selectedTrayBundle: any;
  selectedGroup: any = Object();
  constructor(public device: DeviceDetectorService, private route: ActivatedRoute, private router: Router, private s: SpecManagerService, public l: LanguageService, private dialogService: DialogService, private messageService: MessageService) { }


  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.project = params.project != null ? params.project : '';
      this.docNumber = params.docNumber != null ? params.docNumber : '';
      if (this.project != '' && this.docNumber != ''){
        this.s.getTraysByZonesAndSystems(this.project, this.docNumber).then(res => {
          this.source = res;
          this.fillTraysAndEqs();
        });
      }
      else{
        //this.router.navigate(['']);
      }
    });
  }
  removeLeftZeros(input: string){
    let res = input;
    while (res.length > 0 && res[0] == '0'){
      res = res.substr(1);
    }
    return res;
  }
  fillTraysAndEqs(){
    console.log(this.source);
    this.bundle = this.source.complect;
    this.trays = this.source.trays;
    console.log(this.trays)
    this.grouped.splice(0, this.grouped.length);
    this.equipment = _.sortBy(this.source.eqs, x => this.addLeftZeros(x.LABEL, 5)).filter(x => this.isEqVisible(x));

    if (this.sortValue != ''){
      this.equipment = _.sortBy(this.equipment, x => x[this.sortValue]);
      if (this.sortReverse){
        this.equipment = this.equipment.reverse();
      }
    }

    this.equipment.forEach((eq: any) => {
      eq.LABEL = this.addLeftZeros(eq.LABEL, 10);
      eq.workShopMaterialName = eq.workShopMaterial.name;
    });

    // _.forEach(_.groupBy(_.sortBy(this.trays, x => x.mountData.label), x => x.mountData.label + x.mountData.trmCode + x.mountData.name), group => {
    //   if (this.isTrayVisible(group[0])){
    //     this.grouped.push(group);
    //   }
    // });
    _.forEach(_.groupBy(_.sortBy(this.trays, x => x.mountData.label), x => x.mountData.label + x.mountData.trmCode + x.mountData.name), group => {
      if (this.isTrayVisible(group[0])){
        this.grouped.push(group);
      }
    });
    this.grouped.forEach((g: any) => this.selectedGroup[this.grouped.indexOf(g)] = 0);
  }
  isEqVisible(eq: any){
    return this.search.trim() == '' || (eq.LABEL + eq.USERID + eq.SYSTEM_NAME + eq.ZONE_NAME + eq.STOCK_CODE + eq.workShopMaterial.name + eq.workShopMaterial.description + eq.workShopMaterial.provider).toLowerCase().includes(this.search.toLowerCase().trim());
  }
  isTrayVisible(tray: any){
    return this.search.trim() == '' || (tray.mountData.label + tray.foranTray.ZONE + tray.mountData.trmCode + tray.foranTray.IDSQ + tray.workShopMaterial.name + tray.workShopMaterial.description).toLowerCase().includes(this.search.toLowerCase().trim());
  }
  addLeftZeros(input: string, length: number){
    let res = input;
    while (res.length < length){
      res = '0' + res;
    }
    return res;
  }
  contentClick(content: string): void{
    this.collapsed.includes(content) ? this.collapsed.splice(this.collapsed.indexOf(content), 1) : this.collapsed.push(content);
  }

  generatePdf(revision = false) {
    this.dialogService.open(GenerationWaitComponent, {
      showHeader: false,
      modal: true,
      data: [this.project, this.docNumber, revision]
    });
  }

  containsZeroSurface(group: any[]) {
    return group.find(tray => tray.foranTray.marign == 0) != null || group.find(tray => tray.foranTray.SURFACE == 'F0') != null;
  }
  sort(column: string){
    this.sortValue = column;
    this.sortReverse = !this.sortReverse;
    this.fillTraysAndEqs();
  }
  searchChanged() {
    this.fillTraysAndEqs();
  }
  round(value: number) {
    return Math.round(value * 100) / 100;
  }
  toggleExpanded(name: string){
    if (this.expanded.includes(name)){
      this.expanded.splice(this.expanded.indexOf(name), 1);
    }
    else{
      this.expanded.push(name);
    }
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
  fixTrayBundle(){
    this.s.fixTrayBundle(this.trayBundlesProject, this.selectedTrayBundle);
    this.messageService.add({key:'task', severity:'success', summary:'Fix Bundle', detail:'You have successfully fixed bundle ' + this.selectedTrayBundle + '.'});
  }
}
