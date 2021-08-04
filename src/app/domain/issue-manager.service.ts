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


  async initIssue(user: string) {
    return await this.http.get<IssueDef>(props.http + '/initIssue', {params: {user: user}}).toPromise();
  }
  processIssue(issue: Issue){
    this.http.post(props.http + '/processIssue', JSON.stringify(issue)).subscribe(data => {
      console.log(data);
    });
  }
  async getIssues(login: string): Promise<Issue[]> {
    return await this.http.get<Issue[]>(props.http + '/issues', {params: {user: login}}).toPromise();
  }
}
