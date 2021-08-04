import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {IssueManagerService} from "../../domain/issue-manager.service";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {CreateTaskComponent} from "../create-task/create-task.component";
import {Issue} from "../../domain/classes/issue";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  issues: Issue[] = [];
  newTaskVisible = false;
  // @ts-ignore
  dynamicDialogRef: DynamicDialogRef;
  constructor(private router: Router, private issueManager: IssueManagerService, private auth: AuthManagerService, private dialogService: DialogService) { }

  ngOnInit() {
    this.issueManager.getIssues(this.auth.getUser().login).then(data => {
      this.issues = data;
    });
  }

  newTask() {
    this.dynamicDialogRef = this.dialogService.open(CreateTaskComponent, {
      header: 'Создать задачу',
      modal: true
    });
  }
}
