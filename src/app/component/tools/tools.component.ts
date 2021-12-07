import { Component, OnInit } from '@angular/core';
import {LanguageService} from "../../domain/language.service";
import {IssueManagerService} from "../../domain/issue-manager.service";
import {AuthManagerService} from "../../domain/auth-manager.service";

@Component({
  selector: 'app-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.css']
})
export class ToolsComponent implements OnInit {
  taskProject = '';
  taskProjects: string[] = [];

  constructor(public auth: AuthManagerService, public issues: IssueManagerService, public t: LanguageService) { }

  ngOnInit(): void {
    this.issues.getIssueProjects().then(projects => {
      this.taskProjects = projects.filter(x => this.auth.getUser().visible_projects.includes(x));
      if (this.taskProjects.length > 0) {
        this.taskProject = this.taskProjects[0];
      }
    });
  }

  getBillOfMaterials() {

  }
}
