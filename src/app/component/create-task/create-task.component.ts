import { Component, OnInit } from '@angular/core';
import {IssueManagerService} from "../../domain/issue-manager.service";
import {HttpClient} from "@angular/common/http";
import {FileAttachment} from "../../domain/classes/file-attachment";
import {Issue} from "../../domain/classes/issue";
import {AuthManagerService} from "../../domain/auth-manager.service";

@Component({
  selector: 'app-create-task',
  templateUrl: './create-task.component.html',
  styleUrls: ['./create-task.component.css']
})
export class CreateTaskComponent implements OnInit {
  taskId = '';
  taskSummary = '';
  taskDetails = '';
  taskProjects: string[] = [];
  taskTypes: string[] = [];
  awaitForLoad: string[] = [];
  taskProject = '';
  taskType = 'IT';
  loaded: FileAttachment[] = [];
  taskResponsible: any;
  taskStart: any;
  constructor(public issues: IssueManagerService, private auth: AuthManagerService) { }

  ngOnInit(): void {
    this.issues.initIssue(this.auth.getUser().login).then(issueDef => {
      this.taskId = issueDef.id;
      this.taskProjects = issueDef.issueProjects;
      this.taskTypes = issueDef.issueTypes;
    });
  }

  handleFileInput(files: FileList | null) {
    if (files != null){
      for (let x = 0; x < files.length; x++){
        let file = files.item(x);
        if (file != null){
          this.awaitForLoad.push(file.name);
        }
      }
      for (let x = 0; x < files.length; x++){
        let file = files.item(x);
        if (file != null){
          this.issues.uploadFile(file).then(res => {
            console.log(res);
            this.loaded.push(res);
            const find = this.awaitForLoad.find(x => x == res.name);
            if (find != null){
              this.awaitForLoad.splice(this.awaitForLoad.indexOf(find), 1);
            }
          });
        }
      }
    }
  }

  createTask() {
    const issue = new Issue();
    issue.id = this.taskId;
    issue.name = this.taskSummary;
    issue.details = this.taskDetails;
    issue.taskType = 'IT';
    issue.startedBy = this.auth.getUser().login;
    issue.project = this.taskProject;
    this.issues.processIssue(issue);
  }
}
