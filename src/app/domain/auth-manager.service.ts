import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import * as props from '../props';
import {CookieService} from "ngx-cookie-service";
import {User} from "./classes/user";
import {Router} from "@angular/router";
import {MessageService} from "primeng/api";
import {Observable} from "rxjs";
import {Issue} from "./classes/issue";
import _ from "underscore";
import {LanguageService} from "./language.service";
import { transliterate as tr, slugify } from 'transliteration';
import {DayCalendar} from "./classes/day-calendar";
import {TimeControlInterval} from "./classes/time-control-interval";

@Injectable({
  providedIn: 'root'
})
export class AuthManagerService {

  private token = '';
  private authenticated = false;
  private user: User = new User();
  users: User[] = [];

  constructor(private cookie: CookieService, private http: HttpClient, private router: Router, private messageService: MessageService, private l: LanguageService) {
    this.fillUsers();
  }
  hasPerms(permissions: string): boolean{
    let find = null;
    if (this.user.shared_access != '' && this.user.shared_access != this.user.login){
      find = this.users.find(x => x.login == this.user.shared_access);
    }
    return this.user.permissions.includes(permissions) || find != null && find.permissions.includes(permissions);
  }
  exit(){
    this.setUser(new User(), true);
    this.authenticated = false;
    this.router.navigate(['login']);
  }
  fillUsers(){
    this.getUsers().then(data => {
      this.users = data;
      this.users.forEach(user => user.userName = this.getUserName(user.login));
      this.users.forEach(user => user.userNameEn = tr(user.userName));
      this.users = _.sortBy(this.users.filter(x => x.surname != 'surname'), x => x.userName);
    });
  }
  getUserName(login: string){
    let find = this.users.find(x => x.login == login);
    if (find != null){
      if (this.l.language == 'ru'){
        return find.surname + ' ' + find.name;
      }
      else{
        return tr(find.surname + ' ' + find.name);
      }
    }
    else{
      return login;
    }
  }
  getUserTrimName(login: string){
    let find = this.users.find(x => x.login == login);
    if (find != null){
      if (this.l.language == 'ru'){
        return find.surname + ' ' + find.name.substr(0,1) + '.';

      }
      else{
        return tr(find.surname) + ' ' + tr(find.name).substr(0,1) + '.';
      }
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
          if (qParams.redirect == '/'){
            if (this.user.permissions.includes('view-documents-n004-only')){
              this.router.navigate(['documents'], {queryParams: {redirect: null, guard: null}, queryParamsHandling: 'merge'});
            }
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
  async shareRights(user: string, with_user: string) {
    return await this.http.get<string[]>(props.http + '/shareRights', {params: {user, with_user}}).toPromise();
  }
  async getUserWatches(): Promise<[]> {
    return await this.http.get<[]>(props.http + '/userWatches').toPromise();
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
