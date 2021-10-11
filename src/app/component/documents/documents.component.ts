import { Component, OnInit } from '@angular/core';
import {Material} from "../../domain/classes/material";
import {MaterialManagerService} from "../../domain/material-manager.service";
import {Issue} from "../../domain/classes/issue";
import {IssueManagerService} from "../../domain/issue-manager.service";

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent implements OnInit {
  projects: string[] = ['NR-002'];
  project = this.projects[0];
  issues: Issue[] = [];

  constructor(private issueManager: IssueManagerService) { }

  ngOnInit(): void {
    this.issueManager.getIssues('op').then(data => {
      this.issues = data;
    });
  }

}
