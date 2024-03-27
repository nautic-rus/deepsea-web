import {Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {MaterialManagerService} from "../../domain/material-manager.service";
import {MessageService, TreeNode} from "primeng/api";
import {DialogService} from "primeng/dynamicdialog";
import {LanguageService} from "../../domain/language.service";
import {Issue} from "../../domain/classes/issue";
import _, {object} from "underscore";
import {CreateTaskComponent} from "../create-task/create-task.component";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {Material} from "../../domain/classes/material";
import {MaterialNode} from "../../domain/classes/material-node";
import {NodeLib} from "three/examples/jsm/nodes/core/NodeLib";
import nodes = NodeLib.nodes;
import {$e} from "@angular/compiler/src/chars";
import {ClearFilesComponent} from "../documents/hull-esp/clear-files/clear-files.component";
import {ContextMenu} from "primeng/contextmenu";
import * as XLSX from "xlsx";
import {Table} from "primeng/table";
import {VirtualScroller} from "primeng/virtualscroller";
import {LV} from "../../domain/classes/lv";

@Component({
  selector: 'app-spec-materials',
  templateUrl: './spec-materials.component.html',
  styleUrls: ['./spec-materials.component.css']
})
export class SpecMaterialsComponent implements OnInit {

  search: string = '';
  nodes: any = [];
  nodesSrc: any = [];
  layers: any = [];
  materials: any [] = [];
  materialsSrc: any [] = [];
  selectedNode: any;
  selectedNodePath = '';
  selectedNodeCode = '';
  selectedRootNode: string = '';
  rootNodes: any[] = [];
  tooltips: string[] = [];
  projects: string[] = ['200101', '210101', '000000'];
  project = '';
  selectedMaterial: Material = new Material();
  items = [
    {
      label: 'New Folder',
      icon: 'pi pi-fw pi-plus',
      command: (event: any) => this.createNode(event.item)
    },
  ];
  addNew = false;
  editing = false;
  forNode: any;
  newNode: any = {};
  newNodeSuffix = '';
  selectedView: string = '';
  // @ts-ignore
  @ViewChild('table') table: Table;
  noResult = false;
  materialsFilled = false;
  public innerWidth: any;
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.innerWidth = window.innerWidth;
  }

  constructor(public t: LanguageService, private materialManager: MaterialManagerService, private messageService: MessageService, private dialogService: DialogService, public auth: AuthManagerService) { }

  ngOnInit(): void {
    // fetch('assets/test/materials.json').then(json => {
    //   json.text().then(text => {
    //     let materials = JSON.parse(text);
    //     materials.forEach((m: any) => {
    //       let material = new Material();
    //       material.code = m.trmCode;
    //       material.category = m.category;
    //       material.name = m.name;
    //       material.document = '';
    //       material.projects = ['N002', 'N004'];
    //       material.provider = '';
    //       material.singleWeight = m.singleWeight;
    //       material.units = m.units;
    //       material.description = m.description;
    //       console.log(material);
    //       this.materialManager.updateMaterial(material, 'sidorov').then(() => {});
    //     });
    //   });
    // });

    this.innerWidth = window.innerWidth;

    setTimeout(() => {
      this.selectedView = 'tiles';
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
      this.forNode = node;
      this.newNodeSuffix = '###';
      this.newNode.data = node.data;
      this.newNode.label = '';
      // this.newNode.label = node.label;
      this.newNode.checkChildren = node.children.map((x: any) => x.data);
    }
    console.log(this.newNode);
  }
  editNode(node: any){
    this.addNew = true;
    this.forNode = node;
    this.newNode = {};
    this.newNodeSuffix = '';
    this.newNode.data = node.data;
    this.newNode.label = node.label.replace(' (' + node.data.slice(-3) + ')', '');
    this.newNode.checkChildren = node.children.map((x: any) => x.data);
    this.editing = true;
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
        label: '(' + n.data.substr(parent.length) + ') ' + n.label,
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
    let res = node.label != null ? node.label : '';
    while (parent != null){
      res = parent.label + "/" + res;
      parent = parent.parent;
    }
    return res;
  }
  getNodeCode(node: any){
    let parent = node.parent;
    let res = node.data;
    while (parent != null){
      res = parent.data + res;
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
  addCountToNode(node: any){
    let parent = node.parent;
    node.count++;
    while (parent != null){
      parent.count++;
      parent = parent.parent;
    }
  }
  addMaterial(action: string = 'add', material: Material = new Material()) {
    // this.dialogService.open(AddMaterialComponent, {
    //   showHeader: true,
    //   header: action.replace('add', 'Добавление материала').replace('edit', 'Редактирование материала').replace('clone', 'Клонирование материала'),
    //   modal: true,
    //   closable: true,
    //   data: [this.project, material, action, this.materialsSrc, this.selectedNodeCode]
    // }).onClose.subscribe(res => {
    //   if (res != null && res.code != ''){
    //     let findMaterial = this.materials.find(x => x.id == res.id);
    //     if (findMaterial != null){
    //       this.materialsSrc[this.materialsSrc.indexOf(findMaterial)] = res;
    //       this.materials = [...this.materialsSrc];
    //     }
    //     else{
    //       this.materialsSrc.push(res);
    //       this.materials = [...this.materialsSrc];
    //       this.addCountToNode(this.selectedNode);
    //     }
    //   }
    //   this.selectNode();
    // });
  }

  selectNode() {
    if (this.selectedNode != null){
      this.selectedNodePath = this.getNodePath(this.selectedNode);
      //this.selectedNodeCode = this.getNodeCode(this.selectedNode);
      this.selectedNodeCode = this.selectedNode.data;
      this.materials = this.materialsSrc.filter(x => x.code.startsWith(this.selectedNodeCode));
    }
  }

  test(material: any) {
    console.log(material);
  }

  selectMaterial(material: any) {
    this.selectedMaterial = material;
  }

  deleteMaterial(selectedMaterial: Material) {
    // let selected = this.selectedNode.data;
    // this.dialogService.open(RemoveConfirmationComponent, {
    //   showHeader: false,
    //   modal: true,
    // }).onClose.subscribe(res => {
    //   if (res == 'success'){
    //     this.materialManager.updateMaterial(selectedMaterial, this.auth.getUser().login, 1).then(res => {
    //       let findMaterial = this.materialsSrc.find(x => x == selectedMaterial);
    //       if (findMaterial != null){
    //         this.materialsSrc.splice(this.materialsSrc.indexOf(findMaterial), 1);
    //       }
    //       this.materials = [...this.materialsSrc];
    //       this.refreshNodes(this.nodes, this.materials, '');
    //       this.selectNode();
    //       // this.materialManager.getMaterialNodes().then(res => {
    //       //   this.nodes = this.getNodes(res, this.materialsSrc);
    //       //   this.setParents(this.nodes, '');
    //       //   this.selectPathNode(selected, this.nodes);
    //       // });
    //     });
    //   }
    // });
  }
  refreshNodes(rootNodes: any[], materials: Material[], parent: string = ''){
    rootNodes.filter(x => x.data.length == parent.length + 3 && x.data.startsWith(parent)).forEach(n => {
      n.count = materials.filter(x => x.code.startsWith(n.data)).length;
      this.refreshNodes(n.children, materials, n.data);
    });
  }
  cloneMaterial(material: Material) {
    let newMaterial = JSON.parse(JSON.stringify(material));
    newMaterial.id = Material.generateId();
    this.addMaterial('clone', newMaterial);
  }

  contextMenu(event: any, contextMenu: ContextMenu) {
    event.originalEvent.stopPropagation();
    if (event.node.data.length >= 12){
      this.items = [
        {
          label: 'Edit Folder',
          icon: 'pi pi-fw pi-pencil',
          command: () => this.editNode(event.node)
        },
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
    else{
      this.items = [
        {
          label: 'New Folder',
          icon: 'pi pi-fw pi-plus',
          command: () => this.createNode(event.node)
        },
        {
          label: 'Edit Folder',
          icon: 'pi pi-fw pi-pencil',
          command: () => this.editNode(event.node)
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
  }
  contextMenuOut(event: any, contextMenu: ContextMenu) {
    event.stopPropagation();
    if (this.project != ''){
      this.items = [
        {
          label: 'New Folder',
          icon: 'pi pi-fw pi-plus',
          command: () => {
            this.newNode = {};
            this.forNode = this.nodesSrc.find((x: any) => x.data == this.selectedRootNode);
            this.newNodeSuffix = '###';
            this.newNode.data = this.selectedRootNode;
            this.newNode.label = '';
            // this.newNode.label = node.label;
            this.newNode.checkChildren = this.nodes.map((x: any) => x.data);
            this.forNode.children = this.nodes;
            this.addNew = true;
          }
        }
      ];
      contextMenu.show(event);
    }
  }

  hide() {
    this.newNode = {};
    this.addNew = false;
    this.editing = false;
  }

  isSaveDisabled() {
    if (this.editing){
      return this.newNode.label.trim().length == 0;
    }
    else{
      return (this.newNodeSuffix.length != 2 && this.newNodeSuffix.length != 3) || this.newNode.checkChildren.includes(this.newNode.data + this.newNodeSuffix) || this.newNode.label == '' || !(new RegExp('^[A-Z]+$').test(this.newNodeSuffix)) || this.newNodeSuffix.includes('#');
    }
  }

  save() {
    this.newNode.data += this.newNodeSuffix;
    this.materialManager.updateMaterialNode(this.project, this.newNode.data, this.newNode.label, this.auth.getUser().login, 0).then(resStatus => {
      if (!this.editing){
        this.newNode.children = [];
        this.forNode.children.push(this.newNode);
        this.setParents(this.nodes, '');
      }
      else{
        this.forNode.label = this.newNode.label + ' (' + this.newNode.data + ')';
      }
      this.editing = false;
      this.hide();
      // this.materialManager.getMaterialNodes(this.project).then(res => {
      //   if (this.project == '000000'){
      //     this.nodes = this.getNodes2(res, this.materialsSrc, '');
      //     this.setParents(this.nodes, '');
      //     this.materials.filter(x => x != null).forEach((x: any) => {
      //       x.path = this.setPath(x.code, 2);
      //     });
      //   }
      //   else{
      //     this.nodes = this.getNodes(res, this.materialsSrc, '');
      //     this.setParents(this.nodes, '');
      //     this.materials.filter(x => x != null).forEach((x: any) => {
      //       x.path = this.setPath(x.code);
      //     });
      //   }
      //   this.hide();
      // });
    });
  }

  removeNode(node: any) {
    this.materialManager.updateMaterialNode(this.project, node.data, node.label, this.auth.getUser().login, 1).then(resStatus => {
      if (node.parent != null){
        node.parent.children.splice(node.parent.children.indexOf(node), 1);
      }
      else{
        this.materialManager.getMaterialNodes(this.project).then(res => {
          this.nodesSrc = res;
          this.nodes = this.getNodes(res, this.materialsSrc, '');
          this.setParents(this.nodes, '');
          this.materials.filter(x => x != null).forEach((x: any) => {
            x.path = this.setPath(x.code);
          });
          this.rootNodeChanged();
        });
      }
    });
  }

  alertNodeContains(){
    this.messageService.add({key:'task', severity:'error', summary:'Folder is not empty', detail:'Cant delete non empty folder'});
  }

  exportXLS() {
    let fileName = 'export_' + this.generateId(8) + '.xlsx';
    let data: any[] = this.materials.filter(x => x != null);
    console.log(data);
    data.forEach(d => {
      d.sp1 = d.code.slice(0, 3);
      d.sp2 = d.code.slice(0, 6);
      d.sp3 = d.code.slice(0, 9);
      d.sp4 = d.code.slice(0, 12);
      let findSp1 = this.nodesSrc.find((x: any) => x.data == d.sp1);
      let findSp2 = this.nodesSrc.find((x: any) => x.data == d.sp2);
      let findSp3 = this.nodesSrc.find((x: any) => x.data == d.sp3);
      let findSp4 = this.nodesSrc.find((x: any) => x.data == d.sp4);
      d.sp1 = findSp1 != null ? findSp1.label : '';
      d.sp2 = findSp2 != null ? findSp2.label : '';
      d.sp3 = findSp3 != null ? findSp3.label : d.code.slice(6, 9);
      d.sp4 = findSp4 != null ? findSp4.label : d.code.slice(9, 12);
      d.sp5 = d.code;
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
    let searchIn = this.nodesSrc;
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

  searchChange() {
    if (this.selectedView == 'tiles'){
      this.materials = this.materialsSrc.filter(x => {
        let notNull = x != null;
        let findInName = ((x.name.toLowerCase() + x.description.toLowerCase() + x.code.toLowerCase())).includes(this.search.toLowerCase().trim());
        let findInTranslate = false;
        if (x.translations != null){
          x.translations.forEach((y: any) => {
            if ((y.name.toLowerCase() + y.description.toLowerCase()).includes(this.search.toLowerCase().trim())){
              findInTranslate = true;
            }
          });
        }
        return notNull && (findInName || findInTranslate);
      });
      console.log(this.materials);
      for (let x = 0; x < 10; x ++){
        this.materials.push(null);
      }
    }
    else{
      this.materials = this.materialsSrc.filter(x => {
        let notNull = x != null;
        let findInName = ((x.name.toLowerCase() + x.description.toLowerCase() + x.code.toLowerCase())).includes(this.search.toLowerCase().trim());
        let findInTranslate = false;
        if (x.translations != null){
          x.translations.forEach((y: any) => {
            if ((y.name.toLowerCase() + y.description.toLowerCase()).includes(this.search.toLowerCase().trim())){
              findInTranslate = true;
            }
          });
        }
        return notNull && (findInName || findInTranslate);
      });
      console.log(this.materials);
    }
  }

  projectChanged() {
    this.materials.splice(0, this.materials.length);
    this.nodes.splice(0, this.nodes.length);
    this.materialsFilled = false;
    this.materialManager.getMaterials(this.project).then(res => {
      res.forEach((m => m.materialCloudDirectory = ''));
      this.materials = res;
      this.materialsSrc = res;
      console.log(res);
      this.materialManager.getMaterialNodes(this.project).then(res => {
        this.nodesSrc = res;
        this.nodes = this.getNodes(res, this.materialsSrc, '');
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
          this.rootNodes = this.nodes.filter((x: any) => x.data.length == 3).map((x: any) => new LV(x.label + ' (' + x.count + ')', x.data));
          this.rootNodes = [new LV('Ведомость', '-')].concat(this.rootNodes);
          this.selectedRootNode = this.rootNodes[0].value;
          this.rootNodes = [...this.rootNodes];
          this.rootNodeChanged();
        }
      });
      this.materialsSrc = [...this.materials];
      for (let x = 0; x < 10; x ++){
        this.materials.push(null);
      }
      this.materialsFilled = true;
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
  chunkMaterials(chunkSize = 3){
    let res: any[] = [];
    for (let i = 0; i < this.materials.length; i += chunkSize) {
      const chunk = this.materials.slice(i, i + chunkSize);
      res.push(chunk);
    }
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
  rootNodeChanged() {
    this.selectedNodePath = '';
    this.nodes = this.getNodes(this.nodesSrc.filter((x: any) => x.data.startsWith(this.selectedRootNode)), this.materialsSrc, this.selectedRootNode);
    this.setParents(this.nodes, '');
    this.materials.filter(x => x != null).forEach((x: any) => {
      x.path = this.setPath(x.code);
    });
    this.materials = this.materialsSrc.filter(x => x.code.startsWith(this.selectedRootNode) || this.selectedRootNode == '-');
  }

}
