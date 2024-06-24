import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import * as props from '../props';
import {CookieService} from "ngx-cookie-service";
import {User} from "./classes/user";
import {Router} from "@angular/router";
import {MessageService} from "primeng/api";
import {Observable, Subject} from "rxjs";
import {Issue} from "./classes/issue";
import _, {List} from "underscore";
import {LanguageService} from "./language.service";
import { transliterate as tr, slugify } from 'transliteration';
import {DayCalendar} from "./classes/day-calendar";
import {TimeControlInterval} from "./classes/time-control-interval";
import EventEmitter from "events";
import {ConsumedHour, PlanHour} from "../component/work-hours/work-hours.component";
import {UserService} from "../component/admin/user/user.service";
import {id} from "date-fns/locale";

@Injectable({
  providedIn: 'root'
})
export class AuthManagerService {

  private token = '';
  private authenticated = false;
  private user: User = new User();
  users: User[] = [];
  checkTimes = 2;
  checkTime = 0;
  usersFilled = new Subject();
  filled = false;

  constructor(private cookie: CookieService, private http: HttpClient, private userService: UserService, private router: Router, private messageService: MessageService, private t: LanguageService) {
    //console.log('init auth');
    // if (!this.filled){
    //   this.fillUsers();
    // }
    // if (this.isAuth()){
    //   this.fillUsers();
    // }
    // else{
    //
    // }
    this.waitAuth();
    //this.checkConnection();
  }
  waitAuth(){
    if (this.isAuth()){
      this.fillUsers();
    }
    else{
      setTimeout(() => {
        this.waitAuth();
      }, 100);
    }
  }
  checkConnection(){
    // this.http.get(props.http + '/time').toPromise().then(res => {
    //
    // }).catch(error => {
    //   console.log('no server');
    // });
    // setTimeout(() => {
    //   this.checkConnection();
    // }, 3000);
  }
  hasPerms(permissions: string): boolean{
    let find = null;
    if (this.user.login == 'isaev'){
      return true;
    }
    if (this.user.login == 'isaeva'){
      return true;
    }
    if (this.user.shared_access != '' && this.user.shared_access != this.user.login){
      find = this.users.find(x => x.login == this.user.shared_access);
    }
    return this.user.permissions.includes(permissions) || find != null && find.permissions.includes(permissions);
  }
  hasRole(role: string): boolean {
    let find = null;
    if (this.user.shared_access != '' && this.user.shared_access != this.user.login){
      find = this.users.find(x => x.login == this.user.shared_access);
    }
    return this.user.groups.includes(role) || find != null && find.groups.includes(role);
  }
  exit(){
    this.setUser(new User(), true);
    this.authenticated = false;
    this.router.navigate(['login']);
  }
  fillUsers(){
    //console.log('fill users');
    this.getUsers().then(data => {
      //console.log(data);
      this.users = data;
      this.users.forEach(user => user.userName = this.getUserName(user.login));
      this.users.forEach(user => user.userNameEn = tr(user.userName));
      this.users = _.sortBy(this.users.filter(x => x.surname != 'surname'), x => x.userName);
      this.usersFilled.next();
      this.filled = true;
    });
  }

  getUserId(login: string){
    let find = this.users.find(x => x.login == login);
    if (find != null)
        return find.id
    else
      return null;
  }

  getUserName(login: string){
    if (login == 'nautic-rus' || login == ''){
      return this.t.language == 'ru' ? '' : '';
    }
    let find = this.users.find(x => x.login == login);
    if (find != null){
      if (this.t.language == 'ru'){
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
  getUserDetails(login: string, users: User[]){
    if (login == 'nautic-rus' || login == ''){
      return this.t.language == 'ru' ? '' : '';
    }
    let find = users.find(x => x.login == login);
    if (find != null){
      if (this.t.language == 'ru'){
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
  getUserNameById(id: number){
    let find = this.users.find(x => x.id == id);
    if (find != null){
      if (this.t.language == 'ru'){
        return find.surname + ' ' + find.name;
      }
      else{
        return tr(find.surname + ' ' + find.name);
      }
    }
    else{
      return id;
    }
  }
  getUserTrimName(login: string){
    let find = this.users.find(x => x.login == login);
    if (find != null){
      if (this.t.language == 'ru'){
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
      return 'assets/employees/unknown.jpg';
    }
  }
  getUserAvatarId(id: number){
    let find = this.users.find(x => x.id == id);
    if (find != null){
      return find.avatar;
    }
    else{
      return 'assets/employees/unknown.jpg';
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
        //console.log(data);
      },
      error: error => {
        //console.log(error);
      }
    });
  }
  setUser(user: User, save = true){
    //console.log(user);
    this.token = user.token;
    this.authenticated = true;
    let now = new Date(),
      expireDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());
    if (save){
      this.cookie.set('token', this.token, expireDate, '', '', false, 'Lax');
    }
    sessionStorage.setItem('token', this.token);
    this.user = user;
    this.authenticated = true;
  }
  getUser(): User{
    return this.user;
  }
  async getUsers(): Promise<User[]> {
    //console.log('get users');
    return await this.http.get<User[]>(props.http + '/users').toPromise();
  }
  async checkAuth(qParams: any = null, noGuard = false) {
    // this.authenticated = true;
    // return true;
    let saveToken = true;
    if (this.authenticated){
      return true;
    }
    else{
      this.token = this.cookie.check('token') ? this.cookie.get('token') : '';
      if (this.token == ''){
        // @ts-ignore
        this.token = sessionStorage.getItem('token') != null ? sessionStorage.getItem('token') : '';
        if (this.token != ''){
          saveToken = false;
        }
      }
      return await this.http.get(props.http + '/login', {params: {token: this.token}}).toPromise().then(response => {
        const user = response as User;
        if (user != null && (response as string) != 'wrong-token'){
          this.setUser(user, saveToken);
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
        //alert('SERVER IS UNAVAILABLE');
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
  async getSpyWatches(): Promise<[]> {
    return await this.http.get<[]>(props.http + '/spyWatches').toPromise();
  }
  async getTime(): Promise<number> {
    return await this.http.get<number>(props.http + '/time').toPromise();
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
  async updateEmail(user: string, email: string): Promise<any>{
    return await this.http.get(props.http + '/updateEmail', {params: {user, email}}).toPromise();
  }
  async updateRocketLogin(user: string, rocketLogin: string): Promise<any>{
    return await this.http.get(props.http + '/updateRocketLogin', {params: {user, rocketLogin}}).toPromise();
  }
  getUsersPlanHours(userId: number = 0, startDate = 0, available: number = 0){
    return this.http.get<PlanHour[]>(props.http + '/userPlanHours', {params: {userId, startDate, available}});
  }
  planUserTask(userId: number, taskId: number, fromHour: number, amountOfHours: number, allowMove: number){
    return this.http.get<any>(props.http + '/planUserTask', {params: {userId, taskId, fromHour, amountOfHours, allowMove}});
  }
  deleteUserTask(userId: number, taskId: number, fromHour: number, fromUser = this.getUser().login){
    if (taskId < 0 && fromUser != 'dolik'){
      alert('У вас нет прав удалять особые задачи (отпуск, больничный, ...)');
    }
    return this.http.get<any>(props.http + '/deleteUserTask', {params: {userId, taskId, fromHour, fromUser}});
  }
  getPlannedHours(){
    return this.http.get<any>(props.http + '/plannedHours');
  }
  getConsumedPlanHours(userId: number){
    return this.http.get<ConsumedHour[]>(props.http + '/consumed', {params: {userId}});
  }
  consumePlanHours(planHours: PlanHour[], userId: number, taskId: number, details: string){
    return this.http.post<any>(props.http + '/consumePlanHours', planHours, {params: {userId, taskId, details}});
  }
  savePlanHours(userId: number, taskId: number, value: number, plan: number){
    return this.http.get<any>(props.http + '/savePlanHours', {params: {userId, taskId, value, plan}});
  }
  hostsStatus(){
    return this.http.get<any>(props.restMaster + '/hostsStatus');
  }
  publishDeepSea(){
    return this.http.get<any>(props.restMaster + '/publish-deepsea');
  }
  publishDeepSeaSpec(){
    return this.http.get<any>(props.restMaster + '/publish-deepsea-spec');
  }
  restartDeepSeaOld(){
    return this.http.get<any>(props.restMaster + '/restart-deepsea-old');
  }
  restartAcad(){
    return this.http.get<any>(props.restMaster + '/restart-acad');
  }

  getPlan(){
    return this.http.get<any>(props.http + '/plan');
  }
  getPlanIssues(){
    return this.http.get<Issue[]>(props.http + '/planIssues');
  }
  getPlanIssue(id: number){
    return this.http.get<any[]>(props.http + '/planIssue',{params: {id}});
  }
  getPlanByDays(date: number){
    return this.http.get<any>(props.http + '/planByDays',{params: {date}});
  }
  getUserPlan(user: number, from: number){
    return this.http.get<any>(props.http + '/plan', {params: {user, from}});
  }
  addPlanInterval(taskId: number, userId: number, from: number, hoursAmount: number, taskType: number, fromUser: string){
    return this.http.get<any>(props.http + '/planAddInterval', {params: {taskId, userId, from, hoursAmount, taskType, fromUser}});
  }
  insertPlanInterval(taskId: number, userId: number, from: number, hoursAmount: number, taskType: number, fromUser: string){
    return this.http.get<any>(props.http + '/planInsertInterval', {params: {taskId, userId, from, hoursAmount, taskType, fromUser}});
  }
  insertConsumedPlanInterval(taskId: number, userId: number, from: number, hoursAmount: number, taskType: number){
    return this.http.get<string>(props.http + '/planInsertConsumedInterval', {params: {taskId, userId, from, hoursAmount, taskType}});
  }
  addManHours(taskId: number, userId: number, dateConsumed: number, hoursAmount: number, message: string){
    return this.http.get<string>(props.http + '/addManHours', {params: {taskId, userId, dateConsumed, hoursAmount, message}});
  }
  deleteInterval(id: number, fromUser: string){
    return this.http.get<any>(props.http + '/planDeleteInterval', {params: {id, fromUser}});
  }
  getDepartments(){
    return this.http.get<any[]>(props.http + '/departments');
  }
  getStatsUserDetails(dateFrom: number, dateTo: number, users: number[]){
    return this.http.post<any[]>(props.http + '/statsUsersDetails', users, {params: {dateFrom, dateTo}});
  }
  getUserDiary(userId: number){
    return this.http.get<any[]>(props.http + '/userDiary', {params: {userId}});
  }
  getPlanNotOrdinary(from: number){
    return this.http.get<any[]>(props.http + '/planNotOrdinary', {params: {from}});
  }

  deleteFromDiary(id: number) {
    return this.http.get<any[]>(props.http + '/deleteFromDiary', {params: {id}});
  }
}
