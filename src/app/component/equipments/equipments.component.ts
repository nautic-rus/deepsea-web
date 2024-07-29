import {Component, OnInit, ViewChild} from '@angular/core';
import {LV} from "../../domain/classes/lv";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {EquipmentsService} from "../../domain/equipments.service";
import {IEquipment} from "../../domain/interfaces/equipments";
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import {CreateEquipmentComponent} from "./create-equipment/create-equipment.component";
import {ProjectsManagerService} from "../../domain/projects-manager.service";
import {AddSupplierComponent} from "./add-supplier/add-supplier.component";
import {EditEquipmentComponent} from "./edit-equipment/edit-equipment.component";
import {RightService} from "../admin/right/right.service";
import {ISupplier} from "../../domain/interfaces/supplier";
import {EditSupplierComponent} from "./edit-supplier/edit-supplier.component";
import {CloseCode} from "../../domain/classes/close-code";
import {SupplierService} from "../../domain/supplier.service";
import {Isfi} from "../../domain/interfaces/sfi";
import {LanguageService} from "../../domain/language.service";
import {ActivatedRoute, Router} from "@angular/router";
import {IssueManagerService} from "../../domain/issue-manager.service";
import { TreeNode } from 'primeng/api';
import _ from "underscore";
import {CreateGroupComponent} from "./create-group/create-group.component";
import {EditGroupComponent} from "./edit-group/edit-group.component";
import {TreeTable} from "primeng/treetable";

interface Column {
  field: string;
  header: string;
}

@Component({
  selector: 'app-equipments',
  templateUrl: './equipments.component.html',
  styleUrls: ['./equipments.component.css']
})



export class EquipmentsComponent implements OnInit {
  editGroupSidebarVisible = false; //cлужит для отображения сайдбара с формой редактирования группы (вылезет при клике на группу)
  editEqSidebarVisible = false; //cлужит для отображения сайдбара с формой редактирования группы (вылезет при клике на группу)

  selectedEq: any;
  selectedGroup: IEquipment | undefined;


  equipmentsNode!: TreeNode[];
  cols!: any[];
  filterMode = 'Strict'
  @ViewChild('tt') treeTable!: TreeTable;

  data: any = [];
  projects: any[] = [];
  project = '';
  selectedProjects: string[] = [];
  departments: LV[] = [];
  selectedDepartments: string[] = [];
  equipments: IEquipment[] = [];  //массив после филтрации

  equipmentsSrc: IEquipment[] = []; //массив, который пришел с сервера

  sfis: Isfi[] = [];

  createEqButtonAreHidden = true;
  createSuppButtonAreHidden = true;

  equipmentId: number = 0;
  supplierId: number = 0;


  constructor(public auth: AuthManagerService, public eqService: EquipmentsService, private dialogService: DialogService, public prService: ProjectsManagerService,
              private supplierService: SupplierService, public t: LanguageService, private route: ActivatedRoute, private router: Router, public issueManager: IssueManagerService) {

    route.queryParams.subscribe(params => {
      if (params['equipmentId'] && params['supplierId']) {
        this.equipmentId = params.equipmentId
        this.supplierId = params.supplierId
      }
    });
  }

  ngOnInit(): void {
    this.projects = this.prService.projects;
    this.projects.forEach((x: any) => x.label = this.getProjectName(x));

    this.projects = this.projects.filter(x => this.auth.getUser().visible_projects.includes(x.name) && x.status == 0);
    this.projects.forEach(project => {
      this.selectedProjects.push(project.name);
    })

    //this.departments = this.prService.departments.map(x => new LV(x.name));
    this.departments = this.prService.departments.filter(x => x.visible_documents == 1).map(x => new LV(x.name));
    this.departments.forEach(department => {
      this.selectedDepartments.push(department.value)
    })


    this.cols = [
      {field: '', header: '', width: '3rem'},
      {field: 'id', header: 'ID', width: '5rem'},
      {field: 'sfi', header: 'SFI-Group', width: '8rem'},
      {field: 'name', header: 'Name' , width: '15rem'},
      {field: 'sfi_unit', header: 'SFI-Unit', width: '8rem'},

      {field: 'status', header: 'Status', width: '7rem' },
      {field: 'respons_surname', header: 'Responsible', width: '10rem'},
      {field: 'itt', header: 'ITT', width: '5rem'},
      {field: 'comment', header: 'Comment', width: '20rem'},
      {field: '', header: '', width: '10rem'},
    ];
    //this.selectedDepartments = ['System'];

    this.eqService.getEquipments().subscribe(equipments => {
      // console.log(equipments)
      this.equipmentsNode = []
      this.equipmentsSrc = equipments; //кладу в массив полученный с сервера
      console.log("equipments");
      console.log(equipments);

      if (this.equipmentId != 0 && this.supplierId != 0) {  //чтобы открыть editSupplier выполняем поиск по айдишникам

        let equipmentById = this.equipmentsSrc.find(eq => eq.id == this.equipmentId);
        let supplierById = equipmentById?.suppliers?.find(sup => sup.id == this.supplierId);

        this.editSupplier(equipmentById!, supplierById!);
      }

      this.filterEquipments(); //фильтрую equipments значениями по умолчанию System и NR002

      // let resParsedArray: any[] = []
      // this.equipmentsNode = this.parseEquipmentArrayForTree(this.equipments, 0, this.equipmentsNode);
      //  console.log(this.equipmentsNode)
    });

    this.eqService.getSfis().subscribe(sfis => {
      this.sfis = sfis;
    });

    if (this.auth.hasPerms('create_edit_equ')) {
      this.createEqButtonAreHidden = false;
    }

    if (this.auth.hasPerms('create_edit_sup')) {
      this.createSuppButtonAreHidden = false;
    }
  }

  applyGlobalFilter(filterValue: string) {
    console.log(filterValue)
    this.treeTable.filterGlobal(filterValue, 'contains');
  }

  getProjectName(project: any) {
    let res = project.name;
    if (project.rkd != '') {
      res += ' (' + project.rkd + ')';
    }
    return res;
  }

  filterEquipments() {
    this.equipmentsNode = []
    // this.equipmentsNode = this.equipmentsNode.filter(x => this.selectedProjects.includes(x.data.project_name))
    this.equipments = [...this.equipmentsSrc];
    this.equipments = this.equipments.filter(x => this.selectedProjects.includes(x.project_name));
    this.equipments = this.equipments.filter(x => this.selectedDepartments.includes(x.department));
    this.equipmentsNode = this.parseEquipmentArrayForTree(this.equipments, 0, this.equipmentsNode)
    // this.equipmentsNode = this.equipmentsNode.filter(x => {
    //   //x.data.id = 115
    // })
    // console.log(this.equipmentsNode)
    this.equipments.forEach((eq) => {
      //eq.suppliers?.some
      const hasApprovedSupplier = eq.suppliers?.some((supplier) =>
        supplier.status === 'Approved');
      eq.status = hasApprovedSupplier ? 'Approved' : '-';
    })
  }


  parseEquipmentArrayForTree(rootNodes: any[], parent_id: number, resParsedArray: any[]) {
    rootNodes.filter(x => x.parent_id == parent_id).forEach(n => {
      let nodes = this.parseEquipmentArrayForTree(rootNodes, n.id, []);
      resParsedArray.push({
        data: n,
        children: nodes,
        clicked: false,
      })
    })
    return resParsedArray
  }

  // filterEquipments(){
  //   this.equipments = [...this.equipmentsSrc];
  //   this.equipments = this.equipments.filter(x => this.selectedProjects.includes(x.project_name));
  //   this.equipments = this.equipments.filter(x => this.selectedDepartments.includes(x.department));
  //   this.equipments.forEach((eq) => {
  //     //eq.suppliers?.some
  //     const hasApprovedSupplier = eq.suppliers?.some((supplier) =>
  //       supplier.status === 'Approved');
  //     eq.status = hasApprovedSupplier? 'Approved' : '-';
  //   })
  // }



  projectChanged() {
    this.filterEquipments();
  }

  departmentChanged() {
    this.filterEquipments();
  }

  showSuppliersButtonIsDisabled(eq: IEquipment) {  //если у equipment нет suppliers, то делаем кнопку раскрытия списка disabled
    if (eq.suppliers?.length === 0) {
      return true;
    }
    return false;
  }

  editEquipmentButtonIsDisabled(eq: IEquipment) { //Редактировать карточку может автор или user_rights.rights = "edit_equ"
    if (eq.responsible_id === this.auth.getUser().id || this.auth.getUser().permissions.includes('edit_equ')) {
      return false;
    }
    return true;
  };

  getDateOnly(dateLong: number): string {  //преобразовать поле last_update у поставщика в человеческий вид
    if (dateLong == 0) {
      return '--/--/--';
    }
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
  }


  addSupplier(eq: IEquipment) {
    this.dialogService.open(AddSupplierComponent, {
      modal: true,
      showHeader: false,
      data: eq.id
    }).onClose.subscribe(() => {  //сразу выводить на страницу
      this.closeSideBar();  //обновим
    })
  }

  openSidebar(data: any, dataGroup: any) {
    if (data.parent_id == 0) {
      this.editGroupSidebarVisible = true
      this.selectedEq = data
    } else if (data.parent_id != 0) {
      this.selectedGroup = dataGroup.node.parent.data
      this.selectedEq = data
      this.editEqSidebarVisible = true
    }
  }


  closeSideBar() {
    const expandedStates = this.equipmentsNode.map (obj => obj.expanded)  //для определения и сохраниения раскрытых (объектов где expanded = true)

    this.editGroupSidebarVisible = false;
    this.editEqSidebarVisible = false;
    this.selectedGroup = undefined;
    this.selectedEq = undefined;
    this.eqService.getEquipments().subscribe(equipments => {
      this.equipmentsNode = []
      this.equipmentsSrc = equipments; //кладу в массив полученный с сервера

       this.filterEquipments(); //фильтрую equipments значениями по умолчанию System и NR002

      this.equipmentsNode.forEach((obj, index) => {  //проверяем с сохраненным состояние раскрытых и если что добавляем  obj.expanded = true
        if (expandedStates[index]) {
          obj.expanded = true
        }
      })
      console.log(this.equipmentsNode)
    });
  }

  editSupplier(eq: IEquipment, supplier: ISupplier) {
    // console.log(supplier, eq);
    this.dialogService.open(EditSupplierComponent, {
      header: this.t.tr('Редактировать поставщика'),
      showHeader: false,
      width: '100vh',
      // height: '100wh',
      modal: true,
      data: {
        eq: eq,
        supplier: supplier
      },
      styleClass: 'SUPP'
    }).onClose.subscribe(closed => { //сразу выводить на страницу изменения после редактирования supplier
      this.supplierService.setWaitingCreateFiles([]);
      if (closed.code === 1 ) {   // значит, что пользователь удалил поставщика в форме редактирования поставщика
        eq.suppliers = eq.suppliers?.filter(sup => { return sup.id != closed.data})
      }
      else {
        this.eqService.getEquipments().subscribe(equips => {
          this.equipmentsSrc = equips;
          this.filterEquipments(); //фильтрую equipments значениями по умолчанию System и NR002
        });
      }
      this.supplierService.setWaitingCreateFiles([]);
      this.router.navigate(['.'], { relativeTo: this.route });
    })
  }

  newGroup() {
    console.log('newEquipment')
    this.dialogService.open(CreateGroupComponent, {
      modal: true,
      showHeader: false
    }).onClose.subscribe(closed => { //сразу выводить на страницу
       if (closed != 'error'){
         this.closeSideBar()  //обновляем с сервера список всего оборудования
      } else {
        console.log('newEq error');
      }
    });
  }
  newEquipment(parent: IEquipment) {
    console.log('newEquipment')
    console.log(parent)
    this.dialogService.open(CreateEquipmentComponent, {
      modal: true,
      showHeader: false,
      data: {parent: parent},
    }).onClose.subscribe(closed => { //сразу выводить на страницу
      this.eqService.setWaitingCreateFiles([]);
      if (closed != 'error'){
        this.closeSideBar()
        // this.eqService.getEquipments().subscribe(equips => {
        //   this.equipmentsSrc = equips;
        //   this.filterEquipments(); //фильтрую equipments значениями по умолчанию System и NR002
        // });
      } else {
        console.log('newEq error');
      }
    });
  }

}


// import { Component, OnInit } from '@angular/core';
// import {LV} from "../../domain/classes/lv";
// import {AuthManagerService} from "../../domain/auth-manager.service";
// import {EquipmentsService} from "../../domain/equipments.service";
// import {IEquipment} from "../../domain/interfaces/equipments";
// import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
// import {CreateEquipmentComponent} from "./create-equipment/create-equipment.component";
// import {ProjectsManagerService} from "../../domain/projects-manager.service";
// import {AddSupplierComponent} from "./add-supplier/add-supplier.component";
// import {EditEquipmentComponent} from "./edit-equipment/edit-equipment.component";
// import {RightService} from "../admin/right/right.service";
// import {ISupplier} from "../../domain/interfaces/supplier";
// import {EditSupplierComponent} from "./edit-supplier/edit-supplier.component";
// import {CloseCode} from "../../domain/classes/close-code";
// import {SupplierService} from "../../domain/supplier.service";
// import {Isfi} from "../../domain/interfaces/sfi";
// import {LanguageService} from "../../domain/language.service";
// import {ActivatedRoute, Router} from "@angular/router";
// import {IssueManagerService} from "../../domain/issue-manager.service";
// import { TreeNode } from 'primeng/api';
//
//
// @Component({
//   selector: 'app-equipments',
//   templateUrl: './equipments.component.html',
//   styleUrls: ['./equipments.component.css']
// })
// export class EquipmentsComponent implements OnInit {
//   equipmentsNode!: TreeNode[];
//
//   data:any = [];
//   projects: any[] = [];
//   project = '';
//   selectedProjects: string[] = [];
//   departments: LV[] = [];
//   selectedDepartments: string[] = [];
//   equipments: IEquipment[] = [];  //массив после филтрации
//
//   equipmentsSrc: IEquipment[] = []; //массив, который пришел с сервера
//
//   sfis: Isfi[] = [];
//
//   createEqButtonAreHidden = true;
//   createSuppButtonAreHidden = true;
//
//   equipmentId:number = 0;
//   supplierId: number = 0;
//
//
//   constructor( public auth: AuthManagerService, public eqService: EquipmentsService, private dialogService: DialogService, public prService: ProjectsManagerService,
//                private supplierService: SupplierService, public t: LanguageService, private route: ActivatedRoute, private router: Router, public issueManager: IssueManagerService) {
//
//     route.queryParams.subscribe(params => {
//       if (params['equipmentId'] && params['supplierId']) {
//         this.equipmentId = params.equipmentId
//         this.supplierId = params.supplierId
//       }
//     });
//   }
//
//   ngOnInit(): void {
//     this.projects = this.prService.projects;
//     this.projects.forEach((x: any) => x.label = this.getProjectName(x));
//
//     this.projects = this.projects.filter(x => this.auth.getUser().visible_projects.includes(x.name) && x.status == 0);
//     this.projects.forEach(project => {
//       this.selectedProjects.push(project.name);
//     })
//
//     //this.departments = this.prService.departments.map(x => new LV(x.name));
//     this.departments = this.prService.departments.filter(x => x.visible_documents == 1 ).map(x => new LV(x.name));
//     this.departments.forEach(department => {
//       this.selectedDepartments.push(department.value)
//     })
//     //this.selectedDepartments = ['System'];
//
//     this.eqService.getEquipments().subscribe(equipments => {
//
//       this.equipmentsNode =  [{
//         key: '0',
//         label: 'Documents',
//         data: 'Documents Folder',
//         icon: 'pi pi-fw pi-inbox',
//         children: [
//           {
//             key: '0-0',
//             label: 'Work',
//             data: 'Work Folder',
//             icon: 'pi pi-fw pi-cog',
//             children: [
//               { key: '0-0-0', label: 'Expenses.doc', icon: 'pi pi-fw pi-file', data: 'Expenses Document' },
//               { key: '0-0-1', label: 'Resume.doc', icon: 'pi pi-fw pi-file', data: 'Resume Document' }
//             ]
//           },
//           {
//             key: '0-1',
//             label: 'Home',
//             data: 'Home Folder',
//             icon: 'pi pi-fw pi-home',
//             children: [{ key: '0-1-0', label: 'Invoices.txt', icon: 'pi pi-fw pi-file', data: 'Invoices for this month' }]
//           }
//         ]
//       },
//         {
//           key: '1',
//           label: 'Events',
//           data: 'Events Folder',
//           icon: 'pi pi-fw pi-calendar',
//           children: [
//             { key: '1-0', label: 'Meeting', icon: 'pi pi-fw pi-calendar-plus', data: 'Meeting' },
//             { key: '1-1', label: 'Product Launch', icon: 'pi pi-fw pi-calendar-plus', data: 'Product Launch' },
//             { key: '1-2', label: 'Report Review', icon: 'pi pi-fw pi-calendar-plus', data: 'Report Review' }
//           ]
//         }];
//       console.log(equipments);
//       this.equipmentsSrc = equipments; //кладу в массив полученный с сервера
//
//       if (this.equipmentId !=0 && this.supplierId != 0) {  //чтобы открыть editSupplier выполняем поиск по айдишникам
//
//         let equipmentById = this.equipmentsSrc.find(eq => eq.id == this.equipmentId);
//         let supplierById = equipmentById?.suppliers?.find(sup => sup.id == this.supplierId);
//
//         this.editSupplier(equipmentById!, supplierById!);
//       }
//
//       this.filterEquipments(); //фильтрую equipments значениями по умолчанию System и NR002
//     });
//
//     this.eqService.getSfis().subscribe(sfis=>{
//       this.sfis = sfis;
//     });
//
//     if (this.auth.hasPerms('create_edit_equ')) {
//       this.createEqButtonAreHidden = false;
//     }
//
//     if (this.auth.hasPerms('create_edit_sup')) {
//       this.createSuppButtonAreHidden = false;
//     }
//   }
//
//   getProjectName(project: any) {
//     let res = project.name;
//     if (project.rkd != '') {
//       res += ' (' + project.rkd + ')';
//     }
//     return res;
//   }
//
//   filterEquipments(){
//     this.equipments = [...this.equipmentsSrc];
//     this.equipments = this.equipments.filter(x => this.selectedProjects.includes(x.project_name));
//     this.equipments = this.equipments.filter(x => this.selectedDepartments.includes(x.department));
//     this.equipments.forEach((eq) => {
//       //eq.suppliers?.some
//       const hasApprovedSupplier = eq.suppliers?.some((supplier) =>
//         supplier.status === 'Approved');
//         eq.status = hasApprovedSupplier? 'Approved' : '-';
//     })
//   }
//
//   projectChanged() {
//     this.filterEquipments();
//   }
//   departmentChanged() {
//     this.filterEquipments();
//   }
//
//   showSuppliersButtonIsDisabled(eq:IEquipment) {  //если у equipment нет suppliers, то делаем кнопку раскрытия списка disabled
//     if (eq.suppliers?.length === 0) {
//       return true;
//     }
//     return false;
//   }
//
//   editEquipmentButtonIsDisabled(eq:IEquipment) { //Редактировать карточку может автор или user_rights.rights = "edit_equ"
//     if (eq.responsible_id === this.auth.getUser().id || this.auth.getUser().permissions.includes('edit_equ')) {
//       return false;
//     }
//     return true;
//   };
//
//   getDateOnly(dateLong: number): string {  //преобразовать поле last_update у поставщика в человеческий вид
//     if (dateLong == 0){
//       return '--/--/--';
//     }
//     let date = new Date(dateLong);
//     return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
//   }
//
//
//   addSupplier(eq:IEquipment) {
//     //console.log('addSupplier');
//     // console.log(eq)
//     this.dialogService.open(AddSupplierComponent, {
//       modal: true,
//       showHeader: false,
//       data: eq.id
//     }).onClose.subscribe(()=> {  //сразу выводить на страницу
//       this.eqService.getEquipments().subscribe(equips => {
//         this.equipmentsSrc = equips;
//         this.filterEquipments(); //фильтрую equipments значениями по умолчанию System и NR002
//       });
//     })
//   }
//
//   editEquipment(eq:IEquipment) {
//     // console.log(eq);
//     // console.log('edit equipment');
//     this.dialogService.open(EditEquipmentComponent, {
//       header: this.t.tr('Редактировать оборудование'),
//       showHeader: false,
//       modal: true,
//       data: eq
//     }).onClose.subscribe(closed => { //сразу выводить на страницу
//       // console.log("this.eqService.setWaitingCreateFiles([])")
//       this.eqService.setWaitingCreateFiles([]);
//       // console.log(this.supplierService.getWaitingCreateFiles())
//       // console.log(closed.code);
//       if (closed.code === 1) {  // значит, что пользователь удалил оборудование в форме редактирования оборудования
//         //this.filterEquipments();
//         this.equipments = this.equipments.filter(eq => {
//           return eq.id !== closed.data
//         })
//       }
//       else {
//         this.eqService.getEquipments().subscribe(equips => {
//           this.equipmentsSrc = equips;
//           this.filterEquipments(); //фильтрую equipments значениями по умолчанию System и NR002
//         });
//       }
//
//     })
//   }
//
//   editSupplier(eq: IEquipment, supplier: ISupplier) {
//     // console.log(supplier, eq);
//     this.dialogService.open(EditSupplierComponent, {
//       header: this.t.tr('Редактировать поставщика'),
//       showHeader: false,
//       width: '100vh',
//       // height: '100wh',
//       modal: true,
//       data: {
//         eq: eq,
//         supplier: supplier
//       },
//     }).onClose.subscribe(closed => { //сразу выводить на страницу изменения после редактирования supplier
//       this.supplierService.setWaitingCreateFiles([]);
//       if (closed.code === 1 ) {   // значит, что пользователь удалил поставщика в форме редактирования поставщика
//         eq.suppliers = eq.suppliers?.filter(sup => { return sup.id != closed.data})
//       }
//       else {
//         this.eqService.getEquipments().subscribe(equips => {
//           this.equipmentsSrc = equips;
//           this.filterEquipments(); //фильтрую equipments значениями по умолчанию System и NR002
//         });
//       }
//       this.supplierService.setWaitingCreateFiles([]);
//       this.router.navigate(['.'], { relativeTo: this.route });
//     })
//   }
//
//   newEquipment() {
//     console.log('newEquipment')
//     this.dialogService.open(CreateEquipmentComponent, {
//       modal: true,
//       showHeader: false
//     }).onClose.subscribe(closed => { //сразу выводить на страницу
//       this.eqService.setWaitingCreateFiles([]);
//       if (closed != 'error'){
//
//         this.eqService.getEquipments().subscribe(equips => {
//           this.equipmentsSrc = equips;
//           this.filterEquipments(); //фильтрую equipments значениями по умолчанию System и NR002
//         });
//       } else {
//         console.log('newEq error');
//       }
//     });
//   }
// }
