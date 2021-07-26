import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {AuthManagerService} from "../../domain/auth-manager.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  saveMeChecked = true;
  login = '';
  password = '';
  redirect = '';
  constructor(private route: ActivatedRoute, private auth: AuthManagerService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(param => {
      this.redirect = param['redirect'];
    });
  }

  saveMeCheckedToggle() {
    this.saveMeChecked = !this.saveMeChecked;
  }

  isFilled() {
    return this.login.trim() != '' && this.password.trim() != '';
  }

  processLogin() {
    if (this.isFilled()){
      this.auth.login(this.login.trim().toLowerCase(), this.password, this.redirect, this.saveMeChecked);
    }
  }
}
