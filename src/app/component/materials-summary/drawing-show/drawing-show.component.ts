import { Component, OnInit } from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {LanguageService} from "../../../domain/language.service";
import {User} from "../../../domain/classes/user";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import _ from "underscore";
import * as XLSX from "xlsx";

@Component({
  selector: 'app-drawing-show',
  templateUrl: './drawing-show.component.html',
  styleUrls: ['./drawing-show.component.css']
})
export class DrawingShowComponent implements OnInit {

  material: any;
  drawing: any;
  groupedByDocNumber: any[] = [];
  grouped = false;

  constructor(public ref: DynamicDialogRef, public t: LanguageService, private conf: DynamicDialogConfig, public auth: AuthManagerService) { }

  ngOnInit(): void {
    this.drawing = this.conf.data[0];
    _.forEach(_.groupBy(this.drawing.documents, x => x.docNumber), group => {
      let qtyValue = 0;
      let totalWeightValue = 0;
      group.forEach(g => {
        qtyValue += g.qty;
        totalWeightValue += g.totalWeight;
      });
      let g = group[0];
      this.groupedByDocNumber.push({
        date: g.date,
        docNumber: g.docNumber,
        qty: qtyValue,
        totalWeight: totalWeightValue,
        units: g.units,
        unitsValue: g.unitsValue,
        rev: g.rev,
        user: g.user
      });
    });
    console.log(this.groupedByDocNumber);
    console.log(this.drawing);
  }
  exportXls() {
    let fileName = 'export_' + this.generateId(8) + '.xlsx';
    let data: any[] = this.drawing.documents;
    if (this.grouped){
      data = this.groupedByDocNumber;
    }
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = {Sheets: {'data': worksheet}, SheetNames: ['data']};
    worksheet['!cols'] = [{wch:15},{wch:15}];

    XLSX.writeFile(workbook, fileName);
  }
  close() {
    this.ref.close();
  }
  round(input: number, digit = 100) {
    return Math.round(input * digit) / digit;
  }
  getDate(dateLong: number): string{
    if (dateLong == 0){
      return '--/--/----';
    }
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
  }
  getUser(author: string) {
    return this.auth.getUserName(author);
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
