import { Component, OnInit } from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {LanguageService} from "../../../domain/language.service";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {Issue} from "../../../domain/classes/issue";
import {MessageService} from "primeng/api";

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
    this.issues.setIssueLabor(this.auth.getUser().login, (this.conf.data as Issue).id, +this.hoursAmount, this.comment, +this.calendarDay).then(res => {
      this.messageService.add({key:'task', severity:'success', summary:'Set Labor', detail:'You have successfully updated issue labor.'});
      //this.ref.close('success');
    });
  }
  close() {
    this.ref.close('exit');
  }
}
