import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {Table} from "primeng/table";
import {IssueManagerService} from "../../domain/issue-manager.service";
import {MessageService} from "primeng/api";
import {DialogService} from "primeng/dynamicdialog";
import {AuthManagerService} from "../../domain/auth-manager.service";
import _ from "underscore";
import {LanguageService} from "../../domain/language.service";

export interface IIssueTechSupport {
  id: number;
  project: string;
  department: string;
  started_by: string;
  issue_type: string;
  issue_name: string;
  assigned_to: string;
  responsible: string;
  active_action: string;
  plan_hours: number;
  plan_hours_locked: number;
  modification_description: string;
  reason_of_changes: string;
  actual_man_hours: number;
  reason_of_changes_title: string;
}

@Component({
  selector: 'app-technical-support',
  templateUrl: './technical-support.component.html',
  styleUrls: ['./technical-support.component.css']
})
export class TechnicalSupportComponent implements OnInit {

  cols: any[];
  projects: any[] = [];
  selectedProjects: string[] | null = ['NR002'];
  selectedProjectsLength: number | undefined = 0;
  issuesSrc: IIssueTechSupport[] = [];
  issues : IIssueTechSupport[] = [];

  // _selectedColumns: any[];


  // @Input() get selectedColumns(): any[] {
  //   return this._selectedColumns;
  // }

  constructor(public issueManager: IssueManagerService, private messageService: MessageService, private dialogService: DialogService, public auth: AuthManagerService, public t: LanguageService) {
  }

  @ViewChild('tableTechSupportIssues') table: Table;

  ngOnInit(): void {
    this.issueManager.getIssuesTechSupport().subscribe(res => {
      this.issuesSrc = res;
      this.issues = this.issuesSrc.filter(x => this.selectedProjects?.includes(x.project));
      console.log(this.issuesSrc);
    })

    this.cols = [
      {field: 'id', header: 'Id', sort: true, width: '60px', visible: true},
      {field: 'project', header: 'Проект', sort: true, width: '140px', visible: true},
      {field: 'issue_name', header: 'Название', sort: true, width: '250px', visible: true},
      {field: 'issue_type', header: 'Тип', sort: true, width: '150px', visible: true},
      {field: 'department', header: 'Отдел', sort: true, width: '150px', visible: true},
      {field: 'responsible', header: 'Ответсвенный', sort: true, width: '150px', visible: true},
      {field: 'started_by', header: 'Автор', sort: true, width: '150px', visible: true},
      {field: 'plan_hours', header: 'Плановая трудоемкость', sort: true, width: '150px', visible: true},
      {field: 'plan_hours_locked', header: 'Трудозатраты', sort: true, width: '150px', visible: true},
    ];


    this.projects = this.auth.getUser().visible_projects;
    console.log(this.projects)



  }

  projectChanged(e: any ) {
    this.selectedProjects = e.value;

    if (this.selectedProjects && this.selectedProjects.length > 0) {
      this.issues = this.issuesSrc.filter(x => this.selectedProjects?.includes(x.project));
    } else {
      this.issues = [];
    }
    this.selectedProjectsLength = this.selectedProjects?.length;

    console.log('Фильтрованные задачи:', this.issues);
  }
}
