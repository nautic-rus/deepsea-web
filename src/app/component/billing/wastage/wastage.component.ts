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

  wastages: any[] = [];
  plate: any;
  project = '';

  constructor(public ref: DynamicDialogRef, public t: LanguageService, private conf: DynamicDialogConfig, public s: SpecManagerService) {

  }

  ngOnInit(): void {
    this.project = this.conf.data[0];
    this.plate = this.conf.data[1];
    this.s.hullPlatesWastage(this.project, this.plate.KPL).then(res => {
      this.wastages = _.sortBy(res, x => x.KPL);
      console.log(this.wastages);
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
  exportXls() {
    let fileName = 'export_' + this.generateId(8) + '.xlsx';
    let data: any[] = [];
    this.wastages.filter((x: any) => x != null).forEach(wastage => {
      data.push({
        'KPL': wastage.KPL.split('x')[0],
        'T x W x L': wastage.THICKNESS.split('x')[0] + 'x' + wastage.SWIDTH.split('x')[0] + 'x' +wastage.SLENGTH.split('x')[0],
        'From': wastage.PARENTNESTID,
        'Weight': Math.round(wastage.WEIGHT),
      })
    });
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = {Sheets: {'data': worksheet}, SheetNames: ['data']};
    worksheet['!cols'] = [{wch:13},{wch:13},{wch:13},{wch:13},{wch:13}];

    XLSX.writeFile(workbook, fileName);
  }
}
