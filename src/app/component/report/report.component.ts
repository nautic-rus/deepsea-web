import { Component, OnInit } from '@angular/core';
import {IssueManagerService} from "../../domain/issue-manager.service";

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {

  issues: any[] = [];

  constructor(public issueManager: IssueManagerService) {

  }
  ngOnInit(): void {
    this.issueManager.getIssues('op').then(res => {
      this.issues = res;
      console.log(this.issues);
    });
  }
}
