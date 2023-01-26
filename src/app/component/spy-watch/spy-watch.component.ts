import { Component, OnInit } from '@angular/core';
import {AuthManagerService} from "../../domain/auth-manager.service";
import _ from "underscore";
import {interval} from "rxjs";
import {Router} from "@angular/router";

@Component({
  selector: 'app-spy-watch',
  templateUrl: './spy-watch.component.html',
  styleUrls: ['./spy-watch.component.css']
})
export class SpyWatchComponent implements OnInit {

  users: any[] = [];
  selectedUser = '';
  selectedUserImage = '';
  selectedUserImageIndex = 0;
  lightBox = false;
  time = 0;
  constructor(private auth: AuthManagerService, public router: Router) { }


  refreshUsers(){
    if (this.auth.getUser().login != 'stropilov' && !this.auth.getUser().login.includes('isaev')){
      this.router.navigate(['']);
    }
    this.auth.getSpyWatches().then(res => {
      this.users = _.sortBy(res, (x: any) => x.user);
      this.users.forEach(x => {
        x.time = this.getTime(x.activity);
        x.timeAfk = this.getAfkTime(x.activity);
        if (this.selectedUser == x.user){
          this.selectedUserImage = 'data:image/jpg;base64,' + x.images[this.selectedUserImageIndex];
        }
      });
    });
  }
  ngOnInit(): void {
    this.refreshUsers();
    this.auth.getTime().then(res => {
      this.time = res;
    });
    interval(1000).subscribe(() => {
      this.refreshUsers();
      this.time += 1000;
    });
    interval(60 * 1000).subscribe(() => {
      this.auth.getTime().then(res => {
        this.time = res;
      });
    });
  }
  fromCDate(date: number){
    let cStart = 621355968000000000;
    let dStart = new Date(1970, 0, 1, 0, 0, 0,0).getTime();

    return Math.floor((date - cStart) / 10000) + dStart;
  }
  getTime(timeLong: number){
    let date = new Date(timeLong);
    return ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2) + " / " + ('0' + date.getDate()).slice(-2) + "-" + ('0' + (date.getMonth() + 1)).slice(-2) + "-" + date.getFullYear();
  }
  getTimeNoDate(timeLong: number){
    let date = new Date(timeLong);
    return ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2);
  }
  selectUser(user: string, imageIndex: number) {
    this.selectedUser = user;
    this.selectedUserImageIndex = imageIndex;
    this.users.forEach(x => {
      if (this.selectedUser == x.user){
        this.selectedUserImage = 'data:image/jpg;base64,' + x.images[this.selectedUserImageIndex];
      }
    });
    this.lightBox = true;
  }

  getAfkTime(activity: number) {
    if (this.time == 0){
      return 0;
    }
    let afk = this.time - activity;
    let hours = Math.floor((afk / 1000 / 60 / 60) % 60);
    let minutes = Math.floor((afk / 1000 / 60) % 60);
    let seconds = Math.floor((afk / 1000) % 60);
    return hours + ':' + ('0' + minutes).slice(-2) + ':' +  ('0' + seconds).slice(-2);
  }

  getAfkMinutes(activity: number) {
    return Math.floor((this.time - activity) / 1000 / 60);
  }
}
