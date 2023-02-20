import { Component, OnInit } from '@angular/core';
import {Users} from "../../domain/interfaces/users";
import {DynamicDialogConfig} from "primeng/dynamicdialog";
import {LanguageService} from "../../domain/language.service";
import {Projects} from "../../domain/interfaces/project";
import {ProjectService} from "../project/project.service";

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  user: Users;
  genders: any[];
  projects: Projects[];


  constructor(public conf: DynamicDialogConfig, public lang: LanguageService, public projectService: ProjectService) {
    this.genders = [
      {name: 'male'},
      {name: 'female'}
    ]
  }

  ngOnInit(): void {
    this.user = this.conf.data as Users;
    this.fillProjects();
  }

  fillProjects(): void {
    this.projectService.getProjects()
      .subscribe(projects => {
        console.log(projects);
        this.projects = projects;
      });
  }

  setBirthday(date: any) {
    Date.parse(date);
  }
}
