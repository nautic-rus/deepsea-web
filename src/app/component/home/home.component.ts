import {
  AfterContentChecked,
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {CreateTaskComponent} from "../create-task/create-task.component";
import {Issue} from "../../domain/classes/issue";
import * as _ from 'underscore';
import {TaskComponent} from "../task/task.component";
import * as XLSX from 'xlsx';
import {ImportxlsComponent} from "./importxls/importxls.component";
import {MessageService, PrimeNGConfig, SortEvent} from "primeng/api";
import {ViewedIssue} from "../../domain/classes/viewed-issue";
import {LanguageService} from "../../domain/language.service";
import {jsPDF} from "jspdf";
import 'jspdf-autotable';
import {HttpClient} from "@angular/common/http";
import {concatAll, concatMap, map, retry, toArray} from "rxjs/operators";
import {DeviceDetectorService} from "ngx-device-detector";
import {IssueManagerService} from "../../domain/issue-manager.service";
import {forkJoin, merge, zip} from "rxjs";
import {Table} from "primeng/table";
import {SequenceEqualOperator} from "rxjs/internal/operators/sequenceEqual";
import {Equipment} from "../../domain/classes/equipment";
import {FilterNameComponent} from "./filter-name/filter-name.component";
import { ChangeDetectorRef } from '@angular/core';
import {Dropdown} from "primeng/dropdown";
import {AgreeModalComponent} from "../equipments/agree-modal/agree-modal.component";
import {IFilterSaved} from "../../domain/interfaces/filter-saved";


// interface ISavedFilters {
//   id: number;
//   user_id: number;
//   field: string;
//   value: string;
//   showCompleted: Boolean;
// }

interface IFilter {
  field: string;
  value: string | string[] | null;
}

interface StatusOption {
  label: string;
  value: string
}

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
  showCompleted: boolean = false;
  showAssigned: boolean = false;
  showResponsible: boolean = false;
  showStartedBy: boolean = false;
  savedFilters: any[] = [];
  savedFilters1: IFilterSaved[] = [];
  savedFilterName: string | null = '';

  filtersValues: any;
  noFilters: boolean = true;
  selectedStatuses: string[] = []
  // redDate: boolean = false;
  selectedFilter = '';

  statusesOptions: StatusOption[] = [
    // { label: 'Active', value: 'active' },
    // { label: 'Inactive', value: 'inactive' }
  ];

  constructor(public device: DeviceDetectorService, private config: PrimeNGConfig, private http: HttpClient, private route: ActivatedRoute, private router: Router, private messageService: MessageService, private issueManager: IssueManagerService, public auth: AuthManagerService, private dialogService: DialogService, public t: LanguageService, private cdRef: ChangeDetectorRef) {
  }

  // @ts-ignore
  @ViewChild('search') search;
  // @ts-ignore
  @ViewChild('dt') dt: Table;

  @ViewChild('dd') dd: Dropdown;


  @Input() get selectedColumns(): any[] {
    return this.cols.filter(col => this.selectedCols.includes(col.headerLocale));
  }
  resetSearch = false;

  ngAfterContentChecked(): void {
    if (!this.resetSearch && this.dt != null) {
      this.dt.filterGlobal('', 'content');
      this.resetSearch = true;
    }
  }


  ngOnInit() {
    this.savedFilterName =  localStorage.getItem("savedFilterName");

    this.getSavedFilters();
    if (!this.auth.getUser().visible_pages.includes('home') && this.auth.getUser().visible_pages.length > 0){
      this.router.navigate([this.auth.getUser().visible_pages[0]]);
    }
    if (localStorage.getItem('states') != null){
      this.savedFilters = JSON.parse(localStorage.getItem('states')!);
    }

    this.setCols();
    this.fillIssues();
    this.route.queryParams.subscribe(params => {
      let taskId = params.taskId != null ? params.taskId : '';
      if (taskId != '') {
        this.viewTask(taskId, '');
      }
    });
    if (this.t.language == 'ru'){
      this.config.setTranslation({
        clear: "Очистить",
        apply: "Принять",
        removeRule: "Удалить условие",
        addRule: "Добавить условие",
        dateIs: "Выбраная дата",
        dateIsNot: "Кроме даты",
        matchAll: "Все условия",
        matchAny: "Любое условие",
        dateBefore: "До выбраной даты",
        dateAfter: "После выбраной даты",
        monthNames: ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"],
      });
    }

  }

  clickShowComletedButton() {
    this.showCompleted = !this.showCompleted;
    if (this.showCompleted) {
      this.selectedStatuses.push('Resolved')
      console.log(this.selectedStatuses)
    } else {
      this.selectedStatuses = this.selectedStatuses.filter(x => x != 'Resolved')
      console.log(this.selectedStatuses)
    }
    this.setStatuses()
  }


  setCols() {
    this.cols = [
      {
        field: 'id',
        header: 'ID',
        headerLocale: 'ID',
        sort: true,
        filter: false,
        filters: this.getFilters(this.issues, 'id'),
        skip: false,
        defaultValue: '',
        hidden: false,
        date: false,
      },
      {
        field: 'it_type',
        header: 'IT Type',
        headerLocale: 'IT Type',
        sort: true,
        filter: true,
        skip: false,
        filters: this.getFilters(this.issues, 'it_type'),
        defaultValue: '',
        hidden: false,
        date: false
      },
      {
        field: 'started_date',
        header: 'Date created',
        headerLocale: 'Date created',
        sort: true,
        filter: false,
        filters: this.getFilters(this.issues, 'started_date'),
        skip: false,
        defaultValue: '',
        hidden: false,
        date: true
      },
      {
        field: 'issue_type',
        header: 'Task type',
        headerLocale: 'Task type',
        sort: true,
        filter: true,
        filters: this.getFilters(this.issues, 'issue_type'),
        skip: false,
        defaultValue: '',
        hidden: false,
        date: false
      },
      {
        field: 'project',
        header: 'Project',
        headerLocale: 'Project',
        sort: true,
        filter: true,
        filters: this.getFilters(this.issues, 'project'),
        skip: false,
        defaultValue: '',
        hidden: false,
        date: false
      },
      {
        field: 'department',
        header: 'Department',
        headerLocale: 'Department',
        sort: true,
        filter: true,
        filters: this.getFilters(this.issues, 'department'),
        skip: false,
        defaultValue: '',
        hidden: false,
        date: false
      },

      {
        field: 'doc_number',
        header: 'Drawing number',
        headerLocale: 'Drawing number',
        sort: true,
        filter: false,
        skip: false,
        filters: this.getFilters(this.issues, 'doc_number'),
        defaultValue: '',
        hidden: false,
        date: false
      },
      {
        field: 'name',
        header: 'Title',
        headerLocale: 'Title',
        sort: true,
        filter: false,
        filters: this.getFilters(this.issues, 'name'),
        skip: false,
        defaultValue: '',
        hidden: false,
        date: false
      },
      {
        field: 'started_by',
        header: 'Author',
        headerLocale: 'Author',
        sort: true,
        filter: true,
        filters: this.getFilters(this.issues, 'started_by'),
        skip: false,
        defaultValue: '',
        hidden: false,
        date: false,
      },
      {
        field: 'responsible',
        header: 'Responsible',
        headerLocale: 'Responsible',
        sort: true,
        filter: true,
        skip: false,
        filters: this.getFilters(this.issues, 'responsible'),
        defaultValue: '',
        hidden: false,
        date: false
      },
      {
        field: 'assigned_to',
        header: 'Assignee',
        headerLocale: 'Assignee',
        sort: true,
        filter: true,
        filters: this.getFilters(this.issues, 'assigned_to'),
        skip: false,
        defaultValue: '',
        hidden: false,
        date: false
      },
      {
        field: 'status',
        header: 'Status',
        headerLocale: 'Status',
        sort: true,
        filter: true,
        skip: false,
        filters: this.getFilters(this.issues, 'status'),
        defaultValue: '',
        hidden: false,
        date: false,
      },
      {
        field: 'due_date',
        header: 'Due date',
        headerLocale: 'Due date',
        sort: true,
        filter: false,
        skip: false,
        filters: this.getFilters(this.issues, 'due_date'),
        defaultValue: '',
        hidden: false,
        date: true
      },
      {
        field: 'period',
        header: 'Stage',
        headerLocale: 'Stage',
        sort: true,
        filter: true,
        skip: false,
        filters: this.getFilters(this.issues, 'period'),
        defaultValue: '',
        hidden: false,
        date: false
      },
      {
        field: 'contract_due_date',
        header: 'Stage Due Date',
        headerLocale: 'Stage Due Date',
        sort: true,
        filter: false,
        skip: false,
        filters: this.getFilters(this.issues, 'contract_due_date'),
        defaultValue: '',
        hidden: false,
        date: true,
      },
      {
        field: 'priority',
        header: 'Priority',
        headerLocale: 'Priority',
        sort: true,
        filter: true,
        skip: false,
        filters: this.getFilters(this.issues, 'priority'),
        defaultValue: '',
        hidden: false,
        date: false
      },
      // {
      //   field: 'overtime',
      //   header: 'Overtime',
      //   headerLocale: 'Overtime',
      //   sort: true,
      //   filter: true,
      //   skip: false,
      //   filters: this.getFilters(this.issues, 'overtime'),
      //   defaultValue: '',
      //   hidden: false,
      //   date: false
      // },
      {
        field: 'issue_comment',
        header: 'Comment',
        headerLocale: 'Comment',
        sort: true,
        filter: false,
        skip: false,
        filters: this.getFilters(this.issues, 'issue_comment'),
        defaultValue: '',
        hidden: false,
        date: false
      },
      {
        field: 'author_comment',
        header: 'Comment by author',
        headerLocale: 'Comment by author',
        sort: true,
        filter: false,
        skip: false,
        filters: this.getFilters(this.issues, 'author_comment'),
        defaultValue: '',
        hidden: false,
        date: false,
      },
      {
        field: 'ready',
        header: 'Preparedness',
        headerLocale: 'Preparedness',
        sort: true,
        filter: false,
        skip: true,
        filters: this.getFilters(this.issues, 'ready'),
        defaultValue: '',
        hidden: false,
        date: false,
      },
      {
        field: 'revision',
        header: 'Revision',
        headerLocale: 'Revision',
        sort: true,
        filter: false,
        skip: false,
        filters: this.getFilters(this.issues, 'revision'),
        defaultValue: '',
        hidden: false,
        date: false,
      },
      {
        field: 'contract',
        header: 'Contract',
        headerLocale: 'Contract',
        sort: true,
        filter: false,
        skip: false,
        filters: this.getFilters(this.issues, 'contract'),
        defaultValue: '',
        hidden: false,
        date: false,
      },
      {
        field: 'related_issues',
        header: 'Related Tasks',
        headerLocale: 'Related Tasks',
        sort: false,
        filter: false,
        skip: false,
        filters: this.getFilters(this.issues, 'related_tasks'),
        defaultValue: '',
        hidden: false,
        date: false
      },
      {
        field: 'last_update',
        header: 'Last update',
        headerLocale: 'Last update',
        sort: true,
        filter: false,
        skip: false,
        filters: this.getFilters(this.issues, 'last_update'),
        defaultValue: '',
        hidden: false,
        date: true
      },
      {
        field: 'actual_man_hours',
        header: 'Actual man-hours',
        headerLocale: 'Actual man-hours',
        sort: true,
        filter: false,
        filters: this.getFilters(this.issues, 'actual_man_hours'),
        skip: false,
        defaultValue: '',
        hidden: false,
        date: false,
      },
      {
        field: 'plan_hours',
        header: 'Plan man-hours',
        headerLocale: 'Plan man-hours',
        sort: true,
        filter: false,
        filters: this.getFilters(this.issues, 'plan_hours'),
        skip: false,
        defaultValue: '',
        hidden: false,
        date: false,
      },
    ];
    this.colHeaders = this.cols.map(x => x.headerLocale);
    let selectedColsValue = localStorage.getItem('selectedCols');
    let selectedCols = selectedColsValue ? JSON.parse(selectedColsValue) as string[] : ['ID', 'Author', 'Department', 'Date created', 'Project', 'Assignee', 'Title', 'Drawing number', 'Status', 'Priority', 'Responsible', 'Last update'];
    if (selectedCols.length > 0) {
      this.selectedCols = this.colHeaders.filter(x => selectedCols.includes(x));
    }
    if (localStorage.getItem('id') != null){
      // @ts-ignore
      let newCols = JSON.parse(localStorage.getItem('id'));
      selectedCols.filter(x => newCols.find((y: any) => y.header == x) == null).forEach(col => {
        let findCol = this.cols.find(x => x.header == col);
        if (findCol != null){
          newCols.push(findCol);
        }
      });
      this.cols = newCols;
    }
  }


  fillIssues() {
    this.filled = false;
    // let scroll = 0;
    // if (this.dt != null){
    //   scroll = this.dt.el.nativeElement.querySelector('.p-datatable-virtual-scrollable-body').scrollTop;
    //   this.dt.style = {opacity: 0};
    // }

    zip(this.issueManager.getIssues(this.auth.getUser().login), this.issueManager.getIssues(this.auth.getUser().shared_access)).pipe(map((value) => value[0].concat(value[1]))).subscribe(data => {
      this.issues = data.filter(x => x.id > 0);
      // console.log(this.issues)

      if (this.auth.getUser().shared_access != ''){
        this.issueManager.getIssues(this.auth.getUser().shared_access).then(resShared => {
          resShared.forEach(x => this.issues.push(x));
        });
      }
      this.issues.forEach(issue => {
        issue.started_date = new Date(issue.started_date);
        issue.start_date = new Date(issue.start_date);
        issue.due_date = new Date(issue.due_date);
        issue.last_update = new Date(issue.last_update);
        issue.contract_due_date = new Date(issue.contract_due_date);
        issue.related_issues = [];
        let related: number[] = [];
        issue.combined_issues.forEach(y => {
          if (related.find(x => x == y.id) == null){
            related.push(y.id);
          }
        });
        issue.child_issues.forEach(y => {
          if (related.find(x => x == y.id) == null){
            related.push(y.id);
          }
        });
        if (issue.parent_id != 0){
          if (related.find(x => x == issue.parent_id) == null){
            related.push(issue.parent_id);
            //issue.related_issues = related;
          }
        }
        this.issues.forEach(otherIssue => {
          if (otherIssue.parent_id == issue.id){
            related.push(otherIssue.id);
          }
        });
        // let is = "mmm"
        issue.related_issues = related;

        //добавить столбец с трудозатратами на задачу (чтобы он появился в файлике exel)
        // this.auth.getPlanIssue(issue.id).subscribe(planIssue => {
        //   console.log(issue.actual_man_hours );
        //   issue.actual_man_hours = planIssue[0].consumed;
        //
        // });

        console.log(this.issues)
        // issue.related_issuesStr = is;
        // issue.ready = this.defineReadyState(issue);
      });
      this.cols.forEach(col => col.filters = this.getFilters(this.issues, col.field));
      this.cols.forEach(col => col.hidden = !this.selectedCols.includes(col.headerLocale));
      this.filled = true;
      // this.dt.filter("Closed","status", "in")
      this.issueManager.getIssuesViewed(this.auth.getUser().login).then(res => {
        this.viewedIssues = res;
        // console.log(this.viewedIssues)
      });
    });

    // if (this.dt != null){
    //   setTimeout(() => {
    //     this.dt.scrollTo({top: scroll});
    //     this.dt.style = {opacity: 1, transition: '0.1s'};
    //   }, 500);
    // }
  }

  formatRelatedIssue(issueId: number) {
    let res = '';
    let issueDetails: Issue | undefined = this.issues.find(x => x.id == issueId)
    // @ts-ignore
    if (issueDetails.responsible) {
      // @ts-ignore
      res = issueDetails.issue_type.toUpperCase().substr(0, 3) + '-' + issueDetails.responsible.toUpperCase().substr(0, 3) + '-' + issueDetails.status
    } else {
      // @ts-ignore
      res = issueDetails.issue_type.toUpperCase().substr(0, 3)  + '-' + issueDetails.status;
    }
    return res
  }

  defineReadyState(issue: Issue){
    return issue.ready.includes('|') ? issue.ready.split('|').map(x => +x) : (issue.issue_type == 'RKD' ? [0, 0, 0] : []);
    let states = [];
    states.push(issue.ready[0]);
    states.push(issue.ready[1]);
    states.push(issue.ready[2]);
    // issue.readyM = issue.ready[0] == '1';
    // issue.readyD = issue.ready[1] == '1';
    // issue.readyN = issue.ready[2] == '1';
    return states;
  }
  newTask(issue: object | null) {
    this.dialogService.open(CreateTaskComponent, {
      showHeader: false,
      modal: true,
      data: [issue, '']
    }).onClose.subscribe(res => {
      this.fillIssues();
    });
  }

  viewTask(id: number, type: string) {
    this.setIssueViewed(id);
    this.issueManager.getIssueDetails(id).then(res => {
      // console.log(res);
      if (res.id != null) {
        this.dialogService.open(TaskComponent, {
          showHeader: false,
          modal: true,
          data: res
        }).onClose.subscribe(res => {
          if (this.dt != null) {
            this.dt.resetScrollTop = function() { }
          }
          //this.fillIssues();
          let issue = res as Issue;
          if (issue != null && issue.id != null) {
            this.newTask(issue);
          }
          this.router.navigate([''], {queryParams: {taskId: null}, queryParamsHandling: 'merge'});
        });
      } else {
        this.messageService.add({severity: 'error', summary: 'Url Issue', detail: 'Cannot find issue defined in url.'});
      }
    });
  }

  setStatuses() {
    // this.selectedStatuses = array.filter((x: { value: string; }) => x.value != 'Resolved').map((x: { value: any; }) => x.value)
    // console.log(this.selectedStatuses)
    setTimeout(() => {
      this.dt.filter(this.selectedStatuses, "status", "in")
      // this.dt._filter();
      // this.dt.reset()
      // this.updateStatusFilterModel()
    }, 3000)
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
    // if (field == 'status') {
    //   this.selectedStatuses = res.filter(x => x.value != 'Resolved').map((x) => x.value)
    //   this.setStatuses()
    // }

    return _.sortBy(res, x => {
      x.label ? x.label.toString().replace('Не назначен', '0').replace('Not assigned', '0') : ''
    });
  }

  localeFilter(column: string, field: string): string {
    switch (column) {
      case 'issue_type':
        return this.issueManager.localeTaskType(field);
      case 'started_by':
        return this.auth.getUserName(field);
      case 'assigned_to':
        return this.auth.getUserName(field);
      case 'responsible':
        return this.auth.getUserName(field);
      case 'priority':
        return this.issueManager.localeTaskPriority(field);
      case 'status':
        return this.issueManager.localeStatus(field, false);
      // case 'actual_man_hours':
      //   return field?.toString();
      // case 'it_type':
      //   return this.issueManager.localeItType(field, true);
      default:
        return field;
    }
  }

  getDate(dateLong: number): string {
    let date = new Date(dateLong);
    let ye = new Intl.DateTimeFormat('ru', {year: 'numeric'}).format(date);
    let mo = new Intl.DateTimeFormat('ru', {month: 'short'}).format(date);
    let da = new Intl.DateTimeFormat('ru', {day: '2-digit'}).format(date);
    let hours = new Intl.DateTimeFormat('ru', {hour: '2-digit'}).format(date);
    let minutes = new Intl.DateTimeFormat('ru', {minute: '2-digit'}).format(date);
    return da + ' ' + mo + ' ' + ye + ' ' + ('0' + hours).slice(-2) + ':' + ('0' + minutes).slice(-2);
  }

  getDateOnly(dateLong: number): string {
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
    // let date = new Date(dateLong);
    // let ye = new Intl.DateTimeFormat('ru', { year: '2-digit' }).format(date);
    // let mo = new Intl.DateTimeFormat('ru', { month: '2-digit' }).format(date);
    // let da = new Intl.DateTimeFormat('ru', { day: '2-digit' }).format(date);
    // return da + '.' + mo + '.' + ye;
  }

  getDateNoTime(dateLong: number): string {
    let date = new Date(dateLong);
    let ye = new Intl.DateTimeFormat('ru', {year: 'numeric'}).format(date);
    let mo = new Intl.DateTimeFormat('ru', {month: 'short'}).format(date);
    let da = new Intl.DateTimeFormat('ru', {day: '2-digit'}).format(date);
    return da + ' ' + mo + ' ' + ye + ' ';
  }

  localeColumn(issueElement: string, field: string, issue: Issue): string {
    if (field == 'started_by') {
      return '<div class="df"><img src="' + this.auth.getUserAvatar(issueElement) + '" width="32px" height="32px" style="border-radius: 16px"/><div class="ml-1 cy">' + this.auth.getUserName(issueElement) + '</div></div>';
    } else if (field == 'assigned_to') {
      if (issueElement == '') {
        return '';
      } else {
        return '<div class="df"><img src="' + this.auth.getUserAvatar(issueElement) + '" width="32px" height="32px" style="border-radius: 16px"/><div class="ml-1 cy">' + this.auth.getUserName(issueElement) + '</div></div>';
      }
    } else if (field == 'status') {
      return this.issueManager.localeStatus(issueElement);
    } else if (field == 'it_type') {
        return this.issueManager.localeItType(issueElement);
    } else if (field == 'started_date') {
      return this.getDateOnly(+issueElement);
    } else if (field == 'issue_type') {
      return this.issueManager.localeTaskType(issueElement);
    } else if (field == 'name') {
      return this.trim(issueElement);
    } else if (field == 'priority') {
      return this.issueManager.localeTaskPriority(issueElement);
    } else if (field == 'department') {
      return this.issueManager.localeTaskDepartment(issueElement);
    } else if (field == 'due_date') {
      return +issueElement == 0 ? '-' : this.getDateOnly(+issueElement);
    } else if (field == 'last_update') {
      return +issueElement == 0 ? '-' : this.getDateOnly(+issueElement);
    } else if (field == 'responsible') {
      if (issueElement == '') {
        return '';
      } else {
        return '<div class="df"><img src="' + this.auth.getUserAvatar(issueElement) + '" width="32px" height="32px" style="border-radius: 16px"/><div class="ml-1 cy">' + this.auth.getUserName(issueElement) + '</div></div>';
      }
    } else if (field == 'doc_number') {
      return issueElement != '' ? issueElement : '-';
    } else if (field == 'contract_due_date') {
      return +issueElement == 0 ? '-' : this.getDateOnly(+issueElement);
    }
      // else if (field == 'author_comment') {
      //   return issueElement;
    // }
    else {
      // console.log(issueElement)
      return issueElement;
    }
  }
  localeColumnForPDF(issueElement: string, field: string): string {
    if (field == 'started_by') {
      return this.auth.getUserName(issueElement);
    } else if (field == 'assigned_to') {
      return this.auth.getUserName(issueElement);
    } else if (field == 'status') {
      return this.issueManager.localeStatus(issueElement, false);
    } else if (field == 'started_date') {
      return this.getDateOnly(+issueElement);
    } else if (field == 'issue_type') {
      return this.issueManager.localeTaskType(issueElement);
    } else if (field == 'name') {
      return issueElement;
    } else if (field == 'priority') {
      return this.issueManager.localeTaskPriority(issueElement);
    } else if (field == 'department') {
      return this.issueManager.localeTaskDepartment(issueElement);
    } else if (field == 'due_date') {
      return +issueElement == 0 ? '-' : this.getDateOnly(+issueElement);
    } else if (field == 'contract_due_date') {
      return +issueElement == 0 ? '-' : this.getDateOnly(+issueElement);
    } else if (field == 'last_update') {
      return +issueElement == 0 ? '-' : this.getDateOnly(+issueElement);
    } else if (field == 'responsible') {
      return this.auth.getUserName(issueElement);
    } else if (field == 'doc_number') {
      return issueElement != '' ? issueElement : '-';
    } else if (field == 'issue_comment') {
      return issueElement.replace(/<[^>]+>/g, '');
    } else {
      return issueElement;
    }
  }

  saveSelectedCols() {
    localStorage.setItem('selectedCols', JSON.stringify(this.selectedCols));
    //this.cols.forEach(col => col.hidden = !this.selectedCols.includes(col.headerLocale));
    this.setCols();
  }

  importXls() {
    this.dialogService.open(ImportxlsComponent, {
      showHeader: false,
      modal: true,
    }).onClose.subscribe(message => {
      if (message == 'imported') {
        this.messageService.add({
          severity: 'success',
          summary: 'Deployment',
          detail: 'You have uploaded this model to server'
        });
      }
    });
  }

  trim(input: string, length: number = 45): string {
    if (input.length <= length) {
      return input;
    } else {
      return input.substr(0, length) + '...';
    }
  }
  trimMin(input: string, length: number = 20): string {
    if (input.length <= length) {
      return input;
    } else {
      return input.substr(0, length) + '...';
    }
  }

  isTaskNew(id: number) {
    return this.viewedIssues.find(x => x.issue == id) == null;
  }

  isTaskUpdated(id: number, update: number) {
    return !this.isTaskNew(id) && this.viewedIssues.find(x => x.issue == id && update <= x.date) == null;
  }

  setIssueViewed(id: number) {
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
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() *
        charactersLength));
    }
    return result;
  }

  exportXls() {
    let fileName = 'export_' + this.generateId(8) + '.xlsx';
    let issues = this.dt.filteredValue as Issue[];
    if (this.dt.filteredValue == null){
      issues = this.issues;
    }
    let data: any[] = [];
    let cols = this.selectedColumns.map(x => x.field);
    data.push(this.selectedColumns.map(x => x.header));
    issues.filter(x => this.showIssue(x)).forEach(issue => {
      let newIssue: Issue = JSON.parse(JSON.stringify(issue));
      let rowData: any[] = [];
      let findSrc = this.issues.find(x => x.id == newIssue.id);
      // console.log(findSrc);

      cols.forEach(c => {
        if (findSrc != null){
          // @ts-ignore
          newIssue[c] = findSrc[c];
        }
        if (c == 'name'){
          // @ts-ignore
          console.log(newIssue[c]);
        }

        // @ts-ignore
        rowData.push(this.localeColumnForPDF(newIssue[c], c));
      });
      data.push(rowData);
    });
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = {Sheets: {'data': worksheet}, SheetNames: ['data']};
    XLSX.writeFile(workbook, fileName);
  }

  // @ts-ignore
  exportPDF() {
    console.log(this.dt);
    const doc = new jsPDF('l', 'mm', [297, 210]);
    this.http.get('/assets/fonts/roboto.txt', {responseType: 'text'}).subscribe(data => {
      // @ts-ignore
      doc.addFileToVFS("Roboto.ttf", data);
      doc.addFont("Roboto.ttf", "Roboto", "regular");
      doc.setFont("Roboto", 'regular');

      // @ts-ignore
      let headers: any[] = this.cols.filter(x => this.selectedCols.includes(x.header)).map(col => ({
        title: col.header,
        dataKey: col.field
      }));
      let issues: any[] = [];
      if (this.dt.filteredValue == null){
        this.issues.forEach(x => issues.push(x));
      }
      else{
        (this.dt.filteredValue as Issue[]).forEach(x => issues.push(x));
      }
      let body: any[] = [];
      issues.forEach(issue => {
        let newIssue = new Issue();
        for (let issueKey in issue) {
          // @ts-ignore
          newIssue[issueKey] = issue[issueKey];
        }
        body.push(newIssue);
      });
      body.forEach(issue => {
        for (let issueKey in issue) {
          // @ts-ignore
          issue[issueKey] = this.localeColumnForPDF(issue[issueKey], issueKey, issue);
        }
      });
      // @ts-ignore
      doc.autoTable({
        columns: headers,
        body: body,
        styles: {
          font: 'Roboto',
          fontStyle: 'regular'
        }
      });
      let fileName = 'export_' + this.generateId(8) + '.pdf';
      doc.save(fileName);
    });
  }

  applyFilter(filter: string) {
    switch (filter) {
      case 'assigned': {
        this.dt.filter(this.auth.getUser().login, 'assigned_to', 'equals');
        break;
      }
      case 'author/responsible': {
        this.dt.filter(this.auth.getUser().login, 'responsible', 'equals');
        this.dt.filter(this.auth.getUser().login, 'started_by', 'equals');
        break;
      }
      default: {
        break;
      }
    }
  }

  lastSortField: any = '';

  customSort(event: SortEvent) {
    // @ts-ignore
    event.data.sort((data1, data2) => {


      // @ts-ignore
      let value1 = data1[event.field];
      // @ts-ignore
      let value2 = data2[event.field];
      let result = null;

      if (event.field == 'priority') {
        let value1 = data1[event.field] == '' ? -1 : data1[event.field] == 'Low' ? 0 : data1[event.field] == 'Medium' ? 1 : 2;
        let value2 = data2[event.field] == '' ? -1 : data2[event.field] == 'Low' ? 0 : data2[event.field] == 'Medium' ? 1 : 2;
        result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0;
      } else {
        if (value1 == null && value2 != null)
          result = -1;
        else if (value1 != null && value2 == null)
          result = 1;
        else if (value1 == null && value2 == null)
          result = 0;
        else if (typeof value1 === 'string' && typeof value2 === 'string')
          result = value1.localeCompare(value2);
        else
          result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0;
      }

      // @ts-ignore
      return (event.order * result);
    });
    if (this.lastSortField != (event.field + '' + event.order)) {
      this.lastSortField = event.field + '' + event.order;
      this.issues = [...this.issues];
    }
  }

  showIssue(issue: Issue) {
    let show = true;
    if (this.showAssigned && issue.assigned_to != this.auth.getUser().login){
      show = false;
    }
    if (this.showResponsible && issue.responsible != this.auth.getUser().login){
      show = false;
    }
    if (this.showStartedBy && issue.started_by != this.auth.getUser().login){
      show = false;
    }
    if (issue.status.includes(',')){
      let statuses = issue.status.split(',');
      if (!this.showCompleted){
        show = statuses.find(x => issue.closing_status.includes(x)) != null;
      }
    }
    else{
      if (!this.showCompleted && issue.closing_status.includes(issue.status)){
        show = false;
      }
    }
    if (issue.issue_type == 'QNA' && issue.status == 'Resolved' && issue.started_by != this.auth.getUser().login){
      show = false;
    }
    if (issue.issue_type == 'QNA' && issue.started_by != this.auth.getUser().login && issue.responsible != this.auth.getUser().login && issue.assigned_to != this.auth.getUser().login){
      show = false;
    }
    return show;
  }

  getIssuesLength() {
    if (this.dt?.filteredValue?.length > 0){
      return this.dt?.filteredValue?.filter((x: any) => this.showIssue(x as Issue)).length;
    }
    return this.issues.filter(x => this.showIssue(x)).length;
  }
  getCompletedLength(issues: Issue[]) {
    return issues.filter(x => x.closing_status.includes(x.status)).length;
  }
  showIssuesLength() {
    return this.dt != null && this.dt.value != null;
  }

  saveReorderedColumns(event: any) {
    this.cols = event.columns;
    localStorage.setItem('id', JSON.stringify(event.columns));
  }

  getWidth(r: number) {
    return {
      width: r + 'px',
      'background-color': this.defineColor(r)
    };
  }
  defineColor(r: number): string{
    if (r < 50){
      return '#f16383';
    }
    else if (r < 80){
      return '#F1B263';
    }
    else{
      return '#00ACAC';
    }
  }


  saveFilters() {
    this.dialogService.open(FilterNameComponent, {
      showHeader: false,
      modal: true,
    }).onClose.subscribe(name => {
      // console.log(name)
      if (name) {
        let state = localStorage.getItem('state')
        console.log(state)
        const newFilter: IFilterSaved = {
          id: 0,
          user_id: this.auth.getUser().id,
          name: name,
          value: state!,
          showCompleted: this.showCompleted ? 1 : 0,
          page: 'home'
        }
        // console.log(newFilter)

        this.issueManager.saveFilters(newFilter).subscribe(() => {
          this.messageService.add({key:'filterName', severity:'success', detail:'New filter added successfully'});

          this.savedFilterName = name;
          localStorage.setItem("savedFilterName", name)
          this.getSavedFilters()
        })
      }
    });
  }

  getSavedFilters() {
    this.issueManager.getFilters(this.auth.getUser().id).subscribe(res => {
      this.savedFilters1 = res.filter((filter: IFilterSaved) => filter.page === 'home');
      // console.log(res);
      setTimeout(() => {  //чтобы установить название только загруженного фильтра
        // @ts-ignore
        this.savedFilterName = localStorage.getItem("savedFilterName");
      }, 500)
    })
  }

  loadFilter(dt: Table, filter: any) {
    console.log(this.savedFilterName)

    this.noFilters = false;
    this.cleanFilter();
    localStorage.setItem('state', filter.value);
    localStorage.setItem('savedFilterName', filter.name);
    localStorage.setItem('showCompleted', filter.showCompleted);
    this.dt.restoreState();
    this.dt._filter();
    this.showCompleted = filter.showCompleted
  }

  cleanFilter() {
    // @ts-ignore
    localStorage.setItem('savedFilterName', '');
    // @ts-ignore
    this.savedFilterName = '';
    this.dt.clear();
    this.dt.reset();
    this.dt.clearState();
    this.filtersValues = null;
    this.showStartedBy = false;
    this.showAssigned = false;
    this.showResponsible = false;
    this.showCompleted = false;
    // localStorage.setItem('savedFilterName', null);
  }

  deleteFilter(dt: Table, id: any, name: string, event: MouseEvent) {
    console.log(this.savedFilterName)
    event.stopPropagation()
    // this.issueManager.deleteFilterSaved(id).subscribe(res => {})
    // this.savedFilters1 = this.savedFilters1.filter((number) => number.id !== id)
    const dialog = this.dialogService.open(AgreeModalComponent, {  //открываем модалку подтверждения удаления файла
      modal: true,
      header: this.t.tr('Удалить фильтр?'),
      data: {
        //title: 'Удалить оборудование?',
        id: id
      }
    })
    dialog.onClose.subscribe((res) => {
      if (res) { // User clicked OK
        console.log('User confirmed delete filter');
        this.issueManager.deleteFilterSaved(id).subscribe(res => {})

        if (name === this.savedFilterName) {
          console.log("name == this.savedFilterName")
          console.log(name)
          console.log(this.savedFilterName)
          this.savedFilters1 = this.savedFilters1.filter((number) => number.id !== id)
          this.cleanFilter()
          setTimeout(() => {  //чтобы установить название только загруженного фильтра
            // @ts-ignore
            this.savedFilterName = ''
          }, 300)

        } else {
          console.log(name)
          console.log(this.savedFilterName)
          console.log("else")
          this.savedFilters1 = this.savedFilters1.filter((number) => number.id !== id)
          setTimeout(() => {  //чтобы установить название только загруженного фильтра
            // @ts-ignore
            this.savedFilterName = localStorage.getItem("savedFilterName");
          }, 300)
          // this.dt.restoreState();
          // this.dt._filter();
        }

        // this.eqService.getEquipmentFiles(this.dialogConfig.data.id).subscribe((res) => {  //обновим поле с файлами после удаления
        // })
      }
      else {
        console.log('User canceled'); // User clicked Cancel
      }
    })
  }

  redDate(dueDate: any, stageDueDate: any, status: string) {
    if (dueDate == 'Thu Jan 01 1970 03:00:00 GMT+0300 (Москва, стандартное время)') {  //почему то сравнение с new Date(null) не работает
      return false
    } else {
      if (stageDueDate != 'Thu Jan 01 1970 03:00:00 GMT+0300 (Москва, стандартное время)')
      {
        if (((dueDate < new Date()) || dueDate < stageDueDate) && (status.includes('In Work') || status.includes('AssignedTo') || status.includes('In Rework'))) {
          return true
        } else
          return false
      }
      else {
        if (dueDate < new Date() && (status.includes('In Work') || status.includes('AssignedTo') || status.includes('In Rework'))) {
          return true
        }
      }
    }
    return false
  }

  extractFilters (data: any): IFilter[] {
    const filters: IFilter[] = [];
    console.log(data.sortField)

    for (const key in data.filters) {
      if (data.filters[key][0].value !== null) {
        filters.push({ field: key, value: data.filters[key][0].value });
      }
    }
    return filters
  }

  // cleanFilter(id: number) {
  //   console.log("clean filter with id = " + id)
  // }


  openIssue(id: number) {
    window.open('/?taskId=' + id, '_blank');
  }

  click(filter:any) {
    console.log(filter)
  }
}


// import {
//   AfterContentChecked,
//   AfterViewInit,
//   Component,
//   ElementRef,
//   Input,
//   OnDestroy,
//   OnInit,
//   ViewChild
// } from '@angular/core';
// import {ActivatedRoute, Router} from "@angular/router";
// import {AuthManagerService} from "../../domain/auth-manager.service";
// import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
// import {CreateTaskComponent} from "../create-task/create-task.component";
// import {Issue} from "../../domain/classes/issue";
// import * as _ from 'underscore';
// import {TaskComponent} from "../task/task.component";
// import * as XLSX from 'xlsx';
// import {ImportxlsComponent} from "./importxls/importxls.component";
// import {MessageService, PrimeNGConfig, SortEvent} from "primeng/api";
// import {ViewedIssue} from "../../domain/classes/viewed-issue";
// import {LanguageService} from "../../domain/language.service";
// import {jsPDF} from "jspdf";
// import 'jspdf-autotable';
// import {HttpClient} from "@angular/common/http";
// import {concatAll, concatMap, map, retry, toArray} from "rxjs/operators";
// import {DeviceDetectorService} from "ngx-device-detector";
// import {IssueManagerService} from "../../domain/issue-manager.service";
// import {forkJoin, merge, zip} from "rxjs";
// import {Table} from "primeng/table";
// import {SequenceEqualOperator} from "rxjs/internal/operators/sequenceEqual";
// import {Equipment} from "../../domain/classes/equipment";
// import {FilterNameComponent} from "./filter-name/filter-name.component";
// import { ChangeDetectorRef } from '@angular/core';
// import {Dropdown} from "primeng/dropdown";
// import {AgreeModalComponent} from "../equipments/agree-modal/agree-modal.component";
//
//
// interface ISavedFilters {
//   id: number;
//   user_id: number;
//   field: string;
//   value: string;
//   showCompleted: Boolean;
// }
//
// interface IFilter {
//   field: string;
//   value: string | string[] | null;
// }
//
// interface StatusOption {
//   label: string;
//   value: string
// }
//
// @Component({
//   selector: 'app-home',
//   templateUrl: './home.component.html',
//   styleUrls: ['./home.component.css']
// })
//
//
// export class HomeComponent implements OnInit, AfterContentChecked {
//   issues: Issue[] = [];
//   cols: any[] = [];
//   filters = {};
//   selectedCols: string[] = [];
//   colHeaders: string[] = [];
//   filled = false;
//   viewedIssues: ViewedIssue[] = [];
//   showCompleted: boolean = false;
//   showAssigned: boolean = false;
//   showResponsible: boolean = false;
//   showStartedBy: boolean = false;
//   savedFilters: any[] = [];
//   savedFilters1: ISavedFilters[] = [];
//   // savedFilter: any;
//
//   filtersValues: any;
//   noFilters: boolean = true;
//   selectedStatuses: string[] = []
//   // redDate: boolean = false;
//   selectedFilter: any =  {
//     id: 0,
//     user_id: this.auth.getUser().id,
//     name: '',
//     value: '',
//     showCompleted: false
//   } ;
//
//   statusesOptions: StatusOption[] = [
//     // { label: 'Active', value: 'active' },
//     // { label: 'Inactive', value: 'inactive' }
//   ];
//
//   constructor(public device: DeviceDetectorService, private config: PrimeNGConfig, private http: HttpClient, private route: ActivatedRoute, private router: Router, private messageService: MessageService, private issueManager: IssueManagerService, public auth: AuthManagerService, private dialogService: DialogService, public t: LanguageService, private cdRef: ChangeDetectorRef) {
//   }
//
//   // @ts-ignore
//   @ViewChild('search') search;
//   // @ts-ignore
//   @ViewChild('dt') dt: Table;
//
//   @ViewChild('dd') dd: Dropdown;
//
//
//   @Input() get selectedColumns(): any[] {
//     return this.cols.filter(col => this.selectedCols.includes(col.headerLocale));
//   }
//   resetSearch = false;
//
//   ngAfterContentChecked(): void {
//     if (!this.resetSearch && this.dt != null) {
//       this.dt.filterGlobal('', 'content');
//       this.resetSearch = true;
//     }
//   }
//
//
//   ngOnInit() {
//     const storedFilter = localStorage.getItem("selectedFilter");
//     if (storedFilter) {
//
//
//       setTimeout(() => {
//         this.selectedFilter =  {
//           id: 0,
//           user_id: this.auth.getUser().id,
//           name: storedFilter,
//           value: '',
//           showCompleted: false
//         } ;
//         console.log('mdaa')
//       }, 1000)
//
//       // this.selectedFilter.name = storedFilter;
//       console.log("nhOnInit")
//       console.log(this.selectedFilter)
//
//     } else {
//       console.log("nhOnInit ELSE")
//       console.log(this.selectedFilter)
//     }
//     // if (localStorage.getItem("selectedFilter")) {
//     //   this.selectedFilter =  JSON.parse(localStorage.getItem("selectedFilter"))
//     //   // this.selectedFilter.name = 'mmm'
//     //   // this.selectedFilterChanged()
//     // }
//
//     // const storedFilter = localStorage.getItem("selectedFilter");
//     // if (storedFilter) {
//     //   console.log(storedFilter)
//     //   this.selectedFilter = storedFilter;
//     // } else
//     //   this.selectedFilter = null
//
//
//     this.getSavedFilters();
//     if (!this.auth.getUser().visible_pages.includes('home') && this.auth.getUser().visible_pages.length > 0){
//       this.router.navigate([this.auth.getUser().visible_pages[0]]);
//     }
//     if (localStorage.getItem('states') != null){
//       this.savedFilters = JSON.parse(localStorage.getItem('states')!);
//     }
//
//     this.setCols();
//     this.fillIssues();
//     this.route.queryParams.subscribe(params => {
//       let taskId = params.taskId != null ? params.taskId : '';
//       if (taskId != '') {
//         this.viewTask(taskId, '');
//       }
//     });
//     if (this.t.language == 'ru'){
//       this.config.setTranslation({
//         clear: "Очистить",
//         apply: "Принять",
//         removeRule: "Удалить условие",
//         addRule: "Добавить условие",
//         dateIs: "Выбраная дата",
//         dateIsNot: "Кроме даты",
//         matchAll: "Все условия",
//         matchAny: "Любое условие",
//         dateBefore: "До выбраной даты",
//         dateAfter: "После выбраной даты",
//         monthNames: ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"],
//       });
//     }
//   }
//
//   clickShowComletedButton() {
//     this.showCompleted = !this.showCompleted;
//     if (this.showCompleted) {
//       this.selectedStatuses.push('Resolved')
//       console.log(this.selectedStatuses)
//     } else {
//       this.selectedStatuses = this.selectedStatuses.filter(x => x != 'Resolved')
//       console.log(this.selectedStatuses)
//     }
//     this.setStatuses()
//   }
//
//
//   setCols() {
//     this.cols = [
//       {
//         field: 'id',
//         header: 'ID',
//         headerLocale: 'ID',
//         sort: true,
//         filter: false,
//         filters: this.getFilters(this.issues, 'id'),
//         skip: false,
//         defaultValue: '',
//         hidden: false,
//         date: false,
//       },
//       {
//         field: 'started_date',
//         header: 'Date created',
//         headerLocale: 'Date created',
//         sort: true,
//         filter: false,
//         filters: this.getFilters(this.issues, 'started_date'),
//         skip: false,
//         defaultValue: '',
//         hidden: false,
//         date: true
//       },
//       {
//         field: 'issue_type',
//         header: 'Task type',
//         headerLocale: 'Task type',
//         sort: true,
//         filter: true,
//         filters: this.getFilters(this.issues, 'issue_type'),
//         skip: false,
//         defaultValue: '',
//         hidden: false,
//         date: false
//       },
//       {
//         field: 'started_by',
//         header: 'Author',
//         headerLocale: 'Author',
//         sort: true,
//         filter: true,
//         filters: this.getFilters(this.issues, 'started_by'),
//         skip: false,
//         defaultValue: '',
//         hidden: false,
//         date: false,
//       },
//       {
//         field: 'project',
//         header: 'Project',
//         headerLocale: 'Project',
//         sort: true,
//         filter: true,
//         filters: this.getFilters(this.issues, 'project'),
//         skip: false,
//         defaultValue: '',
//         hidden: false,
//         date: false
//       },
//       {
//         field: 'department',
//         header: 'Department',
//         headerLocale: 'Department',
//         sort: true,
//         filter: true,
//         filters: this.getFilters(this.issues, 'department'),
//         skip: false,
//         defaultValue: '',
//         hidden: false,
//         date: false
//       },
//       {
//         field: 'name',
//         header: 'Title',
//         headerLocale: 'Title',
//         sort: true,
//         filter: false,
//         filters: this.getFilters(this.issues, 'name'),
//         skip: false,
//         defaultValue: '',
//         hidden: false,
//         date: false
//       },
//       {
//         field: 'assigned_to',
//         header: 'Assignee',
//         headerLocale: 'Assignee',
//         sort: true,
//         filter: true,
//         filters: this.getFilters(this.issues, 'assigned_to'),
//         skip: false,
//         defaultValue: '',
//         hidden: false,
//         date: false
//       },
//       {
//         field: 'status',
//         header: 'Status',
//         headerLocale: 'Status',
//         sort: true,
//         filter: true,
//         skip: false,
//         filters: this.getFilters(this.issues, 'status'),
//         defaultValue: '',
//         hidden: false,
//         date: false,
//       },
//       {
//         field: 'priority',
//         header: 'Priority',
//         headerLocale: 'Priority',
//         sort: true,
//         filter: true,
//         skip: false,
//         filters: this.getFilters(this.issues, 'priority'),
//         defaultValue: '',
//         hidden: false,
//         date: false
//       },
//       {
//         field: 'due_date',
//         header: 'Due date',
//         headerLocale: 'Due date',
//         sort: true,
//         filter: false,
//         skip: false,
//         filters: this.getFilters(this.issues, 'due_date'),
//         defaultValue: '',
//         hidden: false,
//         date: true
//       },
//       {
//         field: 'overtime',
//         header: 'Overtime',
//         headerLocale: 'Overtime',
//         sort: true,
//         filter: true,
//         skip: false,
//         filters: this.getFilters(this.issues, 'overtime'),
//         defaultValue: '',
//         hidden: false,
//         date: false
//       },
//       {
//         field: 'responsible',
//         header: 'Responsible',
//         headerLocale: 'Responsible',
//         sort: true,
//         filter: true,
//         skip: false,
//         filters: this.getFilters(this.issues, 'responsible'),
//         defaultValue: '',
//         hidden: false,
//         date: false
//       },
//       {
//         field: 'doc_number',
//         header: 'Drawing number',
//         headerLocale: 'Drawing number',
//         sort: true,
//         filter: false,
//         skip: false,
//         filters: this.getFilters(this.issues, 'doc_number'),
//         defaultValue: '',
//         hidden: false,
//         date: false
//       },
//       {
//         field: 'period',
//         header: 'Stage',
//         headerLocale: 'Stage',
//         sort: true,
//         filter: true,
//         skip: false,
//         filters: this.getFilters(this.issues, 'period'),
//         defaultValue: '',
//         hidden: false,
//         date: false
//       },
//       {
//         field: 'last_update',
//         header: 'Last update',
//         headerLocale: 'Last update',
//         sort: true,
//         filter: false,
//         skip: false,
//         filters: this.getFilters(this.issues, 'last_update'),
//         defaultValue: '',
//         hidden: false,
//         date: true
//       },
//       {
//         field: 'issue_comment',
//         header: 'Note',
//         headerLocale: 'Note',
//         sort: true,
//         filter: false,
//         skip: false,
//         filters: this.getFilters(this.issues, 'issue_comment'),
//         defaultValue: '',
//         hidden: false,
//         date: false
//       },
//       {
//         field: 'author_comment',
//         header: 'Comment',
//         headerLocale: 'Comment',
//         sort: true,
//         filter: false,
//         skip: false,
//         filters: this.getFilters(this.issues, 'author_comment'),
//         defaultValue: '',
//         hidden: false,
//         date: false,
//       },
//       {
//         field: 'ready',
//         header: 'Preparedness',
//         headerLocale: 'Preparedness',
//         sort: true,
//         filter: false,
//         skip: true,
//         filters: this.getFilters(this.issues, 'ready'),
//         defaultValue: '',
//         hidden: false,
//         date: false,
//       },
//       {
//         field: 'revision',
//         header: 'Revision',
//         headerLocale: 'Revision',
//         sort: true,
//         filter: false,
//         skip: false,
//         filters: this.getFilters(this.issues, 'revision'),
//         defaultValue: '',
//         hidden: false,
//         date: false,
//       },
//       {
//         field: 'contract_due_date',
//         header: 'Stage Due Date',
//         headerLocale: 'Stage Due Date',
//         sort: true,
//         filter: false,
//         skip: false,
//         filters: this.getFilters(this.issues, 'contract_due_date'),
//         defaultValue: '',
//         hidden: false,
//         date: true,
//       },
//       {
//         field: 'contract',
//         header: 'Contract',
//         headerLocale: 'Contract',
//         sort: true,
//         filter: false,
//         skip: false,
//         filters: this.getFilters(this.issues, 'contract'),
//         defaultValue: '',
//         hidden: false,
//         date: false,
//       },
//       {
//         field: 'related_issues',
//         header: 'Related Tasks',
//         headerLocale: 'Related Tasks',
//         sort: false,
//         filter: false,
//         skip: false,
//         filters: this.getFilters(this.issues, 'related_tasks'),
//         defaultValue: '',
//         hidden: false,
//         date: false
//       }
//     ];
//     this.colHeaders = this.cols.map(x => x.headerLocale);
//     let selectedColsValue = localStorage.getItem('selectedCols');
//     let selectedCols = selectedColsValue ? JSON.parse(selectedColsValue) as string[] : ['ID', 'Author', 'Department', 'Date created', 'Project', 'Assignee', 'Title', 'Drawing number', 'Status', 'Priority', 'Responsible', 'Last update'];
//     if (selectedCols.length > 0) {
//       this.selectedCols = this.colHeaders.filter(x => selectedCols.includes(x));
//     }
//     if (localStorage.getItem('id') != null){
//       // @ts-ignore
//       let newCols = JSON.parse(localStorage.getItem('id'));
//       selectedCols.filter(x => newCols.find((y: any) => y.header == x) == null).forEach(col => {
//         let findCol = this.cols.find(x => x.header == col);
//         if (findCol != null){
//           newCols.push(findCol);
//         }
//       });
//       this.cols = newCols;
//     }
//   }
//
//
//   fillIssues() {
//     this.filled = false;
//     // let scroll = 0;
//     // if (this.dt != null){
//     //   scroll = this.dt.el.nativeElement.querySelector('.p-datatable-virtual-scrollable-body').scrollTop;
//     //   this.dt.style = {opacity: 0};
//     // }
//
//     zip(this.issueManager.getIssues(this.auth.getUser().login), this.issueManager.getIssues(this.auth.getUser().shared_access)).pipe(map((value) => value[0].concat(value[1]))).subscribe(data => {
//       this.issues = data.filter(x => x.id > 0);
//
//       if (this.auth.getUser().shared_access != ''){
//         this.issueManager.getIssues(this.auth.getUser().shared_access).then(resShared => {
//           resShared.forEach(x => this.issues.push(x));
//         });
//       }
//       this.issues.forEach(issue => {
//         issue.started_date = new Date(issue.started_date);
//         issue.start_date = new Date(issue.start_date);
//         issue.due_date = new Date(issue.due_date);
//         issue.last_update = new Date(issue.last_update);
//         issue.contract_due_date = new Date(issue.contract_due_date);
//         issue.related_issues = [];
//         let related: number[] = [];
//         issue.combined_issues.forEach(y => {
//           if (related.find(x => x == y.id) == null){
//             related.push(y.id);
//           }
//         });
//         issue.child_issues.forEach(y => {
//           if (related.find(x => x == y.id) == null){
//             related.push(y.id);
//           }
//         });
//         if (issue.parent_id != 0){
//           if (related.find(x => x == issue.parent_id) == null){
//             related.push(issue.parent_id);
//             //issue.related_issues = related;
//           }
//         }
//         this.issues.forEach(otherIssue => {
//           if (otherIssue.parent_id == issue.id){
//             related.push(otherIssue.id);
//           }
//         });
//         // let is = "mmm"
//         issue.related_issues = related;
//         // issue.related_issuesStr = is;
//         // issue.ready = this.defineReadyState(issue);
//       });
//       this.cols.forEach(col => col.filters = this.getFilters(this.issues, col.field));
//       this.cols.forEach(col => col.hidden = !this.selectedCols.includes(col.headerLocale));
//       this.filled = true;
//       // this.dt.filter("Closed","status", "in")
//       this.issueManager.getIssuesViewed(this.auth.getUser().login).then(res => {
//         this.viewedIssues = res;
//         // console.log(this.viewedIssues)
//       });
//     });
//
//     // if (this.dt != null){
//     //   setTimeout(() => {
//     //     this.dt.scrollTo({top: scroll});
//     //     this.dt.style = {opacity: 1, transition: '0.1s'};
//     //   }, 500);
//     // }
//   }
//
//   defineReadyState(issue: Issue){
//     return issue.ready.includes('|') ? issue.ready.split('|').map(x => +x) : (issue.issue_type == 'RKD' ? [0, 0, 0] : []);
//     let states = [];
//     states.push(issue.ready[0]);
//     states.push(issue.ready[1]);
//     states.push(issue.ready[2]);
//     // issue.readyM = issue.ready[0] == '1';
//     // issue.readyD = issue.ready[1] == '1';
//     // issue.readyN = issue.ready[2] == '1';
//     return states;
//   }
//   newTask(issue: object | null) {
//     this.dialogService.open(CreateTaskComponent, {
//       showHeader: false,
//       modal: true,
//       data: [issue, '']
//     }).onClose.subscribe(res => {
//       this.fillIssues();
//     });
//   }
//
//   viewTask(id: number, type: string) {
//     this.setIssueViewed(id);
//     this.issueManager.getIssueDetails(id).then(res => {
//       // console.log(res);
//       if (res.id != null) {
//         this.dialogService.open(TaskComponent, {
//           showHeader: false,
//           modal: true,
//           data: res
//         }).onClose.subscribe(res => {
//           if (this.dt != null) {
//             this.dt.resetScrollTop = function() { }
//           }
//           //this.fillIssues();
//           let issue = res as Issue;
//           if (issue != null && issue.id != null) {
//             this.newTask(issue);
//           }
//           this.router.navigate([''], {queryParams: {taskId: null}, queryParamsHandling: 'merge'});
//         });
//       } else {
//         this.messageService.add({severity: 'error', summary: 'Url Issue', detail: 'Cannot find issue defined in url.'});
//       }
//     });
//   }
//
//   setStatuses() {
//     // this.selectedStatuses = array.filter((x: { value: string; }) => x.value != 'Resolved').map((x: { value: any; }) => x.value)
//     // console.log(this.selectedStatuses)
//     setTimeout(() => {
//       this.dt.filter(this.selectedStatuses, "status", "in")
//       // this.dt._filter();
//       // this.dt.reset()
//       // this.updateStatusFilterModel()
//     }, 3000)
//   }
//
//
//
//   getFilters(issues: any[], field: string): any[] {
//     let res: any[] = [];
//     let uniq = _.uniq(issues, x => x[field]);
//     uniq.forEach(x => {
//       res.push({
//         label: this.localeFilter(field, x[field]),
//         value: x[field]
//       })
//     });
//     // if (field == 'status') {
//     //   this.selectedStatuses = res.filter(x => x.value != 'Resolved').map((x) => x.value)
//     //   this.setStatuses()
//     // }
//
//     return _.sortBy(res, x => x.label.toString().replace('Не назначен', '0').replace('Not assigned', '0'));
//   }
//
//   localeFilter(column: string, field: string): string {
//     switch (column) {
//       case 'issue_type':
//         return this.issueManager.localeTaskType(field);
//       case 'started_by':
//         return this.auth.getUserName(field);
//       case 'assigned_to':
//         return this.auth.getUserName(field);
//       case 'responsible':
//         return this.auth.getUserName(field);
//       case 'priority':
//         return this.issueManager.localeTaskPriority(field);
//       case 'status':
//         return this.issueManager.localeStatus(field, false);
//       default:
//         return field;
//     }
//   }
//
//   getDate(dateLong: number): string {
//     let date = new Date(dateLong);
//     let ye = new Intl.DateTimeFormat('ru', {year: 'numeric'}).format(date);
//     let mo = new Intl.DateTimeFormat('ru', {month: 'short'}).format(date);
//     let da = new Intl.DateTimeFormat('ru', {day: '2-digit'}).format(date);
//     let hours = new Intl.DateTimeFormat('ru', {hour: '2-digit'}).format(date);
//     let minutes = new Intl.DateTimeFormat('ru', {minute: '2-digit'}).format(date);
//     return da + ' ' + mo + ' ' + ye + ' ' + ('0' + hours).slice(-2) + ':' + ('0' + minutes).slice(-2);
//   }
//
//   getDateOnly(dateLong: number): string {
//     let date = new Date(dateLong);
//     return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
//     // let date = new Date(dateLong);
//     // let ye = new Intl.DateTimeFormat('ru', { year: '2-digit' }).format(date);
//     // let mo = new Intl.DateTimeFormat('ru', { month: '2-digit' }).format(date);
//     // let da = new Intl.DateTimeFormat('ru', { day: '2-digit' }).format(date);
//     // return da + '.' + mo + '.' + ye;
//   }
//
//   getDateNoTime(dateLong: number): string {
//     let date = new Date(dateLong);
//     let ye = new Intl.DateTimeFormat('ru', {year: 'numeric'}).format(date);
//     let mo = new Intl.DateTimeFormat('ru', {month: 'short'}).format(date);
//     let da = new Intl.DateTimeFormat('ru', {day: '2-digit'}).format(date);
//     return da + ' ' + mo + ' ' + ye + ' ';
//   }
//
//   localeColumn(issueElement: string, field: string, issue: Issue): string {
//     if (field == 'started_by') {
//       return '<div class="df"><img src="' + this.auth.getUserAvatar(issueElement) + '" width="32px" height="32px" style="border-radius: 16px"/><div class="ml-1 cy">' + this.auth.getUserName(issueElement) + '</div></div>';
//     } else if (field == 'assigned_to') {
//       if (issueElement == '') {
//         return '';
//       } else {
//         return '<div class="df"><img src="' + this.auth.getUserAvatar(issueElement) + '" width="32px" height="32px" style="border-radius: 16px"/><div class="ml-1 cy">' + this.auth.getUserName(issueElement) + '</div></div>';
//       }
//     } else if (field == 'status') {
//       return this.issueManager.localeStatus(issueElement);
//     } else if (field == 'started_date') {
//       return this.getDateOnly(+issueElement);
//     } else if (field == 'issue_type') {
//       return this.issueManager.localeTaskType(issueElement);
//     } else if (field == 'name') {
//       return this.trim(issueElement);
//     } else if (field == 'priority') {
//       return this.issueManager.localeTaskPriority(issueElement);
//     } else if (field == 'department') {
//       return this.issueManager.localeTaskDepartment(issueElement);
//     } else if (field == 'due_date') {
//       return +issueElement == 0 ? '-' : this.getDateOnly(+issueElement);
//     } else if (field == 'last_update') {
//       return +issueElement == 0 ? '-' : this.getDateOnly(+issueElement);
//     } else if (field == 'responsible') {
//       if (issueElement == '') {
//         return '';
//       } else {
//         return '<div class="df"><img src="' + this.auth.getUserAvatar(issueElement) + '" width="32px" height="32px" style="border-radius: 16px"/><div class="ml-1 cy">' + this.auth.getUserName(issueElement) + '</div></div>';
//       }
//     } else if (field == 'doc_number') {
//       return issueElement != '' ? issueElement : '-';
//     } else if (field == 'contract_due_date') {
//       return +issueElement == 0 ? '-' : this.getDateOnly(+issueElement);
//     }
//       // else if (field == 'author_comment') {
//       //   return issueElement;
//     // }
//     else {
//       // console.log(issueElement)
//       return issueElement;
//     }
//   }
//   localeColumnForPDF(issueElement: string, field: string): string {
//     if (field == 'started_by') {
//       return this.auth.getUserName(issueElement);
//     } else if (field == 'assigned_to') {
//       return this.auth.getUserName(issueElement);
//     } else if (field == 'status') {
//       return this.issueManager.localeStatus(issueElement, false);
//     } else if (field == 'started_date') {
//       return this.getDateOnly(+issueElement);
//     } else if (field == 'issue_type') {
//       return this.issueManager.localeTaskType(issueElement);
//     } else if (field == 'name') {
//       return issueElement;
//     } else if (field == 'priority') {
//       return this.issueManager.localeTaskPriority(issueElement);
//     } else if (field == 'department') {
//       return this.issueManager.localeTaskDepartment(issueElement);
//     } else if (field == 'due_date') {
//       return +issueElement == 0 ? '-' : this.getDateOnly(+issueElement);
//     } else if (field == 'contract_due_date') {
//       return +issueElement == 0 ? '-' : this.getDateOnly(+issueElement);
//     } else if (field == 'last_update') {
//       return +issueElement == 0 ? '-' : this.getDateOnly(+issueElement);
//     } else if (field == 'responsible') {
//       return this.auth.getUserName(issueElement);
//     } else if (field == 'doc_number') {
//       return issueElement != '' ? issueElement : '-';
//     } else if (field == 'issue_comment') {
//       return issueElement.replace(/<[^>]+>/g, '');
//     } else {
//       return issueElement;
//     }
//   }
//
//   saveSelectedCols() {
//     localStorage.setItem('selectedCols', JSON.stringify(this.selectedCols));
//     //this.cols.forEach(col => col.hidden = !this.selectedCols.includes(col.headerLocale));
//     this.setCols();
//   }
//
//   importXls() {
//     this.dialogService.open(ImportxlsComponent, {
//       showHeader: false,
//       modal: true,
//     }).onClose.subscribe(message => {
//       if (message == 'imported') {
//         this.messageService.add({
//           severity: 'success',
//           summary: 'Deployment',
//           detail: 'You have uploaded this model to server'
//         });
//       }
//     });
//   }
//
//   trim(input: string, length: number = 45): string {
//     if (input.length <= length) {
//       return input;
//     } else {
//       return input.substr(0, length) + '...';
//     }
//   }
//   trimMin(input: string, length: number = 20): string {
//     if (input.length <= length) {
//       return input;
//     } else {
//       return input.substr(0, length) + '...';
//     }
//   }
//
//   isTaskNew(id: number) {
//     return this.viewedIssues.find(x => x.issue == id) == null;
//   }
//
//   isTaskUpdated(id: number, update: number) {
//     return !this.isTaskNew(id) && this.viewedIssues.find(x => x.issue == id && update <= x.date) == null;
//   }
//
//   setIssueViewed(id: number) {
//     this.issueManager.setIssueViewed(id, this.auth.getUser().login).then(res => {
//       this.issueManager.getIssuesViewed(this.auth.getUser().login).then(res => {
//         this.viewedIssues = res;
//       });
//     });
//   }
//
//   generateId(length: number): string {
//     let result = '';
//     const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//     const charactersLength = characters.length;
//     for (let i = 0; i < length; i++) {
//       result += characters.charAt(Math.floor(Math.random() *
//         charactersLength));
//     }
//     return result;
//   }
//
//   exportXls() {
//     let fileName = 'export_' + this.generateId(8) + '.xlsx';
//     let issues = this.dt.filteredValue as Issue[];
//     if (this.dt.filteredValue == null){
//       issues = this.issues;
//     }
//     let data: any[] = [];
//     let cols = this.selectedColumns.map(x => x.field);
//     data.push(this.selectedColumns.map(x => x.header));
//     issues.filter(x => this.showIssue(x)).forEach(issue => {
//       let newIssue: Issue = JSON.parse(JSON.stringify(issue));
//       let rowData: any[] = [];
//       let findSrc = this.issues.find(x => x.id == newIssue.id);
//       console.log(findSrc);
//
//       cols.forEach(c => {
//         if (findSrc != null){
//           // @ts-ignore
//           newIssue[c] = findSrc[c];
//         }
//         if (c == 'name'){
//           // @ts-ignore
//           console.log(newIssue[c]);
//         }
//
//         // @ts-ignore
//         rowData.push(this.localeColumnForPDF(newIssue[c], c));
//       });
//       data.push(rowData);
//     });
//     const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
//     const workbook: XLSX.WorkBook = {Sheets: {'data': worksheet}, SheetNames: ['data']};
//     XLSX.writeFile(workbook, fileName);
//   }
//
//   // @ts-ignore
//   exportPDF() {
//     console.log(this.dt);
//     const doc = new jsPDF('l', 'mm', [297, 210]);
//     this.http.get('/assets/fonts/roboto.txt', {responseType: 'text'}).subscribe(data => {
//       // @ts-ignore
//       doc.addFileToVFS("Roboto.ttf", data);
//       doc.addFont("Roboto.ttf", "Roboto", "regular");
//       doc.setFont("Roboto", 'regular');
//
//       // @ts-ignore
//       let headers: any[] = this.cols.filter(x => this.selectedCols.includes(x.header)).map(col => ({
//         title: col.header,
//         dataKey: col.field
//       }));
//       let issues: any[] = [];
//       if (this.dt.filteredValue == null){
//         this.issues.forEach(x => issues.push(x));
//       }
//       else{
//         (this.dt.filteredValue as Issue[]).forEach(x => issues.push(x));
//       }
//       let body: any[] = [];
//       issues.forEach(issue => {
//         let newIssue = new Issue();
//         for (let issueKey in issue) {
//           // @ts-ignore
//           newIssue[issueKey] = issue[issueKey];
//         }
//         body.push(newIssue);
//       });
//       body.forEach(issue => {
//         for (let issueKey in issue) {
//           // @ts-ignore
//           issue[issueKey] = this.localeColumnForPDF(issue[issueKey], issueKey, issue);
//         }
//       });
//       // @ts-ignore
//       doc.autoTable({
//         columns: headers,
//         body: body,
//         styles: {
//           font: 'Roboto',
//           fontStyle: 'regular'
//         }
//       });
//       let fileName = 'export_' + this.generateId(8) + '.pdf';
//       doc.save(fileName);
//     });
//   }
//
//   applyFilter(filter: string) {
//     switch (filter) {
//       case 'assigned': {
//         this.dt.filter(this.auth.getUser().login, 'assigned_to', 'equals');
//         break;
//       }
//       case 'author/responsible': {
//         this.dt.filter(this.auth.getUser().login, 'responsible', 'equals');
//         this.dt.filter(this.auth.getUser().login, 'started_by', 'equals');
//         break;
//       }
//       default: {
//         break;
//       }
//     }
//   }
//
//   lastSortField: any = '';
//
//   customSort(event: SortEvent) {
//     // @ts-ignore
//     event.data.sort((data1, data2) => {
//
//
//       // @ts-ignore
//       let value1 = data1[event.field];
//       // @ts-ignore
//       let value2 = data2[event.field];
//       let result = null;
//
//       if (event.field == 'priority') {
//         let value1 = data1[event.field] == '' ? -1 : data1[event.field] == 'Low' ? 0 : data1[event.field] == 'Medium' ? 1 : 2;
//         let value2 = data2[event.field] == '' ? -1 : data2[event.field] == 'Low' ? 0 : data2[event.field] == 'Medium' ? 1 : 2;
//         result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0;
//       } else {
//         if (value1 == null && value2 != null)
//           result = -1;
//         else if (value1 != null && value2 == null)
//           result = 1;
//         else if (value1 == null && value2 == null)
//           result = 0;
//         else if (typeof value1 === 'string' && typeof value2 === 'string')
//           result = value1.localeCompare(value2);
//         else
//           result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0;
//       }
//
//       // @ts-ignore
//       return (event.order * result);
//     });
//     if (this.lastSortField != (event.field + '' + event.order)) {
//       this.lastSortField = event.field + '' + event.order;
//       this.issues = [...this.issues];
//     }
//   }
//
//   showIssue(issue: Issue) {
//     let show = true;
//     if (this.showAssigned && issue.assigned_to != this.auth.getUser().login){
//       show = false;
//     }
//     if (this.showResponsible && issue.responsible != this.auth.getUser().login){
//       show = false;
//     }
//     if (this.showStartedBy && issue.started_by != this.auth.getUser().login){
//       show = false;
//     }
//     if (issue.status.includes(',')){
//       let statuses = issue.status.split(',');
//       if (!this.showCompleted){
//         show = statuses.find(x => issue.closing_status.includes(x)) != null;
//       }
//     }
//     else{
//       if (!this.showCompleted && issue.closing_status.includes(issue.status)){
//         show = false;
//       }
//     }
//     return show;
//   }
//
//   getIssuesLength() {
//     if (this.dt?.filteredValue?.length > 0){
//       return this.dt?.filteredValue?.filter((x: any) => this.showIssue(x as Issue)).length;
//     }
//     return this.issues.filter(x => this.showIssue(x)).length;
//   }
//   getCompletedLength(issues: Issue[]) {
//     return issues.filter(x => x.closing_status.includes(x.status)).length;
//   }
//   showIssuesLength() {
//     return this.dt != null && this.dt.value != null;
//   }
//
//   saveReorderedColumns(event: any) {
//     this.cols = event.columns;
//     localStorage.setItem('id', JSON.stringify(event.columns));
//   }
//
//   getWidth(r: number) {
//     return {
//       width: r + 'px',
//       'background-color': this.defineColor(r)
//     };
//   }
//   defineColor(r: number): string{
//     if (r < 50){
//       return '#f16383';
//     }
//     else if (r < 80){
//       return '#F1B263';
//     }
//     else{
//       return '#00ACAC';
//     }
//   }
//
//
//   saveFilters() {
//     this.dialogService.open(FilterNameComponent, {
//       showHeader: false,
//       modal: true,
//     }).onClose.subscribe(name => {
//       // console.log(name)
//       if (name) {
//         let state = localStorage.getItem('state')
//         console.log(state)
//         const newFilter = {
//           id: 0,
//           user_id: this.auth.getUser().id,
//           name: name,
//           value: state,
//           showCompleted: this.showCompleted ? 1 : 0
//         }
//         // console.log(newFilter)
//
//         this.issueManager.saveFilters(newFilter).subscribe(() => {
//           this.messageService.add({key:'filterName', severity:'success', detail:'New filter added successfully'});
//
//           // this.savedFilterName = name;
//           localStorage.setItem("savedFilterName", name)
//           this.getSavedFilters()
//         })
//       }
//     });
//   }
//
//   getSavedFilters() {
//     this.issueManager.getFilters(this.auth.getUser().id).subscribe(res => {
//       this.savedFilters1 = res;
//       // setTimeout(() => {  //чтобы установить название только загруженного фильтра
//       //   // @ts-ignore
//       //   this.savedFilterName = localStorage.getItem("savedFilterName");
//       // }, 300)
//     })
//   }
//
//   selectedFilterChanged() {
//     if (this.selectedFilter !=null) {
//       console.log("selectedFilterChanged")
//       console.log(this.selectedFilter)
//       // console.log(this.savedFilterName)
//       localStorage.setItem('selectedFilter', this.selectedFilter.name);
//       console.log(localStorage.getItem('selectedFilter'))
//     }
//
//   }
//
//   loadFilter(dt: Table, filter: any) {
//     // this.selectedFilterChanged(filter.name)
//
//     this.noFilters = false;
//
//     // this.cleanFilter();
//     localStorage.setItem('state', filter.value);
//     // localStorage.setItem('savedFilterName', filter.name);
//     localStorage.setItem('showCompleted', filter.showCompleted);
//
//     this.dt.restoreState();
//     this.dt._filter();
//     this.showCompleted = filter.showCompleted
//     setTimeout(() => {
//       console.log(this.selectedFilter)
//       localStorage.setItem('selectedFilter', this.selectedFilter.name)
//     }, 100)
//
//
//   }
//
//   cleanFilter() {
//     // @ts-ignore
//     // localStorage.setItem('savedFilterName', '');
//     // @ts-ignore
//
//     this.dt.clear();
//     this.dt.reset();
//     this.dt.clearState();
//     this.selectedFilter = null;
//     // this.selectedFilter.name = ''
//     // @ts-ignore
//     localStorage.setItem('selectedFilter', '')
//     // this.selectedFilterChanged()
//     // this.savedFilter = null;
//     this.filtersValues = null;
//     this.showStartedBy = false;
//     this.showAssigned = false;
//     this.showResponsible = false;
//     this.showCompleted = false;
//     // localStorage.setItem('savedFilterName', null);
//
//   }
//
//   deleteFilter(dt: Table, id: any, name: string, event: MouseEvent) {
//     // console.log(this.savedFilterName)
//     // event.stopPropagation()
//     // this.issueManager.deleteFilterSaved(id).subscribe(res => {})
//     // this.savedFilters1 = this.savedFilters1.filter((number) => number.id !== id)
//     const dialog = this.dialogService.open(AgreeModalComponent, {  //открываем модалку подтверждения удаления файла
//       modal: true,
//       header: this.t.tr('Удалить фильтр?'),
//       data: {
//         //title: 'Удалить оборудование?',
//         id: id
//       }
//     })
//     dialog.onClose.subscribe((res) => {
//       if (res) { // User clicked OK
//         console.log('User confirmed delete filter');
//         this.issueManager.deleteFilterSaved(id).subscribe(res => {})
//
//         // if (name === this.savedFilterName) {
//         //   console.log("name == this.savedFilterName")
//         //   console.log(name)
//         //   console.log(this.savedFilterName)
//         //   this.savedFilters1 = this.savedFilters1.filter((number) => number.id !== id)
//         //   this.cleanFilter()
//         // } else {
//         //   console.log(name)
//         //   console.log(this.savedFilterName)
//         //   console.log("else")
//         //   this.savedFilters1 = this.savedFilters1.filter((number) => number.id !== id)
//         //   this.dt.restoreState();
//         //   this.dt._filter();
//         // }
//
//         // this.eqService.getEquipmentFiles(this.dialogConfig.data.id).subscribe((res) => {  //обновим поле с файлами после удаления
//         // })
//       }
//       else {
//         console.log('User canceled'); // User clicked Cancel
//       }
//     })
//   }
//
//   redDate(dueDate: any, stageDueDate: any, status: string) {
//     if (dueDate == 'Thu Jan 01 1970 03:00:00 GMT+0300 (Москва, стандартное время)') {  //почему то сравнение с new Date(null) не работает
//       return false
//     } else {
//       if (stageDueDate != 'Thu Jan 01 1970 03:00:00 GMT+0300 (Москва, стандартное время)')
//       {
//         if (((dueDate < new Date()) || dueDate < stageDueDate) && (status.includes('In Work') || status.includes('AssignedTo') || status.includes('In Rework'))) {
//           return true
//         } else
//           return false
//       }
//       else {
//         if (dueDate < new Date() && (status.includes('In Work') || status.includes('AssignedTo') || status.includes('In Rework'))) {
//           return true
//         }
//       }
//     }
//     return false
//   }
//
//   extractFilters (data: any): IFilter[] {
//     const filters: IFilter[] = [];
//     console.log(data.sortField)
//
//     for (const key in data.filters) {
//       if (data.filters[key][0].value !== null) {
//         filters.push({ field: key, value: data.filters[key][0].value });
//       }
//     }
//     return filters
//   }
//
//   // cleanFilter(id: number) {
//   //   console.log("clean filter with id = " + id)
//   // }
//
//
//   openIssue(id: number) {
//     window.open('/?taskId=' + id, '_blank');
//   }
//
//   click(filter:any) {
//     console.log(filter)
//   }
// }
//
//
