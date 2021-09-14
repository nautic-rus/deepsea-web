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
  async setIssueStatus(id: string, user: string, status: string): Promise<Issue> {
    return await this.http.get<Issue>(props.http + '/setIssueStatus', {params: {id: id, user: user, status: status}}).toPromise();
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
      case 'In rework': return styled ? '<span style="color: #3f6b73; background-color: #8AC6D1; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">На доработке</span>' : 'На доработке';
      case 'Paused': return styled ? '<span style="color: #8a5340; background-color: #feedaf; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Пристановлено</span>' : 'Пристановлено';
      case 'Archive': return styled ? '<span style="color: #8a5340; background-color: #feedaf; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Архив</span>' : 'Архив';
      case 'Not resolved': return styled ? '<span style="color: #8a5340; background-color: #feedaf; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Не исполнено</span>' : 'Не исполнено';
      case 'Closed': return styled ? '<span style="color: #805b36; background-color: #ffd8b2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Закрыто</span>' : 'Закрыто';
      case 'In Rework': return styled ? '<span style="color: #805b36; background-color: #ffd8b2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">На доработке</span>' : 'На доработке';
      case 'Send to Approval': return styled ? '<span style="color: #805b36; background-color: #ffd8b2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">На согласовании</span>' : 'На согласовании';
      default: return input;
    }
  }
  localeStatusAsButton(input: string, styled = true): string {
    switch (input) {
      case 'In Work': return styled ? '<span style="color: #256029; background-color: #c8e6c9; border-radius: 2px; padding: 8px 10px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">В работу</span>' : 'В работу';
      case 'Resolved': return styled ? '<span style="color: #805b36; background-color: #ffd8b2; border-radius: 2px; padding: 8px 10px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Исполнено</span>' : 'Исполнено';
      case 'New': return styled ? '<span style="color: #23547b; background-color: #b3e5fc; border-radius: 2px; padding: 8px 10px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Новый</span>' : 'Новый';
      case 'Rejected': return styled ? '<span style="color: #c63737; background-color: #ffcdd2; border-radius: 2px; padding: 8px 10px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Отклонить</span>' : 'Отклонить';
      case 'Check': return styled ? '<span style=" color: #694382; background-color: #eccfff; border-radius: 2px; padding: 8px 10px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">На проверку</span>' : 'На проверку';
      case 'In Rework': return styled ? '<span style="color: #3f6b73; background-color: #8AC6D1; border-radius: 2px; padding: 8px 10px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">На доработку</span>' : 'На доработку';
      case 'Paused': return styled ? '<span style="color: #8a5340; background-color: #feedaf; border-radius: 2px; padding: 8px 10px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Пристановить</span>' : 'Пристановить';
      case 'Archive': return styled ? '<span style="color: #8a5340; background-color: #feedaf; border-radius: 2px; padding: 8px 10px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">В архив</span>' : 'В архив';
      case 'Not resolved': return styled ? '<span style="color: #8a5340; background-color: #feedaf; border-radius: 2px; padding: 8px 10px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Не исполнено</span>' : 'Не исполнено';
      case 'Closed': return styled ? '<span style="color: #805b36; background-color: #ffd8b2; border-radius: 2px; padding: 8px 10px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Закрыть</span>' : 'Закрыть';
      case 'Send to Approval': return styled ? '<span style="pointer-events: none; opacity: 0.5; color: #805b36; background-color: #ffd8b2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">На согласовании</span>' : 'На согласование';
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
      default: return input;
    }
  }
  localeTaskPriority(input: string){
    switch (input) {
      default: return input;
    }
  }
}
