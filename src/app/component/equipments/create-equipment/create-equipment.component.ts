import {Component, OnInit} from '@angular/core';
import {AuthManagerService} from "../../../domain/auth-manager.service";
import { FormBuilder} from '@angular/forms';
import {EquipmentsService} from "../../../domain/equipments.service";
import {ProjectsManagerService} from "../../../domain/projects-manager.service";
import {FileAttachment} from "../../../domain/classes/file-attachment";
import {IssueManagerService} from "../../../domain/issue-manager.service";

@Component({
  selector: 'app-create-equipment',
  templateUrl: './create-equipment.component.html',
  styleUrls: ['./create-equipment.component.css']
})
export class CreateEquipmentComponent implements OnInit {
  equipmentForm = this.formBuilder.group({
    sfi: [''],
    project: [''],
    department: [''],
    name: [''],
    description: [''],
  });
  equipmentProjects: string[] = [];
  equipmentProject = '-';
  equipmentDepartments: string[] = [];
  equipmentDepartment: string;

  dragOver = false; //для работы с формой
  loaded: FileAttachment[] = [];
  awaitForLoad: string[] = [];

  constructor(public prService: ProjectsManagerService, public eqService: EquipmentsService,  public auth: AuthManagerService, private formBuilder: FormBuilder, public issues: IssueManagerService ) {
  }

  ngOnInit(): void {
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



  onSubmit() {
    // TODO: Use EventEmitter with form value
    console.warn(this.equipmentForm.value);
  }

}
