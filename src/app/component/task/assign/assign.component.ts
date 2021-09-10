import {ApplicationRef, Component, OnInit} from '@angular/core';
import {Issue} from "../../../domain/classes/issue";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {ConfirmationService} from "primeng/api";

@Component({
  selector: 'app-assign',
  templateUrl: './assign.component.html',
  styleUrls: ['./assign.component.css']
})
export class AssignComponent implements OnInit {

  issue: Issue = new Issue();
  selectedUser: string = '';
  dueDate: Date = new Date();
  today: Date = new Date();
  overtime = false;
  constructor(public ref: DynamicDialogRef, public conf: DynamicDialogConfig, public issueManager: IssueManagerService, public auth: AuthManagerService, private confirmationService: ConfirmationService, private appRef: ApplicationRef) { }

  ngOnInit(): void {
    this.issue = this.conf.data as Issue;
  }

  close(){
    this.ref.close('exit');
  }

  commit() {
    this.issueManager.assignUser(this.issue.id, this.selectedUser, this.dueDate.getTime().toString(), this.overtime ? 'Yes' : 'No').then(res => {
      this.ref.close();
    });
  }
}
