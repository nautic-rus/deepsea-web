import { Component, OnInit } from '@angular/core';
import {Roles} from "../../../domain/interfaces/roles";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {LanguageService} from "../../../domain/language.service";
import {RoleService} from "./role.service";
import {PageService} from "./page.service";
import {Rights} from "../../../domain/interfaces/rights";
import {RightService} from "../right/right.service";

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
  constructor(public conf: DynamicDialogConfig, public lang: LanguageService, public ref: DynamicDialogRef, public roleService: RoleService, public rightService: RightService) { }

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
    this.roleService.deleteRole(this.role.name).subscribe({
      next: res => {
        console.log(res);
        this.ref.close(res);
      },
      error: err => {
        console.log(err);
        this.ref.close(err);
      }
    });
  }


  saveRole() {
    this.roleService.saveRole(this.role, this.name).subscribe({
      next: res => {
        console.log(res);
        if (this.checkBox) {
          this.roleService.setRoleForAll(this.role.name);
          this.ref.close(res);
        }
        else{
          this.ref.close(res);
        }
      },
      error: err => {
        console.log(err);
        this.ref.close(err);
      }
    });
  }
}
