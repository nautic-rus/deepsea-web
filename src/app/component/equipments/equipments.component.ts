import { Component, OnInit } from '@angular/core';
import {LV} from "../../domain/classes/lv";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {EquipmentsService} from "../../domain/equipments.service";
import {IEquipment} from "../../domain/interfaces/equipments";
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import {CreateEquipmentComponent} from "./create-equipment/create-equipment.component";
import {dataApp} from "../../domain/classes/dataApp";
import {Project} from "../../domain/classes/project";
import {ProjectsManagerService} from "../../domain/projects-manager.service";


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
  constructor( public auth: AuthManagerService, public eqService: EquipmentsService, private dialogService: DialogService, public prService: ProjectsManagerService) {
  }

  ngOnInit(): void {
    this.projects = this.prService.projects;
    this.projects.forEach((x: any) => x.label = this.getProjectName(x));
    this.projects = this.projects.filter(x => this.auth.getUser().visible_projects.includes(x.name));
    this.selectedProjects = ['NR002'];

    this.departments = this.prService.departments.filter(x => x.visible_task == 1).map(x => new LV(x.name));
    this.selectedDepartments = ['System'];

    this.eqService.getEquipments().subscribe(equipments => {
      this.equipmentsSrc = equipments; //кладу в массив полученный с сервера
      this.filterEquipments(); //фильтрую equipments значениями по умолчанию System и NR002
    });
    // this.data = new dataApp();
    // const Projects =  this.eqService.getEquipmentsProjects().then(projects => {
    //     this.data.setProjects(projects);
    //     console.log(this.data);
    // })
    // const Departments =  this.eqService.getEquipmentsDepartments().subscribe(departments => {
    //   this.data.setDepartments(departments)
    //   console.log(this.data);
    // })
    // this.eqService.getEquipmentsProjects().then(projects => {
    //   this.projects = projects;
    //   this.projects.forEach((x: any) => x.label = this.getProjectName(x));
    //   this.projects = this.projects.filter(x => this.auth.getUser().visible_projects.includes(x.name));
    //   this.selectedProjects = ['NR002'];
    // });
    // this.eqService.getEquipmentsDepartments().subscribe(departments => {
    //   this.departments = departments.filter(x => x.visible_task == 1).map(x => new LV(x.name));
    //   this.selectedDepartments = ['System'];
    // });
    // this.eqService.getEquipments().subscribe(equipments => {
    //   this.equipmentsSrc = equipments; //кладу в массив полученный с сервера
    //   this.filterEquipments(); //фильтрую equipments значениями по умолчанию System и NR002
    // });
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
    console.log(this.equipments);
    this.equipments.forEach((eq) => {
      const hasApprovedSupplier = eq.suppliers?.some((supplier) =>
        supplier.status === 'Approved');
        eq.status = hasApprovedSupplier? 'Approved' : '-';
    })
    console.log(this.equipments)
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

  newEquipment() {
    console.log('newEquipment')
    this.dialogService.open(CreateEquipmentComponent, {
      modal: true,
    })
  }
}
