import { Component, OnInit } from '@angular/core';
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
  equipmentsNode!: TreeNode[];
  cols!: Column[];

  data:any = [];
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

  equipmentId:number = 0;
  supplierId: number = 0;


  constructor( public auth: AuthManagerService, public eqService: EquipmentsService, private dialogService: DialogService, public prService: ProjectsManagerService,
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
    this.departments = this.prService.departments.filter(x => x.visible_documents == 1 ).map(x => new LV(x.name));
    this.departments.forEach(department => {
      this.selectedDepartments.push(department.value)
    })

    this.cols = [
      { field: 'name', header: 'Name' },
      { field: 'size', header: 'Size' },
      { field: 'type', header: 'Type' }
    ];
    //this.selectedDepartments = ['System'];

    this.eqService.getEquipments().subscribe(equipments => {

      this.equipmentsNode =  [{
            key: '0',
            data: {
              name: 'Applications',
              size: '100kb',
              type: 'Folder'
            },
            children: [
              {
                key: '0-0',
                data: {
                  name: 'React',
                  size: '25kb',
                  type: 'Folder'
                },
                children: [
                  {
                    key: '0-0-0',
                    data: {
                      name: 'react.app',
                      size: '10kb',
                      type: 'Application'
                    }
                  },
                  {
                    key: '0-0-1',
                    data: {
                      name: 'native.app',
                      size: '10kb',
                      type: 'Application'
                    }
                  },
                  {
                    key: '0-0-2',
                    data: {
                      name: 'mobile.app',
                      size: '5kb',
                      type: 'Application'
                    }
                  }
                ]
              },
              {
                key: '0-1',
                data: {
                  name: 'editor.app',
                  size: '25kb',
                  type: 'Application'
                }
              },
              {
                key: '0-2',
                data: {
                  name: 'settings.app',
                  size: '50kb',
                  type: 'Application'
                }
              }
            ]
          },
        {
          key: '1',
          data: {
            name: 'Cloud',
            size: '20kb',
            type: 'Folder'
          },
          children: [
            {
              key: '1-0',
              data: {
                name: 'backup-1.zip',
                size: '10kb',
                type: 'Zip'
              }
            },
            {
              key: '1-1',
              data: {
                name: 'backup-2.zip',
                size: '10kb',
                type: 'Zip'
              }
            }
          ]
        }
        ];
      console.log(this.equipmentsNode);
      console.log(equipments);
      this.equipmentsSrc = equipments; //кладу в массив полученный с сервера

      if (this.equipmentId !=0 && this.supplierId != 0) {  //чтобы открыть editSupplier выполняем поиск по айдишникам

        let equipmentById = this.equipmentsSrc.find(eq => eq.id == this.equipmentId);
        let supplierById = equipmentById?.suppliers?.find(sup => sup.id == this.supplierId);

        this.editSupplier(equipmentById!, supplierById!);
      }

      this.filterEquipments(); //фильтрую equipments значениями по умолчанию System и NR002
      // this.parseEquipmentArrayForTree(this.equipments, 0);
    });

    this.eqService.getSfis().subscribe(sfis=>{
      this.sfis = sfis;
    });

    if (this.auth.hasPerms('create_edit_equ')) {
      this.createEqButtonAreHidden = false;
    }

    if (this.auth.hasPerms('create_edit_sup')) {
      this.createSuppButtonAreHidden = false;
    }
  }



  getProjectName(project: any) {
    let res = project.name;
    if (project.rkd != '') {
      res += ' (' + project.rkd + ')';
    }
    return res;
  }

  filterEquipments(){
    this.equipments = [...this.equipmentsSrc];
    this.equipments = this.equipments.filter(x => this.selectedProjects.includes(x.project_name));
    this.equipments = this.equipments.filter(x => this.selectedDepartments.includes(x.department));
    this.equipments.forEach((eq) => {
      //eq.suppliers?.some
      const hasApprovedSupplier = eq.suppliers?.some((supplier) =>
        supplier.status === 'Approved');
      eq.status = hasApprovedSupplier? 'Approved' : '-';
    })
  }

  parseEquipmentArrayForTree(array: any[], parentId: number) {
    interface item  {
      key : string;
      data: any;
      children: any[];
    }
    let resParsedArray: item[] = []
     array.forEach(group => {
       let item;
       if (group.parent_id === parentId) {
         // @ts-ignore
         item.data  = group;
         // @ts-ignore
         item.children = []
         // @ts-ignore
         resParsedArray.push(item)
       }
       else if (group.parent_id === 0) {

       }
     })
    console.log(resParsedArray)
  }

  projectChanged() {
    this.filterEquipments();
  }
  departmentChanged() {
    this.filterEquipments();
  }

  showSuppliersButtonIsDisabled(eq:IEquipment) {  //если у equipment нет suppliers, то делаем кнопку раскрытия списка disabled
    if (eq.suppliers?.length === 0) {
      return true;
    }
    return false;
  }

  editEquipmentButtonIsDisabled(eq:IEquipment) { //Редактировать карточку может автор или user_rights.rights = "edit_equ"
    if (eq.responsible_id === this.auth.getUser().id || this.auth.getUser().permissions.includes('edit_equ')) {
      return false;
    }
    return true;
  };

  getDateOnly(dateLong: number): string {  //преобразовать поле last_update у поставщика в человеческий вид
    if (dateLong == 0){
      return '--/--/--';
    }
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
  }


  addSupplier(eq:IEquipment) {
    //console.log('addSupplier');
    // console.log(eq)
    this.dialogService.open(AddSupplierComponent, {
      modal: true,
      showHeader: false,
      data: eq.id
    }).onClose.subscribe(()=> {  //сразу выводить на страницу
      this.eqService.getEquipments().subscribe(equips => {
        this.equipmentsSrc = equips;
        this.filterEquipments(); //фильтрую equipments значениями по умолчанию System и NR002
      });
    })
  }

  editEquipment(eq:IEquipment) {
    // console.log(eq);
    // console.log('edit equipment');
    this.dialogService.open(EditEquipmentComponent, {
      header: this.t.tr('Редактировать оборудование'),
      showHeader: false,
      modal: true,
      data: eq
    }).onClose.subscribe(closed => { //сразу выводить на страницу
      // console.log("this.eqService.setWaitingCreateFiles([])")
      this.eqService.setWaitingCreateFiles([]);
      // console.log(this.supplierService.getWaitingCreateFiles())
      // console.log(closed.code);
      if (closed.code === 1) {  // значит, что пользователь удалил оборудование в форме редактирования оборудования
        //this.filterEquipments();
        this.equipments = this.equipments.filter(eq => {
          return eq.id !== closed.data
        })
      }
      else {
        this.eqService.getEquipments().subscribe(equips => {
          this.equipmentsSrc = equips;
          this.filterEquipments(); //фильтрую equipments значениями по умолчанию System и NR002
        });
      }

    })
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

  newEquipment() {
    console.log('newEquipment')
    this.dialogService.open(CreateEquipmentComponent, {
      modal: true,
      showHeader: false
    }).onClose.subscribe(closed => { //сразу выводить на страницу
      this.eqService.setWaitingCreateFiles([]);
      if (closed != 'error'){

        this.eqService.getEquipments().subscribe(equips => {
          this.equipmentsSrc = equips;
          this.filterEquipments(); //фильтрую equipments значениями по умолчанию System и NR002
        });
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
