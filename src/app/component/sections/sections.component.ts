import {Component, OnInit, ViewChild} from '@angular/core';
import {IssueManagerService} from "../../domain/issue-manager.service";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {Issue} from "../../domain/classes/issue";
import {TaskComponent} from "../task/task.component";
import {DialogService} from "primeng/dynamicdialog";
import {CreateTaskComponent} from "../create-task/create-task.component";

@Component({
  selector: 'app-sections',
  templateUrl: './sections.component.html',
  styleUrls: ['./sections.component.css']
})
export class SectionsComponent implements OnInit {
  issues: Issue[] = [];

  constructor(private issueManager: IssueManagerService, public auth: AuthManagerService, private dialogService: DialogService) { }

  ngOnInit(): void {
    this.issueManager.getIssues('op').then(data => {
      this.issues = data;
    });
  }

  getStyle(s: string) {
    let find = this.issues.find(x => x.name.includes('Секция ' + s));
    let status = '';
    if (find != null){
      status = find.status;
    }
    switch (status){
      case 'In Work': return {'background-color': '#feeccd', border: '1px solid #d78a16', color: '#d78a16'};
      case 'Resolved': return {'background-color': '#feeccd', border: '1px solid #d78a16', color: '#d78a16'};
      case 'New': return {'background-color': '#f7cecd', border: '1px solid #aa1f1c', color: '#aa1f1c'};
      case 'Rejected': return {'background-color': '#feeccd', border: '1px solid #d78a16', color: '#d78a16'};
      case 'Check': return {'background-color': '#feeccd', border: '1px solid #d78a16', color: '#d78a16'};
      case 'In Rework': return {'background-color': '#feeccd', border: '1px solid #d78a16', color: '#d78a16'};
      case 'Paused': return {'background-color': '#feeccd', border: '1px solid #d78a16', color: '#d78a16'};
      case 'Archive': return {'background-color': '#e7ecca', border: '1px solid #606a26', color: '#606a26'};
      case 'Not resolved': return {'background-color': '#feeccd', border: '1px solid #d78a16', color: '#d78a16'};
      case 'Closed': return {'background-color': '#e7ecca', border: '1px solid #606a26', color: '#606a26'};
      case 'Send to Approval': return {'background-color': '#feeccd', border: '1px solid #d78a16', color: '#d78a16'};
      case 'Approved': return {'background-color': '#feeccd', border: '1px solid #d78a16', color: '#d78a16'};
      case 'Not approved': return {'background-color': '#feeccd', border: '1px solid #d78a16', color: '#d78a16'};
      case 'Ready to send': return {'background-color': '#e7ecca', border: '1px solid #606a26', color: '#606a26'};
      case 'On reApproval': return {'background-color': '#feeccd', border: '1px solid #d78a16', color: '#d78a16'};
      default: {
      }
    }
    return{};
  }

  viewTask(s: string) {
    let find = this.issues.find(x => x.name.includes('Секция ' + s));
    if (find != null){
      this.issueManager.getIssueDetails(find.id, this.auth.getUser().login).then(res => {
        this.dialogService.open(TaskComponent, {
          showHeader: false,
          modal: true,
          data: res
        })
      });
    }

  }

}