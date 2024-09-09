import {Component, OnInit} from '@angular/core';
import {LanguageService} from "../../../../domain/language.service";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {ProjectService} from "../../project/project.service";
import {AuthManagerService} from "../../../../domain/auth-manager.service";
import {Projects} from "../../../../domain/interfaces/project";
import {Roles} from "../../../../domain/interfaces/roles";
import {RoleService} from "../../role/role.service";
import {UserService} from "../user.service";
import {Users} from "../../../../domain/interfaces/users";
import {formatDate} from "@angular/common";
import {Rights} from "../../../../domain/interfaces/rights";
import {RightService} from "../../right/right.service";
import {Departments} from "../../../../domain/interfaces/departments";
import {MessageService} from "primeng/api";

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css']
})
export class CreateUserComponent implements OnInit {

  id: number = 0;
  login: string = "";
  password: string = this.generatePassword();
  name: string = "";
  surname: string = "";
  profession: string = "";
  department: string = "";
  birthday: string = formatDate(new Date(), 'MM/dd/yyyy', 'en');
  userBD: Date = new Date();
  email: string = "";
  phone: string = "";
  tcid: number = 0;
  avatar: string = "assets/employees/account-user.png";
  avatar_full: string = "assets/employees/account-user_full.png";
  rocket_login: string = "";
  gender: string = "";
  visibility: string = "";
  projects: string[] = [];
  visible_pages: string[] = [];
  shared_access: string[] = [];
  groups: string[] = [];
  permissions: string[] = [];
  token: string = "";
  genders: any[] = [];
  roles: Roles[] = [];
  visible_projects: any[] = [];
  departments: Departments[] = [];
  rights: Rights[] = [];
  loading = false;

  constructor(private messageService: MessageService, public conf: DynamicDialogConfig, public t: LanguageService, public rightService: RightService, public ref: DynamicDialogRef, public userService: UserService, public projectService: ProjectService, public auth: AuthManagerService, public roleService: RoleService) {
    this.genders = [
      {name: 'male'},
      {name: 'female'}
    ]
    this.departments = conf.data[1];
  }

  ngOnInit(): void {
    this.userBD = new Date();
    this.fillRoles();
    this.fillProjects();
    this.fillRights();

  }

  generatePassword() {
    return Array(10).fill("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#").map(function(x) { return x[Math.floor(Math.random() * x.length)] }).join('');
  }

  getDepartmentId(name: any): any {
    let findDep = this.departments.find(x => {
      return x.name.toString() == name.toString();
    });
    return findDep !=null ? findDep.id : 0;
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

  close() {
    this.ref.close();
  }

  createUser() {
    this.loading = true;
    let user: Users = {
      id: this.id,
      login: this.login,
      password: this.password,
      name: this.name,
      surname: this.surname,
      profession: this.profession,
      department: this.department,
      id_department: parseInt(this.getDepartmentId(this.department)),
      birthday: formatDate(this.userBD, 'MM/dd/yyyy', 'en'),
      email: this.email,
      phone: this.phone,
      tcid: this.tcid,
      avatar: this.avatar,
      avatar_full: this.avatar,
      rocket_login: this.rocket_login,
      gender: this.gender,
      visibility: this.visibility,
      visible_projects: this.visible_projects,
      visible_pages: ["-"],
      shared_access: this.shared_access,
      groups: this.groups,
      groupNames: '',
      permissions: this.permissions,
      token: this.token,
      removed: 0
    };
    this.userService.startUser(user).subscribe({
      next: res => {
        this.loading = false;
        console.log(res);
        this.messageService.add({key:'admin', severity:'success', summary: this.t.tr('Создание пользователя'), detail: this.t.tr('Новый пользователь создан')});
      },
      error: err => {
        this.loading = false;
        console.log(err);
        this.messageService.add({key:'admin', severity:'success', summary: this.t.tr('Создание пользователя'), detail: this.t.tr('Не удалось создать нового пользователя')});
      }
    });
  }
  isUserTaskDisabled() {
    return this.login.trim() == '' || this.surname == '';
  }
  roleChanged() {
    this.permissions = [];
    this.groups.forEach(group => {
      this.roleService.getRoleRights(group)
        .subscribe(rights => {
          console.log(rights);
          this.permissions = this.permissions.concat(rights)
        });
    })
  }
}
