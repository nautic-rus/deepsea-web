import { Component, OnInit } from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {LanguageService} from "../../../domain/language.service";
import {ProjectService} from "./project.service";
import {Projects} from "../../../domain/interfaces/project";

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})
export class ProjectComponent implements OnInit {
  project: Projects;
  id: any;

  constructor(public conf: DynamicDialogConfig, public lang: LanguageService, public ref: DynamicDialogRef, public projectService: ProjectService) { }

  ngOnInit(): void {
    this.project = this.conf.data as Projects;
    this.id = this.project.id;
  }

  close() {
    this.ref.close();
  }

  deleteProject() {
    this.projectService.deleteProject(this.project.id).subscribe({
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

  saveProject() {
    this.projectService.saveProject(this.project, this.id).subscribe({
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

}
