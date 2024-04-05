import {Component, OnInit, ViewEncapsulation} from '@angular/core';
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
import {ActivatedRoute} from "@angular/router";
import {MessageService} from "primeng/api";
import {CreateTaskComponent} from "../../create-task/create-task.component";
import {zip} from "rxjs";
import {map} from "rxjs/operators";
import {RelatedTask} from "../../../domain/classes/related-task";
import {IssueManagerService} from "../../../domain/issue-manager.service";

@Component({
  selector: 'app-edit-supplier',
  templateUrl: './edit-supplier.component.html',
  styleUrls: ['./edit-supplier.component.css'],
  encapsulation: ViewEncapsulation.None,
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
  equipment_id: number = this.eq_data.id;
  sfi: number;
  sfi_name: string;  //расшифровка номера sfi
  statusSrc: any[] = []; //весь массив ствтусов, который приходит с сервера из таблицы suppliers_status
  statusTitle: string[] = [];  //это name из таблицы suppliers_status
  relatedTasks: RelatedTask[] = []

  supplierFilesSrc: SupplierFiles[] = []; //Файлы, с сервера которые (они отображаются на странице. все - если нажата кнопка showMore (showMoreFilesButtonIsDisabled = true), 5шт если не нажата )
  supplierFiles: SupplierFiles[] = [];  //файлы, которые я добавляю в момент редактирования
  archivedSupplierFiles: SupplierFiles[] = []; //удаленные файлы (archived == 1)
  // showAttachmentFiles: boolean = true;
  // showArchivedFiles: boolean = false

  showAttachmentButton: boolean = true; // переключение между вложениями (если true) и заархивированными файлами (если false)

  miscIssues: Issue[] = [];
  showMoreFilesButtonIsDisabled: boolean = false;
  showMoreArchivedFilesButtonIsDisabled: boolean = false;
  edit: string = '';  //для отображения
  buttonsAreHidden: boolean = true;
  showmore: boolean = true;  //переменная, чтобы менять состояние кнопки "Показать еще" на "Скрыть" у файлов вложения
  showmoreArchived: boolean = true; //переменная, чтобы менять состояние кнопки "Показать еще" на "Скрыть" у заархивированных файлов
  collapsed: string[] = [];
  stories: string[] = [];

  constructor(private formBuilder: FormBuilder, protected dialogConfig: DynamicDialogConfig, public eqService: EquipmentsService, public t: LanguageService, private messageService: MessageService,
              private supplierService: SupplierService, private dialogService: DialogService, public ref: DynamicDialogRef, public auth: AuthManagerService, private route: ActivatedRoute, public issueManager: IssueManagerService) {

    route.queryParams.subscribe(params => {
      console.log(params)
    });
  }

  ngOnInit(): void {
    this.supplier_id = this.sup_data.id;
    this.sfi = this.eq_data.sfi;
    this.sfi_name = this.eq_data.name;
    this.supplierService.getEquipmentFiles(this.sup_data.id).subscribe((res) => {
      this.archivedSupplierFiles = res.filter((f:any) => f.archived == 1).slice(0, 5)
      this.showMoreArchivedFilesButtonIsDisabled =  res.filter((f:any) => f.archived == 1).length > 5 ? false : true;
      console.log("this.archivedSupplierFiles");
      console.log(this.archivedSupplierFiles);
      this.supplierFilesSrc = res.filter((f:any) => f.archived == 0).slice(0, 5);
      this.showMoreFilesButtonIsDisabled = res.filter((f:any) => f.archived == 0).length > 5 ? false : true;
      console.log("this.supplierFilesSrc");
      console.log(this.supplierFilesSrc);
    })
    this.eqService.getRelatedTasks(this.supplier_id).subscribe((res) => {
      this.relatedTasks = res;
    })

    this.eqService.getSupplierHistory(this.supplier_id).subscribe((res) => {
      this.historyArray = res;
    })

    if (this.auth.getUser().id === this.sup_data.user_id || this.auth.hasPerms('create_edit_sup')) {
      this.buttonsAreHidden = false;
    }

    this.eqService.getSupplierStatuses().subscribe((res) => {
      this.statusSrc = res;
      this.statusTitle = res.map((i: any) => {return i.name});
    })
  }

  copySupplierUrl() {
    navigator.clipboard.writeText(location.origin + '/equipments' + '?equipmentId=' + this.equipment_id + '&supplierId=' + this.supplier_id);
    this.messageService.add({key:'supplierUrl', severity:'success', summary:'Copied', detail:'You have copied supplier url.'});
  }

  showAttachmentFiles() {
    this.showAttachmentButton = true
  }

  showArchivedFiles() {
    this.showAttachmentButton = false
  }

  toggleAttachmentButton() {
    this.showAttachmentButton = !this.showAttachmentButton
  }


  createCombined(issue: object | null) {
      this.dialogService.open(CreateTaskComponent, {
        showHeader: false,
        modal: true,
        data: [issue, '']
      }).onClose.subscribe(res => {  //приходит айди созданной задачи в issue
        let issueId = res;
        let relTask = {id: 0, suppliers_id: this.supplier_id, task_id: issueId}  //заполняю для добавления в таблицу supp_task_relation
        this.eqService.addRelatedSupplierTasks(JSON.stringify(relTask)).subscribe((res) => {  //приходит айди для таблицы supp_task_relation
          this.issueManager.getIssueDetails(issueId).then(issue => {
            //добавляю в таблицу this.relatedTasks для отображения на странице
            this.relatedTasks.push({id: res, issue_id: issueId, issue_typ: issue.issue_type, issue_name: issue.name, started_by: issue.started_by, responsible: issue.responsible, assigned_to: issue.assigned_to, status: issue.status})
          });
        })
      });
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
  }

  setStatusId(statusTitle: string): number {  //ищем id статуса по name из таблицы suppliers_status
    let i: any = this.statusSrc.filter((item) => item.name == statusTitle)
    return i[0].id
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
                this.supplierFilesSrc = res.filter((f:any) => f.archived == 0);
                this.archivedSupplierFiles = res.filter((f:any) => f.archived == 1)
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

  getDateOnly(dateLong: number): string {  //преобразовать поле create_date в человеческий вид
    if (dateLong == 0) {
      return '--/--/--';
    }
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
  }

  // getDate(dateLong: number): string {
  //   let date = new Date(dateLong);
  //   let ye = new Intl.DateTimeFormat('ru', {year: 'numeric'}).format(date);
  //   let mo = new Intl.DateTimeFormat('ru', {month: 'short'}).format(date);
  //   let da = new Intl.DateTimeFormat('ru', {day: '2-digit'}).format(date);
  //   let hours = new Intl.DateTimeFormat('ru', {hour: '2-digit'}).format(date);
  //   let minutes = new Intl.DateTimeFormat('ru', {minute: '2-digit'}).format(date);
  //   return da + ' ' + mo + ' ' + ye + ' ' + ('0' + hours).slice(-2) + ':' + ('0' + minutes).slice(-2);
  // }
  getDate(dateLong: number): string{
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear() + ' ' + date.getHours() + ':' + ('0' + (date.getMinutes())).slice(-2);
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
    this.showmore = false;
    this.supplierService.getEquipmentFiles(this.sup_data.id).subscribe((res) => {
      this.supplierFilesSrc = res.filter((f:any) => f.archived == 0);
      console.log(this.supplierFilesSrc)
    })


  }

  showLess() {
    console.log("showLess")
    this.showmore = true;
    this.supplierFilesSrc = this.supplierFilesSrc.slice(0, 5);
    console.log(this.showmore)
    console.log(this.supplierFilesSrc)
  }

  showMoreArchived() {  //показать все файлы (изначально 5)
    this.showmoreArchived = false;
    this.supplierService.getEquipmentFiles(this.sup_data.id).subscribe((res) => {
      this.archivedSupplierFiles = res.filter((f:any) => f.archived == 1);
      // console.log(this.supplierFilesSrc)
    })


  }

  showLessArchived() {
    console.log("showLess")
    this.showmoreArchived = true;
    this.supplierService.getEquipmentFiles(this.sup_data.id).subscribe((res) => {
      this.archivedSupplierFiles = res.filter((f:any) => f.archived == 1).slice(0, 5);
    })
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
    supplierToDB.sup_id = this.supplier_id; //тут надо полученное снова ставить на это место
    supplierToDB.manufacturer = this.supplierForm.value.manufacturer;
    supplierToDB.description = this.supplierForm.value.description;
    supplierToDB.status_id = this.setStatusId(this.supplierForm.value.status)
    console.log(JSON.stringify(supplierToDB));

    this.eqService.addSupplier(JSON.stringify(supplierToDB)).subscribe(res => {  //Добавляем постащика в БД, в результате получаем его id
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

  contentClick(content: string): void{
    this.collapsed.includes(content) ? this.collapsed.splice(this.collapsed.indexOf(content), 1) : this.collapsed.push(content);
  }

  openIssue(id: number) {
    window.open('/?taskId=' + id, '_blank');
  }

  localeGender(userId: string){
    let find = this.auth.users.find(x => x.login == userId);
    return find != null && find.gender == 'female' && this.t.language == 'ru' ? 'а' : '';
  }

  getNoneZeroInput(input: string) {
    return input == '-' ? '<div class="text-none">Нет</div>' : input;
  }

  trimMin(input: string, length: number = 35): string {
    if (input.length <= length) {
      return input;
    } else {
      return input.substr(0, length) + '...';
    }
  }

  formatValue(name: any, value: any) {
    if (value == ''){
      return 'Нет';
    }
    else{
      switch (name){
        case 'changed status': return this.issueManager.localeStatus(value, true);
        default: return value;
      }
    }
  }
}
