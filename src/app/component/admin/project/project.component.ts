import { Component, OnInit } from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {LanguageService} from "../../../domain/language.service";
import {ProjectService} from "./project.service";
import {Projects} from "../../../domain/interfaces/project";
import {Users} from "../../../domain/interfaces/users";

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})
export class ProjectComponent implements OnInit {
  project: Projects;
  id: any;
  users: Users[] = [];
  selectedUsers: Users[] = [];
  colsUsers: any[] = [];

  constructor(public conf: DynamicDialogConfig, public lang: LanguageService, public ref: DynamicDialogRef, public projectService: ProjectService, public l: LanguageService) { }

  ngOnInit(): void {
    console.log(this.conf.data)
    this.project = this.conf.data[0] as Projects;
    this.users = this.conf.data[1] as Users[];
    this.colsUsers = this.conf.data[2];
    this.id = this.project.id;
  }

  close() {
    this.ref.close();
  }

  setAvatar(avatar: string) {
    return '<div class="df"><img src="' + avatar + '" width="32px" height="32px" style="border-radius: 16px"/><div class="ml-1 cy">' + '</div></div>';
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
