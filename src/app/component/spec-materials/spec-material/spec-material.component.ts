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

  wasChanged: boolean = false;
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
  supplies: any[] = [];
  supply: any;
  supMatRelations: any[] [];
  supMatRelationsId = 0;
  selectedSuplierId = 0;


  constructor(public t: LanguageService, public eqManager: EquipmentsService,  public dialog: DynamicDialogConfig, public materialManager: MaterialManagerService, public auth: AuthManagerService, public ref: DynamicDialogRef, public messageService: MessageService) {
    this.project = dialog.data[0];
    this.material = JSON.parse(JSON.stringify(dialog.data[1]));
    this.action = dialog.data[2];
    this.selectedSpecDirectoryId = dialog.data[3];
    this.selectedSuplierId = dialog.data[4];
    // console.log(this.selectedSuplierId);
    // console.log("принимаю поставшика с таким айди this.selectedSuplierId")

    this.materialManager.getSpecDirectories().subscribe(specDirectories => {
      let nodesSrc = specDirectories.filter((x: any) => x.project_id == this.project || x.project_id == 0);
      this.specDirectories = _.sortBy(this.getDirNodes(nodesSrc), x => x.label);
    });


    if ((this.action == 'add' || this.action == 'clone')){
      this.material.code = 'NRxxxxxxxxxxxxxx'
    }
    this.eqManager.getEquipments().subscribe(eq => {
      eq.forEach(e => {
        e.suppliers?.forEach(s => {
          this.supplies.push({
            id: e.id,
            sfi: e.sfi,
            name: e.name,
            manufacturer: s.name,
            supplier_id: s.id
          });
          if (this.selectedSuplierId == this.supplies[this.supplies.length - 1].supplier_id){
            this.supply = this.supplies[this.supplies.length - 1];
          }
        });
      });
      // console.log("this.selectedSuplierId, this.supplies");
      // console.log(this.selectedSuplierId, this.supplies);
      this.materialManager.getSupMatRelations().subscribe(res => {
        this.supMatRelations = res;
        let find: any = this.supMatRelations.find((x: any) => x.materials_id == this.material.id);
        if (find != null){
          this.supply = this.supplies.find(x => x.supplier_id == find.supplier_id);
          this.supMatRelationsId = find.id;
        }
      });
    });

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
      this.selectStatement(statements.flatMap(x => x.children), id);
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
      // console.log("уже в создания this.supply.supplier_id");
      // console.log(this.supply.supplier_id);
      if (this.supply != null){
        this.materialManager.addSupMatRelations({
          id: this.supMatRelationsId,
          supplier_id: this.supply.supplier_id,
          materials_id: res === 0 ? this.material.id : res
          // materials_id: this.material.id
        }).subscribe((res) => {
          // console.log("addSupMatRelations");
          // console.log(res);
        });
      }
      this.ref.close({material: this.material, newId: res});
      // console.log("id new material");
      // console.log(res);
    });
    this.wasChanged = true;
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



  // close() {
  //
  //   return 'close edit material';
  // }

}
