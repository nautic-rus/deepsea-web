import { Component, OnInit } from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {DynamicDialogConfig} from "primeng/dynamicdialog";
import {IEquipment} from "../../../domain/interfaces/equipments";
import {ISupplier} from "../../../domain/interfaces/supplier";

@Component({
  selector: 'app-edit-supplier',
  templateUrl: './edit-supplier.component.html',
  styleUrls: ['./edit-supplier.component.css']
})
export class EditSupplierComponent implements OnInit {

  supplierForm = this.formBuilder.group({
    //supplier_id: this.dialogConfig.data.supplier.id,
    //sfi: this.dialogConfig.data.eq.sfi,

  });

  eq_data: IEquipment = this.dialogConfig.data.eq;
  sup_data: ISupplier = this.dialogConfig.data.supplier;
  supplier_id: number;
  sfi: number;
  sfi_name: string;
  sup_name: string;
  constructor(private formBuilder: FormBuilder, protected dialogConfig: DynamicDialogConfig) {

  }

  ngOnInit(): void {
    this.supplier_id = this.sup_data.id;
    this.sfi = this.eq_data.sfi;
    this.sfi_name = this.eq_data.name;
    this.sup_name = this.sup_data.name;
  }

}
