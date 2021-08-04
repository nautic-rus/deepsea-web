import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {IssueManagerService} from "../../domain/issue-manager.service";
import {HttpClient} from "@angular/common/http";
import {FileAttachment} from "../../domain/classes/file-attachment";
import {Issue} from "../../domain/classes/issue";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {Editor} from "primeng/editor";
import {DynamicDialogRef} from "primeng/dynamicdialog";

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
  constructor(public issues: IssueManagerService, private auth: AuthManagerService, public ref: DynamicDialogRef) { }


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
          // @ts-ignore
          const find = this.loaded.find(x => x.name == file.name);
          if (find != null){
            this.loaded.splice(this.loaded.indexOf(find), 1);
          }
          this.awaitForLoad.push(file.name);
        }
      }
      for (let x = 0; x < files.length; x++){
        let file = files.item(x);
        if (file != null){
          this.issues.uploadFile(file).then(res => {
            console.log(res);
            this.loaded.push(res);
            // const find = this.awaitForLoad.find(x => x == res.name);
            // if (find != null){
            //   this.awaitForLoad.splice(this.awaitForLoad.indexOf(find), 1);
            // }
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

  isLoaded(file: string) {
    return this.loaded.find(x => x.name == file);
  }

  remove(file: string) {
    let find = this.loaded.find(x => x.name == file);
    if (find != null){
      this.loaded.splice(this.loaded.indexOf(find), 1);
    }
    let findAwait = this.awaitForLoad.find(x => x == file);
    if (findAwait != null){
      this.awaitForLoad.splice(this.awaitForLoad.indexOf(findAwait), 1);
    }
  }

  getFileExtensionIcon(file: string) {
    switch (file.toLowerCase().split('.').pop()){
      case 'pdf': return '-pdf';
      case 'xls': return '-excel';
      case 'xlsx': return '-excel';
      default: return '';
    }
  }

  close() {
    this.ref.close();
  }
}
