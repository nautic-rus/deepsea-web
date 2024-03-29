import { Component, OnInit } from '@angular/core';
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {LanguageService} from "../../../domain/language.service";
import {ProjectService} from "./project.service";
import {Projects} from "../../../domain/interfaces/project";
import {Users} from "../../../domain/interfaces/users";
import _, {groupBy} from "underscore";
import {UserService} from "../user/user.service";
import {MessageService} from "primeng/api";
import {DeleteUserComponent} from "../user/delete-user/delete-user.component";
import {DeleteProjectComponent} from "./delete-project/delete-project.component";
import {AuthManagerService} from "../../../domain/auth-manager.service";

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
  loading = false;
  managers: string[] = []

  constructor(private dialogService: DialogService, private messageService: MessageService, public conf: DynamicDialogConfig, public userService: UserService, public t: LanguageService, public ref: DynamicDialogRef, public projectService: ProjectService, public auth: AuthManagerService) { }

  ngOnInit(): void {
    console.log(this.conf.data)
    this.managers = this.conf.data[0].managers.split(',')
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
      this.loading = true;
      this.dialogService.open(DeleteProjectComponent, {
        showHeader: false,
        modal: true,
        data: this.project.id
      }).onClose.subscribe(res => {
        if (res == 'success'){
          this.ref.close(res);
          this.messageService.add({key:'admin', severity:'success', summary: this.t.tr('Удаление проекта'), detail: this.t.tr('Проект удалён')});
          this.loading = false;
        } else {
          this.loading = false;
          this.messageService.add({key:'admin', severity:'error', summary: this.t.tr('Удаление проекта'), detail: this.t.tr('Не удалось удалить проект')});
          }
      });
  }

  saveProject() {
    this.loading = true;
    this.project.managers = this.managers.join(',')
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
        this.loading = false;
        this.messageService.add({key:'admin', severity:'success', summary: this.t.tr('Сохранение проекта'), detail: this.t.tr('Проект сохранён')});
      },
      error: err => {
        console.log(err);
        this.loading = false;
        this.messageService.add({key:'admin', severity:'error', summary: this.t.tr('Сохранение проекта'), detail: this.t.tr('Не удалось сохранить проект')});
      }
    });

  }
}
