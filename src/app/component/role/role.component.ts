import { Component, OnInit } from '@angular/core';
import {Roles} from "../../domain/interfaces/roles";
import {DynamicDialogConfig} from "primeng/dynamicdialog";
import {LanguageService} from "../../domain/language.service";

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})
export class RoleComponent implements OnInit {
  role: Roles;

  constructor(public conf: DynamicDialogConfig, public lang: LanguageService) { }

  ngOnInit(): void {
    this.role = this.conf.data as Roles;
  }
}
