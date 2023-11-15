import { Component, OnInit } from '@angular/core';
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {MessageService} from "primeng/api";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {RightService} from "../admin/right/right.service";
import {LanguageService} from "../../domain/language.service";
import {DepartmentService} from "../admin/department.service";
import {ProjectService} from "../admin/project/project.service";
import {UserService} from "../admin/user/user.service";
import {RoleService} from "../admin/role/role.service";
import {Users} from "../../domain/interfaces/users";
import {User} from "../../domain/classes/user";

@Component({
  selector: 'app-user-data',
  templateUrl: './user-data.component.html',
  styleUrls: ['./user-data.component.css']
})
export class UserDataComponent implements OnInit {
  user: Users
  oldUser: User
  genders = [
    {name: 'male'},
    {name: 'female'}
  ];
  birthday: Date;

  loading = false;

  constructor(private dialogService: DialogService, private messageService: MessageService, public auth: AuthManagerService, public rightService: RightService, public t: LanguageService,  public departmentService: DepartmentService, public projectService: ProjectService, public userService: UserService, public roleService: RoleService) { }

  ngOnInit(): void {
    this.fillUser()
    this.oldUser = this.auth.getUser()
  }

  fillUser() {
    let userId = this.auth.getUser().id
    this.userService.getUserDetails(userId)
      .subscribe(data => {
        this.user = data
        this.birthday = new Date(this.user.birthday);
      })
  }

  setAvatar(avatar: string) {
    return '<div class="df"><img src="' + avatar + '" width="100px" height="100px" style="border-radius: 50px"/><div class="ml-1 cy">' + '</div></div>';
  }

  isUserTaskDisabled() {
    return this.user.login.trim() == '' || this.user.surname == '';
  }

  saveUser() {
    this.loading = true;
    console.log(this.user)
    this.userService.saveUser(this.user, this.oldUser.id).subscribe({
      next: res => {
        this.loading = false;
        console.log(res);
        this.messageService.add({key:'admin', severity:'success', summary: this.t.tr('Сохранение пользователя'), detail: this.t.tr('Данные пользователя сохранены')});
      },
      error: err => {
        this.loading = false;
        console.log(err);
        this.messageService.add({key:'admin', severity:'error', summary: this.t.tr('Сохранение пользователя'), detail: this.t.tr('Не удалось сохранить данные пользователя')});
      }
    });
  }
}
