import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {SpecManagerService} from "../../../domain/spec-manager.service";
import {DialogService} from "primeng/dynamicdialog";
import _ from "underscore";
import {AddComplectComponent} from "../complect-manager/add-complect/add-complect.component";
import {MaterialManagerService} from "../../../domain/material-manager.service";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {AddMaterialComplectComponent} from "./add-material-complect/add-material-complect.component";

@Component({
  selector: 'app-material-complect-manager',
  templateUrl: './material-complect-manager.component.html',
  styleUrls: ['./material-complect-manager.component.css']
})
export class MaterialComplectManagerComponent implements OnInit {

  project = 'N002';
  complects: any[] = [];
  projects: string[] = [];
  selectedComplect: any;
  systems: any[] = [];
  selectedSystems: any[] = [];
  zones: any[] = [];
  selectedZones: any[] = [];
  materials: any[] = [];
  selectedMaterials: any[] = [];
  constructor(public route: ActivatedRoute, public router: Router, public s: SpecManagerService, public d: DialogService, public materialManagerService: MaterialManagerService, public issues: IssueManagerService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.project = params.project != null ? params.project : this.project;
      this.fillMaterials();
      this.fillProjects();
      this.fillComplects();
    });
  }

  fillMaterials(){
    this.issues.getIssueProjects().then(projects => {
      let findRkd = projects.find(x => x.foran == this.project);
      if (findRkd != null){
        this.materialManagerService.getMaterials(findRkd.rkd).then(res => {
          this.materials = _.sortBy(res, x => x.name);
          console.log(this.materials);
        });
      }
    });
  }
  fillProjects(){
    this.s.getProjects().subscribe(res => {
      this.projects = _.sortBy(res, x=> x);
    });
  }
  fillComplects(){
    this.materialManagerService.getMaterialComplects(this.project).subscribe(res => {
      console.log(res);
      this.complects = _.sortBy(res, x => x.drawingId);
    });
  }

  projectChanged() {
    this.router.navigate([], {queryParams: {project: this.project}});
  }

  save() {
    let cMaterials = this.selectedMaterials.map(x => Object({material: x, count: x.count}));
    this.selectedComplect.materials = cMaterials;
    this.materialManagerService.updateMaterialComplect(this.selectedComplect).subscribe(res => {
      alert('Изменения сохранены');
      this.fillComplects();
    });
  }

  selectComplect(compl: any) {
    this.selectedComplect = compl;
    this.selectedComplect.materials.forEach((cMaterial: any) => {
      let find = this.materials.find(x => x.code == cMaterial.material.code);
      if (find != null){
        find.count = cMaterial.count;
      }
      else{
        find.count = null;
      }
    });
    this.selectedMaterials = this.materials.filter((x: any) => x.count > 0);
    this.materials = _.sortBy(this.materials, x => x.count > 0 ? '0' + x.name : '1' + x.name);
  }

  addComplect() {
    this.d.open(AddMaterialComplectComponent, {
      showHeader: false,
      modal: true,
      data: [this.project]
    }).onClose.subscribe(event => {
      if (event == 'success'){
        this.fillComplects();
      }
    });
  }

  deleteComplect(compl: any) {
    if (confirm('Вы подтверждаете удаление комплекта "' + compl.name + '"?')){
      this.materialManagerService.deleteMaterialComplect(compl.id).subscribe(res => {
        this.selectedComplect = null;
        this.fillComplects();
      });
    }
  }

  getComplectLength(compl: any) {
    if (compl.materials.length > 0){
      return '(' + compl.materials.length + ' шт.)';
    }
    else{
      return '';
    }
  }
}
