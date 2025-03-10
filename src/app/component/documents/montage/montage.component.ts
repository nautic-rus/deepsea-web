import { Component, OnInit } from '@angular/core';
import {SpecManagerService} from "../../../domain/spec-manager.service";
import {ActivatedRoute, Router} from "@angular/router";
import _ from "underscore";
import {MaterialManagerService} from "../../../domain/material-manager.service";
import {Material} from "../../../domain/classes/material";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import * as props from '../../../props';
import {DeleteComponent} from "../../task/delete/delete.component";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {CheckedConfirmationComponent} from "./checked-confirmation/checked-confirmation.component";


@Component({
  selector: 'app-montage',
  templateUrl: './montage.component.html',
  styleUrls: ['./montage.component.css']
})
export class MontageComponent implements OnInit {

  constructor(public ref: DynamicDialogRef, private dialogService: DialogService, public s: SpecManagerService, public router: Router, public route: ActivatedRoute, public materialManager: MaterialManagerService, public auth: AuthManagerService, public issueManager: IssueManagerService) { }

  drawings: any[] = [];
  equips: any[] = [];
  projects: string[] = ['N002', 'N004'];
  project = 'N004';
  search: string = '';
  tooltips: string[] = [];
  materials: Material[] = [];
  sortValues: any[] = [
    'by Name',
    'by UserId',
    'by System',
    'by Status',
  ];
  sortValue = this.sortValues[0];

  drawingValues: any[] = [];
  selectedDrawings: string[] = [];

  sfiValues: any[] = [];
  selectedSfi: string[] = [];

  systemValues: any[] = [];
  selectedSystems: string[] = [];


  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.project = this.projects.includes(params.foranProject) ? params.foranProject : this.project;
      this.materialManager.getMaterials(this.project.replace('N002', '200101').replace('N004', '210101')).then(materials => {
        this.materials = materials;
        this.fill();
      });
    });
  }
  projectChanged() {
    this.router.navigate([], {queryParams: {foranProject: this.project}}).then(() => {
      this.fill();
    });
  }
  fill(){
    this.s.getEqFoundations(this.project).then(res => {
      this.equips = res;
      this.equips.forEach(eq => {
        eq.MATERIAL = this.materials.find(x => x.code == eq.CSTOCK_CODE);
        if (eq.MATERIAL != null){
          eq.MATERIAL.materialCloudDirectory = '';
          eq.MATERIAL.materialCloudFiles = [];
        }
        let dNumb = this.getDocNumberFromDescr(eq.SYSTEMDESCR);
        if (dNumb != null){
          eq.DRAWINGNAME = eq.SYSTEMDESCR.replace(dNumb, '').trim();
          eq.DRAWINGNUMBER = dNumb;
        }
        else{
          eq.DRAWINGNAME = '';
          eq.DRAWINGNUMBER = '';
        }
      });
      console.log(this.equips);
      this.drawings = [...this.equips];
      this.fillFilters();
      this.applyFilters();
      this.issueManager.getProjectNames().then(projectNames => {
        let findProject = projectNames.find((x: any) => x.foran == this.project);
        if (findProject != null){
          this.issueManager.getCloudFiles(findProject.cloud + '/Materials').then(cloudFiles => {
            console.log(cloudFiles);
            this.equips.filter(x => x.MATERIAL != null).forEach(eq => {
              let findEqFiles = cloudFiles.filter(x => x.url.includes(eq.MATERIAL.code));
              let findDirectory = findEqFiles.find(x => x.name.includes(eq.MATERIAL.code));
              if (findDirectory != null){
                let r = new RegExp('(?<=path=).+');
                if (r.test(findDirectory.url)){
                  // @ts-ignore
                  let match = r.exec(findDirectory.url)[0];
                  eq.MATERIAL.materialCloudDirectory = props.cloud + '/apps/files/?dir=' + match;
                }
                else{
                  eq.materialCloudDirectory = '';
                }
              }
              let findFiles = findEqFiles.filter(x => !x.name.includes(eq.MATERIAL.code));
              if (findFiles != null){
                eq.MATERIAL.materialCloudFiles = findFiles;
              }
            });
          });
        }
      });
      // this.drawings.splice(0, this.drawings.length);
      // _.forEach(_.groupBy(_.sortBy(this.equips, x => x.BSFOUNDATION + x.EUSERID), (x: any) => x.BSFOUNDATION), group => {
      //   this.drawings.push(Object({name: group[0].BSFOUNDATION, group: group}));
      // });
    });
  }
  fillFilters(){
    this.drawingValues.splice(0, this.drawingValues.length);
    this.sfiValues.splice(0, this.sfiValues.length);
    this.systemValues.splice(0, this.systemValues.length);

    _.sortBy( _.uniq(this.equips.map(x => x.BSFOUNDATION), x => x), y => y).forEach(z => this.drawingValues.push(z));
    // if (this.drawingValues.length > 0){
    //   this.drawing = this.drawingValues[0];
    // }
    _.sortBy(_.uniq(this.equips.map(x => this.getSfiGroup(x.EUSERID)), x => x), y => y).forEach(z => this.sfiValues.push(z));
    // if (this.sfiValues.length > 0){
    //   this.sfi = this.sfiValues[0];
    // }
    _.sortBy( _.uniq(this.equips.map(x => x.SYSTEMNAME), x => x), y => y).forEach(z => this.systemValues.push(z));
    // if (this.systemValues.length > 0){
    //   this.system = this.systemValues[0];
    // }

    // this.selectedDrawings = [...this.drawingValues];
    // this.selectedSfi = [...this.sfiValues];
    // this.selectedSystems = [...this.systemValues];
  }
  applyFilters(){
    this.drawings = [...this.equips];
    this.drawings = this.drawings.filter(x => this.selectedDrawings.length == 0 || this.selectedDrawings.find(y => x.BSFOUNDATION.includes(y)) != null);
    this.drawings = this.drawings.filter(x => this.selectedSfi.length == 0 || this.selectedSfi.find(y => x.EUSERID.includes(y)) != null);
    this.drawings = this.drawings.filter(x => this.selectedSystems.length == 0 || this.selectedSystems.find(y => x.SYSTEMNAME.includes(y)) != null);
  }
  getSfiGroup(input: string){
    if (input.includes('.')){
      return input.split('.')[0];
    }
    else if (input.includes('-')){
      return input.split('-')[0];
    }
    else{
      return input;
    }
  }
  round(input: number) {
    return Math.round(input * 100) / 100;
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

  getName(login: string){
    if (login == ''){
      return '';
    }
    return login[0].toUpperCase() + login.substr(1);
  }
  getDate(dateLong: number): string{
    if (dateLong == 0){
      return '--/--/----';
    }
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
  }
  createMaterialCloudDirectory(material: any){
    console.log(material);
    material.materialCloudDirectory = 'LOADING';
    this.materialManager.createMaterialCloudDirectory(this.project.replace('N002', '200101').replace('N004', '210101'), material.code).then(res => {
      console.log(res);
      material.materialCloudDirectory = res;
      window.open(material.materialCloudDirectory);
    });
  }
  openMaterialCloudDirectory(material: any) {
    // console.log(material.materialCloudDirectory);
    // console.log(material.materialCloudFiles);
    // window.open(material.materialCloudDirectory);
    if (material.materialCloudDirectory != ''){
      window.open(material.materialCloudDirectory);
    }
    else{
      this.createMaterialCloudDirectory(material);
    }
  }
  trimText(input: string, length = 50){
    let res = input;
    if (res.length > length){
      res = res.substr(0, length) + '..';
    }
    return res;
  }

  sortChanged() {
    switch (this.sortValues.indexOf(this.sortValue)) {
      case 0:{
        this.drawings = _.sortBy(this.equips, x => x.BSFOUNDATION);
        break;
      }
      case 1:{
        this.drawings = _.sortBy(this.equips, x => x.EUSERID);
        break;
      }
      case 2:{
        this.drawings = _.sortBy(this.equips, x => x.SYSTEMNAME);
        break;
      }
      case 3:{
        this.drawings = _.sortBy(this.equips, x => x.STATUS);
        break;
      }
    }
  }
  removeIssue() {
    this.dialogService.open(CheckedConfirmationComponent, {
      showHeader: false,
      modal: true,
    }).onClose.subscribe(res => {
      if (res == 'success'){
        this.ref.close();
      }
    });
  }
  changeStatus(id: number){
    this.dialogService.open(CheckedConfirmationComponent, {
      showHeader: false,
      modal: true,
      data: [this.project, id]
    }).onClose.subscribe(res => {
      if (res == 'success'){
        this.fill();
      }
    });
  }
  filterChanged() {
    this.applyFilters();
  }

  formatStatus(eqStatus: number) {
    switch (eqStatus) {
      case 1: return 'SUCCESS';
      case 0: return 'ERROR';
      default: return 'UNDEFINED';
    }
  }

  clearNumber(descr: string) {
    let r = new RegExp('\\d{6}-\\w{3,4}-\\d{3,4}');
    if (r.test(descr)){
      // @ts-ignore
      let match = r.exec(descr)[0];
      return descr.replace(' ' + match, '');
    }
    else{
      return descr;
    }
  }
  getDocNumberFromDescr(descr: string) {
    let r = new RegExp('\\d{6}-\\w{3,4}-\\d{3,4}');
    if (r.test(descr)){
      // @ts-ignore
      return  r.exec(descr)[0];
    }
    else{
      return '';
    }
  }
}
