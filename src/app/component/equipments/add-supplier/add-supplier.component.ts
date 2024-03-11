import { Component, OnInit } from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {ISupplier} from "../../../domain/interfaces/supplier";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {SupplierToDB} from "../../../domain/classes/supplier-to-db";
import {EquipmentsService} from "../../../domain/equipments.service";

@Component({
  selector: 'app-add-supplier',
  templateUrl: './add-supplier.component.html',
  styleUrls: ['./add-supplier.component.css']
})
export class AddSupplierComponent implements OnInit {
  suppliersForm = this.formBuilder.group({
    name: ['', Validators.required],
    description: [''],
    manufacturer: ['', Validators.required],
  });

  constructor(private formBuilder: FormBuilder, public ref: DynamicDialogRef, private dialogConfig: DynamicDialogConfig, public auth: AuthManagerService, public eqService: EquipmentsService) {}

  ngOnInit(): void {
  }

  createSupplier() {
    const supplierToDB = new SupplierToDB();
    supplierToDB.equ_id = this.dialogConfig.data;  //принимаем из equipment компонент
    supplierToDB.user_id = this.auth.getUser().id;
    supplierToDB.name = this.suppliersForm.value.name;
    supplierToDB.manufacturer = this.suppliersForm.value.manufacturer;
    supplierToDB.description = this.suppliersForm.value.description;
    console.log('createSupplier()');
    console.log(JSON.stringify(supplierToDB));

    this.eqService.addSupplier(JSON.stringify(supplierToDB)).subscribe(res => {
      console.log('res');
      console.log(res);
      if (res.includes('error')){
        alert(res);
      }
      else{
        this.ref.close(res);
      }
    });
  }

  addFiles() {
    console.log('addFiles()')
  }

  close() {
    this.suppliersForm.reset();
    this.ref.close();
  }

}
