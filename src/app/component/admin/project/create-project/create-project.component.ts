import { Component, OnInit } from '@angular/core';
import {LanguageService} from "../../../../domain/language.service";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {ProjectService} from "../project.service";
import {Roles} from "../../../../domain/interfaces/roles";
import {Projects} from "../../../../domain/interfaces/project";
import {AuthManagerService} from "../../../../domain/auth-manager.service";
import {Users} from "../../../../domain/interfaces/users";
import _ from "underscore";
import {MessageService} from "primeng/api";
import {UserService} from "../../user/user.service";

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
  users: Users[] = [];
  selectedUsers: number[] = [];
  colsUsers: any[] = [];
  loading = false;

  constructor(public t: LanguageService, private messageService: MessageService, public ref: DynamicDialogRef, public conf: DynamicDialogConfig, public projectService: ProjectService, public auth: AuthManagerService, public userService: UserService) { }

  ngOnInit(): void {
    this.users = _.sortBy(this.conf.data[1] as Users[], x => (x.surname + x.name));
    this.colsUsers = this.conf.data[2];
    this.managers = [this.auth.getUser().login];
    console.log(this.users);
  }

  close() {
    this.ref.close();
  }

  createProject() {
    this.loading = true;
    let projects: Projects = { id: 0, name: this.name, foran: this.foran, rkd: this.rkd, pdsp: this.pdsp, factory: this.factory, managers: this.managers.join(','), status: this.status };
    this.projectService.startProject(projects).subscribe({
      next: res => {
        console.log(res);
        this.userService.saveUsersProject(this.selectedUsers, +res).subscribe({
          next: res => {
            this.loading = false;
            this.close();
            this.messageService.add({key:'admin', severity:'success', summary: this.t.tr('Создание проекта'), detail: this.t.tr('Новый проект создан')});
          },
          error: err => {
            console.log(err);
          }
        })
      },
      error: err => {
        console.log(err);
        this.loading = false;
        this.messageService.add({key:'admin', severity:'error', summary: this.t.tr('Создание проекта'), detail: this.t.tr('Не удалось создать новый проект')});
      }
    });
  }

  setAvatar(avatar: string) {
    return '<div class="df"><img src="' + avatar + '" width="32px" height="32px" style="border-radius: 16px"/><div class="ml-1 cy">' + '</div></div>';
  }

  isProjectDisabled() {
    return this.name == '' || this.foran == '' || this.rkd == '' || this.pdsp == '' || this.factory == '';
  }

}
