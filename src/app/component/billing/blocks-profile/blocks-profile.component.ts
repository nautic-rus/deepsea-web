import { Component, OnInit } from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {LanguageService} from "../../../domain/language.service";
import {SpecManagerService} from "../../../domain/spec-manager.service";
import _ from "underscore";
import * as XLSX from "xlsx";

@Component({
  selector: 'app-blocks-profile',
  templateUrl: './blocks-profile.component.html',
  styleUrls: ['./blocks-profile.component.css']
})
export class BlocksProfileComponent implements OnInit {

  profiles: any[] = [];
  parts: any[] = [];
  partsByBlocks: any[] = [];
  filters:  { block: any[], name: any[] } = { block: [], name: [] };
  profile: any;
  project = '';

  constructor(public ref: DynamicDialogRef, public t: LanguageService, private conf: DynamicDialogConfig, public s: SpecManagerService) {

  }

  ngOnInit(): void {
    this.project = this.conf.data[0];
    this.profile = this.conf.data[1];
    console.log(this.profile);
    this.s.hullProfiles(this.project, this.profile.mat, this.profile.KSE).then(res => {
      this.parts = _.sortBy(res, x => x.code);
      _.forEach(_.groupBy(this.parts, x => x.block), block => {
        this.partsByBlocks.push({
          block: block[0].block,
          count: block.map(x => x.weight).reduce((x, y) => x + y)
        })
      });
      this.partsByBlocks = _.sortBy(this.partsByBlocks, x => x.block);
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
    this.partsByBlocks.filter((x: any) => x != null).forEach(block => {
      data.push({
        'Block': block.block,
        'Weight': Math.round(block.count),
      })
    });
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = {Sheets: {'data': worksheet}, SheetNames: ['data']};
    worksheet['!cols'] = [{wch:15},{wch:15}];

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
