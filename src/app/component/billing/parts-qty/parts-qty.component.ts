import { Component, OnInit } from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {Issue} from "../../../domain/classes/issue";
import {LanguageService} from "../../../domain/language.service";
import {SpecManagerService} from "../../../domain/spec-manager.service";
import _ from "underscore";
import * as XLSX from "xlsx";

@Component({
  selector: 'app-parts-qty',
  templateUrl: './parts-qty.component.html',
  styleUrls: ['./parts-qty.component.css']
})
export class PartsQtyComponent implements OnInit {
  plates: any[] = [];
  parts: any[] = [];
  filters:  { block: any[], name: any[] } = { block: [], name: [] };
  plate: any;
  project = '';

  constructor(public ref: DynamicDialogRef, public t: LanguageService, private conf: DynamicDialogConfig, public s: SpecManagerService) {

  }

  ngOnInit(): void {
    this.project = this.conf.data[0];
    this.plate = this.conf.data[1];
    this.s.hullPlates(this.project, this.plate.mat, this.plate.scantling.split('x')[0]).then(res => {
      this.parts = _.sortBy(res, x => x.code);
      this.fillParts();
    });
  }
  close() {
    this.ref.close();
  }
  getFilters(issues: any[], field: string): any[] {
    let res: any[] = [];
    let uniq = _.uniq(issues, x => x[field]);
    uniq.forEach(x => {
      res.push({
        label: x[field],
        value: x[field]
      })
    });
    return _.sortBy(res, x => x.label);
  }
  fillParts() {
    this.filters.block = this.getFilters(this.parts, 'block');
    this.filters.name = this.getFilters(this.parts, 'name');
  };
  round(input: number, digit = 100) {
    return Math.round(input * digit) / digit;
  }
  exportXls() {
    let fileName = 'export_' + this.generateId(8) + '.xlsx';
    let data: any[] = [];
    this.parts.filter((x: any) => x != null).forEach(part => {
      data.push({
        'Number': part.code.split('x')[0],
        'Block': part.block.split('x')[0],
        'Name': part.name,
        'Description': part.description,
        'Weight': Math.round(part.weight),
      })
    });
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = {Sheets: {'data': worksheet}, SheetNames: ['data']};
    worksheet['!cols'] = [{wch:13},{wch:13},{wch:13},{wch:13},{wch:13}];

    XLSX.writeFile(workbook, fileName);
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

