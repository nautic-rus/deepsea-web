import { Injectable } from '@angular/core';
import {CookieService} from "ngx-cookie-service";
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import {MessageService} from "primeng/api";
import * as props from "../props";
import {IdName} from "./classes/id-name";
import {FileAttachment} from "./classes/file-attachment";

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
}
