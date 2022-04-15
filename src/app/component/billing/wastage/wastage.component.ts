import { Component, OnInit } from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {LanguageService} from "../../../domain/language.service";
import {SpecManagerService} from "../../../domain/spec-manager.service";
import _ from "underscore";
import * as XLSX from "xlsx";

@Component({
  selector: 'app-wastage',
  templateUrl: './wastage.component.html',
  styleUrls: ['./wastage.component.css']
})
export class WastageComponent implements OnInit {

  wastage: any[] = [];
  plate: any;
  project = '';

  constructor(public ref: DynamicDialogRef, public t: LanguageService, private conf: DynamicDialogConfig, public s: SpecManagerService) {

  }

  ngOnInit(): void {
    this.project = this.conf.data[0];
    this.plate = this.conf.data[1];
    this.s.hullPlatesWastage(this.project, this.plate.KPL).then(res => {
      this.wastage = _.sortBy(res, x => x.KPL);
      console.log(this.wastage);
    });
  }
  close() {
    this.ref.close();
  }
  round(input: number, digit = 100) {
    return Math.round(input * digit) / digit;
  }
  generateId(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() *
        charactersLength));
    }
    return result;
  }
}
