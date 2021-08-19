import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import * as props from '../props';
import {CookieService} from "ngx-cookie-service";
import {User} from "./classes/user";
import {Router} from "@angular/router";
import {MessageService} from "primeng/api";
import {Observable} from "rxjs";
import {Issue} from "./classes/issue";

@Injectable({
  providedIn: 'root'
})
export class AuthManagerService {

  private token = '';
  private authenticated = false;
  private user: User = new User();
  users: User[] = [];

  constructor(private cookie: CookieService, private http: HttpClient, private router: Router, private messageService: MessageService) {
    this.fillUsers();
  }
  hasPerms(permissions: string): boolean{
    return this.user.permissions.includes(permissions);
  }
  exit(){
    this.setUser(new User(), true);
    this.authenticated = false;
    this.router.navigate(['login']);
  }
  fillUsers(){
    this.getUsers().then(data => {
      this.users = data;
    });
  }
  getUserName(login: string){
    let find = this.users.find(x => x.login == login);
    if (find != null){
      return find.surname + ' ' + find.name;
    }
    else{
      return login;
    }
  }
  getUserAvatar(login: string){
    let find = this.users.find(x => x.login == login);
    if (find != null){
      return find.avatar;
    }
    else{
      return '';
    }
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
    console.log(user);
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
  getUser(): User{
    return this.user;
  }
  async getUsers(): Promise<User[]> {
    return await this.http.get<User[]>(props.http + '/users').toPromise();
  }
  async checkAuth(qParams: any = null, noGuard = false) {
    // this.authenticated = true;
    // return true;
    if (this.authenticated){
      return true;
    }
    else{
      this.token = this.cookie.check('token') ? this.cookie.get('token') : '';
      return await this.http.get(props.http + '/login', {params: {token: this.token}}).toPromise().then(response => {
        const user = response as User;
        if (user != null && (response as string) != 'wrong-token'){
          this.setUser(user);
          if (noGuard){
            this.router.navigate(['']);
          }
          return true;
        }
        else{
          this.router.navigate(['login'], {queryParams: qParams});
          return false;
        }
      }).catch(error => {
        alert('SERVER IS UNAVAILABLE');
        this.router.navigate(['login'], {queryParams: qParams});
        return false;
      });
    }
  }
  isAuth(){
    return this.authenticated;
  }

  getUserProfession(login: string) {
    let find = this.users.find(x => x.login == login);
    if (find != null){
      return find.profession;
    }
    else{
      return login;
    }
  }
}
