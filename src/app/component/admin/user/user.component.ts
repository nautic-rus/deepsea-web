import { Component, OnInit } from '@angular/core';
import {Users} from "../../../domain/interfaces/users";
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {LanguageService} from "../../../domain/language.service";
import {Projects} from "../../../domain/interfaces/project";
import {ProjectService} from "../project/project.service";
import {UserService} from "./user.service";
import {Roles} from "../../../domain/interfaces/roles";
import {RoleService} from "../role/role.service";
import {Departments} from "../../../domain/interfaces/departments";
import {DepartmentService} from "../department.service";
import {any} from "underscore";
import {Rights} from "../../../domain/interfaces/rights";
import {RightService} from "../right/right.service";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {MessageService} from "primeng/api";
import {DeleteComponent} from "../../task/delete/delete.component";
import {DeleteUserComponent} from "./delete-user/delete-user.component";

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  user: Users;
  id: any;
  genders: any[];
  projects: Projects[];
  roles: Roles[];
  departments: Departments[] = [];
  rights: Rights[] = [];
  department: string = "";
  birthday: Date;
  loading = false;

  constructor(private dialogService: DialogService, private messageService: MessageService, public conf: DynamicDialogConfig, public auth: AuthManagerService, public rightService: RightService, public t: LanguageService,  public ref: DynamicDialogRef, public departmentService: DepartmentService, public projectService: ProjectService, public userService: UserService, public roleService: RoleService) {
    this.genders = [
      {name: 'male'},
      {name: 'female'}
    ];
    this.departments = conf.data[1];
  }

  ngOnInit(): void {
    this.user = this.conf.data[0] as Users;
    this.fillRoles();
    this.fillProjects();
    this.fillRights();
    // this.fillDepartments();
    this.localeRow();
  }

  localeRow(): void {
    this.id = this.user.id;
    this.birthday = new Date(this.user.birthday);
    this.department = this.getDepartmentName(this.user.id_department);
  }

  getDepartmentName(id: any): any {
    let findDep = this.departments.find(x => {
      return x.id.toString() == id.toString();
    });
    return findDep != null ? findDep.name : '-';
  }

  getDepartmentId(name: any): any {
    let findDep = this.departments.find(x => {
      return x.name.toString() == name.toString();
    });
    return findDep !=null ? findDep.id : 0;
  }

  close() {
    this.ref.close();
  }

  fillProjects(): void {
    this.projectService.getProjects()
      .subscribe(projects => {
        console.log(projects);
        this.projects = projects;
      });
  }

  fillRoles(): void {
    this.roleService.getRoles()
      .subscribe(roles => {
        console.log(roles);
        this.roles = roles;
      });
  }

  fillRights(): void {
    this.rightService.getRights()
      .subscribe(rights => {
        console.log(rights);
        this.rights = rights;
      });
  }

  deleteUser() {
    this.loading = true;
    this.dialogService.open(DeleteUserComponent, {
      showHeader: false,
      modal: true,
      data: this.user.id
    }).onClose.subscribe(res => {
      if (res == 'success'){
        this.ref.close(res);
        this.messageService.add({key:'admin', severity:'success', summary: this.t.tr('Удаление пользователя'), detail: this.t.tr('Пользователь удалён')});
        this.loading = false;
      } else {
        this.loading = false;
        console.log(res);
        this.messageService.add({key:'admin', severity:'error', summary: this.t.tr('Удаление пользователя'), detail: this.t.tr('Не удалось удалить пользователя')});
      }
    });
  }

  sendLogPass() {
    this.loading = true;
    this.userService.sendLogPass(this.user.id).subscribe({
      next: res => {
        this.loading = false;
        this.messageService.add({key:'admin', severity:'success', summary: this.t.tr('Данные для входа'), detail: this.t.tr('Данные для входа доставлены')});
        console.log(res);
      },
      error: err => {
        this.loading = false;
        this.messageService.add({key:'admin', severity:'error', summary: this.t.tr('Данные для входа'), detail: this.t.tr('Не удалось доставить данные для входа')});
        console.log(err);
      }
    });
  }

  saveUser() {
    this.loading = true;
    this.user.department = this.department;
    console.log(this.user)
    this.user.id_department = this.getDepartmentId(this.department);
    this.userService.saveUser(this.user, this.id).subscribe({
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
  isUserTaskDisabled() {
    return this.user.login.trim() == '' || this.user.surname == '';
  }
  roleChanged() {
    console.log(this.user.permissions)
    console.log(this.user.groups)
    this.user.permissions = [];
    this.user.groups.forEach(group => {
      this.roleService.getRoleRights(group)
        .subscribe(rights => {
          console.log(rights);
          this.user.permissions = this.user.permissions.concat(rights)
        });
    })
  }
}
