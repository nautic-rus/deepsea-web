import {ApplicationRef, Component, OnInit} from '@angular/core';
import {Issue} from "../../../domain/classes/issue";
import {User} from "../../../domain/classes/user";
import {ConfirmationService, PrimeNGConfig} from "primeng/api";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {LanguageService} from "../../../domain/language.service";

@Component({
  selector: 'app-accept-to-work',
  templateUrl: './accept-to-work.component.html',
  styleUrls: ['./accept-to-work.component.css']
})
export class AcceptToWorkComponent implements OnInit {

  issue: Issue = new Issue();
  selectedUser: string = '';
  startDate: Date = new Date();
  dueDate: Date = new Date();
  today: Date = new Date();
  overtime = false;
  users: User[] = [];

  constructor(private config: PrimeNGConfig, public ref: DynamicDialogRef, public conf: DynamicDialogConfig, public issueManager: IssueManagerService, public auth: AuthManagerService, private confirmationService: ConfirmationService, private appRef: ApplicationRef,public t: LanguageService) { }

  ngOnInit(): void {
    this.issue = this.conf.data as Issue;
    this.users = this.getUsers();
    this.config.setTranslation({
      dayNamesMin: ["Вс","Пн","Вт","Ср","Чт","Пт","Сб"],
      weekHeader: "№",
      monthNames: ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"],
    });
  }
  close(){
    this.ref.close('exit');
  }

  commit() {
    this.issueManager.assignUser(this.issue.id, this.selectedUser, this.issue.start_date.toString(), this.issue.due_date.toString(), this.issue.overtime, 'Accepted', this.auth.getUser().login).then(res => {
      this.issue.status = 'Accepted';
      this.issue.action = this.issue.status;
      this.issueManager.updateIssue(this.auth.getUser().login, 'status', this.issue).then(() => {
        this.ref.close();
      });
    });
  }
  getUsers() {
    return this.auth.users.filter(x => x.visibility.includes('c'));
  }
}
