import { Component, OnInit } from '@angular/core';
import {LanguageService} from "../../domain/language.service";
import {IssueManagerService} from "../../domain/issue-manager.service";
import {AuthManagerService} from "../../domain/auth-manager.service";

@Component({
  selector: 'app-labor-costs',
  templateUrl: './labor-costs.component.html',
  styleUrls: ['./labor-costs.component.css']
})
export class LaborCostsComponent implements OnInit {

  issueSpentTime: any[] = [];
  filters:  { status: any[],  revision: any[] } = { status: [], revision: [] };
  issues: any[] = [];

  constructor(public l: LanguageService, public issuesManager: IssueManagerService, public auth: AuthManagerService) { }

  ngOnInit(): void {
    this.issuesManager.getIssueSpentTime().then(res => {
      this.issueSpentTime = res;
    });
    this.issuesManager.getIssues('op').then(issues => {
      this.issues = issues;
    });
  }
  getDateOnly(dateLong: number): string{
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
  }

  getIssueName(id: number) {
    let find = this.issues.find(x => x.id == id);
    if (find != null){
      return find.doc_number + ' ' + find.name;
    }
    else {
      return '';
    }
  }
}
