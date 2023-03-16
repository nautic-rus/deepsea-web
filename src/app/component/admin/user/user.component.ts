import { Component, OnInit } from '@angular/core';
import {Users} from "../../../domain/interfaces/users";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
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


  constructor(public conf: DynamicDialogConfig, public rightService: RightService, public lang: LanguageService,  public ref: DynamicDialogRef, public departmentService: DepartmentService, public projectService: ProjectService, public userService: UserService, public roleService: RoleService) {
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
    this.userService.deleteUser(this.user.id).subscribe({
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

  sendLogPass() {
    this.userService.sendLogPass(this.user.id).subscribe({
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

  saveUser() {
    this.user.department = this.department;
    console.log(this.user)
    this.user.id_department = this.getDepartmentId(this.department);
    this.userService.saveUser(this.user, this.id).subscribe({
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
