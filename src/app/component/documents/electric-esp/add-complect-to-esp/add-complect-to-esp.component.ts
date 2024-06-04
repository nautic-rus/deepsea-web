import { Component, OnInit } from '@angular/core';
import {Material} from "../../../../domain/classes/material";
import {LV} from "../../../../domain/classes/lv";
import {IssueManagerService} from "../../../../domain/issue-manager.service";
import {LanguageService} from "../../../../domain/language.service";
import {SpecManagerService} from "../../../../domain/spec-manager.service";
import {MaterialManagerService} from "../../../../domain/material-manager.service";
import {MessageService} from "primeng/api";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {AuthManagerService} from "../../../../domain/auth-manager.service";
import _ from "underscore";
import * as XLSX from "xlsx";
import {Observable, of, zip} from "rxjs";
import {map} from "rxjs/operators";

@Component({
  selector: 'app-add-complect-to-esp',
  templateUrl: './add-complect-to-esp.component.html',
  styleUrls: ['./add-complect-to-esp.component.css']
})
export class AddComplectToEspComponent implements OnInit {


  search: string = '';
  nodes: any = [];
  nodesSrc: any[] = [];
  layers: any = [];
  materials: any [] = [];
  materialsSrc: any [] = [];
  selectedNode: any;
  selectedNodePath = '';
  selectedNodeCode = '';
  tooltips: string[] = [];
  projects: any[] = [];
  project = '';
  projectId = 0;
  selectedMaterial: Material = new Material();
  units: string = "796";
  count: number = 1;
  label: string = '';
  addText: string = '';
  zone: string = '';
  addNew = false;
  newNode: any = {};
  docNumber: string = '';
  forLabel = '';
  kind = '';
  issueId = 0;
  materialsFilled = false;
  specStatements: any[] = [];
  complects: any[] = [];
  selectedComplects: any[] = [];
  complectMaterials: any[] = [];

  constructor(public issues: IssueManagerService, public t: LanguageService, public s: SpecManagerService, private materialManager: MaterialManagerService, private messageService: MessageService, public ref: DynamicDialogRef, public dialog: DynamicDialogConfig, public auth: AuthManagerService) { }

  ngOnInit(): void {
    this.selectedMaterial.name = '';
    this.docNumber = this.dialog.data[0];
    this.project = this.docNumber.split('-')[0];
    this.label = this.dialog.data[1];
    this.count = this.dialog.data[2];
    this.kind = this.dialog.data[3];
    this.issueId = this.dialog.data[4];
    this.fill();
  }
  fill(){
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
      this.materialManager.getMaterialComplects(this.projectId).subscribe(complects => {
        console.log(complects, this.materials);
        complects.forEach(x => x.count = 0);
        this.complects = complects;
        this.materialsFilled = true;
      });
    });
  }


  getProjectName(id: number){
    let project = this.projects.find(x => x.id == id);
    if (project != null){
      return project.name;
    }
    else{
      return '';
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

  close() {
    this.ref.close();
  }

  amountChanged() {
    let count = this.count;
    setTimeout(() => {
      let complectMaterials: any[] = [];
      this.complectMaterials = [];
      this.complects.forEach(c => {
        if (c.count < 0){
          c.count = 0;
        }
      });

      this.complects.filter(x => x.count > 0).forEach(c => {
        c.materials.forEach((m: any) => {
          let findMaterial = this.materials.find(x => x.code == m.material);
          if (findMaterial != null){
            let findInComplect = complectMaterials.find(x => x.stock == findMaterial.code);
            if (findInComplect != null){
              findInComplect.count = findInComplect.count + m.count * c.count;
            }
            else {
              complectMaterials.push({
                name: findMaterial.name,
                code: findMaterial.code,
                units: findMaterial.units,
                count: m.count * c.count,
                label: this.label + '.' + count++,
                weight: findMaterial.weight
              });
            }
            console.log(complectMaterials);
          }
        });
      });
      this.complectMaterials = complectMaterials;
    }, 100);
  }

  commit() {
    let update: Observable<any>[] = this.complectMaterials.map(m => this.s.addIssueMaterial(m.label, m.units, m.weight, m.count, m.code, this.auth.getUser().id, this.docNumber, this.issueId, this.addText, this.kind, this.zone));
    zip(...update).subscribe(res => {
      this.ref.close('success');
    });
  }
}
