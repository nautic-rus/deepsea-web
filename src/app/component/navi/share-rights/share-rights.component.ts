import {ApplicationRef, Component, OnInit} from '@angular/core';
import {User} from "../../../domain/classes/user";
import {ConfirmationService, PrimeNGConfig} from "primeng/api";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {LanguageService} from "../../../domain/language.service";

@Component({
  selector: 'app-share-rights',
  templateUrl: './share-rights.component.html',
  styleUrls: ['./share-rights.component.css']
})
export class ShareRightsComponent implements OnInit {

  selectedUser: string = '';
  users: User[] = [];

  constructor(private config: PrimeNGConfig, public ref: DynamicDialogRef, public conf: DynamicDialogConfig, public issueManager: IssueManagerService, public auth: AuthManagerService, private confirmationService: ConfirmationService, private appRef: ApplicationRef,public t: LanguageService) { }

  ngOnInit(): void {
    this.users = this.getUsers();
  }
  close(){
    this.ref.close('exit');
  }
  commit() {
    this.auth.shareRights(this.auth.getUser().login, this.selectedUser).then(res => {
      this.ref.close('exit');
      location.reload();
    });
  }
  getUsers() {
    return this.auth.users.filter(x => x.visibility.includes('c'));
  }
}
