import { Component, OnInit } from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {any} from "underscore";
import {LanguageService} from "../../../domain/language.service";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {Issue} from "../../../domain/classes/issue";

@Component({
  selector: 'app-laboriousness',
  templateUrl: './laboriousness.component.html',
  styleUrls: ['./laboriousness.component.css']
})
export class LaboriousnessComponent implements OnInit {

  hoursAmount = '';
  calendarDay = '';
  comment = '';
  today: Date = new Date();
  constructor(public t: LanguageService, public ref: DynamicDialogRef, private issues: IssueManagerService, private auth: AuthManagerService, public conf: DynamicDialogConfig) { }

  ngOnInit(): void {
  }
  commit(){
    this.issues.setIssueLabor(this.auth.getUser().login, (this.conf.data as Issue).id, +this.hoursAmount, this.comment, +this.calendarDay).then(res => {
      this.ref.close('success');
    });
  }
  close() {
    this.ref.close('exit');
  }
}
