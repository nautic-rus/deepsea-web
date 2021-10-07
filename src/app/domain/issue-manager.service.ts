import { Injectable } from '@angular/core';
import {CookieService} from "ngx-cookie-service";
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import {MessageService} from "primeng/api";
import * as props from "../props";
import {IdName} from "./classes/id-name";
import {FileAttachment} from "./classes/file-attachment";
import {Issue} from "./classes/issue";
import {IssueDef} from "./classes/issue-def";
import {IssueMessage} from "./classes/issue-message";
import {List} from "underscore";

@Injectable({
  providedIn: 'root'
})
export class IssueManagerService {

  constructor(private cookie: CookieService, private http: HttpClient, private router: Router, private messageService: MessageService) {

  }
  async uploadFile(file: File) {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    return await this.http.post<FileAttachment>(props.http + '/createFileUrl', formData).toPromise();
  }
  async assignUser(id: string, user: string, startDate: string, dueDate: string, overtime: string){
    return await this.http.get<string[]>(props.http + '/assignIssue', {params: {id, user, startDate, dueDate, overtime}}).toPromise();
  }
  async changeResponsible(id: string, user: string){
    return await this.http.get<string[]>(props.http + '/changeResponsible', {params: {id, user}}).toPromise();
  }
  async sendToApproval(id: string, users: string[], filesToApproval: FileAttachment[], textToApproval: string, taskStatus: string){
    return await this.http.get<string[]>(props.http + '/sendToApproval', {params: {id, users: JSON.stringify(users), filesToApproval: JSON.stringify(filesToApproval), textToApproval, taskStatus, taskStatusApproval: 'New', taskTypeApproval: 'Approval'}}).toPromise();
  }
  async getIssueDepartments() {
    return await this.http.get<string[]>(props.http + '/issueDepartments').toPromise();
  }
  async getIssueProjects() {
    return await this.http.get<string[]>(props.http + '/issueProjects').toPromise();
  }
  async getIssueTypes() {
    return await this.http.get<string[]>(props.http + '/issueTypes').toPromise();
  }
  async getTaskPriorities() {
    return await this.http.get<string[]>(props.http + '/issuePriorities').toPromise();
  }
  async startIssue(user: string, issue: Issue){
    return await this.http.post(props.http + '/startIssue', JSON.stringify(issue), {params: {user: user}}).toPromise();
  }
  async getIssues(login: string): Promise<Issue[]> {
    return await this.http.get<Issue[]>(props.http + '/issues', {params: {user: login}}).toPromise();
  }
  async getIssueDetails(id: string, login: string): Promise<Issue> {
    return await this.http.get<Issue>(props.http + '/issueDetails', {params: {id: id, user: login}}).toPromise();
  }
  async updateIssue(user: string, issue: Issue) {
    return await this.http.post(props.http + '/updateIssue', JSON.stringify(issue), {params: {user: user}}).toPromise();
  }
  async setIssueStatus(id: string, user: string, status: string): Promise<string> {
    return await this.http.get<string>(props.http + '/setIssueStatus', {params: {id: id, user: user, status: status}}).toPromise();
  }
  async setIssueMessage(id: string, message: IssueMessage): Promise<string> {
    return await this.http.post<string>(props.http + '/setIssueMessage', JSON.stringify(message), {params: {id: id}}).toPromise();
  }
  async removeIssue(id: string): Promise<string>{
    return await this.http.get<string>(props.http + '/removeIssue', {params: {id: id}}).toPromise();
  }
  localeStatus(input: string, styled = true): string {
    switch (input) {
      case 'In Work': return styled ? '<span style="color: #256029; background-color: #c8e6c9; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">В работе</span>' : 'В работе';
      case 'Resolved': return styled ? '<span style="color: #805b36; background-color: #ffd8b2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Исполнено</span>' : 'Исполнено';
      case 'New': return styled ? '<span style="color: #23547b; background-color: #b3e5fc; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Новый</span>' : 'Новый';
      case 'Rejected': return styled ? '<span style="color: #c63737; background-color: #ffcdd2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Отклонено</span>' : 'Отклонено';
      case 'Check': return styled ? '<span style="color: #694382; background-color: #eccfff; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">На проверке</span>' : 'На проверке';
      case 'In Rework': return styled ? '<span style="color: #3f6b73; background-color: #cbebf1; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">На доработке</span>' : 'На доработке';
      case 'Paused': return styled ? '<span style="color: #8a5340; background-color: #feedaf; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Приостановлено</span>' : 'Приостановлено';
      case 'Archive': return styled ? '<span style="color: #8a5340; background-color: #feedaf; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Архив</span>' : 'Архив';
      case 'Not resolved': return styled ? '<span style="color: #8a5340; background-color: #feedaf; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Не исполнено</span>' : 'Не исполнено';
      case 'Closed': return styled ? '<span style="color: #805b36; background-color: #ffd8b2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Закрыто</span>' : 'Закрыто';
      case 'Send to Approval': return styled ? '<span style="color: #805b36; background-color: #ffd8b2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">На согласовании</span>' : 'На согласовании';
      case 'Approved': return styled ? '<span style="color: #5d9980; background-color: #82d8b5; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Согласовано</span>' : 'Согласовано';
      case 'Not approved': return styled ? '<span style="color: #a3392b; background-color: #F5BBB2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Не согласовано</span>' : 'Не согласовано';
      case 'Ready to send': return styled ? '<span style="color: #4A7863; background-color: #DCEFED; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Готов к отправке</span>' : 'Готов к отправке';
      case 'On reApproval': return styled ? '<span style="color: #813A18; background-color: #FFB38F; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Повторное согласование</span>' : 'Повторное согласование';

      default: return input;
    }
  }
  localeStatusAsButton(input: string, styled = true): string {
    switch (input) {
      case 'In Work': return styled ? ' <div class="buttons-pick-work"><span class="icon-work cxy"><img src="assets/work.svg"></span><span class="cxy button-text">В работу</span></div>' : 'На проверку';
      case 'Resolved': return styled ? '<div class="buttons-pick-resolved"><span class="icon-resolved cxy"><img src="assets/like.svg"></span><span class="cxy button-text">Исполнено</span></div>' : 'Исполнено';
      case 'Rejected': return styled ? '<div class="buttons-pick-reject"><span class="icon-reject cxy"><img src="assets/rejected.svg"></span><span class="cxy button-text">Отклонить</span></div>' : 'Отклонить';
      case 'Check': return styled ? '<div class="buttons-pick-check"><span class="icon-check cxy"><img src="assets/check.svg"></span><span class="cxy button-text">На проверку</span></div>' : 'На проверку';
      case 'Not resolved': return styled ? '<div class="buttons-pick-not-resolved"><span class="icon-not-resolved cxy"><img src="assets/dislike.svg"></span><span class="cxy button-text">Не исполнено</span></div>' : 'Не исполнено';
      case 'Closed': return styled ? '<div class="buttons-pick-close"><span class="icon-close cxy"><img src="assets/close-task.svg"></span><span class="cxy button-text">Закрыть</span></div>' : 'Закрыть';
      case 'Archive': return styled ? '<div class="buttons-pick-archive"><span class="icon-archive cxy"><img src="assets/archive.svg"></span><span class="cxy button-text">В архив</span></div>' : 'В архив';
      case 'In Rework': return styled ? '<div class="buttons-pick-rework"><span class="icon-rework cxy"><img src="assets/rework.svg"></span><span class="cxy button-text">На доработку</span></div>' : 'На доработку';
      case 'Paused': return styled ? '<div class="buttons-pick-pause"><span class="icon-pause cxy"><img src="assets/pause.svg"></span><span class="cxy button-text">Приостановить</span></div>' : 'Приостановить';
      case 'Send to Approval': return styled ? '<div class="buttons-pick-send-approval"><span class="icon-send-approval cxy"><img src="assets/approval.svg"></span><span class="cxy button-text">На согласование</span></div>' : 'На согласование';
      case 'Approved': return styled ? '<div class="buttons-pick-approval"><span class="icon-approval cxy"><img src="assets/like.svg"></span><span class="cxy button-text">Согласовано</span></div>' : 'Согласовано';
      case 'Not approved': return styled ? '<div class="buttons-pick-not-approval"><span class="icon-not-approval cxy"><img src="assets/dislike.svg"></span><span class="cxy button-text">Не согласовано</span></div>' : 'Не согласовано';
      case 'Ready to send': return styled ? '<div class="buttons-pick-send"><span class="icon-send cxy"><img src="assets/send.png" height="18"></span><span class="cxy button-text">Готов к отправке</span></div>' : 'Готов к отправке';
      case 'On reApproval': return styled ? '<div class="buttons-pick-reapproval"><span class="icon-reapproval cxy"><img src="assets/approval.svg" height="18"></span><span class="cxy button-text">Повторное согласование</span></div>' : 'Повторное согласование';

      default: return input;
    }
  }
  localeHistory(input: string){
    switch (input) {
      case '_taskStatus': return 'Статус';
      default: return input;
    }
  }
  localeTaskType(input: string){
    switch (input) {
      case 'it-task': return 'IT';
      case 'simple-task': return 'Прочее';
      case 'Simple': return 'Прочее';
      case 'task-rkd': return 'РКД';
      case 'RKD': return 'РКД';
      case 'Approval': return 'Согласование';
      case 'task-rkd-2': return 'Turkey';
      default: return input;
    }
  }
  localeTaskPriority(input: string){
    switch (input) {
      default: return input;
    }
  }
}
