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
import {PartsQtyComponent} from "./parts-qty/parts-qty.component";
import {WastageComponent} from "./wastage/wastage.component";
import {BlocksComponent} from "./blocks/blocks.component";

@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.css']
})
export class BillingComponent implements OnInit {

  plates: any[] = [];
  profiles: any[] = [];
  platesSource: any[] = [];
  profilesSource: any[] = [];

  projects: string[] = ['N002', 'N004', 'P701', 'P707'];
  project = '';
  search: string = '';
  searchPlates: string = '';
  searchProfiles: string = '';
  filtersPlates:  { material: any[], count: any[], scantling: any[] } = { material: [], count: [], scantling: [] };
  filtersProfiles:  { material: any[], count: any[], scantling: any[], section: any[] } = { material: [], count: [], scantling: [], section: [] };
  selectedHeadTab: string = 'Plates';
  selectedView: string = 'tiles';
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
    'by Profile Count',
    'by Real Count',
    'by Length',
    'by Weight',
    'by Scrap'
  ];
  sortProfilesValue = this.sortProfilesValues[2];

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
    this.s.getHullBillProfiles(this.project).then(res => {
      this.profiles = res;
      this.profilesSource = res;
      this.filtersProfiles.material = this.getProfileFilters(this.profiles, 'mat');
      this.filtersProfiles.material = this.getProfileFilters(this.profiles, 'count');
      this.filtersProfiles.material = this.getProfileFilters(this.profiles, 'scantling');
      this.filtersProfiles.material = this.getProfileFilters(this.profiles, 'section');
      for (let x = 0; x < 10; x ++){
        this.profiles.push(null);
        this.profilesSource.push(null);
      }
      this.sortProfilesChanged();
      console.log(res);
    });
    this.s.getHullBillPlates(this.project).then(res => {
      res.forEach((r: any) => r.side = 'front');
      this.plates = res;
      this.platesSource = res;
      this.filtersPlates.material = this.getPlateFilters(this.plates, 'mat');
      this.filtersPlates.count = this.getPlateFilters(this.plates, 'count');
      this.filtersPlates.scantling = this.getPlateFilters(this.plates, 'scantling');
      for (let x = 0; x < 10; x ++){
        this.plates.push(null);
        this.platesSource.push(null);
      }
      this.sortPlatesChanged();
      console.log(res);
    });
  }
  searchChanged() {
    if (this.selectedHeadTab == 'Plates') {
      if (this.searchPlates.trim() == '') {
        this.plates = this.platesSource;
      } else {
        this.plates = this.platesSource.filter((x: any) => {
          return x == null || (x.KPL.toString() + x.count.toString() + x.mat.toString() + x.nestedParts.toString() + x.plateForecast.toString() + x.realPartsCount.toString() + x.realWeight.toString() + x.scantling.toString() + x.scrap.toString()).trim().toLowerCase().includes(this.searchPlates.toString().trim().toLowerCase())
        });
      }
    }
    if (this.selectedHeadTab == 'Profiles') {
      if (this.searchProfiles.trim() == '') {
        this.profiles = this.profilesSource;
      } else {
        this.profiles = this.profilesSource.filter((x: any) => {
          return x == null || (x.KSE + x.count + x.grossLenght + x.mat + x.profileForecast + x.realLenght + x.realPartsCount + x.scantling + x.scrap + x.section).trim().toLowerCase().includes(this.searchProfiles.trim().toLowerCase())
        });
      }
    }
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
    let data: any[] = [];
    if (this.selectedHeadTab == 'Plates'){
      this.plates.filter((x: any) => x != null).forEach(plate => {
        data.push({
          'Thickness (mm)': plate.scantling.split('x')[0],
          'Thickness Name': 'PL' + plate.scantling.split('x')[0],
          'Steel Grade': plate.mat,
          'Plate (kg)': plate.oneSheetWeight,
          'Nested Parts': plate.nestedParts,
          'Scrap': Math.round(plate.scrap) + '% / ' + this.round(1 + (1 / (100 / (100 - plate.scrap)))),
          'Real QTY': plate.realPartsCount,
          'Parts Weight': plate.realWeight,
          'Stock Plates': plate.stock,
          'Forecast Plates': plate.plateForecast,
          'Usage Plates': plate.count,
        })
      });
    }
    if (this.selectedHeadTab == 'Profiles'){
      data = this.profiles.filter((x: any) => x != null);
    }
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = {Sheets: {'data': worksheet}, SheetNames: ['data']};
    worksheet['!cols'] = [{wch:13},{wch:13},{wch:10},{wch:10},{wch:10},{wch:10},{wch:8},{wch:14},{wch:10},{wch:10},{wch:10}];

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
  getWidth(number: number) {
    return {
      width: number + '%'
    };
  }
  getWidthRightRadius(number: number) {
    return {
      width: number + '%',
      'border-top-right-radius': number == 100 ? '8px' : '0',
      'border-bottom-right-radius':  number == 100 ? '8px' : '0',
    };
  }
  getWidthLeftRadius(number: number) {
    return {
      width: number + '%',
      'border-top-left-radius': number == 100 ? '8px' : '0',
      'border-bottom-left-radius': number == 100 ? '8px' : '0',
    };
  }
  getStock(plate: any) {
    let values = _.sortBy([plate.count, plate.stock, plate.plateForecast]).reverse();
    let comp = values[0];
    let width = plate.stock / comp * 100;
    return {
      position: 'absolute',
      right: '0',
      top: '0',
      width: width + '%'
    };
  }
  getStockProfile(profile: any) {
    let values = _.sortBy([profile.count, profile.stock, profile.profileForecast]).reverse();
    let comp = values[0];
    let width = profile.stock / comp * 100;
    return {
      position: 'absolute',
      right: '0',
      top: '0',
      width: width + '%'
    };
  }
  getStockValue(plate: any) {
    let values = _.sortBy([plate.count, plate.stock, plate.plateForecast]).reverse();
    let comp = values[0];
    return plate.stock / comp * 100;
  }
  getStockValueProfile(profile: any) {
    let values = _.sortBy([profile.count, profile.stock, profile.profileForecast]).reverse();
    let comp = values[0];
    return profile.stock / comp * 100;
  }
  getForecast(plate: any) {
    let values = _.sortBy([plate.count, plate.stock, plate.plateForecast]).reverse();
    let comp = values[0];
    let width = plate.plateForecast / comp * 100;
    return {
      position: 'absolute',
      right: '0',
      top: '0',
      width: width + '%'
    };
  }
  getForecastProfile(profile: any) {
    let values = _.sortBy([profile.count, profile.stock, profile.profileForecast]).reverse();
    let comp = values[0];
    let width = profile.profileForecast / comp * 100;
    return {
      position: 'absolute',
      right: '0',
      top: '0',
      width: width + '%'
    };
  }
  getForecastValue(plate: any) {
    let values = _.sortBy([plate.count, plate.stock, plate.plateForecast]).reverse();
    let comp = values[0];
    return plate.plateForecast / comp * 100;
  }
  getForecastValueProfile(profile: any) {
    let values = _.sortBy([profile.count, profile.stock, profile.profileForecast]).reverse();
    let comp = values[0];
    return profile.profileForecast / comp * 100;
  }
  getCount(plate: any) {
    let values = _.sortBy([plate.count, plate.stock, plate.plateForecast]).reverse();
    let comp = values[0];
    let width = plate.count / comp * 100;
    return {
      position: 'absolute',
      right: '0',
      top: '0',
      width: width + '%'
    };
  }
  getCountProfile(profile: any) {
    let values = _.sortBy([profile.count, profile.stock, profile.profileForecast]).reverse();
    let comp = values[0];
    let width = profile.count / comp * 100;
    return {
      position: 'absolute',
      right: '0',
      top: '0',
      width: width + '%'
    };
  }
  // getStock(number: number) {
  //   return {
  //     width: number + '%',
  //     'border-top-right-radius': number >= 100 ? '8px' : '0',
  //     'border-bottom-right-radius':  number >= 100 ? '8px' : '0',
  //     'background': this.getColor(number)
  //   };
  // }
  // getCount(number: number) {
  //   return {
  //     width: number + '%',
  //     'border-top-left-radius': number == 100 ? '8px' : '0',
  //     'border-bottom-left-radius': number == 100 ? '8px' : '0',
  //     'background-color': number >= 100 ? '#ff5349' : '#EBF4FD'
  //   };
  // }
  getColor(number: number){
    let color = '#94d42d'
    if (number < 100){
      color = 'linear-gradient(270deg, rgba(165,217,54,1) 0%, rgba(148,212,45,1) 100%)';
    }
    if (number < 50){
      color = 'linear-gradient(270deg, rgba(183,222,63,1) 0%, rgba(165,217,54,1) 100%)';
    }
    if (number < 30){
      color = 'linear-gradient(270deg, rgba(225,226,72,1) 0%, rgba(183,222,63,1) 100%)';
    }
    if (number < 20){
      color = 'linear-gradient(270deg, rgba(225,201,72,1) 0%, rgba(225,226,72,1) 100%)';
    }
    if (number < 15){
      color = 'linear-gradient(270deg, rgba(251,201,72,1) 0%, rgba(225,201,72,1) 100%)';
    }
    if (number < 13){
      color = 'linear-gradient(270deg, rgba(253,164,73,1) 0%, rgba(251,201,72,1) 100%)';
    }
    if (number < 10){
      color = 'linear-gradient(270deg, rgba(255,120,73,1) 0%, rgba(253,164,73,1) 100%)';
    }
    if (number < 7){
      color = 'linear-gradient(270deg, rgba(255,108,73,1) 0%, rgba(255,120,73,1) 100%)';
    }
    if (number < 5){
      color = 'linear-gradient(270deg, rgba(255,83,73,1) 0%, rgba(255,108,73,1) 100%)';
    }
    return color;
  }
  addLeftZeros(input: string, length: number){
    let res = input;
    while (res.length < length){
      res = '0' + res;
    }
    return res;
  }
  sortPlatesChanged() {
    this.platesSource = this.platesSource.filter((x: any) => x != null);
    switch (this.sortPlatesValues.indexOf(this.sortPlatesValue)) {
      case 0:{
        this.plates = _.sortBy(this.platesSource, x => x.KPL);
        break;
      }
      case 1:{
        this.plates = _.sortBy(this.platesSource, x => x.scantling.split('x').map((x: any) => this.addLeftZeros(x, 5)).join(''));
        break;
      }
      case 2:{
        this.plates = _.sortBy(this.platesSource, x => x.mat + x.scantling.split('x').map((x: any) => this.addLeftZeros(x, 5)).join(''));
        break;
      }
      case 3:{
        this.plates = _.sortBy(this.platesSource, x => x.nestedParts);
        break;
      }
      case 4:{
        this.plates = _.sortBy(this.platesSource, x => x.oneSheetWeight);
        break;
      }
      case 5:{
        this.plates = _.sortBy(this.platesSource, x => x.realWeight);
        break;
      }
      case 6:{
        this.plates = _.sortBy(this.platesSource, x => x.scrap).reverse();
        break;
      }
    }
    let newPlates = this.plates.filter(x => !x.isDisabled);
    this.plates.filter(x => x.isDisabled).forEach(p => newPlates.push(p));
    this.plates = newPlates;
    for (let x = 0; x < 10; x ++){
      this.plates.push(null);
      this.platesSource.push(null);
    }
  }
  sortProfilesChanged() {
    this.profilesSource = this.profilesSource.filter((x: any) => x != null);
    switch (this.sortProfilesValues.indexOf(this.sortProfilesValue)) {
      case 0:{
        this.profiles = _.sortBy(this.profilesSource, x => x.KSE);
        break;
      }
      case 1:{
        this.profiles = _.sortBy(this.profilesSource, x => x.section);
        break;
      }
      case 2:{
        this.profiles = _.sortBy(this.profilesSource, x => x.mat);
        break;
      }
      case 3:{
        this.profiles = _.sortBy(this.profilesSource, x => x.profileForecast);
        break;
      }
      case 4:{
        this.profiles = _.sortBy(this.profilesSource, x => x.count);
        break;
      }
      case 5:{
        this.profiles = _.sortBy(this.profilesSource, x => x.realPartsCount);
        break;
      }
      case 6:{
        this.profiles = _.sortBy(this.profilesSource, x => x.realLenght);
        break;
      }
      case 7:{
        this.profiles = _.sortBy(this.profilesSource, x => x.partsweight);
        break;
      }
      case 8:{
        this.profiles = _.sortBy(this.profilesSource, x => x.scrap).reverse();
        break;
      }
    }
    let newProfiles = this.profiles.filter(x => !x.isDisabled);
    this.profiles.filter(x => x.isDisabled).forEach(p => newProfiles.push(p));
    this.profiles = newProfiles;
    for (let x = 0; x < 10; x ++){
      this.profiles.push(null);
      this.profilesSource.push(null);
    }
  }

  abs(n: number) {
    return Math.abs(n);
  }

  flip(plate: any) {

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
  showPartsQty(plate: any) {
    this.dialogService.open(PartsQtyComponent, {
      showHeader: false,
      modal: true,
      data: [this.project, plate],
    }).onClose.subscribe(res => {
      if (res == 'success'){
        this.ref.close();
      }
    });
  }
  showWastage(plate: any) {
    this.dialogService.open(WastageComponent, {
      showHeader: false,
      modal: true,
      data: [this.project, plate],
    }).onClose.subscribe(res => {
      if (res == 'success'){
        this.ref.close();
      }
    });
  }
  showBlocks(plate: any) {
    this.dialogService.open(BlocksComponent, {
      showHeader: false,
      modal: true,
      data: [this.project, plate],
    }).onClose.subscribe(res => {
      if (res == 'success'){
        this.ref.close();
      }
    });
  }
  profDecode(code: string): string{
    switch (code) {
      case 'AS': return 'LP';
      case 'FS': return 'FB';
      case 'PS': return 'PIPE';
      case 'RS': return 'RB';
      case 'MC': return 'HRB';
      case 'SR': return 'SQB';
      case 'HR': return 'SQP';
      case 'BS': return 'HP';
      default: return code;
    }
  }
}
