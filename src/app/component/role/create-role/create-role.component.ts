import { Component, OnInit } from '@angular/core';
import {Roles} from "../../../domain/interfaces/roles";
import {LanguageService} from "../../../domain/language.service";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {RoleService} from "../role.service";
import {PageService} from "../page.service";
import {Pages} from "../../../domain/interfaces/pages";

@Component({
  selector: 'app-create-role',
  templateUrl: './create-role.component.html',
  styleUrls: ['./create-role.component.css']
})
export class CreateRoleComponent implements OnInit {
  pages: Pages[] = [];
  selectedPages: string[] = [];
  name: string = "";
  description: string = "";
  visible_pages: string[] = ["-"];

  constructor( public lang: LanguageService, public ref: DynamicDialogRef, public roleService: RoleService, public pageService: PageService) { }

  ngOnInit(): void {
    this.fillPages();
  }

  close() {
    this.ref.close();
  }

  fillPages(): void {
    this.pageService.getPages()
      .subscribe(pages => {
        console.log(pages);
        this.pages = pages;
      });
  }

  createRole() {
    let role: Roles = { name: this.name, description: this.description, visible_pages: this.selectedPages };
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
