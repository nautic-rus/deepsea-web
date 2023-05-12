import { Component, OnInit } from '@angular/core';
import {Roles} from "../../../domain/interfaces/roles";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {LanguageService} from "../../../domain/language.service";
import {RoleService} from "./role.service";
import {PageService} from "./page.service";
import {Rights} from "../../../domain/interfaces/rights";
import {RightService} from "../right/right.service";
import {MessageService} from "primeng/api";

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})
export class RoleComponent implements OnInit {
  rights: Rights[] = [];
  role: Roles;
  name: any;
  checkBox = true;
  loading = false;
  constructor(private messageService: MessageService, public conf: DynamicDialogConfig, public lang: LanguageService, public ref: DynamicDialogRef, public roleService: RoleService, public rightService: RightService) { }

  ngOnInit(): void {
    this.fillRights();
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

  deleteRole() {
    this.loading = true;
    this.roleService.deleteRole(this.role.name).subscribe({
      next: res => {
        console.log(res);
        this.loading = false;
        this.ref.close(res);
        this.messageService.add({key:'admin', severity:'success', summary: this.lang.tr('Удаление роли'), detail: this.lang.tr('Роль удалена')});
      },
      error: err => {
        this.loading = false;
        console.log(err);
        this.messageService.add({key:'admin', severity:'error', summary: this.lang.tr('Удаление роли'), detail: this.lang.tr('Не удалось удалить роль')});
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
          this.messageService.add({key:'admin', severity:'success', summary: this.lang.tr('Сохранение роли'), detail: this.lang.tr('Данные роли сохранены и применены ко всем пользователям')});
        }
        else{
          this.loading = false;
          this.messageService.add({key:'admin', severity:'success', summary: this.lang.tr('Сохранение роли'), detail: this.lang.tr('Данные роли сохранены')});
        }
      },
      error: err => {
        this.loading = false;
        console.log(err);
        this.messageService.add({key:'admin', severity:'error', summary: this.lang.tr('Сохранение роли'), detail: this.lang.tr('Не удалось сохранить данные роли')});
      }
    });
  }
}
