import { Component, OnInit } from '@angular/core';
import {SpecManagerService} from "../../../domain/spec-manager.service";
import {ActivatedRoute, Router} from "@angular/router";
import _ from "underscore";
import {MaterialManagerService} from "../../../domain/material-manager.service";
import {Material} from "../../../domain/classes/material";
import {AuthManagerService} from "../../../domain/auth-manager.service";

@Component({
  selector: 'app-montage',
  templateUrl: './montage.component.html',
  styleUrls: ['./montage.component.css']
})
export class MontageComponent implements OnInit {

  constructor(public s: SpecManagerService, public router: Router, public route: ActivatedRoute, public materialManager: MaterialManagerService, public auth: AuthManagerService) { }

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
        }
      });
      console.log(this.equips);
      this.drawings = [...this.equips];
      // this.drawings.splice(0, this.drawings.length);
      // _.forEach(_.groupBy(_.sortBy(this.equips, x => x.BSFOUNDATION + x.EUSERID), (x: any) => x.BSFOUNDATION), group => {
      //   this.drawings.push(Object({name: group[0].BSFOUNDATION, group: group}));
      // });
    });
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
    });
  }
  openMaterialCloudDirectory(material: any) {
    window.open(material.materialCloudDirectory);
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
}
