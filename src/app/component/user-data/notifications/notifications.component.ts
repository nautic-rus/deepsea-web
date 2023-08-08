import {Component, OnInit} from '@angular/core';
import {LanguageService} from "../../../domain/language.service";
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {UserService} from "../../admin/user/user.service";
import {User} from "../../../domain/classes/user";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {Router} from "@angular/router";
import {UserNotification} from "../../../domain/classes/user-notification";
import {DeleteUserComponent} from "../../admin/user/delete-user/delete-user.component";
import {MessageService} from "primeng/api";
import {DeleteNotificationComponent} from "./delete-notification/delete-notification.component";
import {CreateProjectComponent} from "../../admin/project/create-project/create-project.component";
import {CreateNotificationComponent} from "./create-notification/create-notification.component";
import {DepartmentService} from "../../admin/department.service";
import {Departments} from "../../../domain/interfaces/departments";
import {ProjectUser} from "../../../domain/classes/project-user";

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  user: User
  userNotifications: UserNotification[]
  selectedNotifications: UserNotification[]
  deletingNotifications: UserNotification[]
  loading = false;
  visibleProjects: ProjectUser[]
  departments: Departments[]
  methods: string[] = ['mail']
  types: string[] = ['documents']

  constructor(public departmentService: DepartmentService, private dialogService: DialogService, private messageService: MessageService, public l: LanguageService, public auth: AuthManagerService, public issueManager: IssueManagerService, private router: Router, public t: LanguageService, public userService: UserService) {

  }

  ngOnInit(): void {
    this.user = this.auth.getUser()
    this.fillNotifications()
    this.fillVisibleProjects()
    this.fillDepartments()
  }

  fillVisibleProjects() {
    this.userService.getUserVisibleProjects(this.user.id)
      .subscribe(data => {
        this.visibleProjects = data
      })
  }

  fillDepartments() {
    this.departmentService.getDepartments()
      .subscribe(data => {
        this.departments = data
      })
  }

  fillNotifications() {
    this.userService.getUsersNotifications(this.user.id)
      .subscribe(data => {
        this.userNotifications = data
        console.log(this.userNotifications)
      })
  }

  commit() {

  }

  createNotification() {
    this.dialogService.open(CreateNotificationComponent, {
      showHeader: false,
      modal: true,
      data: [this.visibleProjects, this.departments, this.methods, this.types, this.user.id]
    }).onClose.subscribe(res => {
      this.fillNotifications();
    });
  }

  deleteSelectedNotifications() {
    this.deletingNotifications = this.userNotifications.filter(x => !this.selectedNotifications.includes(x))
    this.confirmDeleting()
  }

  deleteNotification(notification: UserNotification) {
    this.deletingNotifications = this.userNotifications.filter(x => x != notification)
    this.confirmDeleting()
  }

  confirmDeleting() {
    this.dialogService.open(DeleteNotificationComponent, {
      showHeader: false,
      modal: true,
      data: [this.deletingNotifications, this.user.id]
    }).onClose.subscribe(res => {
      if (res == 'success') {
        // this.ref.close(res);
        this.messageService.add({
          key: 'home',
          severity: 'success',
          summary: this.l.tr('Удаление уведомления'),
          detail: this.l.tr('Уведомление удалено')
        });
        this.deletingNotifications = []
        this.selectedNotifications = []
        this.fillNotifications()
      } else {
        console.log(res);
        this.messageService.add({
          key: 'home',
          severity: 'error',
          summary: this.l.tr('Удаление уведомления'),
          detail: this.l.tr('Не удалось удалить уведомление')
        });
        this.deletingNotifications = []
        this.selectedNotifications = []
      }
    });
  }

}
