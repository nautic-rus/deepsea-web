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
  constructor(private auth: AuthManagerService) { }


  refreshUsers(){
    this.auth.getUserWatches().then(res => {
      this.users = _.sortBy(res, (x: any) => x.user);
    });
  }
  ngOnInit(): void {
    interval(1000).subscribe(() => {
      this.refreshUsers();
    });
  }

}
