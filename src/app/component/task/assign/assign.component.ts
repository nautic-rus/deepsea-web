import {ApplicationRef, Component, OnInit} from '@angular/core';
import {Issue} from "../../../domain/classes/issue";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {ConfirmationService, PrimeNGConfig} from "primeng/api";
import {User} from "../../../domain/classes/user";
import {LanguageService} from "../../../domain/language.service";

@Component({
  selector: 'app-assign',
  templateUrl: './assign.component.html',
  styleUrls: ['./assign.component.css']
})
export class AssignComponent implements OnInit {

  issue: Issue = new Issue();
  selectedUser: string = '';
  startDate: Date = new Date();
  dueDate: Date = new Date();
  today: Date = new Date();
  overtime = false;
  toPlan = true;
  toMe = false;
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
    this.auth.getPlanIssue(this.issue.id).subscribe(planIssue => {
      let actualManHours = planIssue[0].consumed;
      let amount = this.issue.plan_hours - actualManHours;
      if (amount <= 0){
        alert('Не хватает плановых часов для назначения задачи');
        return;
      }
      let user = this.auth.users.find(x => x.login == this.selectedUser);
      if (user == null){
        return;
      }
      if (this.toPlan){
        this.auth.addPlanInterval(this.issue.id, user.id, new Date().getTime(), amount, 0, this.auth.getUser().login).subscribe((res) => {
          if (res == 'success'){
            this.ref.close();
          }
          else{
            alert(res);
          }
        });
      }
      else {
        this.auth.insertPlanInterval(this.issue.id, user.id, this.startDate.getTime(), amount, 0, this.auth.getUser().login).subscribe((res) => {
          if (res == 'success'){
            this.ref.close();
          }
          else{
            alert(res);
          }
        });
      }
    });

    // this.issueManager.assignUser(this.issue.id, this.selectedUser, this.startDate.getTime().toString(), this.dueDate.getTime().toString(), this.overtime ? 'Да' : 'Нет', this.issue.action, this.auth.getUser().login).then(res => {
    //   this.issue.status = 'AssignedTo';
    //   this.issue.action = this.issue.status;
    //   this.issueManager.updateIssue(this.auth.getUser().login, 'status', this.issue).then(() => {
    //     this.ref.close();
    //   });
    // });
  }
  getUsers() {
    return this.auth.users.filter(x => x.visibility.includes('c'));
  }
}
