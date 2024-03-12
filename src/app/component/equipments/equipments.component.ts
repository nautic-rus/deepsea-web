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


@Component({
  selector: 'app-equipments',
  templateUrl: './equipments.component.html',
  styleUrls: ['./equipments.component.css']
})
export class EquipmentsComponent implements OnInit {
  data:any = [];
  projects: any[] = [];
  project = '';
  selectedProjects: string[] = [];
  departments: LV[] = [];
  selectedDepartments: string[] = [];
  equipments: IEquipment[] = [];  //массив после филтрации

  equipmentsSrc: IEquipment[] = []; //массив, который пришел с сервера
  selectedEquipment: any[] = []; // equipment по котору кликнули


  constructor( public auth: AuthManagerService, public eqService: EquipmentsService, private dialogService: DialogService, public prService: ProjectsManagerService,
               public rightService: RightService) {
  }

  ngOnInit(): void {
    this.projects = this.prService.projects;
    this.projects.forEach((x: any) => x.label = this.getProjectName(x));

    this.projects = this.projects.filter(x => this.auth.getUser().visible_projects.includes(x.name) && x.status == 0);
    this.selectedProjects = ['NR002'];

    //this.departments = this.prService.departments.map(x => new LV(x.name));
    this.departments = this.prService.departments.filter(x => x.visible_documents == 1 ).map(x => new LV(x.name));
    this.selectedDepartments = ['System'];

    this.eqService.getEquipments().subscribe(equipments => {
      this.equipmentsSrc = equipments; //кладу в массив полученный с сервера
      this.filterEquipments(); //фильтрую equipments значениями по умолчанию System и NR002
    });

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
      const hasApprovedSupplier = eq.suppliers?.some((supplier) =>
        supplier.status === 'Approved');
        eq.status = hasApprovedSupplier? 'Approved' : '-';
    })
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

  addSupplier(eq:IEquipment) {
    //console.log('addSupplier');
    console.log(eq)
    this.dialogService.open(AddSupplierComponent, {
      modal: true,
      data: eq.id
    }).onClose.subscribe(()=> {  //сразу выводить на страницу
      this.eqService.getEquipments().subscribe(equips => {
        this.equipmentsSrc = equips;
        this.filterEquipments(); //фильтрую equipments значениями по умолчанию System и NR002
      });
    })
  }

  editEquipment(eq:IEquipment) {
    console.log('edit equipment');
    this.dialogService.open(EditEquipmentComponent, {
      modal: true,
      data: eq
    }).onClose.subscribe(()=> { //сразу выводить на страницу
         this.eqService.getEquipments().subscribe(equips => {
           this.equipmentsSrc = equips;
           this.filterEquipments(); //фильтрую equipments значениями по умолчанию System и NR002
        });
    })

  }

  newEquipment() {
    console.log('newEquipment')
    this.dialogService.open(CreateEquipmentComponent, {
      modal: true,
    }).onClose.subscribe(closed => { //сразу выводить на страницу
      this.eqService.setWaitingCreateFiles([]);
      if (closed == 'success'){
        this.eqService.getEquipments().subscribe(equips => {
          this.equipmentsSrc = equips;
          this.filterEquipments(); //фильтрую equipments значениями по умолчанию System и NR002
        });
      }
    });
  }
}
