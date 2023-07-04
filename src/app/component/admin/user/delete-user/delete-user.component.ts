import { Component, OnInit } from '@angular/core';
import {LanguageService} from "../../../../domain/language.service";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {UserService} from "../user.service";

@Component({
  selector: 'app-delete-user',
  templateUrl: './delete-user.component.html',
  styleUrls: ['./delete-user.component.css']
})
export class DeleteUserComponent implements OnInit {
  constructor(public t: LanguageService, public ref: DynamicDialogRef, public conf: DynamicDialogConfig, public userService: UserService) { }

  ngOnInit(): void {
  }

  close(){
    this.ref.close('exit');
  }
  commit() {
    this.userService.deleteUser(this.conf.data).subscribe({
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
