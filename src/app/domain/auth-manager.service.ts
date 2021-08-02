import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import * as props from '../props';
import {CookieService} from "ngx-cookie-service";
import {User} from "./classes/user";
import {Router} from "@angular/router";
import {MessageService} from "primeng/api";

@Injectable({
  providedIn: 'root'
})
export class AuthManagerService {

  private token = '';
  private authenticated = false;
  private user: User = new User();

  constructor(private cookie: CookieService, private http: HttpClient, private router: Router, private messageService: MessageService) {

  }

  login(login: string, password: string, redirectUrl = '', redirect = true, save = true){
    this.http.get(props.http + '/login', {params: {login: login, password: password}}).subscribe({
      next: data => {
        let user = data as User;
        if (data as string == 'wrong-password'){
          this.messageService.add({severity:'error', summary:'Authentication', detail:'Wrong Password'});
        }
        else if (user != null){
          this.setUser(user, save);
          if (redirect){
            this.router.navigate([redirectUrl], {queryParams: {redirect: null, guard: null}, queryParamsHandling: 'merge'});
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

  async checkAuth(qParams: any = null, noGuard = false) {
    if (this.authenticated){
      return true;
    }
    else{
      this.token = this.cookie.check('token') ? this.cookie.get('token') : '';
      const data = await this.http.get(props.http + '/login', {params: {token: this.token}}).toPromise();
      const user = data as User;
      if (user != null && (data as string) != 'wrong-token'){
        this.setUser(user);
        if (noGuard){
          await this.router.navigate(['']);
        }
        return true;
      }
      else{
        await this.router.navigate(['login'], {queryParams: qParams});
        return false;
      }
    }
  }
  isAuth(){
    return this.authenticated;
  }
}
