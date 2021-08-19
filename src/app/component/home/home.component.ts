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
  @ViewChild('dt') dt: Table;
  set selectedColumns(val: any[]) {
    //restore original order
    this._selectedColumns = this.cols.filter(col => val.includes(col));
  }
  ngOnInit() {
    this.fillIssues();
    this.cols = [
      { variable: 'id', header: 'ID', headerLocale: 'ID', sort: true, filter: true, skip: false, defaultValue: '' },
      { variable: 'startedDate', header: 'Создана', headerLocale: 'Создана', sort: true, filter: true, skip: false, defaultValue: '' },
      { variable: 'taskType', header: 'Тип задачи', headerLocale: 'Тип задачи', sort: true, filter: true, skip: false, defaultValue: '' },
      { variable: 'startedBy', header: 'Автор', headerLocale: 'Автор', sort: true, filter: true, skip: false, defaultValue: '' },
      { variable: 'project', header: 'Проект', headerLocale: 'Проект', sort: true, filter: true, skip: false, defaultValue: '' },
      { variable: 'department', header: 'Отдел', headerLocale: 'Отдел', sort: true, filter: true, skip: false, defaultValue: '' },
      { variable: 'name', header: 'Название', headerLocale: 'Название', sort: true, filter: true, skip: false, defaultValue: '' },
      // { variable: 'details', header: 'Details', sort: false, filter: false, skip: true, defaultValue: 'View Details' },
      { variable: 'assignedTo', header: 'Исполнитель', headerLocale: 'Исполнитель', sort: true, filter: true, skip: false, defaultValue: '' },
      { variable: 'status', header: 'Статус', headerLocale: 'Статус', sort: true, filter: true, skip: false, defaultValue: '' }
    ];
    this._selectedColumns = this.cols;
  }
  fillIssues(){
    let scroll = 0;
    if (this.dt != null){
      scroll = this.dt.el.nativeElement.querySelector('.p-datatable-scrollable-body').scrollTop;
      this.dt.style = {opacity: 0};
    }
    this.issueManager.getIssues(this.auth.getUser().login).then(data => {
      this.issues = data;
    });
    if (this.dt != null){
      setTimeout(() => {
        this.dt.scrollTo({top: scroll});
        this.dt.style = {opacity: 1, transition: '0.1s'};
      }, 100);
    }
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
  getDate(dateLong: number): string{
    let date = new Date(dateLong);
    let ye = new Intl.DateTimeFormat('ru', { year: 'numeric' }).format(date);
    let mo = new Intl.DateTimeFormat('ru', { month: 'long' }).format(date);
    let da = new Intl.DateTimeFormat('ru', { day: '2-digit' }).format(date);
    let hours = new Intl.DateTimeFormat('ru', { hour: '2-digit' }).format(date);
    let minutes = new Intl.DateTimeFormat('ru', { minute: '2-digit' }).format(date);
    return da + ' ' + mo + ' ' + ye + ' ' + ('0' + hours).slice(-2) + ':' + ('0' + minutes).slice(-2);
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
    else if (variable == 'startedDate'){
      return this.getDate(+issueElement);
    }
    else if (variable == 'taskType'){
      return this.issueManager.localeTaskType(issueElement);
    }
    else{
      return issueElement;
    }
  }
}
