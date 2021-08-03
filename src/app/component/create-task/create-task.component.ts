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
  taskType = 3;
  taskProject = 1;
  taskSummary = '';
  taskDetails = '';
  awaitForLoad: string[] = [];
  loaded: FileAttachment[] = [];
  taskStart = '';
  taskResponsible = '';
  constructor(public issueManager: IssueManagerService, private issues: IssueManagerService, private auth: AuthManagerService) { }

  ngOnInit(): void {
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
    issue.name = this.taskSummary;
    issue.details = this.taskDetails;
    issue.taskModelType = 'IT';
    issue.startedBy = this.auth.getUser().login;
    this.issues.startIssue(issue);
  }
}
