import { Component, OnInit } from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {Equipment} from "../../../domain/classes/equipment";
import {IEquipment, ISuppliersInEq} from "../../../domain/interfaces/equipments";
import {FormBuilder, Validators} from "@angular/forms";
import {EquipmentsFiles} from "../../../domain/classes/equipments-files";
import {Isfi} from "../../../domain/interfaces/sfi";
import {ProjectsManagerService} from "../../../domain/projects-manager.service";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {EquipmentsService} from "../../../domain/equipments.service";
import {EquipmentToDB} from "../../../domain/classes/equipment-to-db";

@Component({
  selector: 'app-edit-equipment',
  templateUrl: './edit-equipment.component.html',
  styleUrls: ['./edit-equipment.component.css']
})
export class EditEquipmentComponent implements OnInit {
  equipmentForm = this.formBuilder.group({
    id: this.dialogConfig.data.id,
    sfi: this.dialogConfig.data.sfi.toString(),
    project: this.dialogConfig.data.project_name,
    department: this.dialogConfig.data.department,
    name: this.dialogConfig.data.name,
    description: this.dialogConfig.data.description,
    comment: this.dialogConfig.data.comment,
  });

  equipment: IEquipment = {
    id: 0,
    sfi: 0,
    name: '',
    department: '',
    comment: '',
    respons_name: '',
    respons_surname: '',
    itt: 0,
    project_name: '',
    status: '',
  };

  equipmentProjects: string[] = [];
  equipmentProject = '-';
  equipmentDepartments: string[] = [];

  equipmentFiles: EquipmentsFiles[] = [];

  sfis: Isfi[] = [];
  constructor(protected dialogConfig: DynamicDialogConfig, private formBuilder: FormBuilder, public prService: ProjectsManagerService, public auth: AuthManagerService,
              public eqService: EquipmentsService, public ref: DynamicDialogRef) {
    console.log(this.dialogConfig.data.sfi);
  }

  ngOnInit(): void {
    this.eqService.getSfis().subscribe(sfis=>{
      this.sfis = sfis;
    });
    this.equipmentProjects = this.prService.projects.map((x: any) => x.name).filter(x => x != '' && this.auth.getUser().visible_projects.includes(x));
    if (this.equipmentProjects.length > 0 && this.equipmentProject == '-') {
      this.equipmentProject = this.equipmentProjects[0];
    }
    this.equipmentDepartments = this.prService.departments.map((x: any) => x.name);
  }

  findProjectId(project_name: string) {
    const project = this.prService.projects.find(project => project.name === project_name);
    return project? project.id : undefined;
  }

  findDepartmentId(department_name: string) {
    const department = this.prService.departments.find(department => department.name === department_name);
    return department? department.id : undefined;
  }

  editEquipment() {
    const eqFormValue = this.equipmentForm.value;
    const eqToDB = new EquipmentToDB();
    eqToDB.id = eqFormValue.id;
    eqToDB.name = eqFormValue.name;
    if (this.equipmentForm.value.description === null) {
      eqToDB.description = '';
    }
    eqToDB.sfi = eqFormValue.sfi;
    eqToDB.project_id = this.findProjectId(eqFormValue.project);
    eqToDB.responsible_id = this.auth.getUser().id;
    eqToDB.department_id = this.findDepartmentId(eqFormValue.department);
    eqToDB.comment = eqFormValue.comment;
    console.warn(this.equipmentForm.value);
    console.log(JSON.stringify(eqToDB));

    this.eqService.addEquipment(JSON.stringify(eqToDB)).subscribe(res => {
      console.log('res');
      console.log(res);
      //this.eqService.setEqID(res.)
      if (res.includes('error')){
        alert(res);
      }
      else{
        this.ref.close(res);
      }
    });

    this.equipmentForm.reset();
    // console.log(this.dialogConfig.data)
    // const editEq = new EquipmentToDB();
    // editEq.id = this.dialogConfig.data.id;
    // editEq.name = this.equipmentForm.value.name;
    // if (this.equipmentForm.value.description === null) {
    //   editEq.description = '';
    // }
    // editEq.sfi = parseInt(this.equipmentForm.value.sfi);
    // //editEq.project_id = this.equipmentForm.value.project;
    // editEq.responsible_id = this.auth.getUser().id;
    // //editEq.department_id = this.equipmentForm.value.department_id;
    // editEq.comment = this.equipmentForm.value.comment;
    //
    //
    // editEq.project_id = this.findProjectId(this.equipmentForm.value.project);
    // editEq.department_id = this.findDepartmentId(this.equipmentForm.value.department);
    // //console.log(this.equipmentForm.value.department_id);
    //
    // this.eqService.addEquipment(JSON.stringify(editEq)).subscribe(res => {
    //   console.log('res');
    //   console.log(res);
    //   if (res.includes('error')){
    //     alert(res);
    //   }
    //   else{
    //     this.ref.close(res);
    //   }
    // });
    //
    // console.log(editEq);
  }

  deleteEquipment(eqId: number) {
    console.log('delete eq with id = ' + eqId);
    this.eqService.deleteEquipment(eqId)
      .subscribe(
        () => {
          console.log('Оборудование удалено успешно');
        },
        error => {
          console.error('Ошибка при удалении оборудования');
        }
      );
  }

  close() {
    this.equipmentForm.reset();
    this.ref.close();
  }

}
