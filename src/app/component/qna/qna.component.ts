import {Component, OnInit, ViewChild} from '@angular/core';
import {AuthManagerService} from "../../domain/auth-manager.service";
import {User} from "../../domain/classes/user";
import {IssueManagerService} from "../../domain/issue-manager.service";
import {AssignNewRevisionComponent} from "../documents/hull-esp/assign-new-revision/assign-new-revision.component";
import {DialogService} from "primeng/dynamicdialog";
import {CreateQuestionComponent} from "./create-question/create-question.component";
import {Issue} from "../../domain/classes/issue";
import _ from "underscore";
import {LV} from "../../domain/classes/lv";
import {ActivatedRoute, Router} from "@angular/router";
import {LanguageService} from "../../domain/language.service";
import {AssignToResponsibleComponent} from "../task/assign-to-responsible/assign-to-responsible.component";
import {AssignQuestionComponent} from "./assign-question/assign-question.component";
import {TaskComponent} from "../task/task.component";
import {Table} from "primeng/table";
import {formatCurrency} from "@angular/common";
import * as XLSX from "xlsx";


@Component({
  selector: 'app-qna',
  templateUrl: './qna.component.html',
  styleUrls: ['./qna.component.css']
})
export class QnaComponent implements OnInit {

  users: User[] = [];
  projects: any[] = [];
  departments: any[] = [];
  project = '';
  projectDefs: any[] = [];
  department = '';
  questionsSrc: Issue[] = [];
  questionsStatus: Issue[] = [];
  questions: Issue[] = [];
  showCompleted: boolean = false;
  showNew: boolean = false;
  showWork: boolean = false;
  showResolve: boolean = false;
  showClose: boolean = false;
  showReject: boolean = false;
  filters:  { status: any[], author: any[], department: any[], priority: any[], responsible: any[], assigned_to: any[], project: any[] } = { status: [], author: [], department: [], priority: [], responsible: [], assigned_to: [], project: [] };

  constructor(private route: ActivatedRoute, public issueManager: IssueManagerService, public auth: AuthManagerService, public issueManagerService: IssueManagerService, private dialogService: DialogService, private router: Router, public t: LanguageService) { }


  @ViewChild('table') table: Table;

  ngOnInit(): void {
    this.users = this.auth.users.filter(x => x.visibility.includes('a') || x.visibility.includes('c'));
    this.fillQNA();
    this.route.queryParams.subscribe(params => {
      let taskId = params.taskId != null ? params.taskId : '';
      if (taskId != '') {
        this.viewTask(taskId, '');
      }
    });
  }
  viewTask(id: number, type: string) {
    this.issueManager.getIssueDetails(id).then(res => {
      if (res.id != null) {
        this.dialogService.open(TaskComponent, {
          showHeader: false,
          modal: true,
          data: res
        }).onClose.subscribe(res => {
          this.issueManagerService.getQuestions().then(resIssues => {
            let find = resIssues.find(x => x.id == id);
            if (find != null){
              let openedQuestion = this.questions.find(x => x.id == id);
              if (openedQuestion != null){
                this.questions[this.questions.indexOf(openedQuestion)] = find;
              }
            }
          });
          this.router.navigate([], {queryParams: {taskId: null}});
        });
      }
    });
  }

  fillQNA(){
    this.issueManagerService.getIssueProjects().then(projects => {
      this.projectDefs = projects;
      this.issueManagerService.getQuestions().then(res => {
        console.log(res)
        if (this.auth.getUser().groups.includes('MR')) {
          res = res.filter(issue => {
            // issue.department === 'Electric';
            const author = this.auth.users.find(user => user.login === issue.started_by);  //проверяем что только те задачи, где автор тоже из роли EMO_PELLA

            return  author?.groups?.includes('MR') && issue.department === 'Electric'
          });
        }

        this.questionsSrc = _.sortBy(res, x => x.started_date).reverse();
        this.questions = _.sortBy(res, x => x.started_date).reverse();

        const excludedProjectNames = ['01701-LEV', '01701-ORION', '03095-ANDROMEDA'];  //эти проекты исключаются из списка проектов на вывод (список)

        this.projects = _.sortBy(_.uniq(res.map(x => x.project)), x => x).filter(x => this.auth.getUser().visible_projects.includes(x) && !excludedProjectNames.includes(x)).map(x => new LV(this.getProject(x), x));
        //this.projects = _.sortBy(_.uniq(projects.map(x => x.project.name)), x => x).filter(x => this.auth.getUser().visible_projects.includes(x)).map(x => new LV(this.getProject(x), x));
        this.departments = _.sortBy(_.uniq(res.map(x => x.department)), x => x).map(x => new LV(x));
        if (this.auth.getUser().groups.includes('MR')) {
          this.departments = this.departments.filter(dep => dep.value === 'Electric')
        }
        this.filters.status = _.sortBy(_.uniq(res.map(x => x.status)), x => x).map(x => new LV(x));
        this.filters.project = _.sortBy(_.uniq(res.map(x => x.project)), x => x).map(x => new LV(x));
        this.filters.department = _.sortBy(_.uniq(res.map(x => x.department)), x => x).map(x => new LV(x));  //это фильтр на фильтр в шапке таблицы
        if (this.auth.getUser().groups.includes('MR')) {
          this.filters.department = this.filters.department.filter(dep => dep.value === 'Electric')
        }

        this.filters.author = _.sortBy(_.uniq(res.map(x => x.started_by)), x => x).map(x => new LV(this.auth.getUserName(x), x));
        this.filters.responsible = _.sortBy(_.uniq(res.map(x => x.responsible)), x => x).map(x => new LV(this.auth.getUserName(x), x));
        this.filters.assigned_to = _.sortBy(_.uniq(res.map(x => x.assigned_to)), x => x).map(x => new LV(this.auth.getUserName(x), x));
        this.filters.priority = _.sortBy(_.uniq(res.map(x => x.priority)), x => x).map(x => new LV(this.auth.getUserName(x), x));

        this.questions.forEach(q => {
          q.started_date_as_date = new Date(q.started_date);
          q.due_date = new Date(q.due_date);
        })


        this.applyFilters();
      });
    });

  }
  getProjectName(project: any){
    return project.factory;
    let res = project.pdsp;
    if (res == ''){
      res = project.name;
    }
    if (project.rkd != ''){
      res += ' (' + project.rkd + ')';
    }
    return res;
  }
  getProject(project: string){
    let find = this.projectDefs.find(x => x.name == project);
    if (find != null){
      return this.getProjectName(find);
    }
    else{
      return project;
    }
  }
  getUserName(login: string){
    if (login == '' || login == 'nautic-rus') {
      return '';
    } else {
      return '<div class="df"><img src="' + this.auth.getUserAvatar(login) + '" width="32px" height="32px" style="border-radius: 16px; border: none"/><div class="ml-1 cy">' + this.auth.getUserName(login) + '</div></div>';
    }
  }
  createQuestion() {
    let projects = _.sortBy(_.uniq(this.projectDefs.map(x => x.name)), x => x).filter(x => this.auth.getUser().visible_projects.includes(x));
    this.dialogService.open(CreateQuestionComponent, {
      showHeader: false,
      modal: true,
      data: projects
    }).onClose.subscribe(res => {
      this.fillQNA();
    });
  }
  getDate(dateLong: number): string{
    if (dateLong == 0){
      return '--/--/----';
    }
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
  }
  openQuestion(id: number) {
    this.viewTask(id, '');
    //window.open('/qna-details?id=' + id, '_blank');
  }
  questionStatus(input: string, styled = true): string {
    return this.issueManagerService.localeStatus(input, true);
    switch (this.t.language) {
      case 'ru':{
        switch (input) {
          case 'В работе': return styled ? '<span style="color: #256029; background-color: #c8e6c9; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">В работе</span>' : 'В работе';
          case 'Новый': return styled ? '<span style="color: #23547b; background-color: #b3e5fc; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Новый</span>' : 'Новый';
          case 'Закрыт': return styled ? '<span style="color: #805b36; background-color: #ffd8b2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Закрыто</span>' : 'Закрыто';
          default: return input;
        }
      }
      default:{
        switch (input) {
          case 'В работе': return styled ? '<span style="color: #256029; background-color: #c8e6c9; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">In Work</span>' : 'In Work';
          case 'Новый': return styled ? '<span style="color: #23547b; background-color: #b3e5fc; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">New</span>' : 'New';
          case 'Закрыт': return styled ? '<span style="color: #805b36; background-color: #ffd8b2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Closed</span>' : 'Closed';
          default: return input;
        }
      }
    }
  }

  assignQuestion(q: Issue) {
    this.dialogService.open(AssignQuestionComponent, {
      showHeader: false,
      modal: true,
      data: q
    }).onClose.subscribe(res => {
      this.fillQNA();
    });
  }
  applyFilters(){
    this.questions = this.questionsSrc.filter(x => this.projects.map(x => x.label).includes(this.getProject(x.project)) || x.project == '' || x.project == '-');
    this.questionsStatus = [...this.questionsSrc];
    this.questions = this.questions.filter(x => x.project == this.project || this.project == null || this.project == '' || this.project == '-');
    this.questions = this.questions.filter(x => x.department == this.department || this.department == null || this.department == '' || this.department == '-');
    //this.questions = this.questions.filter(x => !x.closing_status.includes(x.status) || this.showCompleted);
    this.questions = this.questions.filter(x => x.status == 'New' && this.showNew || !this.showNew);
    this.questions = this.questions.filter(x => x.status == 'Rejected' && this.showReject || !this.showReject);
    this.questions = this.questions.filter(x => (x.status == 'AssignedTo' || x.status == 'In Work' || x.status == 'In Rework' || x.status == 'Assign responsible' || x.status == 'Paused') && this.showWork || !this.showWork);
    this.questions = this.questions.filter(x => x.status == 'Resolved' && this.showResolve || !this.showResolve);
    this.questions = this.questions.filter(x => !x.closing_status.includes(x.status) && !this.showClose || x.closing_status.includes(x.status) && this.showClose);
  }
  changedProject() {
    this.applyFilters();
  }
  changedDepartment() {
    this.applyFilters();
  }

  clearFilters() {
    this.resetStatusFilters();
    this.project = '';
    this.department = '';
    this.applyFilters();
  }

  switchCompleted(){
    this.showCompleted = !this.showCompleted;
    this.applyFilters();
  }
  switchNew(){
    this.showReject = false;
    this.showWork = false;
    this.showResolve = false;
    this.showClose = false;
    this.showNew = !this.showNew;
    this.applyFilters();
  }
  switchWork(){
    this.showReject = false;
    this.showNew = false;
    this.showResolve = false;
    this.showClose = false;
    this.showWork = !this.showWork;
    this.applyFilters();
  }
  switchResolve(){
    this.showReject = false;
    this.showNew = false;
    this.showWork = false;
    this.showClose = false;
    this.showResolve = !this.showResolve;
    this.applyFilters();
  }
  switchClose(){
    this.showReject = false;
    this.showNew = false;
    this.showWork = false;
    this.showResolve = false;
    this.showClose = !this.showClose;
    this.applyFilters();
  }
  switchReject(){
    this.showNew = false;
    this.showWork = false;
    this.showResolve = false;
    this.showClose = false;
    this.showReject = !this.showReject;
    this.applyFilters();
  }
  localeDepartment(department: string): any {
    if (this.t.language == 'ru'){
      switch (department) {
        case 'Hull': return 'Корпусный';
        case 'System': return 'Системный';
        case 'Electric': return 'Электротехнический';
        case 'Accommodation': return 'Достройки';
        case 'Devices': return 'Устройств';
        default: return department;
      }
    }
    else{
      switch (department) {
        case 'Hull': return 'Hull';
        case 'System': return 'System';
        case 'Electric': return 'Electric';
        case 'Accommodation': return 'Accommodation';
        case 'Devices': return 'Devices';
        default: return department;
      }
    }
  }
  getRecommendDate(dateLong: any) {
    let date = new Date(dateLong);
    return date.setDate(date.getDate() +3);
  }

  statusesCount(status: string) {
    return this.questionsStatus.filter(x => x.status == status).length;
    //return this.questionsSrc.filter(x => x.status == status).length;
  }
  resetStatusFilters(){
    this.showNew = false;
    this.showWork = false;
    this.showResolve = false;
    this.showClose = false;
  }
  getIssuesDueDateLength() {
    let ques = this.questionsSrc.filter(x => x.status == 'AssignedTo' || x.status == 'In Work' || x.status == 'In Rework' || x.status == 'Assign responsible' || x.status == 'Paused')
    return ques.filter(x => x.due_date.getTime() == 0).length;
  }

  getDateOnly(dateLong: number): string {
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
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

  exportXls() {
    let fileName = 'export_' + this.generateId(8) + '.xlsx';
    let questionListForImport: Issue[] = [];
    if (this.table.filteredValue!) {
      questionListForImport = this.table.filteredValue;
    } else {
      questionListForImport = this.questions;
    }
    let data: any[] = [];
    let cols = ['id', 'project', 'department','status','doc_number','name','started_by','responsible','assigned_to','started_date_as_date','due_date','priority', 'actual_man_hours', 'plan_hours'];
    let colsHeaders = ['Id', 'Project', 'Department','Status','Document','Topic','Author','Resp.','Assign to','Date created','Due date','Priority', 'Actual man-hours', 'Plan man-hours'];
    data.push(colsHeaders);
    questionListForImport.forEach(issue => {
      let newIssue: Issue = JSON.parse(JSON.stringify(issue));
      let rowData: any[] = [];
      let findSrc = this.questionsSrc.find(x => x.id == newIssue.id);
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
}
