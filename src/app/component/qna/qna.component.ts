import { Component, OnInit } from '@angular/core';
import {AuthManagerService} from "../../domain/auth-manager.service";
import {User} from "../../domain/classes/user";
import {IssueManagerService} from "../../domain/issue-manager.service";
import {AssignNewRevisionComponent} from "../documents/hull-esp/assign-new-revision/assign-new-revision.component";
import {DialogService} from "primeng/dynamicdialog";
import {CreateQuestionComponent} from "./create-question/create-question.component";

@Component({
  selector: 'app-qna',
  templateUrl: './qna.component.html',
  styleUrls: ['./qna.component.css']
})
export class QnaComponent implements OnInit {

  users: User[] = [];
  projects: any[] = [];
  constructor(public auth: AuthManagerService, public issueManagerService: IssueManagerService, private dialogService: DialogService) { }

  ngOnInit(): void {
    this.users = this.auth.users.filter(x => x.visibility.includes('a') || x.visibility.includes('c'));
    this.issueManagerService.getProjectNames().then(res => {
      this.projects = res;
      console.log(this.projects);
    });
  }

  getProjectName(project: any) {
    let res = project.pdsp;
    if (project.rkd != ''){
      res += ' (' + project.rkd + ')';
    }
    return res;
  }

  createQuestion() {
    this.dialogService.open(CreateQuestionComponent, {
      showHeader: false,
      modal: true,
    }).onClose.subscribe(res => {
      //todo create and update
    });
  }
}
