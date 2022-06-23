import { Component, OnInit } from '@angular/core';
import {SpecManagerService} from "../../domain/spec-manager.service";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {collect} from "underscore";
import {LanguageService} from "../../domain/language.service";
import * as _ from "underscore";
import * as XLSX from "xlsx";
import {CreateTaskComponent} from "../create-task/create-task.component";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {DeleteComponent} from "../task/delete/delete.component";
import {PartsQtyComponent} from "../billing/parts-qty/parts-qty.component";
import {PartsQtyProfileComponent} from "../billing/parts-qty-profile/parts-qty-profile.component";
import {WastageComponent} from "../billing/wastage/wastage.component";
import {BlocksComponent} from "../billing/blocks/blocks.component";

@Component({
  selector: 'app-billing-pipe',
  templateUrl: './billing-pipe.component.html',
  styleUrls: ['./billing-pipe.component.css']
})
export class BillingPipeComponent implements OnInit {

  pipes: any[] = [];
  pipesSrc: any[] = [];
  pipeTypeDescrs: any[] = [];

  projects: string[] = ['N002', 'N004', 'P701', 'P707'];
  project = '';
  search: string = '';
  filtersPlates:  { material: any[], count: any[], scantling: any[] } = { material: [], count: [], scantling: [] };
  filtersProfiles:  { material: any[], count: any[], scantling: any[], section: any[] } = { material: [], count: [], scantling: [], section: [] };
  selectedView: string = 'tiles';
  selectedTypeDesc: string = 'Pipe';
  sortPlatesValues: any[] = [
    'by KPL',
    'by Material',
    'by Steel Grade',
    'by Nested Parts',
    'by Plate Weight',
    'by Parts Weight',
    'by Scrap'
  ];
  sortPlatesValue = this.sortPlatesValues[1];
  sortProfilesValues: any[] = [
    'by KSE',
    'by Section',
    'by Material',
    'by Profile Forecast',
    'by Profile Usage',
    'by Parts QTY',
    'by Parts Weight',
    'by Scrap'
  ];
  tooltips: string[] = [];
  sortProfilesValue = this.sortProfilesValues[1];

  constructor(public ref: DynamicDialogRef, public t: LanguageService, public s: SpecManagerService, public route: ActivatedRoute, public auth: AuthManagerService, public router: Router, private dialogService: DialogService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.project = params.foranProject != null ? params.foranProject : 'N004';
      this.projects = this.projects.filter(x => this.auth.getUser().visible_projects.includes(x));
      if (!this.projects.includes(this.project)) {
        this.project = this.projects[0];
      }
      this.fill();
    });
  }
  fill(){
    this.s.getPipeSegsBilling(this.project).then(res => {
      this.pipes = res;
      this.pipesSrc = res;
      this.pipeTypeDescrs = res.map(x => x.typeDesc).filter((value, index, self) => self.indexOf(value) === index);
      this.pipeTypeDescrs = _.sortBy(this.pipeTypeDescrs, x => x);
      this.refresh();
    });
  }
  searchChanged() {
    //todo search
  }
  projectChanged() {
    this.router.navigate([], {queryParams: {foranProject: this.project}}).then(() => {
      //this.fill();
    });
  }
  round(input: number, digit = 100) {
    return Math.round(input * digit) / digit;
  }
  roundDecimal(input: number){
    return Math.ceil(input);
  }
  getPlateFilters(plates: any[], field: string): any[] {
    let res: any[] = [];
    let uniq = _.uniq(plates, x => x[field]);
    uniq.forEach(x => {
      res.push({
        label: x[field],
        value: x[field]
      })
    });
    return _.sortBy(res, x => x.label);
  }
  getProfileFilters(plates: any[], field: string): any[] {
    let res: any[] = [];
    let uniq = _.uniq(plates, x => x[field]);
    uniq.forEach(x => {
      res.push({
        label: x[field],
        value: x[field]
      })
    });
    return _.sortBy(res, x => x.label);
  }

  exportXls() {
    let fileName = 'export_' + this.generateId(8) + '.xlsx';
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.pipes);
    const workbook: XLSX.WorkBook = {Sheets: {'data': worksheet}, SheetNames: ['data']};
    //worksheet['!cols'] = [{wch:13},{wch:13},{wch:10},{wch:10},{wch:10},{wch:10},{wch:8},{wch:14},{wch:10},{wch:10},{wch:10}];

    XLSX.writeFile(workbook, fileName);
  }
  generateId(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() *
        charactersLength));
    }
    return result;
  }
  addLeftZeros(input: string, length: number){
    let res = input;
    while (res.length < length){
      res = '0' + res;
    }
    return res;
  }

  abs(n: number) {
    return Math.abs(n);
  }

  public handleBackClick(event: any, plate: any) {
    if (event.view.getSelection().toString().length === 0) {
      plate.side = 'back';
    }
  }
  public handleFrontClick(event: any, plate: any) {
    if (event.view.getSelection().toString().length === 0) {
      plate.side = 'front';
    }
  }

  refresh() {
    this.pipes = this.pipesSrc.filter(x => x.typeDesc == this.selectedTypeDesc);
  }

  selectTypeDesc(type: any) {
    this.selectedTypeDesc = type;
    this.refresh();
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
}
