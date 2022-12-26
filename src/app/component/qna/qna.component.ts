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
  filters:  { status: any[],  revision: any[], department: any[] } = { status: [], revision: [], department: [] };
  constructor(public auth: AuthManagerService, public issueManagerService: IssueManagerService, private dialogService: DialogService, private router: Router, public t: LanguageService) { }

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
    });
  }
  getProjectName(project: any) {
    let res = project.pdsp;
    if (project.rkd != ''){
      res += ' (' + project.rkd + ')';
    }
    return res;
  }

  createQuestion() {
    this.dialogService.open(CreateQuestionComponent, {
      showHeader: false,
      modal: true,
    }).onClose.subscribe(res => {
      this.fillQNA();
    });
  }

  openQuestion(id: number) {
    window.open('/qna-details?id=' + id, '_blank');
  }
}
