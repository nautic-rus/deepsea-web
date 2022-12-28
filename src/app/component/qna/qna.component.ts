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
import {Router} from "@angular/router";
import {LanguageService} from "../../domain/language.service";

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
  department = '';
  questions: Issue[] = [];
  filters:  { status: any[],  author: any[], department: any[], priority: any[] } = { status: [], author: [], department: [], priority: [] };
  constructor(public issueManager: IssueManagerService, public auth: AuthManagerService, public issueManagerService: IssueManagerService, private dialogService: DialogService, private router: Router, public t: LanguageService) { }

  ngOnInit(): void {
    this.users = this.auth.users.filter(x => x.visibility.includes('a') || x.visibility.includes('c'));
    this.fillQNA();
  }
  fillQNA(){
    this.issueManagerService.getQuestions().then(res => {
      this.questions = res;
      this.questions.forEach(x => x.project = x.project == '' ? '-' : x.project);
      this.questions.forEach(x => x.department = x.department == '' ? '-' : x.department);
      this.projects = _.sortBy(_.uniq(res.map(x => x.project)), x => x).map(x => new LV(x));
      this.departments = _.sortBy(_.uniq(res.map(x => x.department)), x => x).map(x => new LV(x));
      this.filters.status = _.sortBy(_.uniq(res.map(x => x.status)), x => x).map(x => new LV(x));
      this.filters.author = _.sortBy(_.uniq(res.map(x => x.started_by)), x => x).map(x => new LV(this.auth.getUserName(x), x));
      this.filters.priority = _.sortBy(_.uniq(res.map(x => x.priority)), x => x).map(x => new LV(this.auth.getUserName(x), x));
    });
  }
  getProjectName(project: any) {
    let res = project.pdsp;
    if (project.rkd != ''){
      res += ' (' + project.rkd + ')';
    }
    return res;
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
    window.open('/qna-details?id=' + id, '_blank');
  }
  questionStatus(input: string, styled = true): string {
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
}
