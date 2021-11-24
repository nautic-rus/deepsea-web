import {Component, OnInit, ViewChild} from '@angular/core';
import {Material} from "../../domain/classes/material";
import {MaterialManagerService} from "../../domain/material-manager.service";
import {Issue} from "../../domain/classes/issue";
import {IssueManagerService} from "../../domain/issue-manager.service";
import {LanguageService} from "../../domain/language.service";
import {Table} from "primeng/table";
import {TaskComponent} from "../task/task.component";
import {DialogService} from "primeng/dynamicdialog";

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent implements OnInit {
  projects: string[] = [];
  project = this.projects[0];
  issues: Issue[] = [];

  constructor(public issueManager: IssueManagerService, public l: LanguageService, private dialogService: DialogService) { }

  // @ts-ignore
  @ViewChild('table') table: Table;
  ngOnInit(): void {
    this.issueManager.getIssueProjects().then(projects => {
      this.projects = projects;
      if (projects.length > 1){
        this.project = projects[1];
        this.issueManager.getIssues('op').then(data => {
          this.issues = data.filter(x => x.issue_type.includes('RKD')).filter(x => x.project == this.project);
        });
      }
    });
  }

  getDeliveredDate(s: string) {
    return '-';
  }

  projectChanged() {
    this.issueManager.getIssues('op').then(data => {
      this.issues = data.filter(x => x.issue_type.includes('RKD')).filter(x => x.project == this.project);
    });
  }
  viewTask(id: number) {
    this.issueManager.getIssueDetails(id).then(res => {
      if (res.id != null){
        this.dialogService.open(TaskComponent, {
          showHeader: false,
          modal: true,
          data: res
        });
      }
    });
  }

  getDeliveredStatus(status: string): any {
    if (status == 'Delivered' && this.l.language == 'en'){
      return '<span>Completed</span>'
    }
    else if (status == 'Delivered' && this.l.language == 'ru'){
      return '<span>Завершён</span>'
    }
    else if (status != 'Delivered' && this.l.language == 'en'){
      return '<span>Not completed</span>'
    }
    else if (status != 'Delivered' && this.l.language == 'ru'){
      return '<span style="color: #805b36; background-color: #ffd8b2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">В работе</span>'
    }
  }
}
