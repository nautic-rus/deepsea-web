import {ApplicationRef, Component, OnInit} from '@angular/core';
import {Issue} from "../../../domain/classes/issue";
import {User} from "../../../domain/classes/user";
import {ConfirmationService, PrimeNGConfig} from "primeng/api";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {LanguageService} from "../../../domain/language.service";

@Component({
  selector: 'app-subscribe-for-notifications',
  templateUrl: './subscribe-for-notifications.component.html',
  styleUrls: ['./subscribe-for-notifications.component.css']
})
export class SubscribeForNotificationsComponent implements OnInit {
  issue: Issue = new Issue();
  selectedUser: string = '';
  startDate: Date = new Date();
  dueDate: Date = new Date();
  today: Date = new Date();
  emailEnabled = true;
  rocketEnabled = true;
  email = '';
  rocket = '';
  users: User[] = [];

  constructor(private config: PrimeNGConfig, public ref: DynamicDialogRef, public conf: DynamicDialogConfig, public issueManager: IssueManagerService, public auth: AuthManagerService, private confirmationService: ConfirmationService, private appRef: ApplicationRef,public t: LanguageService) { }

  ngOnInit(): void {
    this.email = this.auth.getUser().email;
    this.rocket = this.auth.getUser().rocket_login;
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
    let options = [];
    if (this.emailEnabled){
      options.push('mail');
    }
    if (this.rocketEnabled){
      options.push('rocket');
    }
    if (this.auth.getUser().email != this.email.trim()){
      this.auth.updateEmail(this.auth.getUser().login, this.email.trim());
    }
    if (this.auth.getUser().rocket_login != this.rocket.trim()){
      this.auth.updateRocketLogin(this.auth.getUser().login, this.rocket.trim());
    }
    this.issueManager.subscribeForIssue(this.auth.getUser().login, this.issue.id, options.join(',')).then(res => {
      this.ref.close();
    });
  }
  getUsers() {
    return this.auth.users.filter(x => x.visibility.includes('c'));
  }
}
