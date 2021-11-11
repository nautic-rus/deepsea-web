import { Component, OnInit } from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {User} from "../../../domain/classes/user";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.css']
})
export class UserCardComponent implements OnInit {
  user = new User();

  constructor(public ref: DynamicDialogRef, public auth: AuthManagerService, private sanitizer: DomSanitizer, public conf: DynamicDialogConfig) { }

  ngOnInit(): void {
    let login = this.conf.data as string
    let find = this.auth.users.find(x => x.login == login);
    if (find != null){
      this.user = find;
    }
    else{
      this.ref.close('user not found');
    }
  }
  close(){
    this.ref.close('exit');
  }
  sanitize(url:string){
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  getStyle(avatar_full: string) {
    return {
      'background-image': 'url(' + avatar_full + ')'
    };
  }
}
