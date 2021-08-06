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
  dragOver = false;
  constructor(public issues: IssueManagerService, private auth: AuthManagerService, public ref: DynamicDialogRef) { }


  ngOnInit(): void {
    this.issues.initIssue(this.auth.getUser().login).then(issueDef => {
      this.taskId = issueDef.id;
      this.taskProjects = issueDef.issueProjects;
      this.taskTypes = issueDef.issueTypes;
      this.taskProject = this.taskProjects[0];
      this.taskType = this.taskTypes[0];
    });
    this.ref.onClose.subscribe(res => {
      if (res != 'success'){
        this.issues.removeIssue(this.taskId)
      }
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
            this.loaded.push(res);
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
    issue.taskType = this.taskType;
    issue.startedBy = this.auth.getUser().login;
    issue.project = this.taskProject;
    // @ts-ignore
    issue.fileAttachments = this.loaded;
    this.issues.processIssue(issue).then(res => {
      this.ref.close(res);
    });
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
      case 'pdf': return 'pdf.svg';
      case 'dwg': return 'dwg.svg';
      case 'xls': return 'xls.svg';
      case 'xlsx': return 'xls.svg';
      case 'doc': return 'doc.svg';
      case 'docx': return 'doc.svg';
      case 'png': return 'png.svg';
      case 'jpg': return 'jpg.svg';
      case 'txt': return 'txt.svg';
      case 'zip': return 'zip.svg';
      default: return 'file.svg';
    }
  }


  close() {
    this.ref.close();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    // @ts-ignore
    this.handleFileInput(event.dataTransfer.files);
  }
}
