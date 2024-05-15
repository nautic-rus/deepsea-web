import { Component, OnInit } from '@angular/core';
import {Material} from "../../../../domain/classes/material";
import {LanguageService} from "../../../../domain/language.service";
import {MaterialManagerService} from "../../../../domain/material-manager.service";
import {MessageService} from "primeng/api";
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {AuthManagerService} from "../../../../domain/auth-manager.service";
import {MaterialNode} from "../../../../domain/classes/material-node";
import {AddMaterialComponent} from "../../../materials/add-material/add-material.component";
import {RemoveConfirmationComponent} from "../../../materials/remove-confirmation/remove-confirmation.component";
import {ContextMenu} from "primeng/contextmenu";
import * as XLSX from "xlsx";
import {SpecManagerService} from "../../../../domain/spec-manager.service";
import {LV} from "../../../../domain/classes/lv";
import _ from "underscore";
import {IssueManagerService} from "../../../../domain/issue-manager.service";
import {SpecMaterial} from "../../../../domain/classes/spec-material";

@Component({
  selector: 'app-add-material-to-esp',
  templateUrl: './add-material-to-esp.component.html',
  styleUrls: ['./add-material-to-esp.component.css']
})
export class AddMaterialToEspComponent implements OnInit {

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
  unitsAvailable = [
    new LV('796 - штуки', '796'),
    new LV('006 - метры', '006'),
    new LV('055 - кв.м.', '055'),
    new LV('166 - кг', '166'),
    new LV('112 - литр', '122'),
    new LV('113 - куб.м.', '113'),
  ];
  items = [
    {
      label: 'New Folder',
      icon: 'pi pi-fw pi-plus',
      command: (event: any) => this.createNode(event.item)
    },
  ];
  addNew = false;
  newNode: any = {};
  docNumber: string = '';
  forLabel = '';
  kind = '';
  issueId = 0;
  materialsFilled = false;
  specStatements: any[] = [];

  constructor(public issues: IssueManagerService, public t: LanguageService, public s: SpecManagerService, private materialManager: MaterialManagerService, private messageService: MessageService, public ref: DynamicDialogRef, public dialog: DynamicDialogConfig, public auth: AuthManagerService) { }

  ngOnInit(): void {
    this.selectedMaterial.name = '';
    this.docNumber = this.dialog.data[0];
    this.project = this.docNumber.split('-')[0];
    this.forLabel = this.dialog.data[2];
    this.label = this.dialog.data[1] + '.#';
    if (this.label == '-.#'){
      this.label = '1000';
    }
    if (this.forLabel == 'NEW'){
      this.forLabel = '';
      this.label = this.dialog.data[1];
    }
    else{
      this.kind = this.dialog.data[2];
      this.issueId = this.dialog.data[3];
    }
    this.zone = this.dialog.data[3];
    this.fill();
  }
  fill(){
    this.issues.getSpecProjects().subscribe(projects => {
      this.materialManager.getSpecStatements().subscribe(specStatements => {
        console.log(this.specStatements);
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
      this.materialsSrc = resMaterials.filter((x: any) => projectStatements.includes(x.statem_id));
      this.materialManager.getSpecDirectories().subscribe(specDirectories => {
        console.log(specDirectories);
        console.log(this.project);
        this.nodesSrc = specDirectories.filter((x: any) => x.project_id == this.projectId || x.project_id == 0);
        this.nodes = _.sortBy(this.getNodes(this.nodesSrc, this.materials, 0), x => x.label);
        this.materialsFilled = true;
      });
    });
  }

  createNode(node: any){
    this.addNew = true;
    this.newNode = {};
    this.newNode.data = node.data + '###';
    this.newNode.label = node.label;
    this.newNode.check = node.data;
    this.newNode.checkChildren = node.children.map((x: any) => x.data);

    console.log(this.newNode);
  }
  getNodes(rootNodes: any[], materials: any[], parent_id: number = 0){
    let res: any[] = [];
    rootNodes.filter(x => x.parent_id == parent_id).forEach(n => {
      let nodes = this.getNodes(rootNodes, materials, n.id);
      let nodeMaterials = materials.filter(x => x != null && x.dir_id == n.id);
      nodes.forEach(n => {
        n.materials.forEach((m: any) => nodeMaterials.push(m));
      });
      let count = nodeMaterials.length;
      res.push({
        data: n.id,
        children: _.sortBy(nodes, x => x.label),
        label: n.name + (n.project_id == 0 ? '' : (' (' + this.getProjectName(n.project_id)) + ')'),
        materials: nodeMaterials,
        count: count,
        project: n.project_id
      });
    });
    return res;
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
  setParents(nodes: any[], parent: any){
    nodes.forEach(node => {
      node.parent = parent;
      node.expandedIcon = 'pi pi-folder-open';
      node.collapsedIcon = 'pi pi-folder';
      node.icon = (node.children.length == 0) ? 'pi pi-tag' : '';
      this.setParents(node.children, node);
    });
  }
  getNodePath(node: any){
    let parent = node.parent;
    let res = node.label;
    while (parent != null){
      res = parent.label + "/" + res;
      parent = parent.parent;
    }
    return res;
  }
  showTooltip(index: string) {
    return this.tooltips.includes(index);
  }
  addMaterial() {
    if (this.kind == 'ele' || this.kind == 'hull'){
      if (this.label.includes('#')){
        alert('Вы не указали номер позиции');
        return;
      }
      else{
        this.s.addIssueMaterial(this.label, this.units, this.selectedMaterial.singleWeight, this.count, this.selectedMaterial.code, this.auth.getUser().id, this.docNumber, this.issueId, this.addText, this.kind, this.zone).subscribe(res => {
          this.ref.close('success');
        });
      }
    }
    else{
      console.log(this.label);
      if (this.label.toString().includes('#')){
        this.messageService.add({key:'device', severity:'error', summary:'Ошибка', detail:'Необходимо ввести номер позиции'});
        return;
      }
      this.s.addDeviceToSystem(this.docNumber, this.selectedMaterial.code, this.units, this.count.toString(), this.label, this.forLabel, this.addText, this.zone).then(res => {
        this.ref.close('success');
      });
    }

    // console.log(this.docNumber, this.selectedMaterial.code, this.units, this.count.toString(), this.label, this.forLabel)
  }

  selectNode() {
    if (this.selectedNode != null){
      this.selectedNodePath = this.getNodePath(this.selectedNode);
      //this.selectedNodeCode = this.getNodeCode(this.selectedNode);
      this.selectedNodeCode = this.selectedNode.data;
      this.materials = this.selectedNode.materials;
    }
  }

  selectMaterial(material: any) {
    this.selectedMaterial = material;
  }

  refreshNodes(rootNodes: any[], materials: Material[], parent: string = ''){
    rootNodes.filter(x => x.data.length == parent.length + 3 && x.data.startsWith(parent)).forEach(n => {
      n.count = materials.filter(x => x.code.startsWith(n.data)).length;
      this.refreshNodes(n.children, materials, n.data);
    });
  }


  copyTrmCode(code: string, index: string) {
    navigator.clipboard.writeText(code);
    this.tooltips.push(index);
    setTimeout(() => {
      this.tooltips.splice(this.tooltips.indexOf(index), 1);
    }, 1500);
    //this.messageService.add({key:'task', severity:'success', summary:'Copied', detail:'You have copied issue url.'});
  }


  alertNodeContains(){
    this.messageService.add({key:'task', severity:'error', summary:'Folder is not empty', detail:'Cant delete non empty folder'});
  }

  exportXLS() {
    let fileName = 'export_' + this.generateId(8) + '.xlsx';
    let data: any[] = this.materials;
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = {Sheets: {'data': worksheet}, SheetNames: ['data']};
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

  close() {
    this.ref.close();
  }
}
