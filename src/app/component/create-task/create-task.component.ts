import { Component, OnInit } from '@angular/core';
import {IssueManagerService} from "../../domain/issue-manager.service";
import {HttpClient} from "@angular/common/http";
import {FileAttachment} from "../../domain/classes/file-attachment";

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
  constructor(public issueManager: IssueManagerService, private issues: IssueManagerService) { }

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
}
