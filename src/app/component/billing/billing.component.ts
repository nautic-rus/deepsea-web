import { Component, OnInit } from '@angular/core';
import {SpecManagerService} from "../../domain/spec-manager.service";
import {ActivatedRoute} from "@angular/router";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {collect} from "underscore";
import {LanguageService} from "../../domain/language.service";
import * as _ from "underscore";
import * as XLSX from "xlsx";

@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.css']
})
export class BillingComponent implements OnInit {

  plates = [];
  profiles = [];

  projects: string[] = ['N002', 'N004', 'P701', 'P707'];
  project = '';
  search: string = '';
  filtersPlates:  { material: any[], count: any[], scantling: any[] } = { material: [], count: [], scantling: [] };
  filtersProfiles:  { material: any[], count: any[], scantling: any[], section: any[] } = { material: [], count: [], scantling: [], section: [] };
  selectedHeadTab: string = 'Plates';


  constructor(public t: LanguageService, public s: SpecManagerService, public route: ActivatedRoute, public auth: AuthManagerService) { }

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
    this.s.getHullBillProfiles(this.project).then(res => {
      this.profiles = res;
      this.filtersProfiles.material = this.getProfileFilters(this.profiles, 'mat');
      this.filtersProfiles.material = this.getProfileFilters(this.profiles, 'count');
      this.filtersProfiles.material = this.getProfileFilters(this.profiles, 'scantling');
      this.filtersProfiles.material = this.getProfileFilters(this.profiles, 'section');
      console.log(res);
    });
    this.s.getHullBillPlates(this.project).then(res => {
      this.plates = res;
      this.filtersPlates.material = this.getPlateFilters(this.plates, 'mat');
      this.filtersPlates.count = this.getPlateFilters(this.plates, 'count');
      this.filtersPlates.scantling = this.getPlateFilters(this.plates, 'scantling');
      console.log(res);
    });
  }

  projectChanged() {
    this.fill();
  }
  round(input: number) {
    return Math.round(input * 100) / 100;
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
    if (this.selectedHeadTab == 'Plates'){
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.plates.filter((x: any) => x != null));
      const workbook: XLSX.WorkBook = {Sheets: {'data': worksheet}, SheetNames: ['data']};
      XLSX.writeFile(workbook, fileName);
    }
    if (this.selectedHeadTab == 'Profiles'){
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.profiles.filter((x: any) => x != null));
      const workbook: XLSX.WorkBook = {Sheets: {'data': worksheet}, SheetNames: ['data']};
      XLSX.writeFile(workbook, fileName);
    }
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
}
