import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {LanguageService} from "../../domain/language.service";

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
  constructor(public t: LanguageService, private route: ActivatedRoute, private auth: AuthManagerService, private router: Router) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.redirect = params['redirect'];
      const guard = params['guard'];
      if (guard == null || guard == '0'){
        this.auth.checkAuth(null, true);
      }
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
      this.auth.login(this.login.trim().toLowerCase(), this.password, this.redirect, true, this.saveMeChecked);
    }
  }

  toggleVisibility(input: HTMLInputElement, img: HTMLImageElement) {
    input.type = input.type.includes('password') ? 'text' : 'password';
    img.src = img.src.includes('assets/icons/visibility_1.svg') ? 'assets/icons/visibility.svg' : 'assets/icons/visibility_1.svg';
  }
}
