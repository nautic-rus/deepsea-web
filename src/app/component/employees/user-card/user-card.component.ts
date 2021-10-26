import { Component, OnInit } from '@angular/core';
import {DynamicDialogRef} from "primeng/dynamicdialog";
import {User} from "../../../domain/classes/user";
import {AuthManagerService} from "../../../domain/auth-manager.service";

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.css']
})
export class UserCardComponent implements OnInit {
  user = new User();

  constructor(public ref: DynamicDialogRef, public auth: AuthManagerService) { }

  ngOnInit(): void {
    this.user = this.auth.getUser();
  }
  close(){
    this.ref.close('exit');
  }
}
