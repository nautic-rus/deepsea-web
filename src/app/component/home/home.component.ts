import {Component, Input, OnInit} from '@angular/core';
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
  constructor(private router: Router, private issueManager: IssueManagerService, private auth: AuthManagerService, private dialogService: DialogService) { }
  @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
  }

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
      console.log(data);
      this.issues = data;
    });
  }

  newTask() {
   this.dialogService.open(CreateTaskComponent, {
      header: 'Создать задачу',
      modal: true
    }).onClose.subscribe(res => {
      if (res == 'success'){
        this.fillIssues();
      }
    });
  }
  viewTask(id: string) {
    this.issueManager.getIssueDetails(id, this.auth.getUser().login).then(res => {
      this.dialogService.open(TaskComponent, {
        header: 'Задача: ' + res.name,
        modal: true
      });
    });
  }

  getFilters(issues: any[], variable: string): any[] {
    return _.uniq(issues, x => x[variable]).map(x => x[variable]);
  }
}
