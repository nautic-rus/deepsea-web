import { Component, OnInit } from '@angular/core';
import {SpecManagerService} from "../../../domain/spec-manager.service";
import {ActivatedRoute, Router} from "@angular/router";
import _ from "underscore";
import {MaterialManagerService} from "../../../domain/material-manager.service";
import {Material} from "../../../domain/classes/material";

@Component({
  selector: 'app-montage',
  templateUrl: './montage.component.html',
  styleUrls: ['./montage.component.css']
})
export class MontageComponent implements OnInit {

  constructor(public s: SpecManagerService, public router: Router, public route: ActivatedRoute, public materialManager: MaterialManagerService) { }

  drawings: any[] = [];
  equips: any[] = [];
  projects: string[] = ['N002', 'N004'];
  project = 'N004';
  search: string = '';
  tooltips: string[] = [];
  materials: Material[] = [];

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
      });
      console.log(this.equips);
      this.drawings.splice(0, this.drawings.length);
      _.forEach(_.groupBy(_.sortBy(this.equips, x => x.BSFOUNDATION + x.EUSERID), (x: any) => x.BSFOUNDATION), group => {
        this.drawings.push(Object({name: group[0].BSFOUNDATION, group: group}));
      });
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



}
