import {ApplicationRef, Component, OnInit} from '@angular/core';
import {Issue} from "../../../domain/classes/issue";
import {User} from "../../../domain/classes/user";
import {ConfirmationService, PrimeNGConfig} from "primeng/api";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {LanguageService} from "../../../domain/language.service";
import {forkJoin} from "rxjs";

@Component({
  selector: 'app-assign-question',
  templateUrl: './assign-question.component.html',
  styleUrls: ['./assign-question.component.css']
})
export class AssignQuestionComponent implements OnInit {

  issue: Issue = new Issue();
  selectedUser: string = '';
  startDate: Date = new Date();
  dueDate: Date = new Date();
  today: Date = new Date();
  overtime = false;
  users: User[] = [];
  labor = 0;
  issues: Issue[] = [];
  selectedIssues: number[] = [];

  constructor(private config: PrimeNGConfig, public ref: DynamicDialogRef, public conf: DynamicDialogConfig, public issueManager: IssueManagerService, public auth: AuthManagerService, private confirmationService: ConfirmationService, private appRef: ApplicationRef,public t: LanguageService) { }

  ngOnInit(): void {
    this.issue = this.conf.data as Issue;
    this.users = this.getUsers();
    this.config.setTranslation({
      dayNamesMin: ["Вс","Пн","Вт","Ср","Чт","Пт","Сб"],
      weekHeader: "№",
      monthNames: ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"],
    });
    this.issueManager.getIssues('op').then(res => {
      this.issues = res.filter(x => x.issue_type == 'RKD');
    });
  }
  close(){
    this.ref.close('exit');
  }

  commit() {
    this.issueManager.assignUser(this.issue.id, this.selectedUser, this.startDate.getTime().toString(), this.dueDate.getTime().toString(), 'Нет', this.issue.action, this.auth.getUser().login).then(res => {
      this.issue.status = 'In Work';
      this.issue.action = this.issue.status;
      this.issueManager.updateIssue(this.auth.getUser().login, 'status', this.issue).then(() => {
        this.issueManager.setPlanHours(this.issue.id, this.auth.getUser().login, this.labor).then(() => {
          forkJoin(this.selectedIssues.map(issueId => this.issueManager.combineIssues(this.issue.id, issueId, this.auth.getUser().login))).subscribe(res => {
            this.ref.close();
          });
        });
      });
    });
  }
  getUsers() {
    return this.auth.users.filter(x => x.visibility.includes('c'));
  }
}
