import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {Router} from "@angular/router";
import {IssueManagerService} from "../../domain/issue-manager.service";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {CreateTaskComponent} from "../create-task/create-task.component";
import {Issue} from "../../domain/classes/issue";
import * as _ from 'underscore';
import {TaskComponent} from "../task/task.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  issues: Issue[] = [];
  cols: any[] = [];
  _selectedColumns: any[] = [];
  constructor(private router: Router, private issueManager: IssueManagerService, public auth: AuthManagerService, private dialogService: DialogService) { }
  @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
  }
  // @ts-ignore
  @ViewChild('dt') dt;
  set selectedColumns(val: any[]) {
    //restore original order
    this._selectedColumns = this.cols.filter(col => val.includes(col));
  }
  ngOnInit() {
    this.fillIssues();
    this.cols = [
      { variable: 'id', header: 'TaskId', sort: true, filter: true, skip: false, defaultValue: '' },
      { variable: 'startedBy', header: 'Author', sort: true, filter: true, skip: false, defaultValue: '' },
      { variable: 'project', header: 'Project', sort: true, filter: true, skip: false, defaultValue: '' },
      { variable: 'department', header: 'Department', sort: true, filter: true, skip: false, defaultValue: '' },
      { variable: 'name', header: 'Summary', sort: true, filter: true, skip: false, defaultValue: '' },
      // { variable: 'details', header: 'Details', sort: false, filter: false, skip: true, defaultValue: 'View Details' },
      { variable: 'assignedTo', header: 'Assigned To', sort: true, filter: true, skip: false, defaultValue: '' },
      { variable: 'status', header: 'Status', sort: true, filter: true, skip: false, defaultValue: '' }
    ];
    this._selectedColumns = this.cols;
  }
  fillIssues(){
    this.issueManager.getIssues(this.auth.getUser().login).then(data => {
      data.forEach(d => {
        let find = this.issues.find(x => x.id == d.id);
        if (find != null){
          this.issues[this.issues.indexOf(find)] = d;
        }
        else{
          this.issues.push(d);
        }
      });
    });
  }
  newTask() {
   this.dialogService.open(CreateTaskComponent, {
      header: 'Создать задачу',
      modal: true
    }).onClose.subscribe(res => {
      this.fillIssues();
    });
  }
  viewTask(id: string) {
    this.issueManager.getIssueDetails(id, this.auth.getUser().login).then(res => {
      this.dialogService.open(TaskComponent, {
        showHeader: false,
        modal: true,
        data: res
      }).onClose.subscribe(res => {
        this.fillIssues();
      });
    });
  }

  getFilters(issues: any[], variable: string): any[] {
    return _.uniq(issues, x => x[variable]).map(x => x[variable]);
  }
  localeHeader(input: string): string{
    switch (input) {
      case 'TaskId': return 'ID';
      case 'Author': return 'Автор';
      case 'Project': return 'Проект';
      case 'Department': return 'Отдел';
      case 'Summary': return 'Название';
      case 'Assigned To': return 'Исполнитель';
      case 'Status': return 'Статус';
      default: return input;

    }
  }

  localeColumn(issueElement: string, variable: string): string {
    if (variable == 'startedBy'){
      return '<div class="df"><img src="' + this.auth.getUserAvatar(issueElement) + '" width="32px" style="border-radius: 16px"/><div class="ml-1 cy">' + this.auth.getUserName(issueElement) + '</div></div>';
    }
    else if (variable == 'assignedTo'){
      if (issueElement == ''){
        return '';
      }
      else {
        return '<div class="df"><img src="' + this.auth.getUserAvatar(issueElement) + '" width="32px" style="border-radius: 16px"/><div class="ml-1 cy">' + this.auth.getUserName(issueElement) + '</div></div>';
      }
    }
    else if (variable == 'status'){
      return this.issueManager.localeStatus(issueElement);
    }
    else{
      return issueElement;
    }
  }
}
