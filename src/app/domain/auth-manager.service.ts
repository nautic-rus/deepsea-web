import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import * as props from '../props';
import {CookieService} from "ngx-cookie-service";
import {User} from "./classes/user";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class AuthManagerService {

  private token = '';
  private authenticated = false;
  private user: User = new User();

  constructor(private cookie: CookieService, private http: HttpClient, private router: Router) {

  }

  login(login: string, password: string, redirect = '', save = true){
    this.http.get(props.http + '/login', {params: {login: login, password: password}}).subscribe({
      next: data => {
        let user = data as User;
        if (user != null){
          this.setUser(user, save);
          if (redirect != ''){
            this.router.navigate([redirect]);
          }
        }
        console.log(data);
      },
      error: error => {
        console.log(error);
      }
    });
  }
  setUser(user: User, save = true){
    this.token = user.token;
    this.authenticated = true;
    let now = new Date(),
      expireDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());
    if (save){
      this.cookie.set('token', this.token, expireDate, '', '', false, 'Lax');
    }
    this.user = user;
    this.authenticated = true;
  }

  async checkAuth(state: string = '') {
    if (this.authenticated){
      return true;
    }
    else{
      this.token = this.cookie.check('token') ? this.cookie.get('token') : '';
      const data = await this.http.get(props.http + '/login', {params: {token: this.token}}).toPromise();
      const user = data as User;
      if (user != null && (data as string) != 'wrong-token'){
        this.setUser(user);
        return true;
      }
      else{
        await this.router.navigate(['login'], {queryParams: {redirect: state}});
        return false;
      }
    }
  }
  isAuth(){
    return this.authenticated;
  }
}
