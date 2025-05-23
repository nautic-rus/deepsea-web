import { Component, OnInit } from '@angular/core';
import {Material} from "../../../../domain/classes/material";
import {LV} from "../../../../domain/classes/lv";
import {LanguageService} from "../../../../domain/language.service";
import {SpecManagerService} from "../../../../domain/spec-manager.service";
import {MaterialManagerService} from "../../../../domain/material-manager.service";
import {MessageService} from "primeng/api";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {AuthManagerService} from "../../../../domain/auth-manager.service";
import {MaterialNode} from "../../../../domain/classes/material-node";
import {ContextMenu} from "primeng/contextmenu";
import * as XLSX from "xlsx";
import _ from "underscore";
import {Issue} from "../../../../domain/classes/issue";

@Component({
  selector: 'app-add-group-device',
  templateUrl: './add-group-device.component.html',
  styleUrls: ['./add-group-device.component.css']
})
export class AddGroupDeviceComponent implements OnInit {


  search: string = '';
  nodes: any = [];
  layers: any = [];
  materials: any [] = [];
  materialsSrc: any [] = [];
  selectedNode: any;
  selectedNodePath = '';
  selectedNodeCode = '';
  tooltips: string[] = [];
  projects: string[] = ['200101', '210101'];
  project = '';
  selectedMaterial: any;
  label: string = '';
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
  devices: any[] = [];
  useZone = false;
  issue: Issue;
  foranProject = '';
  revEsp = '';

  constructor(public t: LanguageService, public s: SpecManagerService, private materialManager: MaterialManagerService, private messageService: MessageService, public ref: DynamicDialogRef, public dialog: DynamicDialogConfig, public auth: AuthManagerService) { }

  ngOnInit(): void {
    // this.selectedMaterial.name = '';
    this.docNumber = this.dialog.data[0];
    this.project = this.docNumber.split('-')[0];
    this.devices = this.dialog.data[1];
    this.issue = this.dialog.data[2];
    this.foranProject = this.dialog.data[3];
    this.revEsp = this.dialog.data[4];
    let materials: any[] = [];
    _.forEach(_.groupBy(this.devices.map(x => Object({m: x.material, zone: x.zone})), x => x.m.code + x.zone), group => {
      materials.push(group[0]);
    });
    this.materials = _.sortBy(materials, x => x.m.code + x.zone);
    this.materialsSrc = materials;
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
  getNodes(rootNodes: MaterialNode[], materials: Material[], parent: string = ''){
    let res: any[] = [];
    rootNodes.filter(x => x.data.length == parent.length + 3 && x.data.startsWith(parent)).forEach(n => {
      res.push({
        data: n.data,
        children: this.getNodes(rootNodes, materials, n.data),
        label: n.label,
        count: materials.filter(x => x.code.startsWith(n.data)).length
      });
    });
    return res;
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
    this.s.addGroupToSystem(this.docNumber, this.selectedMaterial.m.code + '|' + (this.useZone ? this.selectedMaterial.zone : ''), this.label).then(res => {
      this.s.createDeviceEsp(this.foranProject, this.docNumber, this.revEsp, this.auth.getUser().login, 'device', this.issue.id).subscribe(res => {
        this.ref.close('success');
      });
    });
  }

  selectNode() {
    if (this.selectedNode != null){
      this.selectedNodePath = this.getNodePath(this.selectedNode);
      //this.selectedNodeCode = this.getNodeCode(this.selectedNode);
      this.selectedNodeCode = this.selectedNode.data;
      this.materials = this.materialsSrc.filter(x => x.code.startsWith(this.selectedNodeCode));
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

  contextMenu(event: any, contextMenu: ContextMenu) {
    if (event.node.data.length >= 12){
      this.items = [
        this.materials.filter(x => x.code.startsWith(event.node.data)).length > 0 ? {
          label: 'Remove',
          icon: 'pi pi-fw pi-trash',
          command: () => this.alertNodeContains()
        } : {
          label: 'Remove',
          icon: 'pi pi-fw pi-trash',
          command: () => this.removeNode(event.node)
        }
      ];
    }
    this.items = [
      {
        label: 'New Folder',
        icon: 'pi pi-fw pi-plus',
        command: () => this.createNode(event.node)
      },
      this.materials.filter(x => x.code.startsWith(event.node.data)).length > 0 ? {
        label: 'Remove',
        icon: 'pi pi-fw pi-trash',
        command: (event: any) => this.alertNodeContains()
      } : {
        label: 'Remove',
        icon: 'pi pi-fw pi-trash',
        command: () => this.removeNode(event.node)
      }
    ];
  }
  copyTrmCode(code: string, index: string) {
    navigator.clipboard.writeText(code);
    this.tooltips.push(index);
    setTimeout(() => {
      this.tooltips.splice(this.tooltips.indexOf(index), 1);
    }, 1500);
    //this.messageService.add({key:'task', severity:'success', summary:'Copied', detail:'You have copied issue url.'});
  }

  removeNode(node: any) {
    this.materialManager.updateMaterialNode(this.project, node.data, node.label, this.auth.getUser().login, 1).then(resStatus => {
      this.materialManager.getMaterialNodes(this.project).then(res => {
        this.nodes = this.getNodes(res, this.materialsSrc, '');
        this.setParents(this.nodes, '');
      });
    });
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
