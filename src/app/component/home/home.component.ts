import {Component, Input, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {IssueManagerService} from "../../domain/issue-manager.service";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {CreateTaskComponent} from "../create-task/create-task.component";
import {Issue} from "../../domain/classes/issue";
import * as _ from 'underscore';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  issues: Issue[] = [];
  cols: any[] = [];
  _selectedColumns: any[] = [];
  newTaskVisible = false;
  // @ts-ignore
  dynamicDialogRef: DynamicDialogRef;
  constructor(private router: Router, private issueManager: IssueManagerService, private auth: AuthManagerService, private dialogService: DialogService) { }
  @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
  }

  set selectedColumns(val: any[]) {
    //restore original order
    this._selectedColumns = this.cols.filter(col => val.includes(col));
  }
  ngOnInit() {
    this.issueManager.getIssues(this.auth.getUser().login).then(data => {
      console.log(data);
      this.issues = data;
    });
    this.cols = [
      { variable: 'id', header: 'TaskId' },
      { variable: 'startedBy', header: 'Author' },
      { variable: 'project', header: 'Project' },
      { variable: 'department', header: 'Department' }
    ];
    this._selectedColumns = this.cols;
  }

  newTask() {
    this.dynamicDialogRef = this.dialogService.open(CreateTaskComponent, {
      header: 'Создать задачу',
      modal: true
    });
  }

  getFilters(issues: any[], variable: string): any[] {
    return _.uniq(issues, x => x[variable]).map(x => x[variable]);
  }
}
