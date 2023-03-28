import { Component, OnInit } from '@angular/core';
import {Roles} from "../../../../domain/interfaces/roles";
import {LanguageService} from "../../../../domain/language.service";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {RoleService} from "../role.service";
import {PageService} from "../page.service";
import {Pages} from "../../../../domain/interfaces/pages";
import {Rights} from "../../../../domain/interfaces/rights";
import {RightService} from "../../right/right.service";

@Component({
  selector: 'app-create-role',
  templateUrl: './create-role.component.html',
  styleUrls: ['./create-role.component.css']
})
export class CreateRoleComponent implements OnInit {
  rights: Rights[] = [];
  selectedRights: string[] = [];
  name: string = "";
  description: string = "";

  constructor( public lang: LanguageService, public ref: DynamicDialogRef, public roleService: RoleService, public rightService: RightService) { }

  ngOnInit(): void {
    this.fillRights();
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

  createRole() {
    let role: Roles = { name: this.name, description: this.description, rights: this.selectedRights};
    this.roleService.startRole(role).subscribe({
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
