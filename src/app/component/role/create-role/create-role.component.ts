import { Component, OnInit } from '@angular/core';
import {Roles} from "../../../domain/interfaces/roles";
import {LanguageService} from "../../../domain/language.service";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {RoleService} from "../role.service";

@Component({
  selector: 'app-create-role',
  templateUrl: './create-role.component.html',
  styleUrls: ['./create-role.component.css']
})
export class CreateRoleComponent implements OnInit {
  name: any;
  description: any;

  constructor( public lang: LanguageService, public ref: DynamicDialogRef, public roleService: RoleService) { }

  ngOnInit(): void {
  }

  close() {
    this.ref.close();
  }

  createRole() {
    let role: Roles = { name: this.name, description: this.description };
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
