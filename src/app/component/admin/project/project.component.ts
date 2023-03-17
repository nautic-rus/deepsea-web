import { Component, OnInit } from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {LanguageService} from "../../../domain/language.service";
import {ProjectService} from "./project.service";
import {Projects} from "../../../domain/interfaces/project";
import {Users} from "../../../domain/interfaces/users";
import _, {groupBy} from "underscore";
import {UserService} from "../user/user.service";

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})
export class ProjectComponent implements OnInit {
  project: Projects;
  id: any;
  users: Users[] = [];
  selectedUsers: number[] = [];
  colsUsers: any[] = [];
  scrollHeight: string = '600px';

  constructor(public conf: DynamicDialogConfig, public userService: UserService, public lang: LanguageService, public ref: DynamicDialogRef, public projectService: ProjectService, public l: LanguageService) { }

  ngOnInit(): void {
    console.log(this.conf.data)
    this.project = this.conf.data[0] as Projects;
    this.users = _.sortBy(this.conf.data[1] as Users[], x => x.name) ;
    this.colsUsers = this.conf.data[2];
    this.id = this.project.id;
    this.fillSelectedUsers(this.id);
    console.log(this.selectedUsers)
  }

  fillSelectedUsers(id: number): void {
    this.userService.getUsersProject(id)
      .subscribe(users => {
        console.log(users);
        this.selectedUsers = users.map((x: any) => x);
      });
  }


  close() {
    this.ref.close();
  }

  setAvatar(avatar: string) {
    return '<div class="df"><img src="' + avatar + '" width="26px" height="26px" style="border-radius: 13px"/><div class="ml-1 cy">' + '</div></div>';
  }

  deleteProject() {
    this.projectService.deleteProject(this.project.id).subscribe({
      next: res => {
        console.log(res);
        this.userService.deleteUsersProject(this.project.id).subscribe({
          next: res => {
            console.log(res);
          },
          error: err => {
            console.log(err);
          }
        })
        this.ref.close(res);
      },
      error: err => {
        console.log(err);
        this.ref.close(err);
      }
    });
  }

  saveProject() {
    this.projectService.saveProject(this.project, this.id, this.selectedUsers).subscribe({
      next: res => {
        console.log(res);
        this.userService.saveUsersProject(this.selectedUsers, this.project.id).subscribe({
          next: res => {
            console.log(res);
          },
          error: err => {
            console.log(err);
          }
        })
        this.ref.close(res);
      },
      error: err => {
        console.log(err);
        this.ref.close(err);
      }
    });

  }
}
