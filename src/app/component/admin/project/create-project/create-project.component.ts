import { Component, OnInit } from '@angular/core';
import {LanguageService} from "../../../../domain/language.service";
import {DynamicDialogRef} from "primeng/dynamicdialog";
import {ProjectService} from "../project.service";
import {Roles} from "../../../../domain/interfaces/roles";
import {Projects} from "../../../../domain/interfaces/project";
import {AuthManagerService} from "../../../../domain/auth-manager.service";

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.css']
})
export class CreateProjectComponent implements OnInit {

  id: any;
  name: string = '';
  foran: string = '';
  rkd: string = '';
  pdsp: string = '';
  factory: string = '';
  managers: any;
  status: any;

  constructor(public lang: LanguageService, public ref: DynamicDialogRef, public projectService: ProjectService, public auth: AuthManagerService) { }

  ngOnInit(): void {
    this.managers = this.auth.getUser().login;
  }

  close() {
    this.ref.close();
  }

  createProject() {
    let projects: Projects = { id: 0, name: this.name, foran: this.foran, rkd: this.rkd, pdsp: this.pdsp, factory: this.factory, managers: this.managers, status: this.status };
    this.projectService.startProject(projects).subscribe({
      next: res => {
        console.log(res);
        this.ref.close(res);
      },
      error: err => {
        console.log(err);
        this.ref.close(err);
      }
    });
  }

  isProjectDisabled() {
    return this.name == '' || this.foran == '' || this.rkd == '' || this.pdsp == '' || this.factory == '';
  }

}
