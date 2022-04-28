import { Component, OnInit } from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {LanguageService} from "../../../domain/language.service";
import {SpecManagerService} from "../../../domain/spec-manager.service";
import _ from "underscore";
import * as XLSX from "xlsx";

@Component({
  selector: 'app-vacant-wastage',
  templateUrl: './vacant-wastage.component.html',
  styleUrls: ['./vacant-wastage.component.css']
})
export class VacantWastageComponent implements OnInit {

  wastage: any[] = [];


  constructor(public ref: DynamicDialogRef, public t: LanguageService, private conf: DynamicDialogConfig, public s: SpecManagerService) {

  }

  ngOnInit(): void {
    this.wastage = this.conf.data;
  }
  close() {
    this.ref.close();
  }
  round(input: number, digit = 100) {
    return Math.round(input * digit) / digit;
  }
  exportXls() {
    let fileName = 'export_' + this.generateId(8) + '.xlsx';
    let data: any[] = this.wastage;
    // this.wastage.filter((x: any) => x != null).forEach(part => {
    //   data.push({
    //     'Number': part.code.split('x')[0],
    //     'Block': part.block.split('x')[0],
    //     'Name': part.name,
    //     'Description': part.description,
    //     'Weight': Math.round(part.weight),
    //   })
    // });
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = {Sheets: {'data': worksheet}, SheetNames: ['data']};
    //worksheet['!cols'] = [{wch:13},{wch:13},{wch:13},{wch:13},{wch:13}];

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
  getNestingMaterial(n: any){
    return [n.MAT, n.THICKNESS, n.CHILDLENGTH, n.CHILDWIDTH].join('x');
  }
}
