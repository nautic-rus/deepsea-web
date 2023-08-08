import { Component, OnInit } from '@angular/core';
import {LanguageService} from "../../../../domain/language.service";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {UserService} from "../../../admin/user/user.service";

@Component({
  selector: 'app-delete-notification',
  templateUrl: './delete-notification.component.html',
  styleUrls: ['./delete-notification.component.css']
})
export class DeleteNotificationComponent implements OnInit {

  constructor(public t: LanguageService, public ref: DynamicDialogRef, public conf: DynamicDialogConfig, public userService: UserService) { }

  ngOnInit(): void {
  }

  close(){
    this.ref.close('exit');
  }
  commit() {
    this.userService.updateNotification(this.conf.data[0], this.conf.data[1]).subscribe({
      next: res => {
        console.log(res);
        this.ref.close('success');
      },
      error: err => {
        console.log(err);
        this.ref.close('error');
      }
    });
  }

}
