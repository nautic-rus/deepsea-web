import { Component, OnInit } from '@angular/core';
import {Users} from "../../../domain/interfaces/users";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {LanguageService} from "../../../domain/language.service";
import {Projects} from "../../../domain/interfaces/project";
import {ProjectService} from "../project/project.service";
import {UserService} from "./user.service";
import {Roles} from "../../../domain/interfaces/roles";
import {RoleService} from "../role/role.service";

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
  birthday: Date;


  constructor(public conf: DynamicDialogConfig, public lang: LanguageService,  public ref: DynamicDialogRef, public projectService: ProjectService, public userService: UserService, public roleService: RoleService) {
    this.genders = [
      {name: 'male'},
      {name: 'female'}
    ]
  }

  ngOnInit(): void {
    this.user = this.conf.data as Users;
    this.id = this.user.id;
    this.birthday = new Date(this.user.birthday);
    this.fillRoles();
    this.fillProjects();
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

  saveUser() {
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
}
