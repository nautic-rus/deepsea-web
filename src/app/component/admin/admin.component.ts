import {Component, OnInit, ViewChild} from '@angular/core';
import {DeviceDetectorService} from "ngx-device-detector";
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import {MessageService} from "primeng/api";
import {UserService} from "./user.service";
import {LanguageService} from "../../domain/language.service";
import {DialogService} from "primeng/dynamicdialog";
import {Users} from "../../domain/interfaces/users";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {Issue} from "../../domain/classes/issue";
import {User} from "../../domain/classes/user";
import {CreateTaskComponent} from "../create-task/create-task.component";
import {CreateUserComponent} from "../create-user/create-user.component";
import {Roles} from "../../domain/interfaces/roles";
import {Projects} from "../../domain/interfaces/project";
import {RoleService} from "./role.service";
import {ProjectService} from "./project.service";

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  users: Users[] = [];
  roles: Roles[] = [];
  projects: Projects[] = [];
  colsUsers: any[] = [];
  colsRoles: any[] = [];
  colsProjects: any[] = [];
  // @ts-ignore
  @ViewChild('search') search;
  // @ts-ignore
  @ViewChild('dt') dt: Table;
  constructor(public roleService: RoleService, public projectService: ProjectService, public device: DeviceDetectorService, private http: HttpClient, private router: Router, private messageService: MessageService, private userService: UserService, public auth: AuthManagerService, private dialogService: DialogService, public l: LanguageService) { }

  ngOnInit(): void {
    if (!this.auth.getUser().visible_pages.includes('home') && this.auth.getUser().visible_pages.length > 0){
      this.router.navigate([this.auth.getUser().visible_pages[0]]);
    }
    this.setCols();
    this.fillUsers();
    this.fillRoles();
    this.fillProjects();
  }

  fillUsers(): void {
    this.userService.getUsers()
      .subscribe(users => this.users = users);
  }

  fillRoles(): void {
    this.roleService.getRoles()
      .subscribe(roles => {
        console.log(roles);
        this.roles = roles;
      });
  }

  fillProjects(): void {
    this.projectService.getProjects()
      .subscribe(projects => {
        console.log(projects);
        this.projects = projects;
      });
  }

  localeColumn(userElement: string, field: string): string {
    if (field == 'avatar') {
      return '<div class="df"><img src="' + userElement + '" width="32px" height="32px" style="border-radius: 16px"/><div class="ml-1 cy">' + '</div></div>';
    }
    else {
      return userElement;
    }
  }

  showUser(user: Users): void {

  }

  newUser(user: object | null) {
    this.dialogService.open(CreateUserComponent, {
      showHeader: false,
      modal: true,
      data: [user, '']
    }).onClose.subscribe(res => {
      this.fillUsers();
    });
  }

  setCols() {
    this.colsRoles = [
      {
        field: 'name',
        header: 'Name',
        headerLocale: 'Name',
        sort: true,
        filter: false,
        skip: false,
        defaultValue: '',
        hidden: false,
        date: false,
      },
      {
        field: 'description',
        header: 'Description',
        headerLocale: 'Description',
        sort: true,
        filter: false,
        skip: false,
        defaultValue: '',
        hidden: false,
        date: true
      },
    ];

    this.colsProjects = [
      {
        field: 'id',
        header: 'ID',
        headerLocale: 'ID',
        sort: true,
        filter: false,
        skip: false,
        defaultValue: '',
        hidden: false,
        date: false,
      },
      {
        field: 'foran',
        header: 'Foran',
        headerLocale: 'Foran',
        sort: true,
        filter: false,
        skip: false,
        defaultValue: '',
        hidden: false,
        date: true
      },
      {
        field: 'rkd',
        header: 'RKD',
        headerLocale: 'RKD',
        sort: true,
        filter: false,
        skip: false,
        defaultValue: '',
        hidden: false,
        date: true
      },
      {
        field: 'pdsp',
        header: 'PDSP',
        headerLocale: 'PDSP',
        sort: true,
        filter: false,
        skip: false,
        defaultValue: '',
        hidden: false,
        date: true
      },
      {
        field: 'cloud',
        header: 'Cloud',
        headerLocale: 'Cloud',
        sort: true,
        filter: false,
        skip: false,
        defaultValue: '',
        hidden: false,
        date: true
      },
    ];

    this.colsUsers = [
      {
        field: 'id',
        header: 'ID',
        headerLocale: 'ID',
        sort: true,
        filter: false,
        skip: false,
        defaultValue: '',
        hidden: false,
        date: false,
      },

      {
        field: 'avatar',
        header: 'Avatar',
        headerLocale: 'Avatar',
        sort: true,
        filter: false,
        skip: false,
        defaultValue: '',
        hidden: false,
        date: true
      },
      {
        field: 'name',
        header: 'Name',
        headerLocale: 'Name',
        sort: true,
        filter: false,
        skip: false,
        defaultValue: '',
        hidden: false,
        date: true
      },
      {
        field: 'surname',
        header: 'Surname',
        headerLocale: 'Surname',
        sort: true,
        filter: true,
        skip: false,
        defaultValue: '',
        hidden: false,
        date: false
      },
      {
        field: 'profession',
        header: 'Profession',
        headerLocale: 'Profession',
        sort: true,
        filter: true,
        skip: false,
        defaultValue: '',
        hidden: false,
        date: false
      },
      // {
      //   field: 'login',
      //   header: 'Login',
      //   headerLocale: 'Login',
      //   sort: true,
      //   filter: true,
      //   skip: false,
      //   defaultValue: '',
      //   hidden: false,
      //   date: false,
      // },
      // {
      //   field: 'password',
      //   header: 'Password',
      //   headerLocale: 'Password',
      //   sort: true,
      //   filter: true,
      //   skip: false,
      //   defaultValue: '',
      //   hidden: false,
      //   date: false
      // },
      // {
      //   field: 'gender',
      //   header: 'Gender',
      //   headerLocale: 'Gender',
      //   sort: true,
      //   filter: false,
      //   skip: false,
      //   defaultValue: '',
      //   hidden: false,
      //   date: false
      // },
      // {
      //   field: 'birthday',
      //   header: 'Birthday',
      //   headerLocale: 'Birthday',
      //   sort: true,
      //   filter: false,
      //   skip: false,
      //   defaultValue: '',
      //   hidden: false,
      //   date: false
      // },
      // {
      //   field: 'email',
      //   header: 'Email',
      //   headerLocale: 'Email',
      //   sort: true,
      //   filter: true,
      //   skip: false,
      //   defaultValue: '',
      //   hidden: false,
      //   date: false
      // },
      // {
      //   field: 'phone',
      //   header: 'Phone',
      //   headerLocale: 'Phone',
      //   sort: true,
      //   filter: true,
      //   skip: false,
      //   defaultValue: '',
      //   hidden: false,
      //   date: false
      // },
      //
      // {
      //   field: 'department',
      //   header: 'Department',
      //   headerLocale: 'Department',
      //   sort: true,
      //   filter: true,
      //   skip: false,
      //   defaultValue: '',
      //   hidden: false,
      //   date: false
      // },
      // {
      //   field: 'permissions',
      //   header: 'Permissions',
      //   headerLocale: 'Permissions',
      //   sort: true,
      //   filter: true,
      //   skip: false,
      //   defaultValue: '',
      //   hidden: false,
      //   date: false
      // },
      // {
      //   field: 'visible_projects',
      //   header: 'Visible projects',
      //   headerLocale: 'Visible projects',
      //   sort: true,
      //   filter: true,
      //   skip: false,
      //   defaultValue: '',
      //   hidden: false,
      //   date: false
      // },
      // {
      //   field: 'visible_pages',
      //   header: 'Visible pages',
      //   headerLocale: 'Visible pages',
      //   sort: true,
      //   filter: true,
      //   skip: false,
      //   defaultValue: '',
      //   hidden: false,
      //   date: false
      // },
      // {
      //   field: 'rocket_login',
      //   header: 'Rocket login',
      //   headerLocale: 'Rocket login',
      //   sort: true,
      //   filter: true,
      //   skip: false,
      //   defaultValue: '',
      //   hidden: false,
      //   date: false
      // },
      // {
      //   field: 'tcid',
      //   header: 'Tc id',
      //   headerLocale: 'Tc id',
      //   sort: true,
      //   filter: false,
      //   skip: false,
      //   defaultValue: '',
      //   hidden: false,
      //   date: true
      // },
      // {
      //   field: 'visibility',
      //   header: 'Visibility',
      //   headerLocale: 'Visibility',
      //   sort: true,
      //   filter: true,
      //   skip: false,
      //   defaultValue: '',
      //   hidden: false,
      //   date: false
      // },
      // {
      //   field: 'groups',
      //   header: 'Groups',
      //   headerLocale: 'Groups',
      //   sort: true,
      //   filter: true,
      //   skip: false,
      //   defaultValue: '',
      //   hidden: false,
      //   date: false
      // },
      // {
      //   field: 'token',
      //   header: 'Token',
      //   headerLocale: 'Token',
      //   sort: true,
      //   filter: false,
      //   skip: false,
      //   defaultValue: '',
      //   hidden: false,
      //   date: false
      // }
    ];
  }

}
