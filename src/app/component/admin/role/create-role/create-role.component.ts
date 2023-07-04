import { Component, OnInit } from '@angular/core';
import {Roles} from "../../../../domain/interfaces/roles";
import {LanguageService} from "../../../../domain/language.service";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {RoleService} from "../role.service";
import {PageService} from "../page.service";
import {Pages} from "../../../../domain/interfaces/pages";
import {Rights} from "../../../../domain/interfaces/rights";
import {RightService} from "../../right/right.service";
import {MessageService} from "primeng/api";
import {Page} from "../../../../domain/interfaces/page";

@Component({
  selector: 'app-create-role',
  templateUrl: './create-role.component.html',
  styleUrls: ['./create-role.component.css']
})
export class CreateRoleComponent implements OnInit {
  rights: Rights[] = [];
  pages: Page[] = []
  selectedRights: string[] = [];
  selectedPages: string[] = [];
  name: string = "";
  description: string = "";
  loading = false;

  constructor(private pageService: PageService, private messageService: MessageService, public lang: LanguageService, public ref: DynamicDialogRef, public roleService: RoleService, public rightService: RightService) { }

  ngOnInit(): void {
    this.fillRights();
    this.fillPages();
  }

  close() {
    this.ref.close();
  }

  fillRights(): void {
    this.rightService.getRights()
      .subscribe(rights => {
        console.log(rights);
        this.rights = rights;
      });
  }

  fillPages(): void {
    this.pageService.getPages()
      .subscribe(pages => {
        console.log(pages);
        this.pages = pages;
      })
  }

  createRole() {
    this.loading = true;
    let role: Roles = { name: this.name, description: this.description, rights: this.selectedRights, pages: this.selectedPages};
    this.roleService.startRole(role).subscribe({
      next: res => {
        this.loading = false;
        console.log(res);
        this.messageService.add({key:'admin', severity:'success', summary: this.lang.tr('Создание роли'), detail: this.lang.tr('Роль создана')});
      },
      error: err => {
        this.loading = false;
        console.log(err);
        this.messageService.add({key:'admin', severity:'error', summary: this.lang.tr('Создание роли'), detail: this.lang.tr('Не удалось создать роль')});
      }
    });
  }

  isRoleDisabled() {
    return this.name == '' || this.description == '';
  }
}
