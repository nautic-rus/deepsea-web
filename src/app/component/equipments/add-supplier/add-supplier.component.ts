import { Component, OnInit } from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {ISupplier} from "../../../domain/interfaces/supplier";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {SupplierToDB} from "../../../domain/classes/supplier-to-db";
import {EquipmentsService} from "../../../domain/equipments.service";
import {AddFilesComponent} from "../add-files/add-files.component";
import {SupplierService} from "../../../domain/supplier.service";
import {EquipmentsFiles} from "../../../domain/classes/equipments-files";
import {SupplierFiles} from "../../../domain/classes/supplier-files";
import {LanguageService} from "../../../domain/language.service";
import {SupplierHistory} from "../../../domain/classes/supplier-history";

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

  supplierFiles: SupplierFiles[] = [];
  dragOver = false;

  constructor(private formBuilder: FormBuilder, public ref: DynamicDialogRef, private dialogConfig: DynamicDialogConfig, public auth: AuthManagerService, public eqService: EquipmentsService,
              private dialogService: DialogService, private supplierService: SupplierService, public t: LanguageService) {}

  ngOnInit(): void {}


  addFiles() {
    const dialog = this.dialogService.open(AddFilesComponent, {
      header: this.t.tr('Добавить файлы'),
      modal: true,
      data: {
        service: this.supplierService,
      }
    })
    dialog.onClose.subscribe(() => {
      this.supplierService.getCreateFiles().forEach(file => {
        this.supplierFiles.push(file);
      })
      this.supplierService.setCreateFiles([]);
    })
  }

  getFileExtensionIcon(fileUrl: string) {
    const fileName = this.extractFileName(fileUrl);
    switch (fileName.toLowerCase().split('.').pop()) {
      case 'pdf':
        return 'pdf.svg';
      case 'dwg':
        return 'dwg.svg';
      case 'xls':
        return 'xls.svg';
      case 'xlsx':
        return 'xls.svg';
      case 'doc':
        return 'doc.svg';
      case 'docx':
        return 'doc.svg';
      case 'png':
        return 'png.svg';
      case 'jpg':
        return 'jpg.svg';
      case 'txt':
        return 'txt.svg';
      case 'zip':
        return 'zip.svg';
      case 'mp4':
        return 'mp4.svg';
      default:
        return 'file.svg';
    }
  }

  trimFileName(fileUrl: string, length: number = 10): string {
    const fileName = this.extractFileName(fileUrl);
    let split = fileName.split('.');
    let name = split[0];
    let extension = split[1];
    if (name.length > length) {
      return name.substr(0, length - 2) + '..' + name.substr(name.length - 2, 2) + '.' + extension;
    } else {
      return fileName;
    }
  }

  extractFileName(fileUrl: string): string {
    const parts = fileUrl.split('/');
    return parts[parts.length - 1];
  }

  openFile(url: string) {
    window.open(url);
  }
  deleteFile(file: SupplierFiles) {
    this.supplierFiles.splice(this.supplierFiles.indexOf(file), 1);
    console.log(this.supplierFiles);
  }

  createSupplier() {
    const supplierToDB = new SupplierToDB();
    supplierToDB.equip_id= this.dialogConfig.data;  //принимаем из equipment компонент
    supplierToDB.user_id = this.auth.getUser().id;
    supplierToDB.name = this.suppliersForm.value.name;
    supplierToDB.manufacturer = this.suppliersForm.value.manufacturer;
    supplierToDB.description = this.suppliersForm.value.description;
    console.log('createSupplier()');
    console.log(JSON.stringify(supplierToDB));

    this.eqService.addSupplier(JSON.stringify(supplierToDB)).subscribe(res => {  //Добавляем постащика в БД, в результате получаем его id
      console.log('res');
      console.log(res);
      if (res.includes('error')){
        alert(res);
      }
      else{
        this.supplierFiles.forEach(file => { //добавляем файлы в БД
          file.supplier_id = parseInt(res);  //кладем id добавленного постащика в supplier_id файла
          console.log('createSupplier() + file');
          console.log(file);
          this.supplierService.addSupplierFiles(JSON.stringify(file)).subscribe(() => {});
        })
        this.supplierService.setCreateFiles([]);
        //this.equipmentFiles = this.eqService.getCreateEqFiles();
        console.log('closed uploading files: add-supplier');
        console.log(this.supplierFiles);
        this.ref.close(res);
      }

      const history = new SupplierHistory(this.auth.getUser().id, 'created', '', '', parseInt(res))  //добавляем в supp_history Информацию о том, что поставщик был добавлен
      this.eqService.addSupplierHistory( JSON.stringify(history)).subscribe((res) => {
      })

    });


  }

  close() {
    this.supplierService.setWaitingCreateFiles([]);
    this.suppliersForm.reset();
    this.ref.close();
  }

}
