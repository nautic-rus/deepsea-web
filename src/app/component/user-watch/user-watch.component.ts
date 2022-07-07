import { Component, OnInit } from '@angular/core';
import {AuthManagerService} from "../../domain/auth-manager.service";
import {interval} from "rxjs";
import _ from "underscore";

@Component({
  selector: 'app-user-watch',
  templateUrl: './user-watch.component.html',
  styleUrls: ['./user-watch.component.css']
})
export class UserWatchComponent implements OnInit {
  users: any[] = [];
  selectedUser = '';
  selectedUserImage = '';
  lightBox = false;
  constructor(private auth: AuthManagerService) { }


  refreshUsers(){
    this.auth.getUserWatches().then(res => {
      this.users = _.sortBy(res, (x: any) => x.user);
      this.users.forEach(x => {
        x.time = this.getTime(x.activity, x.user);
        if (this.selectedUser == x.user){
          this.selectedUserImage = 'data:image/jpg;base64,' + x.image;
        }
      });
    });
  }
  ngOnInit(): void {
    this.refreshUsers();
    interval(1000).subscribe(() => {
      this.refreshUsers();
    });
  }
  fromCDate(date: number){
    let cStart = 621355968000000000;
    let dStart = new Date(1970, 0, 1, 0, 0, 0,0).getTime();

    return Math.floor((date - cStart) / 10000) + dStart;
  }
  getTime(timeLong: number, user: string){
    let dif = Math.floor((new Date().getTime() - this.fromCDate(timeLong)) / 1000);
    let seconds = dif % 60;
    let minutes = Math.floor(dif / 60) % 60;
    let hours = Math.floor(dif / 60 / 60);
    if (dif > 5 * 60){
      return ('0' + hours).slice(-2) + ":" + ('0' + minutes).slice(-2) + ":" + ('0' + seconds).slice(-2);
    }
    else{
      return '';
    }
  }

  selectUser(user: string) {
    this.selectedUser = user;
    this.users.forEach(x => {
      if (this.selectedUser == x.user){
        this.selectedUserImage = 'data:image/jpg;base64,' + x.image;
      }
    });
    this.lightBox = true;
  }
  isLightbox() {
    return this.selectedUser != '';
  }
}
