import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {SpecManagerService} from "../../../domain/spec-manager.service";
import {DialogService} from "primeng/dynamicdialog";
import _ from "underscore";
import {AddComplectComponent} from "../complect-manager/add-complect/add-complect.component";
import {MaterialManagerService} from "../../../domain/material-manager.service";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {AddMaterialComplectComponent} from "./add-material-complect/add-material-complect.component";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {LanguageService} from "../../../domain/language.service";

@Component({
  selector: 'app-material-complect-manager',
  templateUrl: './material-complect-manager.component.html',
  styleUrls: ['./material-complect-manager.component.css']
})
export class MaterialComplectManagerComponent implements OnInit {

  project = 'N002';
  complects: any[] = [];
  projects: any[] = [];
  selectedComplect: any;
  systems: any[] = [];
  selectedSystems: any[] = [];
  zones: any[] = [];
  selectedZones: any[] = [];
  materials: any[] = [];
  selectedMaterials: any[] = [];
  specStatements: any[] = [];
  projectId = 0;

  constructor(public route: ActivatedRoute, public router: Router, public s: SpecManagerService, public d: DialogService, public materialManager: MaterialManagerService, public issues: IssueManagerService, public auth: AuthManagerService, public t: LanguageService) { }

  ngOnInit(): void {
    this.fillMaterials();
  }

  fillMaterials(){
    this.issues.getSpecProjects().subscribe(projects => {
      this.materialManager.getSpecStatements().subscribe(specStatements => {
        this.specStatements = specStatements;
        this.projects = projects.filter(x => specStatements.find((y: any) => y.project_id == x.id) != null);
        if (this.projects.length > 0){
          this.projectId = this.projects[0].id;
        }
        this.projectChanged();
      });
    });
  }
  projectChanged() {
    this.materialManager.getSpecMaterials().subscribe(resMaterials => {
      resMaterials.forEach((m: any) => m.materialCloudDirectory = '');
      resMaterials.forEach((m: any) => m.path = []);
      let projectStatements = this.specStatements.filter(x => x.project_id == this.projectId).map(x => x.id);
      this.materials = resMaterials.filter((x: any) => projectStatements.includes(x.statem_id));
      this.fillComplects();
    });
  }
  fillComplects(){
    this.materialManager.getMaterialComplects(this.projectId).subscribe(res => {
      this.complects = _.sortBy(res, x => x.drawingId);
      console.log(res);
    });
  }

  save() {
    let cMaterials = this.selectedMaterials.map(x => Object({material: x.code, count: x.count}));
    this.selectedComplect.materials = cMaterials;
    this.materialManager.updateMaterialComplect(this.selectedComplect).subscribe(res => {
      alert('Изменения сохранены');
      this.fillComplects();
    });
  }

  selectComplect(compl: any) {
    if (this.selectedComplect == compl){
      this.selectedComplect = null;
    }
    else{
      this.selectedComplect = compl;
    }
    this.materials.forEach(m => m.count = null);
    if (this.selectedComplect != null){
      this.selectedComplect.materials.forEach((cMaterial: any) => {
        let find = this.materials.find(x => x.code == cMaterial.material);
        if (find != null){
          find.count = cMaterial.count;
        }
      });
    }
    this.selectedMaterials = this.materials.filter((x: any) => x.count > 0);
    this.materials = _.sortBy(this.materials, x => x.count > 0 ? '0' + x.name : '1' + x.name);
  }

  addComplect() {
    this.d.open(AddMaterialComplectComponent, {
      showHeader: false,
      modal: true,
      data: [this.projectId, 'elec']
    }).onClose.subscribe(event => {
      if (event == 'success'){
        this.fillComplects();
      }
    });
  }

  deleteComplect(compl: any) {
    if (confirm('Вы подтверждаете удаление комплекта "' + compl.name + '"?')){
      this.materialManager.deleteMaterialComplect(compl.id).subscribe(res => {
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
