import { Component, OnInit } from '@angular/core';
import {AbstractControl, FormBuilder, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {ISupplier} from "../../../domain/interfaces/supplier";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {Supplier} from "../../../domain/classes/supplier";
import {EquipmentsService} from "../../../domain/equipments.service";
import {AddFilesComponent} from "../add-files/add-files.component";
import {SupplierService} from "../../../domain/supplier.service";
import {EquipmentsFiles} from "../../../domain/classes/equipments-files";
import {SupplierFiles} from "../../../domain/classes/supplier-files";
import {LanguageService} from "../../../domain/language.service";
import {SupplierHistory} from "../../../domain/classes/supplier-history";
import {reject} from "underscore";

@Component({
  selector: 'app-add-supplier',
  templateUrl: './add-supplier.component.html',
  styleUrls: ['./add-supplier.component.css']
})
export class AddSupplierComponent implements OnInit {
  suppliersForm = this.formBuilder.group({
    name: ['', [Validators.required, this.customNameValidator()]],  //имя поставщика
    supp_id: [''],
    model: ['', [Validators.required]],  //это name на макете
    manufacturer: [''],
    weight: ['0'],
    ele_param: [''],
    mech_param: [''],
    description: [''],
  });

  //для добавления нового или выбора поставщика из списка
  addedNewSupp: boolean = false; // показывает кликнут чекбокс длдя добавления нового поставщика или нет
  supplierNames: any[] = [];


  supplierFiles: SupplierFiles[] = [];
  dragOver = false;
  b : string = '';

  constructor(private formBuilder: FormBuilder, public ref: DynamicDialogRef, private dialogConfig: DynamicDialogConfig, public auth: AuthManagerService, public eqService: EquipmentsService,
              private dialogService: DialogService, private supplierService: SupplierService, public t: LanguageService) {}

  ngOnInit(): void {
    this.eqService.getSupplierNames().subscribe((res) => {
      this.supplierNames = res;
      console.log(this.supplierNames.sort((a: any, b: any) => a.name > b.name ? 1 : -1));
    })
  }

  toggleCheckbox() { //если галочка снята, то чистим поле с name (в ином случае будет проходить валидацию без галочки и без выбранного из списка )
    this.addedNewSupp = !this.addedNewSupp;
    this.suppliersForm.get('name')?.setValue('');
  }

  onSupplierSelect(id: any) {
    let supName: any[] = this.supplierNames.filter(name => id === name.id)
    this.suppliersForm.get('name')?.setValue(supName[0].name);
  }

  customNameValidator(): ValidatorFn {
    // @ts-ignore
    return (control: AbstractControl): ValidationErrors | null => {
      if (!this.suppliersForm) {
        return null;
      }
      if (this.addedNewSupp) {
        if (control.value !== '') {
          return null
        } else
          return {customNameInvalid: true}
      }
      else {
        if (this.suppliersForm.get('supp_id')?.value !== '') {
          console.log("this.suppliersForm.get('supp_id')?.value != ''")
          return null
        } else
          console.log("customNameInvalid: true")
          return {customNameInvalid: true}
      }
    }
  }

  addFiles() {
    const dialog = this.dialogService.open(AddFilesComponent, {
      header: this.t.tr('Добавить файлы'),
      modal: true,
      showHeader: false,
      data: {
        isEqServise: true,
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
    if (this.addedNewSupp) {
      console.log("if (this.addedNewSupp)")
      this.addNewSupplierName().then((res) => {  //тут промис вернул индекс добавленного имени в suppliers_name
        console.log(res)
        this.processSupplier(res);
      });
    } else {
      this.processSupplier(this.suppliersForm.value.supp_id);
    }
  }

  addNewSupplierName(): Promise<any> {  //добавляем в suppliers_name и промис возвращает индекс из этой же таблицы
    return new Promise((resolve, reject) => {
      //this.suppliersForm.get('supp_id')?.setValue(0);
      this.eqService.addSupplierName(JSON.stringify({id: 0, name: this.suppliersForm.get('name')?.value})).subscribe((res) => {
        console.log(res)
        resolve(parseInt(res));
      });
      // reject("error: add new supp name ")
    });
  }

  processSupplier(supplierId: number) {  //добавляем в таблицу suppliers, history, suppliers files
    const supplierToDB = new Supplier();
    supplierToDB.id = 0;
    supplierToDB.sup_id = supplierId;
    supplierToDB.user_id = this.auth.getUser().id;
    supplierToDB.equip_id = this.dialogConfig.data;
    supplierToDB.description = this.suppliersForm.value.description;
    supplierToDB.comment = '';
    supplierToDB.status_id = 1;
    supplierToDB.manufacturer = this.suppliersForm.value.manufacturer;
    supplierToDB.approvement = 0;
    supplierToDB.weight = parseInt(this.suppliersForm.value.weight);
    supplierToDB.ele_param = this.suppliersForm.value.ele_param;
    supplierToDB.mech_param = this.suppliersForm.value.mech_param;
    supplierToDB.model = this.suppliersForm.value.model;
    supplierToDB.name = '';
    supplierToDB.status = '';
    supplierToDB.last_update = 0;


    console.warn(this.suppliersForm.value);
    console.log(supplierToDB);



    this.eqService.addSupplier(JSON.stringify(supplierToDB)).subscribe((res) => {
      if (res.includes('error')) {
        alert(res);
      } else {
        this.supplierFiles.forEach(file => {
          file.supplier_id = parseInt(res);
          this.supplierService.addSupplierFiles(JSON.stringify(file)).subscribe(() => {});
        });
        this.supplierService.setCreateFiles([]);
        this.ref.close(res);

        const history = new SupplierHistory(this.auth.getUser().id, 'created', '', '', parseInt(res));
        this.eqService.addSupplierHistory(JSON.stringify(history)).subscribe(() => {});
      }
    });
  }

  // createSupplier() {
  //   if (this.addedNewSupp ) {
  //     this.suppliersForm.get('supp_id')?.setValue(0);
  //     console.log(JSON.stringify(this.suppliersForm.get('name')?.value));
  //     this.eqService.addSupplierName(JSON.stringify({id: 0, name: this.suppliersForm.get('name')?.value})).subscribe((res) => {
  //       console.log("  this.eqService.addSupplierName")
  //       console.log(res)
  //       this.suppId = parseInt(res);
  //
  //       const supplierToDB = new SupplierToDB();
  //       supplierToDB.sup_id = this.suppId;
  //       supplierToDB.equip_id= this.dialogConfig.data;  //принимаем из equipment компонент
  //       supplierToDB.user_id = this.auth.getUser().id;
  //
  //       supplierToDB.manufacturer = this.suppliersForm.value.manufacturer;
  //       supplierToDB.description = this.suppliersForm.value.description;
  //       console.log('createSupplier()');
  //       console.log(JSON.stringify(supplierToDB));
  //
  //       this.eqService.addSupplier(JSON.stringify(supplierToDB)).subscribe(res => {  //Добавляем постащика в БД, в результате получаем его id
  //         console.log('res');
  //         console.log(res);
  //         if (res.includes('error')){
  //           alert(res);
  //         }
  //         else{
  //           this.supplierFiles.forEach(file => { //добавляем файлы в БД
  //             file.supplier_id = parseInt(res);  //кладем id добавленного постащика в supplier_id файла
  //             console.log('createSupplier() + file');
  //             console.log(file);
  //             this.supplierService.addSupplierFiles(JSON.stringify(file)).subscribe(() => {});
  //           })
  //           this.supplierService.setCreateFiles([]);
  //           //this.equipmentFiles = this.eqService.getCreateEqFiles();
  //           console.log('closed uploading files: add-supplier');
  //           console.log(this.supplierFiles);
  //           this.ref.close(res);
  //         }
  //
  //         const history = new SupplierHistory(this.auth.getUser().id, 'created', '', '', parseInt(res))  //добавляем в supp_history Информацию о том, что поставщик был добавлен
  //         this.eqService.addSupplierHistory( JSON.stringify(history)).subscribe((res) => {
  //         })
  //
  //       });
  //
  //     })
  //   } else {
  //     this.suppliersForm.get('name')?.setValue('');
  //     this.suppId = this.suppliersForm.value.supp_id;
  //
  //     const supplierToDB = new SupplierToDB();
  //     supplierToDB.sup_id = this.suppId;
  //     supplierToDB.equip_id= this.dialogConfig.data;  //принимаем из equipment компонент
  //     supplierToDB.user_id = this.auth.getUser().id;
  //
  //     supplierToDB.manufacturer = this.suppliersForm.value.manufacturer;
  //     supplierToDB.description = this.suppliersForm.value.description;
  //     console.log('createSupplier()');
  //     console.log(JSON.stringify(supplierToDB));
  //
  //     this.eqService.addSupplier(JSON.stringify(supplierToDB)).subscribe(res => {  //Добавляем постащика в БД, в результате получаем его id
  //       console.log('res');
  //       console.log(res);
  //       if (res.includes('error')){
  //         alert(res);
  //       }
  //       else{
  //         this.supplierFiles.forEach(file => { //добавляем файлы в БД
  //           file.supplier_id = parseInt(res);  //кладем id добавленного постащика в supplier_id файла
  //           console.log('createSupplier() + file');
  //           console.log(file);
  //           this.supplierService.addSupplierFiles(JSON.stringify(file)).subscribe(() => {});
  //         })
  //         this.supplierService.setCreateFiles([]);
  //         //this.equipmentFiles = this.eqService.getCreateEqFiles();
  //         console.log('closed uploading files: add-supplier');
  //         console.log(this.supplierFiles);
  //         this.ref.close(res);
  //       }
  //
  //       const history = new SupplierHistory(this.auth.getUser().id, 'created', '', '', parseInt(res))  //добавляем в supp_history Информацию о том, что поставщик был добавлен
  //       this.eqService.addSupplierHistory( JSON.stringify(history)).subscribe((res) => {
  //       })
  //
  //     });
  //   }
  //   console.log(this.suppliersForm.value)
  //   console.log(this.suppId);
  // }

  close() {
    // if (this.addedNewSupp ) { //тут еще отправка в таблицу suppliers_name
    //   this.suppliersForm.get('supp_id')?.setValue(0);
    //   console.log(JSON.stringify(this.suppliersForm.get('name')?.value));
    //   this.eqService.addSupplierName(JSON.stringify({id: 0, name: this.suppliersForm.get('name')?.value})).subscribe((res) => {
    //     console.log("  this.eqService.addSupplierName")
    //     console.log(res)
    //   })
    // } else {
    //   this.suppliersForm.get('name')?.setValue('');
    // }
    // console.log(this.suppliersForm.value)
    this.supplierService.setWaitingCreateFiles([]);
    this.suppliersForm.reset();
    this.ref.close();
  }

  protected readonly console = console;
}
