import {ChangeDetectorRef, Component, HostListener, OnInit, ViewChild} from '@angular/core';
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
import {RemoveConfirmationComponent} from "../materials/remove-confirmation/remove-confirmation.component";
import {SpecMaterialComponent} from "./spec-material/spec-material.component";
import {IssueManagerService} from "../../domain/issue-manager.service";
import {SpecMaterial} from "../../domain/classes/spec-material";
import {SpecDirectory} from "../../domain/classes/spec-directory";
import {EquipmentsService} from "../../domain/equipments.service";

@Component({
  selector: 'app-spec-materials',
  templateUrl: './spec-materials.component.html',
  styleUrls: ['./spec-materials.component.css']
})
export class SpecMaterialsComponent implements OnInit {
  materialWasChanged: boolean = false;
  search: string = '';
  nodes: any = [];
  nodesSrc: any = [];
  layers: any = [];
  materials: any [] = [];
  materialsSrc: any [] = [];
  selectedNode: any;
  selectedNodePath = '';
  selectedNodeCode = '';
  selectedNodeId = '';
  selectedRootNode: string = '';
  rootNodes: any[] = [];
  tooltips: string[] = [];
  selectedMaterial: SpecMaterial = new SpecMaterial();
  items = [
    {
      label: 'New Folder',
      icon: 'pi pi-fw pi-plus',
      command: (event: any) => this.createNode(event.item)
    },
  ];
  addNew = false;
  editing = false;
  newNode: SpecDirectory = new SpecDirectory();
  newNodeSuffix = '';
  selectedView: string = 'list';
  // @ts-ignore
  @ViewChild('table') table: Table;
  noResult = false;
  materialsFilled = false;
  public innerWidth: any;
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.innerWidth = window.innerWidth;
  }
  projects: any[] = [];
  project = 0;
  specStatements: any[] = [];
  materialPath: any = Object();
  expandedNodes: any[] = [];
  onlyProject = false;
  supplies: any[] = [];
  supMatRelations: any[] = [];
  matSupplies: any = Object();
  materialChecks: string[] = [];

  constructor(public t: LanguageService, public cd: ChangeDetectorRef, public eqManager: EquipmentsService, public issues: IssueManagerService, private materialManager: MaterialManagerService, private messageService: MessageService, private dialogService: DialogService, public auth: AuthManagerService) { }

  ngOnInit(): void {
    this.innerWidth = window.innerWidth;
    setTimeout(() => {
      this.selectedView = 'list';
    }, 1000);
    this.issues.getSpecProjects().subscribe(projects => {
      this.materialManager.getSpecStatements().subscribe(specStatements => {
        this.specStatements = specStatements;
        this.projects = projects.filter(x => specStatements.find((y: any) => y.project_id == x.id) != null);
        if (this.projects.length > 0){
          this.project = this.projects[0].id;
        }
        this.projectChanged();
      });
    });
    this.materialManager.getMaterialChecks().subscribe(res => {
      this.materialChecks = res;
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
    this.addNew = true;
    this.newNode = new SpecDirectory();
    this.newNode.parent_id = node.data;
    this.newNode.user_id = this.auth.getUser().id;
    this.onlyProject = false;
  }
  editNode(node: any){
    this.addNew = true;
    this.newNode = this.nodesSrc.find((x: any) => x.id == node.data)!;
    this.editing = true;
    this.onlyProject = node.project != 0;
  }
  getNodes(rootNodes: any[], materials: any[], parent_id: number = 0){
    // console.log(rootNodes);
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
  getNodePath(node: any){
    let parent = node.parent;
    let res = node.label != null ? node.label : '';
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
  addCountToNode(node: any){
    let parent = node.parent;
    node.count++;
    while (parent != null){
      parent.count++;
      parent = parent.parent;
    }
  }
  addMaterial(action: string = 'add', material: SpecMaterial = new SpecMaterial()) {
    this.cd.detach();
    this.dialogService.open(SpecMaterialComponent, {
      showHeader: true,
      header: action.replace('add', 'Добавление материала').replace('edit', 'Редактирование материала').replace('clone', 'Клонирование материала'),
      modal: true,
      closable: true,
      data: [this.project, material, action, this.selectedNode != null ? this.selectedNode.data : '', 0]
    }).onClose.subscribe(res => {
      if (res?.material) {
        this.materialWasChanged = true;
        this.projectChanged();
        if (res.newId != 0) {
          setTimeout(() => {
            let newCode = this.materialsSrc.find(mat => mat.id === res.newId);
            navigator.clipboard.writeText(newCode.code);
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Материал успешно добавлен. Stock code скопирован в буфер обмена' });
          }, 400)
        }
      }
      else {
        this.selectNode();
      }
      this.cd.reattach();
    });
  }

  selectNode() {
    this.selectedMaterial = new SpecMaterial();
    if (this.selectedNode != null){
      // console.log(this.selectedNode);
      this.selectedNodePath = this.getNodePath(this.selectedNode);
      // console.log("this.selectedNodePath");
      // console.log(this.selectedNodePath);
      this.selectedNodeId = this.selectedNode.id;
      // console.log("this.selectedNodeId");
      // console.log(this.selectedNodeId);
      this.materials = this.selectedNode.materials;
      // console.log("this.materials");
      // console.log(this.materials);
    }
  }

  test(material: any) {
    console.log(material);
  }

  selectMaterial(material: any) {
    this.selectedMaterial = material;
  }

  deleteMaterial(selectedMaterial: SpecMaterial) {
    this.dialogService.open(RemoveConfirmationComponent, {
      showHeader: false,
      modal: true,
    }).onClose.subscribe(res => {
      if (res == 'success'){
        selectedMaterial.removed = 1;
        this.materialManager.updateSpecMaterial(selectedMaterial).subscribe(res => {
          this.projectChanged();
        });
      }
    });
  }
  refreshNodes(rootNodes: any[], materials: SpecMaterial[], parent: string = ''){
    rootNodes.filter(x => x.data.length == parent.length + 3 && x.data.startsWith(parent)).forEach(n => {
      n.count = materials.filter(x => x.code.startsWith(n.data)).length;
      this.refreshNodes(n.children, materials, n.data);
    });
  }
  cloneMaterial(material: SpecMaterial) {
    let newMaterial = JSON.parse(JSON.stringify(material));
    newMaterial.id = 0;
    this.addMaterial('clone', newMaterial);
  }

  contextMenu(event: any, contextMenu: ContextMenu) {
    event.originalEvent.stopPropagation();
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
      event.node.materials.length > 0 ? {
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
  contextMenuOut(event: any, contextMenu: ContextMenu) {
    event.stopPropagation();
    if (this.project != 0){
      this.items = [
        {
          label: 'New Folder',
          icon: 'pi pi-fw pi-plus',
          command: () => {
            this.newNode = new SpecDirectory();
            this.newNode.parent_id = 0;
            this.newNode.user_id = this.auth.getUser().id;
            this.addNew = true;
          }
        }
      ];
      contextMenu.show(event);
    }
  }

  hide() {
    this.addNew = false;
    this.editing = false;
  }

  isSaveDisabled() {
    return this.newNode.name.trim().length == 0;
  }

  save() {
    this.newNode.project_id = this.onlyProject ? this.project : 0;
    this.materialManager.updateSpecDirectory(this.newNode).subscribe(resStatus => {
      this.editing = false;
      this.hide();
      this.projectChanged();
    });
  }

  removeNode(node: any) {
    this.newNode = this.nodesSrc.find((x: any) => x.id == node.data)!;
    this.newNode.removed = 1;
    this.materialManager.updateSpecDirectory(this.newNode).subscribe(resStatus => {
      this.editing = false;
      this.hide();
      this.projectChanged();
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
    this.materialManager.createMaterialCloudDirectory(this.project.toString(), material.code).then(res => {
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
    localStorage.setItem('search', this.search);
    if (this.selectedView == 'tiles'){
      this.materials = this.materialsSrc.filter(x => {
        let notNull = x != null;
        let findInName = ((x.name.toLowerCase() + x.descr.toLowerCase() + x.code.toLowerCase())).includes(this.search.toLowerCase().trim());
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
      for (let x = 0; x < 10; x ++){
        this.materials.push(null);
      }
    }
    else{
      this.materials = this.materialsSrc.filter(x => {
        let notNull = x != null;
        let findInName = ((x.name.toLowerCase() + x.descr.toLowerCase() + x.code.toLowerCase())).includes(this.search.toLowerCase().trim());
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
    }
  }

  getMaterialPathStr(material: any) {
    let str = material.path;
    console.log(str);
    return str;
  }
  getMaterialName(material: any) {
    let res = material.name;
    return res;
  }
  getMaterialDescription(material: any) {
    let res = material.descr;
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
    this.nodes = this.getNodes(this.nodesSrc.filter((x: any) => x.data.startsWith(this.selectedRootNode)), this.materialsSrc, 0);
    this.materials.filter(x => x != null).forEach((x: any) => {
      x.path = this.setPath(x.code);
    });
    this.materials = this.materialsSrc.filter(x => x.code.startsWith(this.selectedRootNode) || this.selectedRootNode == '-');
  }

  projectChanged() {
    this.eqManager.getEquipments().subscribe(eq => {
      eq.forEach(e => {
        e.suppliers?.forEach(s => {
          this.supplies.push({
            id: e.id,
            sfi: e.sfi,
            name: e.name,
            manufacturer: s.name,
            supplier_id: s.id,
            // equ_id: e.id,
          });
        });
      });
      this.materialManager.getSupMatRelations().subscribe(res => {
        this.supMatRelations = res;
        this.materialsFilled = false;
        this.materials = [];
        this.materialManager.getSpecMaterials().subscribe(resMaterials => {
          // console.log("resMaterials");
          // console.log(resMaterials);
          resMaterials.forEach((m: any) => m.materialCloudDirectory = '');
          resMaterials.forEach((m: any) => m.path = []);
          let projectStatements = this.specStatements.filter(x => x.project_id == this.project).map(x => x.id);
          this.materials = resMaterials.filter((x: any) => projectStatements.includes(x.statem_id));
          this.materialsSrc = resMaterials.filter((x: any) => projectStatements.includes(x.statem_id));
          console.log(this.materialsSrc);
          this.materialManager.getSpecDirectories().subscribe(specDirectories => {
            this.nodesSrc = specDirectories.filter((x: any) => x.project_id == this.project || x.project_id == 0);
            this.nodes = _.sortBy(this.getNodes(this.nodesSrc, this.materials, 0), x => x.label);
            this.materials.filter(x => x != null).forEach(m => m.path = this.getMaterialPath(this.nodes, m.dir_id));
            this.setExpandedNodes(this.nodes);
            this.setSelectedNode(this.nodes);
            this.setMaterialsProviders();
            this.materialsFilled = true;
            let search = localStorage.getItem('search');
            if (search != null && search != ''){
              this.search = search;
              this.searchChange();
            }
          });
          for (let x = 0; x < 10; x ++){
            this.materials.push(null);
          }
          // console.log("project changed finished");
        });

      });
      console.log("this.supplies");
      console.log(this.supplies);
    });
  }

  getEquIdBySupplierId(supplierId: number) {
    let supp = this.supplies.find(supp => supp.supplier_id === supplierId);
    console.log(supp);
    return supp.id;
  }
  getMaterialPath(nodes: any[], dir_id: number){
    let res = [];
    let find = nodes.find(x => x.data == dir_id);
    if (find == null){
      nodes.forEach(n => {
        let findChild = this.getMaterialPath(n.children, dir_id);
        if (findChild.length > 0){
          res.push(n.label);
          findChild.forEach(x => {
            res.push(x);
          });
        }
      });
    }
    else{
      res.push(find.label);
    }
    return res;
  }

  getStatement(stat_id: any) {
    let find = this.specStatements.find(x => x.id == stat_id);
    return find != null ? find.code : '';
  }

  nodeExpanded(event: any, tree: any) {
    this.expandedNodes.push(event.node);
  }

  nodeCollapsed(event: any) {
    this.expandedNodes.splice(this.expandedNodes.indexOf(event.node), 1);
  }

  setExpandedNodes(rootNodes: any[]){
    if (rootNodes.length == 0){
      return;
    }
    rootNodes.forEach(node => {
      if (this.expandedNodes.map(x => x.data).includes(node.data)){
        node.expanded = true;
      }
    });
    this.setExpandedNodes(rootNodes.flatMap(x => x.children));
  }
  setSelectedNode(rootNodes: any[]){
    if (this.selectedNode == null || rootNodes.length == 0){
      return;
    }
    rootNodes.forEach(node => {
      if (this.selectedNode.data == node.data){
        this.selectedNode = node;
        this.selectNode();
      }
    });
    this.setSelectedNode(rootNodes.flatMap(x => x.children));
  }

  setMaterialsProviders() {
    this.materials.filter(x => x != null).forEach(m => {
      let supplier = 'unknown';
      let find: any = this.supMatRelations.find((x: any) => x.materials_id == m.id);
      if (find != null){
        let supply = this.supplies.find(x => x.supplier_id == find.supplier_id);
        if (supply != null){
          supplier = supply.manufacturer;
        }
      }
      this.matSupplies[m.id] = supplier;
    });
  }

  getMaterialCheck(code: string) {
    return this.materialChecks.includes(code);
  }

  addMaterialCheck(code: string) {
    this.materialManager.addMaterialChecks(code).subscribe((res) => {
      this.materialChecks.push(code);
    });
  }

  removeMaterialCheck(code: string) {
    this.materialManager.deleteMaterialChecks(code).subscribe((res) => {
      this.materialChecks.splice(this.materialChecks.indexOf(code), 1);
    });
  }
}


//старая версия начинается здесь
// import {ChangeDetectorRef, Component, HostListener, OnInit, ViewChild} from '@angular/core';
// import {MaterialManagerService} from "../../domain/material-manager.service";
// import {MessageService, TreeNode} from "primeng/api";
// import {DialogService} from "primeng/dynamicdialog";
// import {LanguageService} from "../../domain/language.service";
// import {Issue} from "../../domain/classes/issue";
// import _, {object} from "underscore";
// import {CreateTaskComponent} from "../create-task/create-task.component";
// import {AuthManagerService} from "../../domain/auth-manager.service";
// import {Material} from "../../domain/classes/material";
// import {MaterialNode} from "../../domain/classes/material-node";
// import {NodeLib} from "three/examples/jsm/nodes/core/NodeLib";
// import nodes = NodeLib.nodes;
// import {$e} from "@angular/compiler/src/chars";
// import {ClearFilesComponent} from "../documents/hull-esp/clear-files/clear-files.component";
// import {ContextMenu} from "primeng/contextmenu";
// import * as XLSX from "xlsx";
// import {Table} from "primeng/table";
// import {RemoveConfirmationComponent} from "../materials/remove-confirmation/remove-confirmation.component";
// import {SpecMaterialComponent} from "./spec-material/spec-material.component";
// import {IssueManagerService} from "../../domain/issue-manager.service";
// import {SpecMaterial} from "../../domain/classes/spec-material";
// import {SpecDirectory} from "../../domain/classes/spec-directory";
// import {EquipmentsService} from "../../domain/equipments.service";
//
// @Component({
//   selector: 'app-spec-materials',
//   templateUrl: './spec-materials.component.html',
//   styleUrls: ['./spec-materials.component.css']
// })
// export class SpecMaterialsComponent implements OnInit {
//   search: string = '';
//   nodes: any = [];
//   nodesSrc: any = [];
//   layers: any = [];
//   materials: any [] = [];
//   materialsSrc: any [] = [];
//   selectedNode: any;
//   selectedNodePath = '';
//   selectedNodeCode = '';
//   selectedNodeId = '';
//   selectedRootNode: string = '';
//   rootNodes: any[] = [];
//   tooltips: string[] = [];
//   selectedMaterial: SpecMaterial = new SpecMaterial();
//   items = [
//     {
//       label: 'New Folder',
//       icon: 'pi pi-fw pi-plus',
//       command: (event: any) => this.createNode(event.item)
//     },
//   ];
//   addNew = false;
//   editing = false;
//   newNode: SpecDirectory = new SpecDirectory();
//   newNodeSuffix = '';
//   selectedView: string = 'list';
//   // @ts-ignore
//   @ViewChild('table') table: Table;
//   noResult = false;
//   materialsFilled = false;
//   public innerWidth: any;
//   @HostListener('window:resize', ['$event'])
//   onResize(event: any) {
//     this.innerWidth = window.innerWidth;
//   }
//   projects: any[] = [];
//   project = 0;
//   specStatements: any[] = [];
//   materialPath: any = Object();
//   expandedNodes: any[] = [];
//   onlyProject = false;
//   supplies: any[] = [];
//   supMatRelations: any[] = [];
//   matSupplies: any = Object();
//
//   constructor(public t: LanguageService, public cd: ChangeDetectorRef, public eqManager: EquipmentsService, public issues: IssueManagerService, private materialManager: MaterialManagerService, private messageService: MessageService, private dialogService: DialogService, public auth: AuthManagerService) { }
//
//   ngOnInit(): void {
//     this.innerWidth = window.innerWidth;
//     setTimeout(() => {
//       this.selectedView = 'list';
//     }, 1000);
//     this.issues.getSpecProjects().subscribe(projects => {
//       this.materialManager.getSpecStatements().subscribe(specStatements => {
//         this.specStatements = specStatements;
//         this.projects = projects.filter(x => specStatements.find((y: any) => y.project_id == x.id) != null);
//         if (this.projects.length > 0){
//           this.project = this.projects[0].id;
//         }
//         this.projectChanged();
//       });
//     });
//   }
//   setPath(code: string, length = 3){
//     let count = 1;
//     let path = '';
//     let root = code.substr(0, length * count);
//     let findNode = this.nodesSrc.find((x: any) => x.data == root);
//     while (findNode != null){
//       path = path + '/' + findNode.label;
//       count += 1;
//       findNode = this.nodesSrc.find((x: any) => x.data == code.substr(0, length * count));
//     }
//     return path.split('/').filter(x => x != '');
//   }
//   createNode(node: any){
//     this.addNew = true;
//     this.newNode = new SpecDirectory();
//     this.newNode.parent_id = node.data;
//     this.newNode.user_id = this.auth.getUser().id;
//     this.onlyProject = false;
//   }
//   editNode(node: any){
//     this.addNew = true;
//     this.newNode = this.nodesSrc.find((x: any) => x.id == node.data)!;
//     this.editing = true;
//     this.onlyProject = node.project != 0;
//   }
//   getNodes(rootNodes: any[], materials: any[], parent_id: number = 0){
//     // console.log(rootNodes);
//     let res: any[] = [];
//     rootNodes.filter(x => x.parent_id == parent_id).forEach(n => {
//       let nodes = this.getNodes(rootNodes, materials, n.id);
//       let nodeMaterials = materials.filter(x => x != null && x.dir_id == n.id);
//       nodes.forEach(n => {
//         n.materials.forEach((m: any) => nodeMaterials.push(m));
//       });
//       let count = nodeMaterials.length;
//       res.push({
//         data: n.id,
//         children: _.sortBy(nodes, x => x.label),
//         label: n.name + (n.project_id == 0 ? '' : (' (' + this.getProjectName(n.project_id)) + ')'),
//         materials: nodeMaterials,
//         count: count,
//         project: n.project_id
//       });
//     });
//     return res;
//   }
//   getProjectName(id: number){
//     let project = this.projects.find(x => x.id == id);
//     if (project != null){
//       return project.name;
//     }
//     else{
//       return '';
//     }
//   }
//   getNodePath(node: any){
//     let parent = node.parent;
//     let res = node.label != null ? node.label : '';
//     while (parent != null){
//       res = parent.label + "/" + res;
//       parent = parent.parent;
//     }
//     return res;
//   }
//   copyTrmCode(code: string, index: string) {
//     navigator.clipboard.writeText(code);
//     this.tooltips.push(index);
//     setTimeout(() => {
//       this.tooltips.splice(this.tooltips.indexOf(index), 1);
//     }, 1500);
//     //this.messageService.add({key:'task', severity:'success', summary:'Copied', detail:'You have copied issue url.'});
//   }
//   showTooltip(index: string) {
//     return this.tooltips.includes(index);
//   }
//   addCountToNode(node: any){
//     let parent = node.parent;
//     node.count++;
//     while (parent != null){
//       parent.count++;
//       parent = parent.parent;
//     }
//   }
//   addMaterial(action: string = 'add', material: SpecMaterial = new SpecMaterial()) {
//     this.cd.detach();
//     this.dialogService.open(SpecMaterialComponent, {
//       showHeader: true,
//       header: action.replace('add', 'Добавление материала').replace('edit', 'Редактирование материала').replace('clone', 'Клонирование материала'),
//       modal: true,
//       closable: true,
//       data: [this.project, material, action, this.selectedNode != null ? this.selectedNode.data : '', 0]
//     }).onClose.subscribe(res => {
//       this.projectChanged();
//       this.cd.reattach();
//     });
//   }
//
//   selectNode() {
//     this.selectedMaterial = new SpecMaterial();
//     if (this.selectedNode != null){
//       this.selectedNodePath = this.getNodePath(this.selectedNode);
//       this.selectedNodeId = this.selectedNode.id;
//       this.materials = this.selectedNode.materials;
//     }
//   }
//
//   test(material: any) {
//     console.log(material);
//   }
//
//   selectMaterial(material: any) {
//     this.selectedMaterial = material;
//   }
//
//   deleteMaterial(selectedMaterial: SpecMaterial) {
//     this.dialogService.open(RemoveConfirmationComponent, {
//       showHeader: false,
//       modal: true,
//     }).onClose.subscribe(res => {
//       if (res == 'success'){
//         selectedMaterial.removed = 1;
//         this.materialManager.updateSpecMaterial(selectedMaterial).subscribe(res => {
//           this.projectChanged();
//         });
//       }
//     });
//   }
//   refreshNodes(rootNodes: any[], materials: SpecMaterial[], parent: string = ''){
//     rootNodes.filter(x => x.data.length == parent.length + 3 && x.data.startsWith(parent)).forEach(n => {
//       n.count = materials.filter(x => x.code.startsWith(n.data)).length;
//       this.refreshNodes(n.children, materials, n.data);
//     });
//   }
//   cloneMaterial(material: SpecMaterial) {
//     let newMaterial = JSON.parse(JSON.stringify(material));
//     newMaterial.id = 0;
//     this.addMaterial('clone', newMaterial);
//   }
//
//   contextMenu(event: any, contextMenu: ContextMenu) {
//     event.originalEvent.stopPropagation();
//     this.items = [
//       {
//         label: 'New Folder',
//         icon: 'pi pi-fw pi-plus',
//         command: () => this.createNode(event.node)
//       },
//       {
//         label: 'Edit Folder',
//         icon: 'pi pi-fw pi-pencil',
//         command: () => this.editNode(event.node)
//       },
//       event.node.materials.length > 0 ? {
//         label: 'Remove',
//         icon: 'pi pi-fw pi-trash',
//         command: (event: any) => this.alertNodeContains()
//       } : {
//         label: 'Remove',
//         icon: 'pi pi-fw pi-trash',
//         command: () => this.removeNode(event.node)
//       }
//     ];
//   }
//   contextMenuOut(event: any, contextMenu: ContextMenu) {
//     event.stopPropagation();
//     if (this.project != 0){
//       this.items = [
//         {
//           label: 'New Folder',
//           icon: 'pi pi-fw pi-plus',
//           command: () => {
//             this.newNode = new SpecDirectory();
//             this.newNode.parent_id = 0;
//             this.newNode.user_id = this.auth.getUser().id;
//             this.addNew = true;
//           }
//         }
//       ];
//       contextMenu.show(event);
//     }
//   }
//
//   hide() {
//     this.addNew = false;
//     this.editing = false;
//   }
//
//   isSaveDisabled() {
//     return this.newNode.name.trim().length == 0;
//   }
//
//   save() {
//     this.newNode.project_id = this.onlyProject ? this.project : 0;
//     this.materialManager.updateSpecDirectory(this.newNode).subscribe(resStatus => {
//       this.editing = false;
//       this.hide();
//       this.projectChanged();
//     });
//   }
//
//   removeNode(node: any) {
//     this.newNode = this.nodesSrc.find((x: any) => x.id == node.data)!;
//     this.newNode.removed = 1;
//     this.materialManager.updateSpecDirectory(this.newNode).subscribe(resStatus => {
//       this.editing = false;
//       this.hide();
//       this.projectChanged();
//     });
//   }
//
//   alertNodeContains(){
//     this.messageService.add({key:'task', severity:'error', summary:'Folder is not empty', detail:'Cant delete non empty folder'});
//   }
//
//   exportXLS() {
//     let fileName = 'export_' + this.generateId(8) + '.xlsx';
//     let data: any[] = this.materials.filter(x => x != null);
//     console.log(data);
//     data.forEach(d => {
//       d.sp1 = d.code.slice(0, 3);
//       d.sp2 = d.code.slice(0, 6);
//       d.sp3 = d.code.slice(0, 9);
//       d.sp4 = d.code.slice(0, 12);
//       let findSp1 = this.nodesSrc.find((x: any) => x.data == d.sp1);
//       let findSp2 = this.nodesSrc.find((x: any) => x.data == d.sp2);
//       let findSp3 = this.nodesSrc.find((x: any) => x.data == d.sp3);
//       let findSp4 = this.nodesSrc.find((x: any) => x.data == d.sp4);
//       d.sp1 = findSp1 != null ? findSp1.label : '';
//       d.sp2 = findSp2 != null ? findSp2.label : '';
//       d.sp3 = findSp3 != null ? findSp3.label : d.code.slice(6, 9);
//       d.sp4 = findSp4 != null ? findSp4.label : d.code.slice(9, 12);
//       d.sp5 = d.code;
//     });
//
//
//     const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
//     const workbook: XLSX.WorkBook = {Sheets: {'data': worksheet}, SheetNames: ['data']};
//     XLSX.writeFile(workbook, fileName);
//   }
//   generateId(length: number): string {
//     let result = '';
//     const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//     const charactersLength = characters.length;
//     for (let i = 0; i < length; i++ ) {
//       result += characters.charAt(Math.floor(Math.random() *
//         charactersLength));
//     }
//     return result;
//   }
//   trimFileName(input: string, length: number = 10): string{
//     let split = input.split('.');
//     let name = split[0];
//     let extension = split[1];
//     if (name.length > length){
//       return name.substr(0, length - 2) + '..';
//     }
//     else{
//       return input;
//     }
//   }
//
//   selectPath(p: string, path: string[]) {
//     let searchIn = this.nodesSrc;
//     path.forEach(x => {
//       let node = searchIn.find((n: any) => n.label == x);
//       if (node != null && p.includes(node.label)){
//         this.selectedNode = node;
//         node.partialSelected = true;
//         node.expanded = true;
//         this.selectNode();
//         return;
//       }
//       if (node != null){
//         searchIn = node.children;
//       }
//     });
//   }
//   createMaterialCloudDirectory(material: any){
//     material.materialCloudDirectory = 'LOADING';
//     this.materialManager.createMaterialCloudDirectory(this.project.toString(), material.code).then(res => {
//       console.log(res);
//       material.materialCloudDirectory = res;
//     });
//   }
//
//   openMaterialCloudDirectory(material: any) {
//     window.open(material.materialCloudDirectory);
//   }
//   trimText(input: string, length = 50){
//     let res = input;
//     if (res.length > length){
//       res = res.substr(0, length) + '..';
//     }
//     return res;
//   }
//
//   searchChange() {
//     localStorage.setItem('search', this.search);
//     if (this.selectedView == 'tiles'){
//       this.materials = this.materialsSrc.filter(x => {
//         let notNull = x != null;
//         let findInName = ((x.name.toLowerCase() + x.descr.toLowerCase() + x.code.toLowerCase())).includes(this.search.toLowerCase().trim());
//         let findInTranslate = false;
//         if (x.translations != null){
//           x.translations.forEach((y: any) => {
//             if ((y.name.toLowerCase() + y.description.toLowerCase()).includes(this.search.toLowerCase().trim())){
//               findInTranslate = true;
//             }
//           });
//         }
//         return notNull && (findInName || findInTranslate);
//       });
//       for (let x = 0; x < 10; x ++){
//         this.materials.push(null);
//       }
//     }
//     else{
//       this.materials = this.materialsSrc.filter(x => {
//         let notNull = x != null;
//         let findInName = ((x.name.toLowerCase() + x.descr.toLowerCase() + x.code.toLowerCase())).includes(this.search.toLowerCase().trim());
//         let findInTranslate = false;
//         if (x.translations != null){
//           x.translations.forEach((y: any) => {
//             if ((y.name.toLowerCase() + y.description.toLowerCase()).includes(this.search.toLowerCase().trim())){
//               findInTranslate = true;
//             }
//           });
//         }
//         return notNull && (findInName || findInTranslate);
//       });
//     }
//   }
//
//
//   getMaterialName(material: any) {
//     let res = material.name;
//     return res;
//   }
//   getMaterialDescription(material: any) {
//     let res = material.descr;
//     return res;
//   }
//   chunkMaterials(chunkSize = 3){
//     let res: any[] = [];
//     for (let i = 0; i < this.materials.length; i += chunkSize) {
//       const chunk = this.materials.slice(i, i + chunkSize);
//       res.push(chunk);
//     }
//     return res;
//   }
//
//   defineChunkSize() {
//     let res = 2;
//     if (this.innerWidth > 1600){
//       res = 3;
//     }
//     if (this.innerWidth > 1800){
//       res = 4;
//     }
//     return res;
//   }
//   rootNodeChanged() {
//     this.selectedNodePath = '';
//     this.nodes = this.getNodes(this.nodesSrc.filter((x: any) => x.data.startsWith(this.selectedRootNode)), this.materialsSrc, 0);
//     this.materials.filter(x => x != null).forEach((x: any) => {
//       x.path = this.setPath(x.code);
//     });
//     this.materials = this.materialsSrc.filter(x => x.code.startsWith(this.selectedRootNode) || this.selectedRootNode == '-');
//   }
//
//   projectChanged() {
//     this.eqManager.getEquipments().subscribe(eq => {
//       eq.forEach(e => {
//         e.suppliers?.forEach(s => {
//           this.supplies.push({
//             id: e.id,
//             sfi: e.sfi,
//             name: e.name,
//             manufacturer: s.name,
//             supplier_id: s.id
//           });
//         });
//       });
//       this.materialManager.getSupMatRelations().subscribe(res => {
//         this.supMatRelations = res;
//         this.materialsFilled = false;
//         this.materials = [];
//         this.materialManager.getSpecMaterials().subscribe(resMaterials => {
//           console.log("resMaterials");
//           console.log(resMaterials);
//           resMaterials.forEach((m: any) => m.materialCloudDirectory = '');
//           resMaterials.forEach((m: any) => m.path = []);
//           let projectStatements = this.specStatements.filter(x => x.project_id == this.project).map(x => x.id);
//           this.materials = resMaterials.filter((x: any) => projectStatements.includes(x.statem_id));
//           this.materialsSrc = resMaterials.filter((x: any) => projectStatements.includes(x.statem_id));
//           console.log(this.materialsSrc);
//           this.materialManager.getSpecDirectories().subscribe(specDirectories => {
//             this.nodesSrc = specDirectories.filter((x: any) => x.project_id == this.project || x.project_id == 0);
//             this.nodes = _.sortBy(this.getNodes(this.nodesSrc, this.materials, 0), x => x.label);
//             this.materials.filter(x => x != null).forEach(m => m.path = this.getMaterialPath(this.nodes, m.dir_id));
//             this.setExpandedNodes(this.nodes);
//             this.setSelectedNode(this.nodes);
//             this.setMaterialsProviders();
//             this.materialsFilled = true;
//             let search = localStorage.getItem('search');
//             if (search != null){
//               this.search = search;
//             }
//             this.searchChange();
//           });
//           for (let x = 0; x < 10; x ++){
//             this.materials.push(null);
//           }
//         });
//       });
//     });
//   }
//   getMaterialPath(nodes: any[], dir_id: number){
//     let res = [];
//     let find = nodes.find(x => x.data == dir_id);
//     if (find == null){
//       nodes.forEach(n => {
//         let findChild = this.getMaterialPath(n.children, dir_id);
//         if (findChild.length > 0){
//           res.push(n.label);
//           findChild.forEach(x => {
//             res.push(x);
//           });
//         }
//       });
//     }
//     else{
//       res.push(find.label);
//     }
//     return res;
//   }
//
//   getStatement(stat_id: any) {
//     let find = this.specStatements.find(x => x.id == stat_id);
//     return find != null ? find.code : '';
//   }
//
//   nodeExpanded(event: any, tree: any) {
//     this.expandedNodes.push(event.node);
//   }
//
//   nodeCollapsed(event: any) {
//     this.expandedNodes.splice(this.expandedNodes.indexOf(event.node), 1);
//   }
//
//   setExpandedNodes(rootNodes: any[]){
//     if (rootNodes.length == 0){
//       return;
//     }
//     rootNodes.forEach(node => {
//       if (this.expandedNodes.map(x => x.data).includes(node.data)){
//         node.expanded = true;
//       }
//     });
//     this.setExpandedNodes(rootNodes.flatMap(x => x.children));
//   }
//   setSelectedNode(rootNodes: any[]){
//     if (this.selectedNode == null || rootNodes.length == 0){
//       return;
//     }
//     rootNodes.forEach(node => {
//       if (this.selectedNode.data == node.data){
//         this.selectedNode = node;
//         this.selectNode();
//       }
//     });
//     this.setSelectedNode(rootNodes.flatMap(x => x.children));
//   }
//
//   setMaterialsProviders() {
//     this.materials.filter(x => x != null).forEach(m => {
//       let supplier = 'unknown';
//       let find: any = this.supMatRelations.find((x: any) => x.materials_id == m.id);
//       if (find != null){
//         let supply = this.supplies.find(x => x.supplier_id == find.supplier_id);
//         if (supply != null){
//           supplier = supply.manufacturer;
//         }
//       }
//       this.matSupplies[m.id] = supplier;
//     });
//   }
// }
