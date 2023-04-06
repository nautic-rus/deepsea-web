import { Component, OnInit } from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {MaterialManagerService} from "../../../domain/material-manager.service";
import {LanguageService} from "../../../domain/language.service";
export interface MaterialPurchase{
  code: string,
  project: string,
  date: number,
  user: string,
  qty: number,
  contract: string
}
@Component({
  selector: 'app-add-material-stock',
  templateUrl: './add-material-stock.component.html',
  styleUrls: ['./add-material-stock.component.css']
})
export class AddMaterialStockComponent implements OnInit {

  contract: string = '';
  amount: number = 0;
  project: string = '';
  code: string = '';
  units: string = '';
  constructor(public conf: DynamicDialogConfig, public ref: DynamicDialogRef, public auth: AuthManagerService, public materialManager: MaterialManagerService, public t: LanguageService) { }

  ngOnInit(): void {
    this.project = this.conf.data[0];
    this.code = this.conf.data[1];
    this.units = this.conf.data[2];
  }

  commit() {
    let materialPurchase: MaterialPurchase = {
      code: this.code,
      project: this.project,
      date: new Date().getTime(),
      user: this.auth.getUser().login,
      qty: this.amount,
      contract: this.contract
    };
    this.materialManager.addMaterialPurchase(materialPurchase).subscribe(res => {
      this.ref.close(materialPurchase);
    });
  }

  close() {
    this.ref.close('exit');
  }
}
