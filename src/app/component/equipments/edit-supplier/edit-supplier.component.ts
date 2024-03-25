import { Component, OnInit } from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {IEquipment} from "../../../domain/interfaces/equipments";
import {ISupplier} from "../../../domain/interfaces/supplier";
import {SupplierToDB} from "../../../domain/classes/supplier-to-db";
import {SupplierService} from "../../../domain/supplier.service";
import {EquipmentsService} from "../../../domain/equipments.service";
import {EquipmentsFiles} from "../../../domain/classes/equipments-files";
import {AddFilesComponent} from "../add-files/add-files.component";
import {SupplierFiles} from "../../../domain/classes/supplier-files";
import {AgreeModalComponent} from "../agree-modal/agree-modal.component";
import {Issue} from "../../../domain/classes/issue";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {CloseCode} from "../../../domain/classes/close-code";
import {LanguageService} from "../../../domain/language.service";
import {SupplierHistory} from "../../../domain/classes/supplier-history";

@Component({
  selector: 'app-edit-supplier',
  templateUrl: './edit-supplier.component.html',
  styleUrls: ['./edit-supplier.component.css']
})
export class EditSupplierComponent implements OnInit {

  eq_data: IEquipment = this.dialogConfig.data.eq;
  sup_data: ISupplier = this.dialogConfig.data.supplier;

  prev_sup_data: ISupplier = this.dialogConfig.data.supplier;


  supplierForm = this.formBuilder.group({
    name: this.sup_data.name,  //название компании поставщика
    manufacturer: this.sup_data.manufacturer,
    description: this.sup_data.description,
    comment: this.sup_data.comment,
    status: this.sup_data.status,
  });

  historyArray: any[] = [];

  supplier_id: number;
  sfi: number;
  sfi_name: string;  //расшифровка номера sfi
  status: string[] = ['New', 'ITT sent', 'On approval', 'Approved', 'Not approved', 'Accepted']

  relatedTasks: any[] = [] //написать интерфейс для тасков

  supplierFilesSrc: SupplierFiles[] = []; //файлы, с сервера которые (они отображаются на странице. все - если нажата кнопка showMore (showMoreFilesButtonIsDisabled = true), 5шт если не нажата )
  supplierFiles: SupplierFiles[] = [];  //файлы, которые я добавляю в момент редактирования


  miscIssues: Issue[] = [];

  showMoreFilesButtonIsDisabled: boolean = false;

  edit: string = '';  //для отображения

  buttonsAreHidden: boolean = true;

  showmore: boolean = true;  //переменная, чтобы менять состояние кнопки "Показать еще" на "Скрыть" у файлов

  constructor(private formBuilder: FormBuilder, protected dialogConfig: DynamicDialogConfig, public eqService: EquipmentsService, public t: LanguageService,
              private supplierService: SupplierService, private dialogService: DialogService, public ref: DynamicDialogRef, public auth: AuthManagerService) {
  }

  ngOnInit(): void {
    this.supplier_id = this.sup_data.id;
    this.sfi = this.eq_data.sfi;
    this.sfi_name = this.eq_data.name;
    this.supplierService.getEquipmentFiles(this.sup_data.id).subscribe((res) => {
      // this.supplierFilesSrc = res;
      this.supplierFilesSrc = res.slice(0, 5);
      this.showMoreFilesButtonIsDisabled = res.length > 5 ? false : true;
       // console.log(this.supplierFilesSrc);
    })
    this.eqService.getRelatedTasks(this.supplier_id).subscribe((res) => {
      this.relatedTasks = res;
      console.log(res)
    })

    this.eqService.getSupplierHistory(this.supplier_id).subscribe((res) => {
      this.historyArray = res;
      // console.log(res)
    })

    if (this.auth.getUser().id === this.sup_data.user_id || this.auth.hasPerms('create_edit_sup')) {
      this.buttonsAreHidden = false;
    }

    //
  }

  showEditBlock(blockName: string) {  //отображаем блок редактирования для blockName (если '', то все скрыты)
    this.edit = blockName;
    this.supplierForm.patchValue({
      name: this.prev_sup_data.name,  //если ввести и отменить, чтоб отображалось то, что должно быть (сохранено)
      description: this.prev_sup_data.description,
      comment: this.prev_sup_data.comment,
      status: this.prev_sup_data.status,
      manufacturer: this.prev_sup_data.manufacturer
    });
    //this.supplierForm.patchValue({ description: this.prev_sup_data.description});
  }

  setStatusId(status: string): number {  //вообще надо из таблицы supplier_status, но пока так
    switch (status) {
      case 'New' :
        return (1)
      case 'Approved':
        return 2
      case 'Not approved':
        return 3
      case 'On approval':
        return 4
      case 'ITT sent':
        return 5
      case 'Accepted':
        return 6
      default:
        return 1
    }
  }

  refactorHistoryTitle(title: string): string {
    switch (title) {
      case 'changed manufacturer':
        return 'изменил(а) производителя'
      case 'changed comment':
        return 'изменил(а) комментарий'
      case 'changed name':
        return 'изменил(а) наименование'
      case 'changed description':
        return 'изменил(а) описание'
      case 'changed status':
        return 'изменил(а) статус'
      default:
        return title;
    }
  }

  addFiles() {  //просто добавляем файлы в this.supplierFiles чтобы отобразить в блоке с файлами (которые планируем отправлять в БД)
    const dialog = this.dialogService.open(AddFilesComponent, {
      header: 'Uploading files',
      modal: true,
      data: {
        service: this.supplierService,
      }
    })
    dialog.onClose.subscribe(() => {
      this.supplierService.getCreateFiles().forEach(file => {
        this.supplierFiles.push(file);
      })
      this.eqService.setCreateFiles([]);
    })
  }

  addFiles2(addedFiles: SupplierFiles[]) {
    addedFiles.forEach(file => {
      const history = new SupplierHistory(this.auth.getUser().id, 'added file', '', file.url, this.supplier_id)
      this.eqService.addSupplierHistory(JSON.stringify(history)).subscribe((res) => {
        this.eqService.getSupplierHistory(this.supplier_id).subscribe((res) => {
          this.historyArray = res;
          console.log(res)
        })
      })
      console.log(history);
    })
    this.editSupplier('', '', '')  //а здесь отправляем файлы () в БД
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

  deleteFile(file: SupplierFiles) {
    const dialog = this.dialogService.open(AgreeModalComponent, {
      modal: true,
      header: this.t.tr('Удалить файл поставщика?'),
      data: {
        //title: 'Удалить файл поставщика?',
        file: file
      }
    })
    dialog.onClose.subscribe(res => {
      if (res) {
        console.log('deleteFile');
        console.log(file);
        this.supplierFiles.splice(this.supplierFiles.indexOf(file), 1);
        this.supplierService.deleteSupplierFile(file.id)
          .subscribe(
            () => {
              console.log('Файл поставщика удален успешно');
              this.supplierService.getEquipmentFiles(this.sup_data.id).subscribe((res) => {  //обновим поле с файлами после удаления
                this.supplierFilesSrc = res;
              })
              //this.close();
            },
            error => {
              console.error('Ошибка при удалении файла поставщика');
            }
          );
      } else {
        console.log('User canceled'); // User clicked Cancel
      }
    })
  }

  downloadFile(url: string) {
    const a = document.createElement('a');
    a.href = url;
    a.download = url;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  getDateOnly(dateLong: number): string {  //преобразовать поле create_date в человеческий вид
    if (dateLong == 0) {
      return '--/--/--';
    }
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
  }

  getDate(dateLong: number): string {
    let date = new Date(dateLong);
    let ye = new Intl.DateTimeFormat('ru', {year: 'numeric'}).format(date);
    let mo = new Intl.DateTimeFormat('ru', {month: 'short'}).format(date);
    let da = new Intl.DateTimeFormat('ru', {day: '2-digit'}).format(date);
    let hours = new Intl.DateTimeFormat('ru', {hour: '2-digit'}).format(date);
    let minutes = new Intl.DateTimeFormat('ru', {minute: '2-digit'}).format(date);
    return da + ' ' + mo + ' ' + ye + ' ' + ('0' + hours).slice(-2) + ':' + ('0' + minutes).slice(-2);
  }

  deleteRelatedTask(taskId: number) {  //удаляем из таблицы sup_task_relations строку по айди
    const dialog = this.dialogService.open(AgreeModalComponent, {  //открываем модалку подтверждения удаления файла
      modal: true,
      header: this.t.tr('Удалить связанную задачу?'),
      data: {
        //title: 'Удалить поставщика?',
        supplier_id: this.supplier_id
      }
    })
    dialog.onClose.subscribe((res) => {
      if (res) { // User clicked OK
        console.log('User confirmed delete related task');
        this.eqService.deleteRelatedTask(taskId).subscribe(() => {
          // console.log("delete Related Task with id = " + taskId);
          this.relatedTasks = this.relatedTasks.filter((task) => {
            // console.log(task)
            return task.id !== taskId
          })
          // console.log(this.relatedTasks);
        })
      } else {
        console.log('User canceled'); // User clicked Cancel
      }
    })
    // console.log(taskId);

  }

  showMore() {  //показать все файлы (изначально 5)
    console.log("showMore")

    this.showmore = false;
    this.supplierService.getEquipmentFiles(this.sup_data.id).subscribe((res) => {
      this.supplierFilesSrc = res;
      console.log(this.supplierFilesSrc)
    })
    //this.showMoreFilesButtonIsDisabled = true;
    console.log(this.showmore)

  }

  showLess() {
    console.log("showLess")
    this.showmore = true;
    this.supplierFilesSrc = this.supplierFilesSrc.slice(0, 5);
    console.log(this.showmore)
    console.log(this.supplierFilesSrc)
  }

  openFile(url: string) {
    window.open(url);
  }

  deleteSupplier(id:number) {
    console.log("deleteSupplier");
    const dialog = this.dialogService.open(AgreeModalComponent, {  //открываем модалку подтверждения удаления файла
      modal: true,
      header: this.t.tr('Удалить поставщика?'),
      data: {
        //title: 'Удалить поставщика?',
        supplier_id: this.supplier_id
      }
    })
    dialog.onClose.subscribe((res) => {
      if (res) { // User clicked OK
        console.log('User confirmed deleteFile');
        this.eqService.deleteSupplier(this.sup_data.id)
          .subscribe(
            () => {
              console.log('Поставщик удален успешно');
              this.ref.close(new CloseCode(1, id));
            },
            error => {
              console.error('Ошибка при удалении поставщика');
            }
          );
      }
      else {
        console.log('User canceled'); // User clicked Cancel
      }
    })
  }
  close() {
    this.supplierService.setWaitingCreateFiles([]);
    this.ref.close(new CloseCode(0));
  }


    // this.supplierService.getEquipmentFiles(this.sup_data.id).subscribe((res) => {
    //   this.supplierFilesSrc = res.slice(0,5);
    //   this.showMoreFilesButtonIsDisabled = res.length > 5 ? false : true;
    //   console.log(this.supplierFilesSrc);
    // })


  editSupplier(name_value: string, prev_data: string, new_data: string) {
    if (name_value) {
      const history = new SupplierHistory(this.auth.getUser().id, name_value, prev_data, new_data, this.supplier_id)
      this.eqService.addSupplierHistory( JSON.stringify(history)).subscribe((res) => {
        this.eqService.getSupplierHistory(this.supplier_id).subscribe((res) => {
          this.historyArray = res;
          console.log(res)
        })
      })
    }


    const supplierToDB = new SupplierToDB();
    supplierToDB.equip_id= this.eq_data.id;
    supplierToDB.user_id = this.eq_data.responsible_id; //или уже id поменявшего?
    supplierToDB.id = this.dialogConfig.data.supplier.id;
    supplierToDB.comment= this.supplierForm.value.comment;
    supplierToDB.name = this.supplierForm.value.name;
    supplierToDB.manufacturer = this.supplierForm.value.manufacturer;
    supplierToDB.description = this.supplierForm.value.description;
    supplierToDB.status_id = this.setStatusId(this.supplierForm.value.status)
    // console.log('this.setStatusId(this.supplierForm.value.status)');
    // console.log(this.supplierForm.value.status);
    // console.log('editSupplier()');
     console.log(JSON.stringify(supplierToDB));

    this.eqService.addSupplier(JSON.stringify(supplierToDB)).subscribe(res => {  //Добавляем постащика в БД, в результате получаем его id
      // console.log('res');
      // console.log(res);
      if (res.includes('error')){
        alert(res);
      }
      else{
        console.log('supplier with id = '+supplierToDB.id +'changed');
        this.supplierFiles.forEach(file => { //добавляем файлы в БД
          file.supplier_id = parseInt(res);  //кладем id добавленного поставщика в supplier_id файла
          console.log('createSupplier() + file');
          console.log(file);
          this.supplierService.addSupplierFiles(JSON.stringify(file)).subscribe(() => {
            this.supplierFiles.forEach(file => {
              this.supplierFilesSrc.push(file); //перенесем в отображаемый массив
              console.log(this.supplierFilesSrc);
              if (this.supplierFilesSrc.length > 5) {
                this.showmore = false;
                this.showMoreFilesButtonIsDisabled = false;
              }
            })

            this.supplierFiles = [];

          });
        })
        this.supplierService.setCreateFiles([]);
        console.log('closed uploading files: add-supplier');
        console.log(this.supplierFiles);
        //this.ref.close(new CloseCode(0));
      }
    });

    this.prev_sup_data = this.supplierForm.value;

    this.edit = '';  //скроем все блоки, в которых можно редактировать данные поставщика
  }

}
