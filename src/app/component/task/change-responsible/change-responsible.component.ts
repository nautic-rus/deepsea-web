import {ApplicationRef, Component, OnInit} from '@angular/core';
import {Issue} from "../../../domain/classes/issue";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {ConfirmationService} from "primeng/api";
import {User} from "../../../domain/classes/user";
import {LanguageService} from "../../../domain/language.service";

@Component({
  selector: 'app-change-responsible',
  templateUrl: './change-responsible.component.html',
  styleUrls: ['./change-responsible.component.css']
})
export class ChangeResponsibleComponent implements OnInit {

  issue: Issue = new Issue();
  selectedUser: string = '';
  users: User[] = [];

  constructor(public t: LanguageService, public ref: DynamicDialogRef, public conf: DynamicDialogConfig, public issueManager: IssueManagerService, public auth: AuthManagerService, private confirmationService: ConfirmationService, private appRef: ApplicationRef, ) { }

  ngOnInit(): void {
    this.issue = this.conf.data as Issue;
    this.users = this.getUsers();
  }

  close(){
    this.ref.close('exit');
  }

  commit() {
    this.issueManager.changeResponsible(this.issue.id, this.selectedUser).then(res => {
      this.ref.close();
    });
  }

  getUsers() {
    return this.auth.users.filter(x => x.visibility.includes('c'));
  }

}
