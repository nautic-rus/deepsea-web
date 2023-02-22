import {Component, OnInit} from '@angular/core';
import {LanguageService} from "../../../../domain/language.service";
import {DynamicDialogRef} from "primeng/dynamicdialog";
import {ProjectService} from "../../project/project.service";
import {AuthManagerService} from "../../../../domain/auth-manager.service";
import {Projects} from "../../../../domain/interfaces/project";
import {Roles} from "../../../../domain/interfaces/roles";
import {RoleService} from "../../role/role.service";
import {UserService} from "../user.service";
import {Users} from "../../../../domain/interfaces/users";
import {formatDate} from "@angular/common";

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css']
})
export class CreateUserComponent implements OnInit {

  id: number = 0;
  login: string = "";
  password: string = "";
  name: string = "";
  surname: string = "";
  profession: string = "";
  department: string = "";
  birthday: string = formatDate(new Date(), 'MM/dd/yyyy', 'en');
  userBD: Date = new Date();
  email: string = "";
  phone: string = "";
  tcid: number = 0;
  avatar: string = "";
  avatar_full: string = "";
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

  constructor(public lang: LanguageService, public ref: DynamicDialogRef, public userService: UserService, public projectService: ProjectService, public auth: AuthManagerService, public roleService: RoleService) {
  }

  ngOnInit(): void {
    this.userBD = new Date();
    this.fillRoles();
    this.fillProjects();
    this.genders = [
      {name: 'male'},
      {name: 'female'}
    ]
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

  close() {
    this.ref.close();
  }

  createUser() {
    let user: Users = {
      id: this.id,
      login: this.login,
      password: this.password,
      name: this.name,
      surname: this.surname,
      profession: this.profession,
      department: this.department,
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
      permissions: this.permissions,
      token: this.token,
      projects: this.visible_projects,
    };
    this.userService.startUser(user).subscribe({
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
    return this.login.trim() == '' || this.surname == '';
  }
}
