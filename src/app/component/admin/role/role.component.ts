import { Component, OnInit } from '@angular/core';
import {Roles} from "../../../domain/interfaces/roles";
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {LanguageService} from "../../../domain/language.service";
import {RoleService} from "./role.service";
import {PageService} from "./page.service";
import {Rights} from "../../../domain/interfaces/rights";
import {RightService} from "../right/right.service";
import {MessageService} from "primeng/api";
import {Page} from "../../../domain/interfaces/page";
import {DeleteProjectComponent} from "../project/delete-project/delete-project.component";
import {DeleteRoleComponent} from "./delete-role/delete-role.component";

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})
export class RoleComponent implements OnInit {
  rights: Rights[] = [];
  pages: Page[] = []
  role: Roles;
  name: any;
  checkBox = false;
  loading = false;
  constructor(private dialogService: DialogService, private pageService: PageService, private messageService: MessageService, public conf: DynamicDialogConfig, public t: LanguageService, public ref: DynamicDialogRef, public roleService: RoleService, public rightService: RightService) { }

  ngOnInit(): void {
    this.fillRights();
    this.fillPages();
    this.role = this.conf.data as Roles;
    this.name = this.role.name;
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

  deleteRole() {
    this.loading = true;
    this.dialogService.open(DeleteRoleComponent, {
      showHeader: false,
      modal: true,
      data: this.role.name
    }).onClose.subscribe(res => {
      if (res == 'success'){
        this.ref.close(res);
        this.messageService.add({key:'admin', severity:'success', summary: this.t.tr('Удаление роли'), detail: this.t.tr('Роль удалена')});
        this.loading = false;
      } else {
        this.loading = false;
        this.messageService.add({key:'admin', severity:'error', summary: this.t.tr('Удаление роли'), detail: this.t.tr('Не удалось удалить роль')});
      }
    });
  }


  saveRole() {
    this.loading = true;
    this.roleService.saveRole(this.role, this.name).subscribe({
      next: res => {
        console.log(res);
        if (this.checkBox) {
          this.loading = false;
          this.roleService.setRoleForAll(this.role.name);
          this.messageService.add({key:'admin', severity:'success', summary: this.t.tr('Сохранение роли'), detail: this.t.tr('Данные роли сохранены и применены ко всем пользователям')});
        }
        else{
          this.loading = false;
          this.messageService.add({key:'admin', severity:'success', summary: this.t.tr('Сохранение роли'), detail: this.t.tr('Данные роли сохранены')});
        }
      },
      error: err => {
        this.loading = false;
        console.log(err);
        this.messageService.add({key:'admin', severity:'error', summary: this.t.tr('Сохранение роли'), detail: this.t.tr('Не удалось сохранить данные роли')});
      }
    });
  }
}
