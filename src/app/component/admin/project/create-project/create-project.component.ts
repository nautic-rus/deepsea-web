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
  selectedUsers: Users[] = [];
  colsUsers: any[] = [];
  loading = false;

  constructor(public l: LanguageService, private messageService: MessageService, public lang: LanguageService, public ref: DynamicDialogRef, public conf: DynamicDialogConfig, public projectService: ProjectService, public auth: AuthManagerService) { }

  ngOnInit(): void {
    this.users = _.sortBy(this.conf.data[1] as Users[], x => x.name) ;
    this.colsUsers = this.conf.data[2];
    this.managers = this.auth.getUser().login;
  }

  close() {
    this.ref.close();
  }

  createProject() {
    this.loading = true;
    let projects: Projects = { id: 0, name: this.name, foran: this.foran, rkd: this.rkd, pdsp: this.pdsp, factory: this.factory, managers: this.managers, status: this.status };
    this.projectService.startProject(projects).subscribe({
      next: res => {
        console.log(res);
        this.loading = false;
        this.messageService.add({key:'admin', severity:'success', summary: this.lang.tr('Создание проекта'), detail: this.lang.tr('Новый проект создан')});
      },
      error: err => {
        console.log(err);
        this.loading = false;
        this.messageService.add({key:'admin', severity:'error', summary: this.lang.tr('Создание проекта'), detail: this.lang.tr('Не удалось создать новый проект')});
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
