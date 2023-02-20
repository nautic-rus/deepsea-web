import { Component, OnInit } from '@angular/core';
import {Roles} from "../../domain/interfaces/roles";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {LanguageService} from "../../domain/language.service";
import {RoleService} from "./role.service";

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})
export class RoleComponent implements OnInit {
  role: Roles;
  name: any;

  constructor(public conf: DynamicDialogConfig, public lang: LanguageService, public ref: DynamicDialogRef, public roleService: RoleService) { }

  ngOnInit(): void {
    this.role = this.conf.data as Roles;
    this.name = this.role.name;
  }

  close() {
    this.ref.close();
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
        this.ref.close(res);
      },
      error: err => {
        console.log(err);
        this.ref.close(err);
      }
    });
  }
}
