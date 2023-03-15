import {Component, OnInit, ViewChild} from '@angular/core';
import {DeviceDetectorService} from "ngx-device-detector";
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import {MessageService} from "primeng/api";
import {UserService} from "./user/user.service";
import {LanguageService} from "../../domain/language.service";
import {DialogService} from "primeng/dynamicdialog";
import {Users} from "../../domain/interfaces/users";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {Issue} from "../../domain/classes/issue";
import {User} from "../../domain/classes/user";
import {CreateTaskComponent} from "../create-task/create-task.component";
import {CreateUserComponent} from "./user/create-user/create-user.component";
import {Roles} from "../../domain/interfaces/roles";
import {Projects} from "../../domain/interfaces/project";
import {RoleService} from "./role/role.service";
import {ProjectService} from "./project/project.service";
import {TaskComponent} from "../task/task.component";
import {UserComponent} from "./user/user.component";
import {Table} from "primeng/table";
import {CreateRoleComponent} from "./role/create-role/create-role.component";
import {RoleComponent} from "./role/role.component";
import {CreateProjectComponent} from "./project/create-project/create-project.component";
import {ProjectComponent} from "./project/project.component";
import {Rights} from "../../domain/interfaces/rights";
import {RightService} from "./right/right.service";
import {CreateRightComponent} from "./right/create-right/create-right.component";
import {RightComponent} from "./right/right.component";
import {Departments} from "../../domain/interfaces/departments";
import {DepartmentService} from "./department.service";

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  users: Users[] = [];
  roles: Roles[] = [];
  rights: Rights[] = [];
  projects: Projects[] = [];
  departments: Departments[] = [];
  colsUsers: any[] = [];
  colsRoles: any[] = [];
  colsProjects: any[] = [];
  colsRights: any[] = [];
  // @ts-ignore
  @ViewChild('search') search;
  // @ts-ignore
  @ViewChild('users') usr: Table;
  @ViewChild('roles') rls: Table;
  @ViewChild('projects') prcts: Table;
  constructor(public roleService: RoleService, public departmentService: DepartmentService, public projectService: ProjectService, public rightService: RightService, public device: DeviceDetectorService, private http: HttpClient, private router: Router, private messageService: MessageService, private userService: UserService, public auth: AuthManagerService, private dialogService: DialogService, public l: LanguageService) { }

  ngOnInit(): void {
    if (!this.auth.hasRole('Admin')) {
      this.router.navigate([this.auth.getUser().visible_pages[0]]);
    }
    this.setCols();
    this.fillUsers();
    this.fillRoles();
    this.fillProjects();
    this.fillRights();
    this.fillDepartments();
  }

  fillUsers(): void {
    this.userService.getUsers()
      .subscribe(users => {
        console.log(users)
        this.users = users
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
      })
  }

  fillProjects(): void {
    this.projectService.getProjects()
      .subscribe(projects => {
        console.log(projects);
        this.projects = projects;
      });
  }

  fillDepartments(): void {
    this.departmentService.getDepartments()
      .subscribe(departments => {
        console.log(departments);
        this.departments = departments;
      });
  }

  saveReorderedColumnsUsers(event: any) {
    this.colsUsers = event.columns;
    localStorage.setItem('id', JSON.stringify(event.columns));
  }

  localeColumn(element: any, field: string): string {
    if (field == 'avatar') {
      return '<div class="df"><img src="' + element + '" width="32px" height="32px" style="border-radius: 16px"/><div class="ml-1 cy">' + '</div></div>';
    }
    if (field == 'id_department') {
      return this.getDepartmentName(element)
    }
    else {
      return element;
    }
  }

  getDepartmentName(id: any): any {
    let findDep = this.departments.find(x => x.id.toString() == id.toString());
    return findDep != null ? findDep.name : '-';
  }

  isRoleNew(name: string) {
    return this.roles.find(x => x.name == name) == null;
  }

  isRoleUpdated(name: string) {
    return !this.isRoleNew(name) && this.roles.find(x => x.name == name) == null;
  }

  newRole(role: object | null) {
    this.dialogService.open(CreateRoleComponent, {
      showHeader: false,
      modal: true,
      data: [role, '']
    }).onClose.subscribe(res => {
      this.fillRoles();
    });
  }

  viewRole(name: string) {
    this.roleService.getRoleDetails(name).subscribe(res => {
      console.log(res);
      console.log(res.name);
      if (res.name != null) {
        this.dialogService.open(RoleComponent, {
          showHeader: false,
          modal: true,
          data: res
        }).onClose.subscribe(res => {
          this.fillRoles();
        });
      } else {
        this.messageService.add({severity: 'error', summary: 'Url Role', detail: 'Cannot find role defined in url.'});
      }
    });
  }

  newRight(right: object | null) {
    this.dialogService.open(CreateRightComponent, {
      showHeader: false,
      modal: true,
      data: [right, '']
    }).onClose.subscribe(res => {
      this.fillRights();
    })
  }

  viewRight(name: string) {
    this.rightService.getRightDetails(name).subscribe(res => {
      console.log(res);
      console.log(res.name);
      if (res.name != null) {
        this.dialogService.open(RightComponent, {
          showHeader: false,
          modal: true,
          data: res
        }).onClose.subscribe(res => {
          this.fillRights();
        });
      } else {
        this.messageService.add({severity: 'error', summary: 'Url Right', detail: 'Cannot find right defined in url.'});
      }
    })
  }

  newProject(project: object | null) {
    this.dialogService.open(CreateProjectComponent, {
      showHeader: false,
      modal: true,
      data: [project, this.users, this.colsUsers]
    }).onClose.subscribe(res => {
      this.fillProjects();
    });
  }

  viewProject(id: number) {
    this.projectService.getProjectDetails(id).subscribe(res => {
      console.log(res);
      console.log(res.id);
      if (res.id != null) {
        this.dialogService.open(ProjectComponent, {
          showHeader: false,
          modal: true,
          data: [res, this.users, this.colsUsers]
        }).onClose.subscribe(res => {
          this.fillProjects();
        });
      } else {
        this.messageService.add({severity: 'error', summary: 'Url Project', detail: 'Cannot find project defined in url.'});
      }
    });
  }

  isUserNew(id: number) {
    return this.users.find(x => x.id == id) == null;
  }

  newUser(user: object | null) {
    this.dialogService.open(CreateUserComponent, {
      showHeader: false,
      modal: true,
      data: [user, this.departments]
    }).onClose.subscribe(res => {
      this.fillUsers();
    });
  }

  viewUser(id: number) {
    this.userService.getUserDetails(id).subscribe(res => {
      console.log(res);
      console.log(res.id);
      if (res.id != null) {
        this.dialogService.open(UserComponent, {
          showHeader: false,
          modal: true,
          data: [res, this.departments]
        }).onClose.subscribe(res => {
          this.fillUsers();
        });
      } else {
        this.messageService.add({severity: 'error', summary: 'Url Project', detail: 'Cannot find project defined in url.'});
      }
    });
  }

  setCols() {
    this.colsRights = [
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
    ]
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
      {
        field: 'rights',
        header: 'Rights',
        headerLocale: 'Rights',
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
        field: 'managers',
        header: 'Managers',
        headerLocale: 'Managers',
        sort: true,
        filter: false,
        skip: false,
        defaultValue: '',
        hidden: false,
        date: true
      },
      {
        field: 'status',
        header: 'Status',
        headerLocale: 'Status',
        sort: true,
        filter: false,
        skip: false,
        defaultValue: '',
        hidden: false,
        date: true
      },
      // {
      //   field: 'rkd',
      //   header: 'RKD',
      //   headerLocale: 'RKD',
      //   sort: true,
      //   filter: false,
      //   skip: false,
      //   defaultValue: '',
      //   hidden: false,
      //   date: true
      // },
      // {
      //   field: 'pdsp',
      //   header: 'PDSP',
      //   headerLocale: 'PDSP',
      //   sort: true,
      //   filter: false,
      //   skip: false,
      //   defaultValue: '',
      //   hidden: false,
      //   date: true
      // },
      // {
      //   field: 'cloud',
      //   header: 'Cloud',
      //   headerLocale: 'Cloud',
      //   sort: true,
      //   filter: false,
      //   skip: false,
      //   defaultValue: '',
      //   hidden: false,
      //   date: true
      // },
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
      {
        field: 'id_department',
        header: 'Department',
        headerLocale: 'Department',
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
