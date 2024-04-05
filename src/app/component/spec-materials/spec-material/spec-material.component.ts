import { Component, OnInit } from '@angular/core';
import {LV} from "../../../domain/classes/lv";
import {Material} from "../../../domain/classes/material";
import {MaterialTranslation} from "../../../domain/interfaces/material-translation";
import {LanguageService} from "../../../domain/language.service";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {MaterialManagerService} from "../../../domain/material-manager.service";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {MessageService} from "primeng/api";
import {SpecMaterial} from "../../../domain/classes/spec-material";
import {EquipmentsService} from "../../../domain/equipments.service";
import {MaterialNode} from "../../../domain/classes/material-node";
import _ from "underscore";

@Component({
  selector: 'app-spec-material',
  templateUrl: './spec-material.component.html',
  styleUrls: ['./spec-material.component.css']
})
export class SpecMaterialComponent implements OnInit {

  projects: string[] = [];
  project = '';
  categories = ['00002', '13112', '14109', '14122', '13124', '19127', '09003', '09004', '30000', '30005', '15107', '17108', '16101', '18123', '12116' ];
  units = [
    new LV('796 - штуки', '796'),
    new LV('006 - метры', '006'),
    new LV('055 - кв.м.', '055'),
    new LV('166 - кг', '166'),
    new LV('112 - литр', '112'),
    new LV('113 - куб.м.', '113'),
  ];
  category = this.categories[0];
  material: SpecMaterial = new SpecMaterial();
  action = '';
  materials: SpecMaterial[] = [];
  codeSelectors: any[] = [];
  noneCode = {
    data: 'NON',
    label: 'No specified type',
  };
  materialTranslationRu: MaterialTranslation = {lang: 'ru', name: '', description: ''};
  suppliers: any[] = [];
  statements: any[] = [];
  statementNodes: any[] = [];
  selectedStatementNode: any;
  specDirectories: any[] = [];
  selectedSpecDirectory: any;
  selectedSpecDirectoryId: any;

  constructor(public t: LanguageService, public eqManager: EquipmentsService, public dialog: DynamicDialogConfig, public materialManager: MaterialManagerService, public auth: AuthManagerService, public ref: DynamicDialogRef, public messageService: MessageService) {
    this.project = dialog.data[0];
    this.material = JSON.parse(JSON.stringify(dialog.data[1]));
    this.action = dialog.data[2];
    this.materials = dialog.data[3];
    this.selectedSpecDirectoryId = dialog.data[4];
    this.specDirectories = _.sortBy(this.getDirNodes(dialog.data[5]), x => x.label);

    if ((this.action == 'add' || this.action == 'clone')){
      this.material.code = 'NRxxxxxxxxxxxxxx'
    }

    this.materialManager.getSpecStatements().subscribe(stmts => {
      this.statements = stmts.filter((x: any) => x.project_id == this.project);
      this.statementNodes = _.sortBy(this.getNodes(this.statements, 0), x => this.sortDot(x.index));

      if (this.action == 'clone' || this.action == 'edit'){
        this.selectStatement(this.statementNodes, this.material.statem_id);
        this.selectDirectory(this.specDirectories, this.material.dir_id);
      }
    });
  }

  selectDirectory(directories: any[], id: number){
    let find = directories.find(x => x.data == id);
    if (find != null){
      this.selectedSpecDirectory = find;
    }
    else{
      this.selectDirectory(directories.flatMap(x => x.children), id);
    }
  }
  selectStatement(statements: any[], id: number){
    let find = statements.find(x => x.data == id);
    if (find != null){
      this.selectedStatementNode = find;
    }
    else{
      this.selectDirectory(statements.flatMap(x => x.children), id);
    }
  }
  getDirNodes(rootNodes: any[], parent_id: number = 0){
    let res: any[] = [];
    rootNodes.filter(x => x.parent_id == parent_id).forEach(n => {
      let nodes = this.getDirNodes(rootNodes, n.id);
      res.push({
        data: n.id,
        children: _.sortBy(nodes, x => x.label),
        label: n.name,
      });
      if (n.id == this.selectedSpecDirectoryId){
        this.selectedSpecDirectory = res[res.length - 1];
      }
    });
    return res;
  }
  ngOnInit(): void {

  }
  sortDot(input: string, numDots = 3, length = 5){
    let res = '';
    let split = input.split('.');
    for (let d = 0; d < numDots; d++){
      if (split.length > d){
        res += this.alz(split[d], length);
      }
    }
    return res;
  }
  alz(input: string, length = 5){
    let res = input;
    while (res.length < length){
      res = '0' + res;
    }
    return res;
  }
  getNodes(rootNodes: any[], parent_id = 0){
    let res: any[] = [];
    rootNodes.filter(x => x.parent_id == parent_id).forEach(n => {
      res.push({
        data: n.id,
        children: _.sortBy(this.getNodes(rootNodes, n.id), x => this.sortDot(x.index)),
        label: this.getNodeLabel(n.code, n.name),
        index: n.code
      });
    });
    return res;
  }
  getNodeLabel(code: string, name: string){
    let res = name;
    if (code != '-' && code != ''){
      res = code + ' - ' + name;
    }
    return res;
  }

  createMaterial() {
    this.material.statem_id = this.selectedStatementNode.data;
    this.material.dir_id = this.selectedSpecDirectory.data;
    this.material.user_id = this.auth.getUser().id;
    this.materialManager.updateSpecMaterial(this.material).subscribe(res => {
      this.ref.close(this.material);
    });
  }


  getLabel(action: string) {
    return action.replace('add', 'Create').replace('edit', 'Update').replace('clone', 'Clone');
  }

  unitsChanged() {
    if (this.material.units == '166'){
      this.material.weight = 1;
    }
  }

  getUnitsText() {
    switch (this.material.units) {
      case '796': return 'Вес кг. 1 штуки:';
      case '006': return 'Вес кг. 1 метра:';
      case '055': return 'Вес кг. 1 кв. м.:';
      case '166': return '';
      case '112': return 'Вес кг. 1 литра:';
      case '113': return 'Вес кг. 1 куб. м.:';
      default: return this.material.units;
    }
  }
}
