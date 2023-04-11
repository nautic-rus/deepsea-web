import { Component, OnInit } from '@angular/core';
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
  questions: Issue[] = [];
  showCompleted: boolean = false;
  filters:  { status: any[],  author: any[], department: any[], priority: any[] } = { status: [], author: [], department: [], priority: [] };
  constructor(private route: ActivatedRoute, public issueManager: IssueManagerService, public auth: AuthManagerService, public issueManagerService: IssueManagerService, private dialogService: DialogService, private router: Router, public t: LanguageService) { }

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
          this.fillQNA();
          this.router.navigate([], {queryParams: {taskId: null}});
        });
      }
    });
  }

  fillQNA(){
    this.issueManagerService.getIssueProjects().then(projects => {
      this.projectDefs = projects;
      this.issueManagerService.getQuestions().then(res => {

        this.questionsSrc = res;
        this.questions = res;

        this.projects = _.sortBy(_.uniq(res.map(x => x.project)), x => x).map(x => new LV(this.getProject(x), x));
        this.departments = _.sortBy(_.uniq(res.map(x => x.department)), x => x).map(x => new LV(x));

        this.filters.status = _.sortBy(_.uniq(res.map(x => x.status)), x => x).map(x => new LV(x));
        this.filters.author = _.sortBy(_.uniq(res.map(x => x.started_by)), x => x).map(x => new LV(this.auth.getUserName(x), x));
        this.filters.priority = _.sortBy(_.uniq(res.map(x => x.priority)), x => x).map(x => new LV(this.auth.getUserName(x), x));

        this.applyFilters();
      });
    });

  }
  getProjectName(project: any){
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
    return '<div class="df"><img src="' + this.auth.getUserAvatar(login) + '" width="32px" height="32px" style="border-radius: 16px"/><div class="ml-1 cy">' + this.auth.getUserName(login) + '</div></div>';
  }
  createQuestion() {
    this.dialogService.open(CreateQuestionComponent, {
      showHeader: false,
      modal: true,
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
    this.questions = this.questionsSrc;
    this.questions = this.questions.filter(x => x.project == this.project || this.project == null || this.project == '' || this.project == '-');
    this.questions = this.questions.filter(x => x.department == this.department || this.department == null || this.department == '' || this.department == '-');
    this.questions = this.questions.filter(x => x.status != 'Closed' || this.showCompleted);
  }
  changedProject() {
    this.applyFilters();
  }
  changedDepartment() {
    this.applyFilters();
  }

  clearFilters() {
    this.project = '';
    this.department = '';
    this.applyFilters();
  }

  switchCompleted(){
    this.showCompleted = !this.showCompleted;
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
  }

}
