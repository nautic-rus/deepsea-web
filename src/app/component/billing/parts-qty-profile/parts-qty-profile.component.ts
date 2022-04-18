import { Component, OnInit } from '@angular/core';
import * as XLSX from "xlsx";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {LanguageService} from "../../../domain/language.service";
import _ from "underscore";
import {SpecManagerService} from "../../../domain/spec-manager.service";

@Component({
  selector: 'app-parts-qty-profile',
  templateUrl: './parts-qty-profile.component.html',
  styleUrls: ['./parts-qty-profile.component.css']
})
export class PartsQtyProfileComponent implements OnInit {

  profile: any;
  parts: any[] = [];
  profiles: any[] = [];
  filters:  { block: any[], name: any[] } = { block: [], name: [] };
  project = '';

  constructor(public ref: DynamicDialogRef, public t: LanguageService, private conf: DynamicDialogConfig, public s: SpecManagerService) { }

  ngOnInit(): void {
    this.project = this.conf.data[0];
    this.profile = this.conf.data[1];
    console.log(this.profile);
    this.s.hullProfiles(this.project, this.profile.mat, this.profile.KSE).then(res => {
      console.log(res);
      this.parts = _.sortBy(res, x => x.code);
      this.fillParts();
    });
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

  close() {
    this.ref.close();
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
  round(input: number, digit = 100) {
    return Math.round(input * digit) / digit;
  }
  profDecode(code: string): string{
    switch (code) {
      case 'AS': return 'LP';
      case 'FS': return 'FB';
      case 'PS': return 'PIPE';
      case 'RS': return 'RB';
      case 'MC': return 'HRB';
      case 'SR': return 'SQB';
      case 'HR': return 'SQP';
      case 'BS': return 'HP';
      default: return code;
    }
  }

}
