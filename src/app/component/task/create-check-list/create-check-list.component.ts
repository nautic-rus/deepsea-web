import {ApplicationRef, Component, OnInit} from '@angular/core';
import {Issue} from "../../../domain/classes/issue";
import {User} from "../../../domain/classes/user";
import {LanguageService} from "../../../domain/language.service";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {ConfirmationService} from "primeng/api";
import {IssueCheck} from "../../../domain/classes/issue-check";
import _ from "underscore";

@Component({
  selector: 'app-create-check-list',
  templateUrl: './create-check-list.component.html',
  styleUrls: ['./create-check-list.component.css']
})
export class CreateCheckListComponent implements OnInit {

  issue: Issue = new Issue();
  selectedUser: string = '';
  users: User[] = [];
  issueChecks: IssueCheck[] = [];

  constructor(public t: LanguageService, public ref: DynamicDialogRef, public conf: DynamicDialogConfig, public issueManager: IssueManagerService, public auth: AuthManagerService, private confirmationService: ConfirmationService, private appRef: ApplicationRef, ) { }

  ngOnInit(): void {
    this.issue = this.conf.data as Issue;
    this.users = this.getUsers();
    this.issueChecks = this.issue.checks;
  }

  close(){
    this.ref.close('exit');
  }

  commit() {
    this.issue.checks = _.sortBy(this.issueChecks, x => x.check_group);
    this.ref.close('save');
  }

  getUsers() {
    return this.auth.users.filter(x => x.visibility.includes('c'));
  }

  addRow() {
    let check = new IssueCheck();
    check.check_description = 'New Description';
    check.check_group = 'New Group';
    if (this.issueChecks.length > 0){
      check.check_group = this.issueChecks[this.issueChecks.length - 1].check_group;
    }

    this.issueChecks.push(check);
    this.issueChecks = [...this.issueChecks];
  }

  delete(check: any) {
    this.issueChecks.splice(this.issueChecks.indexOf(check), 1);
  }
}