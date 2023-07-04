import { Component, OnInit } from '@angular/core';
import {LanguageService} from "../../../domain/language.service";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {UserService} from "../../admin/user/user.service";
import {User} from "../../../domain/classes/user";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  user: User

  constructor(public auth: AuthManagerService, public issueManager: IssueManagerService, private router: Router, public t: LanguageService, public ref: DynamicDialogRef, public conf: DynamicDialogConfig, public userService: UserService) { }

  ngOnInit(): void {
    if (!this.auth.hasRole('Admin')) {
      this.router.navigate([this.auth.getUser().visible_pages[0]]);
    }
    this.user = this.conf.data as User
  }

  close(){
    this.ref.close('exit');
  }
  commit() {

  }
}
