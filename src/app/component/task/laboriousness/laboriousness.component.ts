import { Component, OnInit } from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {LanguageService} from "../../../domain/language.service";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {Issue} from "../../../domain/classes/issue";
import {MessageService} from "primeng/api";
import {DailyTask} from "../../../domain/interfaces/daily-task";

@Component({
  selector: 'app-laboriousness',
  templateUrl: './laboriousness.component.html',
  styleUrls: ['./laboriousness.component.css']
})
export class LaboriousnessComponent implements OnInit {

  hoursAmount = '';
  calendarDay: Date = new Date();
  comment = '';
  today: Date = new Date();
  constructor(public t: LanguageService, public ref: DynamicDialogRef, private issues: IssueManagerService, private auth: AuthManagerService, public conf: DynamicDialogConfig, private messageService: MessageService) { }

  ngOnInit(): void {
  }
  commit(){
    let issue = this.conf.data as Issue;
    let t: DailyTask = new DailyTask(
      issue.id,
      this.calendarDay.getTime(),
      new Date().getTime(),
      this.auth.getUser().login,
      issue.project,
      this.comment,
      +this.hoursAmount,
      0,
      this.auth.getUserName(this.auth.getUser().login),
      issue.doc_number,
      '',
      0,
      0,
      '',
      '',
      '',
      false,
    );
    if (+this.hoursAmount + issue.labor > issue.plan_hours){
      // this.messageService.add({
      //   severity: 'error',
      //   summary: 'Ошибка',
      //   detail: 'Количество затраченых на работу часов больше чем плановое количество'
      // });
      // return;
    }
    this.issues.addDailyTask(t.toJson()).then(r => {
      this.ref.close('success');
    });
  }
  generateId(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() *
        charactersLength));
    }
    return result;
  }
  close() {
    this.ref.close('exit');
  }
}
