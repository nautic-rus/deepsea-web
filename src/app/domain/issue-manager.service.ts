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
  localeStatus(input: string): string {
    switch (input) {
      case 'In Work': return 'В работе';
      case 'Resolved': return 'Исполнено';
      case 'New': return 'Новый';
      case 'Rejected': return 'Отклонено';
      case 'Check': return 'На проверке';
      case 'In rework': return 'На доработке';
      default: return input;
    }
  }
}
