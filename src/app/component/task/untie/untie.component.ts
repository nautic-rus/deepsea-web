import { Component, OnInit } from '@angular/core';
import {LanguageService} from "../../../domain/language.service";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {AuthManagerService} from "../../../domain/auth-manager.service";

@Component({
  selector: 'app-untie',
  templateUrl: './untie.component.html',
  styleUrls: ['./untie.component.css']
})
export class UntieComponent implements OnInit {

  idFirst = 0;
  idSecond = 0;
  constructor(public t: LanguageService, public conf: DynamicDialogConfig, public ref: DynamicDialogRef, public issue: IssueManagerService, public auth: AuthManagerService) { }

  ngOnInit(): void {
    this.idFirst = this.conf.data[0];
    this.idSecond = this.conf.data[1];
  }
  close(){
    this.ref.close('exit');
  }


  unTie() {
    this.issue.unCombineIssues(this.idFirst, this.idSecond, this.auth.getUser().login).subscribe(res => {
      this.ref.close('success');
    });
  }
}
