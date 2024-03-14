import { Component, OnInit } from '@angular/core';
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {Equipment} from "../../../domain/classes/equipment";
import {IEquipment} from "../../../domain/interfaces/equipments";
import {FormBuilder, Validators} from "@angular/forms";
import {EquipmentsFiles} from "../../../domain/classes/equipments-files";
import {Isfi} from "../../../domain/interfaces/sfi";
import {ProjectsManagerService} from "../../../domain/projects-manager.service";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {EquipmentsService} from "../../../domain/equipments.service";
import {EquipmentToDB} from "../../../domain/classes/equipment-to-db";
import {AddEquipmentFilesComponent} from "../add-equipment-files/add-equipment-files.component";
import {Observable} from "rxjs";

@Component({
  selector: 'app-edit-equipment',
  templateUrl: './edit-equipment.component.html',
  styleUrls: ['./edit-equipment.component.css']
})
export class EditEquipmentComponent implements OnInit {
  equipmentForm = this.formBuilder.group({
    id: this.dialogConfig.data.id,
    sfi: this.dialogConfig.data.sfi,
    project: this.dialogConfig.data.project_name,
    department: this.dialogConfig.data.department,
    name: this.dialogConfig.data.name,
    description: this.dialogConfig.data.description,
    comment: this.dialogConfig.data.comment,
  });

  equipmentProjects: string[] = [];
  equipmentProject = '-';
  equipmentDepartments: string[] = [];

  equipmentFilesSrc: EquipmentsFiles[] = [];
  equipmentFiles: EquipmentsFiles[] = [];
  fileArray: any[] =[];

  sfis: Isfi[] = [];
  constructor(protected dialogConfig: DynamicDialogConfig, private formBuilder: FormBuilder, public prService: ProjectsManagerService, public auth: AuthManagerService,
              public eqService: EquipmentsService, public ref: DynamicDialogRef,  private dialogService: DialogService) {
    this.eqService.deleteEquipmentFile(25);
    // this.eqService.getEquipmentFiles(this.dialogConfig.data.id).subscribe(file => {
    //   this.equipmentFiles.push(file);
    //   console.log('this.equipmentFiles');
    //   console.log(this.equipmentFiles);
    // });
    //console.log(eqService.getEquipmentFiles(this.equipmentForm.value.id));
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

    this.eqService.getEquipmentFiles(this.dialogConfig.data.id).subscribe(res => {
      this.equipmentFilesSrc = res;
      //console.log(file);
      // this.equipmentFiles.push(file);
      // console.log('this.equipmentFiles');
      // console.log(this.equipmentFiles[0]);
      //this.fileArray = this.equipmentFiles[0];
    });

  }

  addFiles() {
    const dialog = this.dialogService.open(AddEquipmentFilesComponent, {
      header: 'Uploading files',
      modal: true,
      data: {
        service: this.eqService,
        equ_id: this.equipmentForm.value.id,
      }
    })
    dialog.onClose.subscribe(() => {
      this.eqService.getCreateFiles().forEach(file => {
        this.equipmentFiles.push(file);
        this.equipmentFilesSrc.push(file);
      })
      this.eqService.setCreateFiles([]);
      //this.equipmentFiles = this.eqService.getCreateEqFiles();
      console.log('closed uploading files');
      console.log(this.equipmentFiles);
    })
  }

  getFileExtensionIcon(fileUrl: string) {
    const fileName = this.extractFileName(fileUrl);
    switch (fileName.toLowerCase().split('.').pop()) {
      case 'pdf':
        return 'pdf.svg';
      case 'dwg':
        return 'dwg.svg';
      case 'xls':
        return 'xls.svg';
      case 'xlsx':
        return 'xls.svg';
      case 'doc':
        return 'doc.svg';
      case 'docx':
        return 'doc.svg';
      case 'png':
        return 'png.svg';
      case 'jpg':
        return 'jpg.svg';
      case 'txt':
        return 'txt.svg';
      case 'zip':
        return 'zip.svg';
      case 'mp4':
        return 'mp4.svg';
      default:
        return 'file.svg';
    }
  }

  trimFileName(fileUrl: string, length: number = 10): string {
    const fileName = this.extractFileName(fileUrl);
    let split = fileName.split('.');
    let name = split[0];
    let extension = split[1];
    if (name.length > length) {
      return name.substr(0, length - 2) + '..' + name.substr(name.length - 2, 2) + '.' + extension;
    } else {
      return fileName;
    }
  }

  extractFileName(fileUrl: string): string {
    const parts = fileUrl.split('/');
    return parts[parts.length - 1];
  }

  deleteFile(file: EquipmentsFiles) {
    console.log('deleteFile');
    console.log(file);
    this.equipmentFiles.splice(this.equipmentFiles.indexOf(file), 1);
    this.eqService.deleteEquipmentFile(file.id)
      .subscribe(
        () => {
          console.log('Файд оборудования  удален успешно');
          this.close();
        },
        error => {
          console.error('Ошибка при удалении файла оборудования');
        }
      );
    //console.log(file.id);
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
    eqToDB.description = eqFormValue.description;
    eqToDB.sfi = eqFormValue.sfi;
    eqToDB.project_id = this.findProjectId(eqFormValue.project);
    eqToDB.responsible_id = this.auth.getUser().id;
    eqToDB.department_id = this.findDepartmentId(eqFormValue.department);
    eqToDB.comment = eqFormValue.comment;
    console.warn(this.equipmentForm.value);
    console.log(JSON.stringify(eqToDB));

    this.eqService.addEquipment(JSON.stringify(eqToDB)).subscribe(res => {  //добавить изменения оборудования в бд
      console.log(eqToDB);
      console.log('res');
      console.log(res);
      //this.eqService.setEqID(res.)
      if (res.includes('error')){
        alert(res);
      }
      else{
        this.equipmentForm.reset();
        this.ref.close(res);
      }
    });
    console.log('edit eq + this.equipmentFiles');
    console.log(this.equipmentFiles);

    //добавляем файлы в БД
    this.equipmentFiles.forEach(file => { //добавляем файлы в БД
      console.log(JSON.stringify(file));
      this.eqService.addEquipmentFiles(JSON.stringify(file)).subscribe(res => {
        if (res.includes('error')){
          alert(res);
        }
        else{
          this.ref.close(res);
        }
      })
    })
  }


  deleteEquipment(eqId: number) {
    console.log('delete eq with id = ' + eqId);
    this.eqService.deleteEquipment(eqId)
      .subscribe(
        () => {
          console.log('Оборудование удалено успешно');
          this.close();
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
