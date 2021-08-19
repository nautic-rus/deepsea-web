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


  async getIssueProjects() {
    return await this.http.get<string[]>(props.http + '/issueProjects').toPromise();
  }
  async getIssueTypes() {
    return await this.http.get<string[]>(props.http + '/issueTypes').toPromise();
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
      case 'In Work': return styled ? '<span style="color: #256029; background-color: #c8e6c9; border-radius: 2px; padding: .25em .5rem; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">В работе</span>' : 'В работе';
      case 'Resolved': return styled ? '<span style="color: #805b36; background-color: #ffd8b2; border-radius: 2px; padding: .25em .5rem; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Исполнено</span>' : 'Исполнено';
      case 'New': return styled ? '<span style="color: #23547b; background-color: #b3e5fc; border-radius: 2px; padding: .25em .5rem; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Новый</span>' : 'Новый';
      case 'Rejected': return styled ? '<span style="color: #c63737; background-color: #ffcdd2; border-radius: 2px; padding: .25em .5rem; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Отклонено</span>' : 'Отклонено';
      case 'Check': return styled ? '<span style="color: #694382; background-color: #eccfff; border-radius: 2px; padding: .25em .5rem; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">На проверке</span>' : 'На проверке';
      case 'In rework': return styled ? '<span style="color: #3f6b73; background-color: #8AC6D1; border-radius: 2px; padding: .25em .5rem; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">На доработке</span>' : 'На доработке';
      case 'Paused': return styled ? '<span style="color: #8a5340; background-color: #feedaf; border-radius: 2px; padding: .25em .5rem; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Пристановлено</span>' : 'Пристановлено';
      case 'Archive': return styled ? '<span style="color: #8a5340; background-color: #feedaf; border-radius: 2px; padding: .25em .5rem; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Архив</span>' : 'Архив';
      case 'Not resolved': return styled ? '<span style="color: #8a5340; background-color: #feedaf; border-radius: 2px; padding: .25em .5rem; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Не исполнено</span>' : 'Не исполнено';
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
      default: return input;
    }
  }
}
