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
      console.log(res);
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

        this.questionsSrc = _.sortBy(res, x => x.started_date).reverse();
        this.questions = _.sortBy(res, x => x.started_date).reverse();

        this.projects = _.sortBy(_.uniq(res.map(x => x.project)), x => x).filter(x => this.auth.getUser().visible_projects.includes(x)).map(x => new LV(this.getProject(x), x));
        //this.projects = _.sortBy(_.uniq(projects.map(x => x.project.name)), x => x).filter(x => this.auth.getUser().visible_projects.includes(x)).map(x => new LV(this.getProject(x), x));
        this.departments = _.sortBy(_.uniq(res.map(x => x.department)), x => x).map(x => new LV(x));
        this.filters.status = _.sortBy(_.uniq(res.map(x => x.status)), x => x).map(x => new LV(x));
        this.filters.project = _.sortBy(_.uniq(res.map(x => x.project)), x => x).map(x => new LV(x));
        this.filters.department = _.sortBy(_.uniq(res.map(x => x.department)), x => x).map(x => new LV(x));
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
}
