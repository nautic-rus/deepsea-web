import { Component, OnInit } from '@angular/core';
import {LanguageService} from "../../../../domain/language.service";
import {DynamicDialogRef} from "primeng/dynamicdialog";
import {RoleService} from "../../role/role.service";
import {PageService} from "../../role/page.service";
import {RightService} from "../right.service";
import {Roles} from "../../../../domain/interfaces/roles";
import {Rights} from "../../../../domain/interfaces/rights";

@Component({
  selector: 'app-create-right',
  templateUrl: './create-right.component.html',
  styleUrls: ['./create-right.component.css']
})
export class CreateRightComponent implements OnInit {
  name: string = '';

  constructor( public lang: LanguageService, public ref: DynamicDialogRef, public rightService: RightService) { }

  ngOnInit(): void {
  }

  close() {
    this.ref.close();
  }

  createRole() {
    let right: Rights = { name: this.name};
    this.rightService.startRight(right).subscribe({
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
