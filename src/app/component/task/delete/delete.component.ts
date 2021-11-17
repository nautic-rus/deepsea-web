import {ApplicationRef, Component, OnInit} from '@angular/core';
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {ConfirmationService, PrimeNGConfig} from "primeng/api";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {Issue} from "../../../domain/classes/issue";
import {LanguageService} from "../../../domain/language.service";

@Component({
  selector: 'app-delete',
  templateUrl: './delete.component.html',
  styleUrls: ['./delete.component.css']
})
export class DeleteComponent implements OnInit {
  issue: Issue = new Issue();
  constructor(public t: LanguageService, private config: PrimeNGConfig, public ref: DynamicDialogRef, public conf: DynamicDialogConfig, public issueManager: IssueManagerService, public auth: AuthManagerService, private confirmationService: ConfirmationService, private appRef: ApplicationRef) { }

  ngOnInit(): void {
    this.issue = this.conf.data as Issue;
  }
  close(){
    this.ref.close('exit');
  }
  commit() {
    this.issueManager.removeIssue(this.issue.id, this.auth.getUser().login).then(res => {
      this.ref.close('success');
    });
  }
}
