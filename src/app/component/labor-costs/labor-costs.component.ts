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

  constructor(public l: LanguageService, public issues: IssueManagerService, public auth: AuthManagerService) { }

  ngOnInit(): void {
    this.issues.getIssueSpentTime().then(res => {
      console.log(res);
      this.issueSpentTime = res;
    });
  }
  getDateOnly(dateLong: number): string{
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
  }
}
