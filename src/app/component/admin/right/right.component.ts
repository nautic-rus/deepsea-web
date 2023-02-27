import { Component, OnInit } from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {LanguageService} from "../../../domain/language.service";
import {RightService} from "./right.service";
import {Rights} from "../../../domain/interfaces/rights";
import {Roles} from "../../../domain/interfaces/roles";

@Component({
  selector: 'app-right',
  templateUrl: './right.component.html',
  styleUrls: ['./right.component.css']
})
export class RightComponent implements OnInit {
  right: Rights;
  name: string = '';

  constructor(public conf: DynamicDialogConfig, public lang: LanguageService, public ref: DynamicDialogRef, public rightService: RightService) { }

  ngOnInit(): void {
    this.right = this.conf.data as Rights;
    this.name = this.right.name;
  }
  deleteRight() {
    this.rightService.deleteRight(this.right.name).subscribe({
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
  saveRight() {
    this.rightService.saveRight(this.right, this.name).subscribe({
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
