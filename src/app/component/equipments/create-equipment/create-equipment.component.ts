import {Component, OnInit} from '@angular/core';
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {FormBuilder, Validators} from '@angular/forms';
import {EquipmentsService} from "../../../domain/equipments.service";
import {ProjectsManagerService} from "../../../domain/projects-manager.service";
import {FileAttachment} from "../../../domain/classes/file-attachment";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import { TreeSelectModule } from 'primeng/treeselect';
import { DropdownModule } from 'primeng/dropdown';
import {EquipmentToDB} from "../../../domain/classes/equipment-to-db";
import {Isfi} from "../../../domain/interfaces/sfi";

@Component({
  selector: 'app-create-equipment',
  templateUrl: './create-equipment.component.html',
  styleUrls: ['./create-equipment.component.css']
})
export class CreateEquipmentComponent implements OnInit {
  equipmentForm = this.formBuilder.group({
    sfi: [''],
    project: ['', Validators.required],
    department: [''],
    name: [''],
    description: [''],
    commentText: [''],
  });
  equipmentProjects: string[] = [];
  equipmentProject = '-';
  equipmentDepartments: string[] = [];

  sfis: Isfi[] = [];

  //для работы с файлами
  dragOver = false;
  loaded: FileAttachment[] = [];
  awaitForLoad: string[] = [];



  constructor( public prService: ProjectsManagerService, public auth: AuthManagerService, private formBuilder: FormBuilder, public issues: IssueManagerService,
               public ref: DynamicDialogRef, public eqService: EquipmentsService) {
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


  onFilesDrop(event: DragEvent) {
    event.preventDefault();
    // @ts-ignore
    this.handleFileInput(event.dataTransfer.files);
  }

  handleFileInput(files: FileList | null) {
    if (files != null){
      for (let x = 0; x < files.length; x++){
        let file = files.item(x);
        if (file != null){
          // @ts-ignore
          const find = this.loaded.find(x => x.name == file.name);
          if (find != null){
            this.loaded.splice(this.loaded.indexOf(find), 1);
          }
          this.awaitForLoad.push(file.name);
        }
      }
      for (let x = 0; x < files.length; x++){
        let file = files.item(x);
        if (file != null){
          this.issues.uploadFile(file, this.auth.getUser().login).then(res => {
            console.log(res);
            this.loaded.push(res);
          });
        }
      }
    }
  }

  getFileExtensionIcon(file: string) {
    switch (file.toLowerCase().split('.').pop()){
      case 'pdf': return 'pdf.svg';
      case 'dwg': return 'dwg.svg';
      case 'xls': return 'xls.svg';
      case 'xlsx': return 'xls.svg';
      case 'doc': return 'doc.svg';
      case 'docx': return 'doc.svg';
      case 'png': return 'png.svg';
      case 'jpg': return 'jpg.svg';
      case 'txt': return 'txt.svg';
      case 'zip': return 'zip.svg';
      default: return 'file.svg';
    }
  }

  isLoaded(file: string) {
    return this.loaded.find(x => x.name == file);
  }

  remove(file: string) {
    let find = this.loaded.find(x => x.name == file);
    if (find != null){
      this.loaded.splice(this.loaded.indexOf(find), 1);
    }
    let findAwait = this.awaitForLoad.find(x => x == file);
    if (findAwait != null){
      this.awaitForLoad.splice(this.awaitForLoad.indexOf(findAwait), 1);
    }
  }

  close() {
    this.equipmentForm.reset();
    this.ref.close();
  }

  findProjectId(project_name: string) {
    const project = this.prService.projects.find(project => project.name === project_name);
    return project? project.id : undefined;
  }

  findDepartmentId(department_name: string) {
    const department = this.prService.departments.find(department => department.name === department_name);
    return department? department.id : undefined;
  }

  createEquipment() {
    const eqFormValue = this.equipmentForm.value;

    const eqToDB = new EquipmentToDB();
    eqToDB.name = eqFormValue.name;
    eqToDB.description = eqFormValue.description;
    eqToDB.sfi = eqFormValue.sfi;
    eqToDB.project_id = this.findProjectId(eqFormValue.project);
    eqToDB.responsible_id = this.auth.getUser().id;
    eqToDB.department_id = this.findDepartmentId(eqFormValue.department);
    eqToDB.comment = eqFormValue.commentText;
    console.warn(this.equipmentForm.value);
    console.log(JSON.stringify(eqToDB));
    this.equipmentForm.reset();
  }
}
