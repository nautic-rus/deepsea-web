import {Component, OnInit} from '@angular/core';
import {LanguageService} from "../../../../domain/language.service";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {UserService} from "../../../admin/user/user.service";
import {ProjectUser} from "../../../../domain/classes/project-user";
import {Departments} from "../../../../domain/interfaces/departments";
import {UserNotification} from "../../../../domain/classes/user-notification";
import {MessageService} from "primeng/api";
import {Observable, zip} from "rxjs";
import {IssueManagerService} from "../../../../domain/issue-manager.service";
import {LV} from "../../../../domain/classes/lv";

@Component({
  selector: 'app-create-notification',
  templateUrl: './create-notification.component.html',
  styleUrls: ['./create-notification.component.css']
})
export class CreateNotificationComponent implements OnInit {
  name: string = '';
  visibleProjects: ProjectUser[];
  departments: Departments[];
  methods: string[];
  types: string[];
  userId: number;

  project: string[];
  department: string[];
  type: string[];
  method: string[];

  constructor(public issueManager: IssueManagerService, public t: LanguageService, private messageService: MessageService, public conf: DynamicDialogConfig, public ref: DynamicDialogRef, public userService: UserService) {
  }

  ngOnInit(): void {
    this.issueManager.getDepartments().subscribe(departments => {
      this.visibleProjects = this.conf.data[0];
      this.departments = departments.filter(x => x.visible_documents == 1).map(x => Object({
        id: x.id,
        name: x.name,
        manager: x.manager
      }));
      this.methods = this.conf.data[2];
      this.types = this.conf.data[3];
      this.userId = this.conf.data[4];
    });
  }

  close() {
    this.ref.close();
  }

  createRole() {
    let observers: Observable<string>[] = [];
    this.project.forEach(project => {
      let projectId = this.visibleProjects.filter(x => x.projectName == project).map(x => x.projectId)[0];
      this.department.forEach(department => {
        let departmentId = this.departments.filter(x => x.name == department).map(x => x.id)[0];
        this.types.forEach(type => {
          this.method.forEach(method => {
            let notification: UserNotification = {
              userId: this.userId,
              kind: type,
              method: method,
              project: project,
              projectId: projectId,
              department: department,
              departmentId: departmentId,
            };
            let obs = this.userService.createNotification(notification);
            observers.push(obs);
          });
        });
      });
    });

    zip(...observers).subscribe(res => {
      this.messageService.add({key:'admin', severity:'success', summary: this.t.tr('Создание уведомления'), detail: this.t.tr('Новое уведомление создано')});
      this.ref.close();
    });
  }

}
