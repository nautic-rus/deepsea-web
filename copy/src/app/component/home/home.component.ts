import {AfterContentChecked, AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {IssueManagerService} from "../../domain/issue-manager.service";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {CreateTaskComponent} from "../create-task/create-task.component";
import {Issue} from "../../domain/classes/issue";
import * as _ from 'underscore';
import {TaskComponent} from "../task/task.component";
import {J} from "@angular/cdk/keycodes";
import * as XLSX from 'xlsx';
import {AssignComponent} from "../task/assign/assign.component";
import {ImportxlsComponent} from "./importxls/importxls.component";
import {MessageService} from "primeng/api";
import {stringify} from "uuid";
import {ViewedIssue} from "../../domain/classes/viewed-issue";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterContentChecked {
  issues: Issue[] = [];
  cols: any[] = [];
  filters = {};
  selectedCols: string[] = [];
  colHeaders: string[] = [];
  filled = false;
  viewedIssues: ViewedIssue[] = [];
  constructor(private route: ActivatedRoute, private router: Router, private messageService: MessageService, private issueManager: IssueManagerService, public auth: AuthManagerService, private dialogService: DialogService) { }
  // @ts-ignore
  @ViewChild('search') search;
  // @ts-ignore
  @ViewChild('dt') dt: Table;

  resetSearch = false;
  ngAfterContentChecked(): void {
    if (!this.resetSearch && this.dt != null){
      this.dt.filterGlobal('', 'content');
      this.resetSearch = true;
    }
  }
  ngOnInit() {
    this.setCols();
    this.fillIssues();
    this.route.queryParams.subscribe(params => {
      let taskId = params.taskId != null ? params.taskId : '';
      if (taskId != ''){
        this.viewTask(taskId);
      }
    });
  }
  setCols(){
    this.cols = [
      { field: 'humanId', header: 'ID', headerLocale: 'ID', sort: true, filter: false, filters: this.getFilters(this.issues, 'id'), skip: false, defaultValue: '', hidden: false },
      { field: 'startedDate', header: 'Создана', headerLocale: 'Создана', sort: true, filter: false, filters: this.getFilters(this.issues, 'startedDate'), skip: false, defaultValue: '', hidden: false },
      { field: 'taskType', header: 'Тип задачи', headerLocale: 'Тип задачи', sort: true, filter: true, filters: this.getFilters(this.issues, 'taskType'), skip: false, defaultValue: '', hidden: false },
      { field: 'startedBy', header: 'Автор', headerLocale: 'Автор', sort: true, filter: true, filters: this.getFilters(this.issues, 'startedBy'), skip: false, defaultValue: '', hidden: false },
      { field: 'project', header: 'Проект', headerLocale: 'Проект', sort: true, filter: true, filters: this.getFilters(this.issues, 'project'), skip: false, defaultValue: '', hidden: false },
      { field: 'department', header: 'Отдел', headerLocale: 'Отдел', sort: true, filter: true, filters: this.getFilters(this.issues, 'department'), skip: false, defaultValue: '', hidden: false },
      { field: 'name', header: 'Название', headerLocale: 'Название', sort: true, filter: false, filters: this.getFilters(this.issues, 'name'), skip: false, defaultValue: '', hidden: false },
      { field: 'assignedTo', header: 'Исполнитель', headerLocale: 'Исполнитель', sort: true, filter: true, filters: this.getFilters(this.issues, 'assignedTo'), skip: false, defaultValue: '', hidden: false },
      { field: 'status', header: 'Статус', headerLocale: 'Статус', sort: true, filter: true, skip: false, filters: this.getFilters(this.issues, 'status'), defaultValue: '', hidden: false },
      { field: 'priority', header: 'Приоритет', headerLocale: 'Приоритет', sort: true, filter: true, skip: false, filters: this.getFilters(this.issues, 'priority'), defaultValue: '', hidden: false },
      { field: 'dueDate', header: 'Срок исполнения', headerLocale: 'Срок исполнения', sort: true, filter: false, skip: false, filters: this.getFilters(this.issues, 'dueDate'), defaultValue: '', hidden: false },
      { field: 'overtime', header: 'Сверхурочные', headerLocale: 'Сверхурочные', sort: true, filter: true, skip: false, filters: this.getFilters(this.issues, 'overtime'), defaultValue: '', hidden: false },
      { field: 'responsible', header: 'Ответственный', headerLocale: 'Ответственный', sort: true, filter: true, skip: false, filters: this.getFilters(this.issues, 'responsible'), defaultValue: '', hidden: false },
      { field: 'docNumber', header: 'Номер чертежа', headerLocale: 'Номер чертежа', sort: true, filter: false, skip: false, filters: this.getFilters(this.issues, 'docNumber'), defaultValue: '', hidden: false },
      { field: 'period', header: 'Этап', headerLocale: 'Этап', sort: true, filter: true, skip: false, filters: this.getFilters(this.issues, 'period'), defaultValue: '', hidden: false }
    ];
    this.colHeaders = this.cols.map(x => x.headerLocale);
    let selectedColsValue = localStorage.getItem('selectedCols');
    let selectedCols = selectedColsValue ? JSON.parse(selectedColsValue) as string[] : ['ID', 'Тип задачи', 'Автор', 'Проект', 'Название', 'Статус', 'Срок исполнения', 'Приоритет'];
    if (selectedCols.length > 0){
      this.selectedCols = this.colHeaders.filter(x => selectedCols.includes(x));
    }
  }
  fillIssues(){
    let scroll = 0;
    if (this.dt != null){
      scroll = this.dt.el.nativeElement.querySelector('.p-datatable-virtual-scrollable-body').scrollTop;
      this.dt.style = {opacity: 0};
    }
    this.issueManager.getIssues(this.auth.getUser().login).then(data => {
      this.issues = data;
      this.cols.forEach(col => col.filters = this.getFilters(this.issues, col.field));
      this.cols.forEach(col => col.hidden = !this.selectedCols.includes(col.headerLocale));
      //this.setCols();
      this.filled = true;
      this.issueManager.getIssuesViewed(this.auth.getUser().login).then(res => {
        console.log(res);
        this.viewedIssues = res;
      });
    });
    if (this.dt != null){
      setTimeout(() => {
        this.dt.scrollTo({top: scroll});
        this.dt.style = {opacity: 1, transition: '0.1s'};
      }, 500);
    }
  }
  newTask(issue: object | null) {
   this.dialogService.open(CreateTaskComponent, {
      showHeader: false,
      modal: true,
      data: issue
    }).onClose.subscribe(res => {
      this.fillIssues();
    });
  }
  viewTask(id: string) {
    this.setIssueViewed(id);
    this.issueManager.getIssueDetails(id, this.auth.getUser().login).then(res => {
      console.log(res);
      if (res.id != null){
        this.dialogService.open(TaskComponent, {
          showHeader: false,
          modal: true,
          data: res
        }).onClose.subscribe(res => {
          this.fillIssues();
          let issue = res as Issue;
          if (issue != null && issue.id != null){
            this.newTask(issue);
          }
          this.router.navigate([''], {queryParams: {taskId: null}});
        });
      }
      else{
        this.messageService.add({severity:'error', summary:'Url Issue', detail:'Cannot find issue defined in url.'});
      }
    });
  }
  getFilters(issues: any[], field: string): any[] {
    let res: any[] = [];
    let uniq = _.uniq(issues, x => x[field]);
    uniq.forEach(x => {
      res.push({
        label: this.localeFilter(field, x[field]),
        value: x[field]
      })
    });
    return _.sortBy(res, x => x.label);
  }
  localeFilter(column: string, field: string): string{
    switch (column) {
      case 'taskType': return this.issueManager.localeTaskType(field);
      case 'startedBy': return this.auth.getUserName(field);
      case 'assignedTo': return this.auth.getUserName(field);
      case 'status': return this.issueManager.localeStatus(field, false);
      default: return field;
    }
  }
  getDate(dateLong: number): string{
    let date = new Date(dateLong);
    let ye = new Intl.DateTimeFormat('ru', { year: 'numeric' }).format(date);
    let mo = new Intl.DateTimeFormat('ru', { month: 'short' }).format(date);
    let da = new Intl.DateTimeFormat('ru', { day: '2-digit' }).format(date);
    let hours = new Intl.DateTimeFormat('ru', { hour: '2-digit' }).format(date);
    let minutes = new Intl.DateTimeFormat('ru', { minute: '2-digit' }).format(date);
    return da + ' ' + mo + ' ' + ye + ' ' + ('0' + hours).slice(-2) + ':' + ('0' + minutes).slice(-2);
  }
  getDateOnly(dateLong: number): string{
    let date = new Date(dateLong);
    let ye = new Intl.DateTimeFormat('ru', { year: '2-digit' }).format(date);
    let mo = new Intl.DateTimeFormat('ru', { month: '2-digit' }).format(date);
    let da = new Intl.DateTimeFormat('ru', { day: '2-digit' }).format(date);
    return da + '.' + mo + '.' + ye;
  }
  getDateNoTime(dateLong: number): string{
    let date = new Date(dateLong);
    let ye = new Intl.DateTimeFormat('ru', { year: 'numeric' }).format(date);
    let mo = new Intl.DateTimeFormat('ru', { month: 'short' }).format(date);
    let da = new Intl.DateTimeFormat('ru', { day: '2-digit' }).format(date);
    return da + ' ' + mo + ' ' + ye + ' ';
  }
  localeColumn(issueElement: string, field: string, issue: Issue): string {
    if (field == 'startedBy'){
      return '<div class="df"><img src="' + this.auth.getUserAvatar(issueElement) + '" width="32px" height="32px" style="border-radius: 16px"/><div class="ml-1 cy">' + this.auth.getUserName(issueElement) + '</div></div>';
    }
    else if (field == 'assignedTo'){
      if (issueElement == ''){
        return '';
      }
      else {
        return '<div class="df"><img src="' + this.auth.getUserAvatar(issueElement) + '" width="32px" height="32px" style="border-radius: 16px"/><div class="ml-1 cy">' + this.auth.getUserName(issueElement) + '</div></div>';
      }
    }
    else if (field == 'status'){
      return this.issueManager.localeStatus(issueElement);
    }
    else if (field == 'startedDate'){
      return this.getDateOnly(+issueElement);
    }
    else if (field == 'taskType'){
      return this.issueManager.localeTaskType(issueElement);
    }
    else if (field == 'name'){
      if (issue.taskType == 'Approval'){
        return 'Согласование ' + issue.docNumber;
      }
      else{
        return this.trim(issueElement);
      }
    }
    else if (field == 'priority'){
      return this.issueManager.localeTaskPriority(issueElement);
    }
    else if (field == 'department'){
      return this.issueManager.localeTaskDepartment(issueElement);
    }
    else if (field == 'dueDate'){
      return +issueElement == 0 ? '-' : this.getDateOnly(+issueElement);
    }
    else if (field == 'responsible'){
      if (issueElement == ''){
        return '';
      }
      else {
        return '<div class="df"><img src="' + this.auth.getUserAvatar(issueElement) + '" width="32px" height="32px" style="border-radius: 16px"/><div class="ml-1 cy">' + this.auth.getUserName(issueElement) + '</div></div>';
      }
    }
    else if (field == 'docNumber'){
      return issueElement != '' ? issueElement : '-';
    }
    else{
      return issueElement;
    }
  }

  saveSelectedCols() {
    this.dt.clearState();
    this.dt.restoreState();
    localStorage.setItem('selectedCols', JSON.stringify(this.selectedCols));
    this.cols.forEach(col => col.hidden = !this.selectedCols.includes(col.headerLocale));
  }
  importXls(){
    this.dialogService.open(ImportxlsComponent, {
      showHeader: false,
      modal: true,
    }).onClose.subscribe(message => {
      if (message == 'imported'){
        this.messageService.add({severity:'success', summary:'Deployment', detail:'You have uploaded this model to server'});
      }
    });
  }
  trim(input: string, length: number = 55): string{
    if (input.length <= length){
      return input;
    }
    else {
      return input.substr(0, length) + '...';
    }
  }

  isTaskNew(id: string) {
    return this.viewedIssues.find(x => x.issue == id) == null;
  }

  isTaskUpdated(id: string, update: string) {
    return !this.isTaskNew(id) && this.viewedIssues.find(x => x.issue == id && +update <= x.date) == null;
  }

  setIssueViewed(id: string){
    this.issueManager.setIssueViewed(id, this.auth.getUser().login).then(res => {
      this.issueManager.getIssuesViewed(this.auth.getUser().login).then(res => {
        this.viewedIssues = res;
      });
    });
  }

  generateId(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() *
        charactersLength));
    }
    return result;
  }
  exportXls() {
    let fileName = 'export_' + this.generateId(8) + '.xlsx';
    let data: any[] = [];
    let issues = this.dt.filteredValue as Issue[];
    data.push(['ID', 'Статус', 'Отдел', 'Создал', 'Дата создания', 'Тип задачи', 'Наименование', 'Номер документа', 'Ответственный', 'Назначена', 'Дата окончания', 'Описание']);
    issues.forEach(v => {
      data.push(
        [
          v.humanId,
          this.issueManager.localeStatus(v.status, false),
          this.issueManager.localeTaskDepartment(v.department),
          this.auth.getUserName(v.startedBy),
          this.getDateNoTime(v.startedDate),
          this.issueManager.localeTaskType(v.taskType),
          v.name,
          v.docNumber,
          this.auth.getUserName(v.responsible),
          this.auth.getUserName(v.assignedTo),
          this.getDateNoTime(v.dueDate),
          v.details
        ]
      );
    });
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = {Sheets: {'data': worksheet}, SheetNames: ['data']};
    XLSX.writeFile(workbook, fileName);
  }
}
