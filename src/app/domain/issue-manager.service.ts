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

  issueProjects: IdName[] = [];
  issueTypes: IdName[] = [];

  constructor(private cookie: CookieService, private http: HttpClient, private router: Router, private messageService: MessageService) {
    this.setIssueProjects();
    this.setIssueTypes();
  }
  private setIssueProjects(){
    this.http.get<IdName[]>(props.http + '/issueProjects').subscribe(data => {
      this.issueProjects = data;
    });
  }
  private setIssueTypes(){
    this.http.get<IdName[]>(props.http + '/issueTypes').subscribe(data => {
      this.issueTypes = data;
    });
  }
  async uploadFile(file: File) {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    return await this.http.post<FileAttachment>(props.http + '/createFileUrl', formData).toPromise();
  }
  startIssue(issue: Issue){
    this.http.post(props.http + '/startIssue', JSON.stringify(issue)).subscribe(data => {
      console.log(data);
    });
  }

  async initIssue(user: string) {
    return await this.http.get<IssueDef>(props.http + '/initIssue', {params: {user: user}}).toPromise();
  }
}
