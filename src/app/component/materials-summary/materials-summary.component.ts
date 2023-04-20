import {Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {Material} from "../../domain/classes/material";
import {Table} from "primeng/table";
import {LanguageService} from "../../domain/language.service";
import {MaterialManagerService} from "../../domain/material-manager.service";
import {MessageService} from "primeng/api";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {MaterialNode} from "../../domain/classes/material-node";
import _ from "underscore";
import {AddMaterialComponent} from "../materials/add-material/add-material.component";
import {RemoveConfirmationComponent} from "../materials/remove-confirmation/remove-confirmation.component";
import {ContextMenu} from "primeng/contextmenu";
import * as XLSX from "xlsx";
import {IssueManagerService} from "../../domain/issue-manager.service";
import {AddMaterialStockComponent} from "./add-material-stock/add-material-stock.component";
import {PartsQtyComponent} from "../billing/parts-qty/parts-qty.component";
import {DrawingShowComponent} from "./drawing-show/drawing-show.component";

@Component({
  selector: 'app-materials-summary',
  templateUrl: './materials-summary.component.html',
  styleUrls: ['./materials-summary.component.css']
})
export class MaterialsSummaryComponent implements OnInit {

  search: string = '';
  nodes: any = [];
  nodesSrc: any = [];
  layers: any = [];
  materials: any [] = [];
  materialsSrc: any [] = [];
  selectedNode: any;
  selectedNodePath = '';
  selectedNodeCode = '';
  tooltips: string[] = [];
  projects: any[] = [];
  project: any;
  selectedMaterial: Material = new Material();
  items = [
    {
      label: 'New Folder',
      icon: 'pi pi-fw pi-plus',
      command: (event: any) => this.createNode(event.item)
    },
  ];
  addNew = false;
  newNode: any = {};
  newNodeSuffix = '';
  selectedView: string = '';
  // @ts-ignore
  @ViewChild('table') table: Table;
  noResult = false;
  materialsFilled = false;
  materialsSummarySrc: any[] = [];
  materialsSummary: any[] = [];
  materialPurchases: any[] = [];
  public innerWidth: any;
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.innerWidth = window.innerWidth;
  }

  constructor(public ref: DynamicDialogRef, public issueManager: IssueManagerService, public t: LanguageService, private materialManager: MaterialManagerService, private messageService: MessageService, private dialogService: DialogService, public auth: AuthManagerService) { }

  ngOnInit(): void {
    this.project = '';
    this.issueManager.getIssueProjects().then(res => {
      this.projects = res;
    });
    this.innerWidth = window.innerWidth;
    setTimeout(() => {
      this.selectedView = 'list';
    }, 1000);
    //this.projects = this.projects.filter(x => this.auth.getUser().visible_projects.includes(x));
    this.project = '';
    this.materialManager.getMaterials(this.project).then(res => {
      res.forEach(m => m.materialCloudDirectory = '');
      this.materials = res;
      this.materialsSrc = res;
      this.materialManager.getMaterialNodes(this.project).then(res => {
        this.nodesSrc = res;
        if (this.project == '000000'){
          this.nodes = this.getNodes2(res, this.materialsSrc, '');
          this.setParents(this.nodes, '');
          this.materials.filter(x => x != null).forEach((x: any) => {
            x.path = this.setPath(x.code, 2);
          });
        }
        else{
          this.nodes = this.getNodes(res, this.materialsSrc, '');
          this.setParents(this.nodes, '');
          this.materials.filter(x => x != null).forEach((x: any) => {
            x.path = this.setPath(x.code);
          });
        }
      });
      this.materialsSrc = [...this.materials];
      for (let x = 0; x < 10; x ++){
        this.materials.push(null);
      }
      this.materialsFilled = true;
    });
  }
  setPath(code: string, length = 3){
    let count = 1;
    let path = '';
    let root = code.substr(0, length * count);
    let findNode = this.nodesSrc.find((x: any) => x.data == root);
    while (findNode != null){
      path = path + '/' + findNode.label;
      count += 1;
      findNode = this.nodesSrc.find((x: any) => x.data == code.substr(0, length * count));
    }
    return path.split('/').filter(x => x != '');
  }
  searchChange() {
    if (this.selectedView == 'tiles'){
      this.materialsSummary = this.materialsSummarySrc.filter(x => {
        let notNull = x != null;
        let findInName = ((x.name.toLowerCase() + x.desc.toLowerCase() + x.code.toLowerCase())).includes(this.search.toLowerCase().trim());
        let findInTranslate = false;
        if (x.translations != null){
          x.translations.forEach((y: any) => {
            if ((y.name.toLowerCase() + y.desc.toLowerCase()).includes(this.search.toLowerCase().trim())){
              findInTranslate = true;
            }
          });
        }
        return notNull && (findInName || findInTranslate);
      });
      console.log(this.materialsSummary);
      for (let x = 0; x < 10; x ++){
        this.materialsSummary.push(null);
      }
    }
    else{
      this.materialsSummary = this.materialsSummarySrc.filter(x => {
        let notNull = x != null;
        let findInName = ((x.name.toLowerCase() + x.desc.toLowerCase() + x.code.toLowerCase())).includes(this.search.toLowerCase().trim());
        let findInTranslate = false;
        if (x.translations != null){
          x.translations.forEach((y: any) => {
            if ((y.name.toLowerCase() + y.desc.toLowerCase()).includes(this.search.toLowerCase().trim())){
              findInTranslate = true;
            }
          });
        }
        return notNull && (findInName || findInTranslate);
      });
      console.log(this.materialsSummary);
    }
  }

  createNode(node: any){
    if (this.project == '000000'){
      this.addNew = true;
      this.newNode = {};
      this.newNodeSuffix = '##';
      this.newNode.data = node.data;
      this.newNode.label = '';
      // this.newNode.label = node.label;
      this.newNode.checkChildren = node.children.map((x: any) => x.data);
    }
    else{
      this.addNew = true;
      this.newNode = {};
      this.newNodeSuffix = '###';
      this.newNode.data = node.data;
      this.newNode.label = '';
      // this.newNode.label = node.label;
      this.newNode.checkChildren = node.children.map((x: any) => x.data);
    }
    console.log(this.newNode);
  }
  getNodes2(rootNodes: MaterialNode[], materials: Material[], parent: string = ''){
    let res: any[] = [];
    rootNodes.filter(x => x.data.length == parent.length + 2 && x.data.startsWith(parent)).forEach(n => {
      res.push({
        data: n.data,
        children: _.sortBy(this.getNodes2(rootNodes, materials, n.data), x => x.label),
        label: n.label,
        count: materials.filter(x => x.code.startsWith(n.data)).length
      });
    });
    return res;
  }
  getNodes(rootNodes: MaterialNode[], materials: Material[], parent: string = ''){
    let res: any[] = [];
    rootNodes.filter(x => x.data.length == parent.length + 3 && x.data.startsWith(parent)).forEach(n => {
      res.push({
        data: n.data,
        children: this.getNodes(rootNodes, materials, n.data),
        label: n.label + ' (' + n.data.substr(parent.length) + ')',
        count: this.materialsSummarySrc.filter(x => x.code.startsWith(n.data)).length
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
  selectNode() {
    if (this.selectedNode != null){
      this.selectedNodePath = this.getNodePath(this.selectedNode);
      this.selectedNodeCode = this.selectedNode.data;
      this.materialsSummary = this.materialsSummarySrc.filter(x => x.code.startsWith(this.selectedNodeCode));
    }
  }
  selectMaterial(material: any) {
    this.selectedMaterial = material;
  }
  refreshNodes(rootNodes: any[], materials: Material[], parent: string = ''){
    rootNodes.filter(x => x.data.length == parent.length + 3 && x.data.startsWith(parent)).forEach(n => {
      n.count = this.materialsSummarySrc.filter(x => x.code.startsWith(n.data)).length;
      this.refreshNodes(n.children, materials, n.data);
    });
  }
  hide() {
    this.newNode = {};
    this.addNew = false;
  }
  exportXLS() {
    let fileName = 'export_' + this.generateId(8) + '.xlsx';
    let data: any[] = this.materialsSummary;
    console.log(data);
    data.forEach(d => {
      d.pathValue = d.path.join('/');
      d.drawingsList = _.uniq(d.documents.map((x: any) => x.docNumber)).join(', ');
    });
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
  trimFileName(input: string, length: number = 10): string{
    let split = input.split('.');
    let name = split[0];
    let extension = split[1];
    if (name.length > length){
      return name.substr(0, length - 2) + '..';
    }
    else{
      return input;
    }
  }
  selectPath(p: string, path: string[]) {
    let searchIn = this.nodes;
    path.forEach(x => {
      let node = searchIn.find((n: any) => n.label == x);
      if (node != null && p.includes(node.label)){
        this.selectedNode = node;
        node.partialSelected = true;
        node.expanded = true;
        this.selectNode();
        return;
      }
      if (node != null){
        searchIn = node.children;
      }
    });
  }
  createMaterialCloudDirectory(material: any){
    material.materialCloudDirectory = 'LOADING';
    this.materialManager.createMaterialCloudDirectory(this.project, material.code).then(res => {
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

  projectChanged() {
    this.materials.splice(0, this.materials.length);
    this.materialsSummary.splice(0, this.materialsSummary.length);
    this.nodes.splice(0, this.nodes.length);
    this.materialsFilled = false;
    this.materialManager.getMaterials(this.project.rkd).then(materialsValue => {
      materialsValue.forEach((m => m.materialCloudDirectory = ''));
      this.materials = materialsValue;
      this.materialsSrc = materialsValue;
      this.materialManager.getMaterialsSummary([this.project.foran], ['pipe']).then(materialsSummary => {
        this.materialsFilled = true;
        this.materialsSummarySrc = materialsSummary;
        this.materialsSummary = this.materialsSummarySrc;
        console.log(this.materialsSummary);
        this.materialManager.getMaterialNodes(this.project.rkd).then(materialNodes => {
          this.nodesSrc = materialNodes;
          this.nodes = this.getNodes(materialNodes, this.materialsSrc, '');
          this.setParents(this.nodes, '');
          this.materials.filter(x => x != null).forEach((x: any) => {
            x.path = this.setPath(x.code);
          });
          this.materialManager.getMaterialPurchases(this.project.foran).then(materialPurchases => {
            this.materialPurchases = materialPurchases;
            console.log(this.materialPurchases);
          });
          this.materialsSummary.forEach(x => x.path = this.setPath(x.code));
          //this.nodes = _.sortBy(this.nodes,x => x.data);
          // let sorted: any[] = [];
          // this.nodes.forEach((node: any) => {
          //   this.materialsSummary.filter(x => x.A1.startsWith(node.data)).forEach(x => sorted.push(x));
          // });
          // this.materialsSummary = sorted;
          this.materialsSummary = _.sortBy(this.materialsSummary, x => x.code);
        });
      });
    });
  }

  getMaterialName(material: any) {
    let res = material.name;
    if (this.t.language == 'ru'){
      if (material.translations.length > 0){
        res = material.translations[0].name;
      }
    }
    return res;
  }
  getMaterialDescription(material: any) {
    let res = material.description;
    if (this.t.language == 'ru'){
      if (material.translations.length > 0){
        res = material.translations[0].description;
      }
    }
    return res;
  }

  addStock(code: string, units: string) {
    this.dialogService.open(AddMaterialStockComponent, {
      showHeader: false,
      modal: true,
      data: [this.project.foran, code, units]
    }).onClose.subscribe(res => {
      if (res != 'exit'){
        console.log(res);
        this.materialPurchases.push(res);
      }
    });
  }
  getDate(dateLong: number): string {
    if (dateLong == 0) {
      return '--/--/----';
    }
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
  }
  chunkMaterials(chunkSize = 3){
    let res: any[] = [];
    for (let i = 0; i < this.materialsSummary.length; i += chunkSize) {
      const chunk = this.materialsSummary.slice(i, i + chunkSize);
      res.push(chunk);
    }
    return res;
  }
  getPurchasedCount(code: string) {
    let res = 0;
    this.materialPurchases.filter(x => x.code == code).forEach(x => res += x.qty);
    return res;
  }
  defineChunkSize() {
    let res = 2;
    if (this.innerWidth > 1600){
      res = 3;
    }
    if (this.innerWidth > 1800){
      res = 4;
    }
    return res;
  }
  showDrawings(drawing: any) {
    this.dialogService.open(DrawingShowComponent, {
      showHeader: false,
      modal: true,
      data: [drawing],
    }).onClose.subscribe(res => {
      if (res == 'success'){
        this.ref.close();
      }
    });
  }
}
