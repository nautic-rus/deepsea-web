import {Component, OnInit} from '@angular/core';
import {LanguageService} from "../../../../domain/language.service";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {RightService} from "../../../admin/right/right.service";
import {Rights} from "../../../../domain/interfaces/rights";
import {UserService} from "../../../admin/user/user.service";
import {ProjectUser} from "../../../../domain/classes/project-user";
import {Departments} from "../../../../domain/interfaces/departments";
import {UserNotification} from "../../../../domain/classes/user-notification";
import {MessageService} from "primeng/api";

@Component({
  selector: 'app-create-notification',
  templateUrl: './create-notification.component.html',
  styleUrls: ['./create-notification.component.css']
})
export class CreateNotificationComponent implements OnInit {
  name: string = '';
  visibleProjects: ProjectUser[]
  departments: Departments[]
  methods: string[]
  types: string[]
  userId: number

  project: string = ""
  department: string = ""
  type: string = ""
  method: string = ""

  constructor(public l: LanguageService, private messageService: MessageService, public conf: DynamicDialogConfig, public lang: LanguageService, public ref: DynamicDialogRef, public userService: UserService) {
  }

  ngOnInit(): void {
    this.visibleProjects = this.conf.data[0]
    this.departments = this.conf.data[1]
    this.methods = this.conf.data[2]
    this.types = this.conf.data[3]
    this.userId = this.conf.data[4]
  }

  close() {
    this.ref.close();
  }

  createRole() {
    let projectId = this.visibleProjects.filter(x => x.projectName == this.project).map(x => x.projectId)[0]
    let departmentId = this.departments.filter(x => x.name == this.department).map(x => x.id)[0]
    let notification: UserNotification = {
      userId: this.userId,
      kind: this.type,
      method: this.method,
      project: this.project,
      projectId: projectId,
      department: this.department,
      departmentId: departmentId,
    }

    console.log(notification)

    this.userService.createNotification(notification).subscribe({
      next: res => {
        console.log(res);
        this.messageService.add({key:'admin', severity:'success', summary: this.lang.tr('Создание уведомления'), detail: this.lang.tr('Новое уведомление создано')})
        this.ref.close(res);
      },
      error: err => {
        console.log(err);
        this.ref.close(err);
        this.messageService.add({key:'admin', severity:'error', summary: this.lang.tr('Создание уведомления'), detail: this.lang.tr('Не удалось создать новое уведомление')})
      }
    });
  }

}
