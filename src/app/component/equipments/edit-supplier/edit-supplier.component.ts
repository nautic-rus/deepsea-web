import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {IEquipment} from "../../../domain/interfaces/equipments";
import {ISupplier} from "../../../domain/interfaces/supplier";
import {Supplier} from "../../../domain/classes/supplier";
import {SupplierService} from "../../../domain/supplier.service";
import {EquipmentsService} from "../../../domain/equipments.service";
import {AddFilesComponent} from "../add-files/add-files.component";
import {SupplierFiles} from "../../../domain/classes/supplier-files";
import {AgreeModalComponent} from "../agree-modal/agree-modal.component";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {CloseCode} from "../../../domain/classes/close-code";
import {LanguageService} from "../../../domain/language.service";
import {SupplierHistory} from "../../../domain/classes/supplier-history";
import {ActivatedRoute} from "@angular/router";
import {MessageService} from "primeng/api";
import {CreateTaskComponent} from "../../create-task/create-task.component";
import {RelatedTask} from "../../../domain/classes/related-task";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {IEqSupRelatedMaterials} from "../../../domain/interfaces/eqSupRelatedMaterials";


@Component({
  selector: 'app-edit-supplier',
  templateUrl: './edit-supplier.component.html',
  styleUrls: ['./edit-supplier.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class EditSupplierComponent implements OnInit {

  parent_data: IEquipment = this.dialogConfig.data.parent;
  eq_data: IEquipment = this.dialogConfig.data.eq;
  sup_data: ISupplier = this.dialogConfig.data.supplier;
  prev_sup_data: ISupplier = this.dialogConfig.data.supplier;

  supplierForm = this.formBuilder.group({
    model: this.sup_data.model,
    manufacturer: this.sup_data.manufacturer,
    status: this.sup_data.status,
    name: this.sup_data.name,  //название компании поставщика
    comment: this.sup_data.comment,
    description: this.sup_data.description,
    ele_param: this.sup_data.ele_param,
    mech_param: this.sup_data.mech_param,
    supp_id: this.sup_data.sup_id,
    weight: this.sup_data.weight,
  });

  //для добавления нового или выбора поставщика из списка
  addedNewSupp: boolean = false; // показывает кликнут чекбокс длдя добавления нового поставщика или нет
  supplierNames: any[] = [];


  historyArray: any[] = [];
  supplier_id: number;
  equipment_id: number = this.eq_data.id;
  sfi: number;
  sfi_name: string;  //расшифровка номера sfi
  statusSrc: any[] = []; //весь массив ствтусов, который приходит с сервера из таблицы suppliers_status
  statusTitle: string[] = [];  //это name из таблицы suppliers_status
  relatedTasks: RelatedTask[] = [];

  relatedMaterials: IEqSupRelatedMaterials[] = [];

  supplierFilesSrc: SupplierFiles[] = []; //Файлы, с сервера которые (они отображаются на странице. все - если нажата кнопка showMore (showMoreFilesButtonIsDisabled = true), 5шт если не нажата )
  // supplierFiles: SupplierFiles[] = [];  //файлы, которые я добавляю в момент редактирования
  archivedSupplierFilesSrc: SupplierFiles[] = []; //удаленные файлы (archived == 1)
  // showAttachmentFiles: boolean = true;
  // showArchivedFiles: boolean = false
  suppFilesLenght: number = 5;

  showAttachmentButton: boolean = true; // переключение между вложениями (если true) и заархивированными файлами (если false)
  showMoreButtonClicked: boolean = false;

  edit: string = '';  //для отображения
  buttonsAreHidden: boolean = true;


  // showmore: boolean = true;  //переменная, чтобы менять состояние кнопки "Показать еще" на "Скрыть" у файлов вложения
  // showmoreArchived: boolean = true; //переменная, чтобы менять состояние кнопки "Показать еще" на "Скрыть" у заархивированных файлов
  collapsed: string[] = [];
  stories: string[] = [];

  projectNames: any[] = [];

  constructor(private formBuilder: FormBuilder, protected dialogConfig: DynamicDialogConfig, public eqService: EquipmentsService, public t: LanguageService, private messageService: MessageService,
              private supplierService: SupplierService, private dialogService: DialogService, public ref: DynamicDialogRef, public auth: AuthManagerService, private route: ActivatedRoute, public issueManager: IssueManagerService) {

    route.queryParams.subscribe(params => {
      // console.log(params)
    });
  }

  ngOnInit(): void {
    // console.log("this.parent_data")
    // console.log(this.parent_data)
    // console.log("this.eq_data")
    // console.log(this.eq_data)
    // console.log("this.sup_data")
    // console.log(this.sup_data)


    this.eqService.getSupplierNames().subscribe((res) => {
      this.supplierNames = res;
    })

    this.supplier_id = this.sup_data.id;
    this.sfi = this.eq_data.sfi;
    this.sfi_name = this.eq_data.name;


    this.supplierService.getEquipmentFiles(this.sup_data.id).subscribe((res) => {
      // console.log(res)
      this.supplierFilesSrc = res.filter((f:any) => f.archived == 0);
      this.archivedSupplierFilesSrc = res.filter((f:any) => f.archived == 1)
    })


    this.eqService.getRelatedTasks(this.supplier_id).subscribe((res) => {
      this.relatedTasks = res;
    })

    this.eqService.getSupplierHistory(this.supplier_id).subscribe((res) => {
      res.sort((a:any, b:any) => a.update_date - b.update_date)  //отсортируем по дате добавления
      this.historyArray = res;
      // console.log("this.historyArray")
      // console.log(this.historyArray)
    })

    if (this.auth.getUser().id === this.sup_data.user_id || this.auth.hasPerms('create_edit_sup')) {
      this.buttonsAreHidden = false;
    }

    this.eqService.getSupplierStatuses().subscribe((res) => {
      this.statusSrc = res;
      this.statusTitle = res.map((i: any) => {return i.name});
    })

    this.eqService.getRelatedMaterials(this.supplier_id).subscribe((res) => {
      this.relatedMaterials = res;
    })
  }

  toggleCheckbox() { //если галочка снята, то чистим поле с name (в ином случае будет проходить валидацию без галочки и без выбранного из списка )
    this.addedNewSupp = !this.addedNewSupp
    this.supplierForm.get('name')?.setValue('');
  }

  onSupplierSelect(id: any) {
    console.log(id);
    let supName: any[] = this.supplierNames.filter(name => id === name.id)
    this.supplierForm.get('name')?.setValue(supName[0].name);
  }

  saveButton() {
    console.log("saveButton()")
    console.log(this.supplierForm.value)
    const supplierToDB = new Supplier();
    supplierToDB.id = this.dialogConfig.data.supplier.id;
    supplierToDB.equip_id= this.eq_data.id;
    supplierToDB.user_id = this.eq_data.responsible_id;
    supplierToDB.comment= this.supplierForm.value.comment;
    supplierToDB.sup_id = this.supplierForm.value.supp_id; //это название компании поставщика из suppliers_name
    supplierToDB.manufacturer = this.supplierForm.value.manufacturer;
    supplierToDB.description = this.supplierForm.value.description;
    supplierToDB.status_id = this.setStatusId(this.supplierForm.value.status)
    supplierToDB.weight = parseInt(this.supplierForm.value.weight) | 0;
    supplierToDB.ele_param = this.supplierForm.value.ele_param;
    supplierToDB.mech_param = this.supplierForm.value.mech_param;
    supplierToDB.approvement = 0;
    supplierToDB.model = this.supplierForm.value.model;
    supplierToDB.name = '';
    supplierToDB.status = '';
    supplierToDB.last_update = 0;

    console.log(supplierToDB);

    this.eqService.addSupplier(JSON.stringify(supplierToDB)).subscribe((res) => {
      if (res.includes('error')) {
        alert(res);
      }
      else {
          console.log('supplier with id = '+supplierToDB.id +'changed');
          //тут надо будет в историю еще добавлять
        }
    });

  }



  addFiles() {  //записать в историю еще надо
    const dialog = this.dialogService.open(AddFilesComponent, {
      header: 'Uploading files',
      showHeader: false,
      modal: true,
      data: {
        isEqService: false,
        service: this.supplierService,
      }
    })
    dialog.onClose.subscribe(() => {
      this.supplierService.getCreateFiles().forEach(file => {  //добавляем файлы в БД
        file.supplier_id = this.supplier_id
        this.supplierService.addSupplierFiles(JSON.stringify(file)).subscribe(res => {
          if (res.includes('error')) {
            alert(res);
          }
        })
      })

      this.supplierService.getCreateFiles().forEach(file => {  //добавляем файлы в историю
        const history = new SupplierHistory(this.auth.getUser().id, 'added file', '', file.url, this.supplier_id)
        this.eqService.addSupplierHistory(JSON.stringify(history)).subscribe((res) => {
          this.eqService.getSupplierHistory(this.supplier_id).subscribe((res) => {
            res.sort((a:any, b:any) => a.update_date - b.update_date)  //отсортируем по дате добавления
            this.historyArray = res;
          })
        })
      })

      this.supplierService.getEquipmentFiles(this.sup_data.id).subscribe((res) => {  //отображаем файлы на странице
        this.supplierFilesSrc = res.filter((f:any) => f.archived == 0);
        // console.log(this.supplierFilesSrc)
      })

      this.supplierService.setCreateFiles([])  //чистим loaded

    })
  }


  deleteFile(file: SupplierFiles ) {
    const dialog = this.dialogService.open(AgreeModalComponent, {
      modal: true,
      header: this.t.tr('Удалить файл поставщика?'),
      data: {
        file: file
      }
    })
    dialog.onClose.subscribe(res => {
      if (res) {
        console.log('deleteFile');
        this.supplierFilesSrc.splice(this.supplierFilesSrc.indexOf(file), 1); //удаляем из отображения
        this.archivedSupplierFilesSrc.push(file)  //добавляем удаленный файл в archived
        this.supplierService.deleteSupplierFile(file.id)  //удаляем из БД
          .subscribe(
            () => {
              console.log('Файл поставщика удален успешно');
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

  copySupplierUrl() {
    navigator.clipboard.writeText(location.origin + '/equipments' + '?equipmentId=' + this.equipment_id + '&supplierId=' + this.supplier_id);
    this.messageService.add({key:'supplierUrl', severity:'success', summary:'Copied', detail:'You have copied supplier url.'});
  }

  showAttachmentFiles() {  //переключение на вкладку с вложенными файлами
    this.suppFilesLenght = 5    //при переключении сворачиваем файлы (отображаем только 5 файлов)
    this.showAttachmentButton = true;  //показываем, что на вкладке с вложенными файлами
    this.showMoreButtonClicked = false  //как будто не кликали на кнопку "Показать еще"
  }

  showArchivedFiles() {  //переключение на вкладку с удаленными файлами
    this.suppFilesLenght = 5  //при переключении отображаем только 5 файлов
    this.showAttachmentButton = false  //показываем, что на вкладке не с вложенными файлами
    this.showMoreButtonClicked = false  //как будто не кликали на кнопку "Показать еще"
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


  getDateOnly(dateLong: number): string {  //преобразовать поле create_date в человеческий вид
    if (dateLong == 0){
      let date = new Date()
      return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
    }
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
  }

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


  openFile(url: string) {
    window.open(url);
  }

  openMaterial(material: IEqSupRelatedMaterials) {
    console.log(material)
  }

  viewTask(issueId: number, project: string, docNumber: string, department: string) {
    if (docNumber != '') {
      let foranProject = project
      let findProject = this.projectNames.find((x: any) => x != null && (x.name == project || x.pdsp == project || x.rkd == project));
      if (findProject != null){
        foranProject = findProject.foran;
      }

      switch (department) {
        case 'Hull': window.open(`/hull-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
        case 'System': window.open(`/pipe-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
        case 'Devices': window.open(`/device-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
        case 'Trays': window.open(`/trays?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
        case 'Cables': window.open(`/cables?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
        case 'Electric': window.open(`/electric-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
        case 'Accommodation': window.open(`/accommodation-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
        case 'Design': window.open(`/design-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
        case 'General': window.open(`/general-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
        default: break;
      }
    }

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



  editSupplier(name_value: string, prev_data: string, new_data: string) {
    // if (name_value && prev_data !== new_data) {
    //   const history = new SupplierHistory(this.auth.getUser().id, name_value, prev_data, new_data, this.supplier_id)
    //   this.eqService.addSupplierHistory( JSON.stringify(history)).subscribe((res) => {
    //     this.eqService.getSupplierHistory(this.supplier_id).subscribe((res) => {
    //       res.sort((a:any, b:any) => a.update_date - b.update_date)  //отсортируем по дате добавления
    //       this.historyArray = res;
    //     })
    //   })
    // }

    const supplierToDB = new Supplier();
    supplierToDB.equip_id= this.eq_data.id;
    supplierToDB.user_id = this.eq_data.responsible_id; //или уже id поменявшего?
    supplierToDB.id = this.dialogConfig.data.supplier.id;
    supplierToDB.comment= this.supplierForm.value.comment;
    supplierToDB.model = this.supplierForm.value.model;
    supplierToDB.sup_id = this.supplier_id; //тут надо полученное снова ставить на это место
    supplierToDB.manufacturer = this.supplierForm.value.manufacturer;
    supplierToDB.description = this.supplierForm.value.description;
    supplierToDB.status_id = this.setStatusId(this.supplierForm.value.status)
    console.log(JSON.stringify(supplierToDB));



    // supplierToDB.sup_id = supplierId;
    // supplierToDB.user_id = this.auth.getUser().id;
    // supplierToDB.equip_id = this.dialogConfig.data;
    // supplierToDB.description = this.suppliersForm.value.description;
    // supplierToDB.comment = '';
    // supplierToDB.status_id = 1;
    // supplierToDB.manufacturer = this.suppliersForm.value.manufacturer;
    // supplierToDB.approvement = 0;
    // supplierToDB.weight = parseInt(this.suppliersForm.value.weight);
    // supplierToDB.ele_param = this.suppliersForm.value.ele_param;
    // supplierToDB.mech_param = this.suppliersForm.value.mech_param;
    // supplierToDB.model = this.suppliersForm.value.model;
    //
    // console.warn(this.suppliersForm.value);
    // console.log(supplierToDB);

    this.eqService.addSupplier(JSON.stringify(supplierToDB)).subscribe(res => {  //Добавляем постащика в БД, в результате получаем его id
      if (res.includes('error')){
        alert(res);
      }
      else{
        // console.log('supplier with id = '+supplierToDB.id +'changed');
        // console.log("Это то, что я хочу добавть то есть this.supplierFiles")
        // console.log(this.supplierFiles)
        // this.supplierFiles.forEach(file => { //добавляем файлы в БД
        //   file.supplier_id = parseInt(res);  //кладем id добавленного поставщика в supplier_id файла
        //   console.log('createSupplier() + file');
        //   console.log(file);
        //   this.supplierService.addSupplierFiles(JSON.stringify(file)).subscribe(() => {
        //     this.supplierFiles.forEach(file => {
        //
        //       if (this.supplierFilesSrc.length > 5) {
        //         this.showmore = false;
        //         this.showMoreFilesButtonIsDisabled = false;
        //       }
        //     })
        //
        //     this.supplierFiles = [];
        //   });
        //   this.supplierService.getEquipmentFiles(this.sup_data.id).subscribe((res) => {
        //    // this.showMoreArchivedFilesButtonIsDisabled =  res.filter((f:any) => f.archived == 1).length > 5 ? false : true;
        //     this.supplierFilesSrc = res.filter((f:any) => f.archived == 0).slice(0, 5);
        //     //this.showMoreFilesButtonIsDisabled = res.filter((f:any) => f.archived == 0).length > 5 ? false : true;
        //   })
        //
        // })
        // this.supplierService.setCreateFiles([]);
        // console.log('closed uploading files: add-supplier');
        // console.log(this.supplierFiles);
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
    // console.log(id)
    window.open('/?taskId=' + id, '_blank');
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

  toggleShowMoreButton() {
    let array: SupplierFiles[];
    if (this.showAttachmentButton === true) {  //если раскрыт массив с файлами вложения
      array = this.supplierFilesSrc
    } else if (this.showAttachmentButton === false) {  //если раскрыт массив с удаленными файлами
      array = this.archivedSupplierFilesSrc
    }

    this.showMoreButtonClicked = !this.showMoreButtonClicked
    if (this.showMoreButtonClicked) {
      // @ts-ignore
      this.suppFilesLenght = array.length;  //если мы кликнули на кнопку показать еще, то показываем весь массив
    } else {
      this.suppFilesLenght = 5;  ////если мы не кликнули на кнопку показать еще, то показываем часть массива
    }
    // @ts-ignore
    this.getSupFiles(array)  //а тут устанавливаем отображаемый массив с нужно длинной уже  this.suppFilesLenght

  }

  getSupFiles( array: SupplierFiles[] ) {
    return array.slice(0, this.suppFilesLenght);
  }

}






// import {Component, OnInit, ViewEncapsulation} from '@angular/core';
// import {FormBuilder} from "@angular/forms";
// import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
// import {IEquipment} from "../../../domain/interfaces/equipments";
// import {ISupplier} from "../../../domain/interfaces/supplier";
// import {SupplierToDB} from "../../../domain/classes/supplier-to-db";
// import {SupplierService} from "../../../domain/supplier.service";
// import {EquipmentsService} from "../../../domain/equipments.service";
// import {AddFilesComponent} from "../add-files/add-files.component";
// import {SupplierFiles} from "../../../domain/classes/supplier-files";
// import {AgreeModalComponent} from "../agree-modal/agree-modal.component";
// import {AuthManagerService} from "../../../domain/auth-manager.service";
// import {CloseCode} from "../../../domain/classes/close-code";
// import {LanguageService} from "../../../domain/language.service";
// import {SupplierHistory} from "../../../domain/classes/supplier-history";
// import {ActivatedRoute} from "@angular/router";
// import {MessageService} from "primeng/api";
// import {CreateTaskComponent} from "../../create-task/create-task.component";
// import {RelatedTask} from "../../../domain/classes/related-task";


// import {IssueManagerService} from "../../../domain/issue-manager.service";
// import {IEqSupRelatedMaterials} from "../../../domain/interfaces/eqSupRelatedMaterials";
//
//
// @Component({
//   selector: 'app-edit-supplier',
//   templateUrl: './edit-supplier.component.html',
//   styleUrls: ['./edit-supplier.component.css'],
//   encapsulation: ViewEncapsulation.None,
// })
// export class EditSupplierComponent implements OnInit {
//
//   parent_data: IEquipment = this.dialogConfig.data.parent;
//   eq_data: IEquipment = this.dialogConfig.data.eq;
//   sup_data: ISupplier = this.dialogConfig.data.supplier;
//   prev_sup_data: ISupplier = this.dialogConfig.data.supplier;
//   supplierForm = this.formBuilder.group({
//     name: this.sup_data.name,  //название компании поставщика
//     manufacturer: this.sup_data.manufacturer,
//     description: this.sup_data.description,
//     comment: this.sup_data.comment,
//     status: this.sup_data.status,
//   });
//   historyArray: any[] = [];
//   supplier_id: number;
//   equipment_id: number = this.eq_data.id;
//   sfi: number;
//   sfi_name: string;  //расшифровка номера sfi
//   statusSrc: any[] = []; //весь массив ствтусов, который приходит с сервера из таблицы suppliers_status
//   statusTitle: string[] = [];  //это name из таблицы suppliers_status
//   relatedTasks: RelatedTask[] = [];
//
//   relatedMaterials: IEqSupRelatedMaterials[] = [];
//
//   supplierFilesSrc: SupplierFiles[] = []; //Файлы, с сервера которые (они отображаются на странице. все - если нажата кнопка showMore (showMoreFilesButtonIsDisabled = true), 5шт если не нажата )
//   // supplierFiles: SupplierFiles[] = [];  //файлы, которые я добавляю в момент редактирования
//   archivedSupplierFilesSrc: SupplierFiles[] = []; //удаленные файлы (archived == 1)
//   // showAttachmentFiles: boolean = true;
//   // showArchivedFiles: boolean = false
//   suppFilesLenght: number = 5;
//
//   showAttachmentButton: boolean = true; // переключение между вложениями (если true) и заархивированными файлами (если false)
//   showMoreButtonClicked: boolean = false;
//
//   edit: string = '';  //для отображения
//   buttonsAreHidden: boolean = true;
//
//
//   // showmore: boolean = true;  //переменная, чтобы менять состояние кнопки "Показать еще" на "Скрыть" у файлов вложения
//   // showmoreArchived: boolean = true; //переменная, чтобы менять состояние кнопки "Показать еще" на "Скрыть" у заархивированных файлов
//   collapsed: string[] = [];
//   stories: string[] = [];
//
//   projectNames: any[] = [];
//
//   constructor(private formBuilder: FormBuilder, protected dialogConfig: DynamicDialogConfig, public eqService: EquipmentsService, public t: LanguageService, private messageService: MessageService,
//               private supplierService: SupplierService, private dialogService: DialogService, public ref: DynamicDialogRef, public auth: AuthManagerService, private route: ActivatedRoute, public issueManager: IssueManagerService) {
//
//     route.queryParams.subscribe(params => {
//       // console.log(params)
//     });
//   }
//
//   ngOnInit(): void {
//     console.log("this.parent_data")
//     console.log(this.parent_data)
//     console.log("this.eq_data")
//     console.log(this.eq_data)
//     console.log("this.sup_data")
//     console.log(this.sup_data)
//
//
//
//     this.supplier_id = this.sup_data.id;
//     this.sfi = this.eq_data.sfi;
//     this.sfi_name = this.eq_data.name;
//
//
//     this.supplierService.getEquipmentFiles(this.sup_data.id).subscribe((res) => {
//       // console.log(res)
//       this.supplierFilesSrc = res.filter((f:any) => f.archived == 0);
//       this.archivedSupplierFilesSrc = res.filter((f:any) => f.archived == 1)
//     })
//
//
//     this.eqService.getRelatedTasks(this.supplier_id).subscribe((res) => {
//       this.relatedTasks = res;
//     })
//
//     this.eqService.getSupplierHistory(this.supplier_id).subscribe((res) => {
//       res.sort((a:any, b:any) => a.update_date - b.update_date)  //отсортируем по дате добавления
//       this.historyArray = res;
//       // console.log("this.historyArray")
//       // console.log(this.historyArray)
//     })
//
//     if (this.auth.getUser().id === this.sup_data.user_id || this.auth.hasPerms('create_edit_sup')) {
//       this.buttonsAreHidden = false;
//     }
//
//     this.eqService.getSupplierStatuses().subscribe((res) => {
//       this.statusSrc = res;
//       this.statusTitle = res.map((i: any) => {return i.name});
//     })
//
//     this.eqService.getRelatedMaterials(this.supplier_id).subscribe((res) => {
//       this.relatedMaterials = res;
//     })
//   }
//
//   addFiles() {  //записать в историю еще надо
//     const dialog = this.dialogService.open(AddFilesComponent, {
//       header: 'Uploading files',
//       showHeader: false,
//       modal: true,
//       data: {
//         isEqService: false,
//         service: this.supplierService,
//       }
//     })
//     dialog.onClose.subscribe(() => {
//       this.supplierService.getCreateFiles().forEach(file => {  //добавляем файлы в БД
//         file.supplier_id = this.supplier_id
//         this.supplierService.addSupplierFiles(JSON.stringify(file)).subscribe(res => {
//           if (res.includes('error')) {
//             alert(res);
//           }
//         })
//       })
//
//       this.supplierService.getCreateFiles().forEach(file => {  //добавляем файлы в историю
//         const history = new SupplierHistory(this.auth.getUser().id, 'added file', '', file.url, this.supplier_id)
//         this.eqService.addSupplierHistory(JSON.stringify(history)).subscribe((res) => {
//           this.eqService.getSupplierHistory(this.supplier_id).subscribe((res) => {
//             res.sort((a:any, b:any) => a.update_date - b.update_date)  //отсортируем по дате добавления
//             this.historyArray = res;
//           })
//         })
//       })
//
//       this.supplierService.getEquipmentFiles(this.sup_data.id).subscribe((res) => {  //отображаем файлы на странице
//         this.supplierFilesSrc = res.filter((f:any) => f.archived == 0);
//         // console.log(this.supplierFilesSrc)
//       })
//
//       this.supplierService.setCreateFiles([])  //чистим loaded
//
//     })
//   }
//
//
//   deleteFile(file: SupplierFiles ) {
//     const dialog = this.dialogService.open(AgreeModalComponent, {
//       modal: true,
//       header: this.t.tr('Удалить файл поставщика?'),
//       data: {
//         file: file
//       }
//     })
//     dialog.onClose.subscribe(res => {
//       if (res) {
//         console.log('deleteFile');
//         this.supplierFilesSrc.splice(this.supplierFilesSrc.indexOf(file), 1); //удаляем из отображения
//         this.archivedSupplierFilesSrc.push(file)  //добавляем удаленный файл в archived
//         this.supplierService.deleteSupplierFile(file.id)  //удаляем из БД
//           .subscribe(
//             () => {
//               console.log('Файл поставщика удален успешно');
//             },
//             error => {
//               console.error('Ошибка при удалении файла поставщика');
//             }
//           );
//       } else {
//         console.log('User canceled'); // User clicked Cancel
//       }
//     })
//   }
//
//   copySupplierUrl() {
//     navigator.clipboard.writeText(location.origin + '/equipments' + '?equipmentId=' + this.equipment_id + '&supplierId=' + this.supplier_id);
//     this.messageService.add({key:'supplierUrl', severity:'success', summary:'Copied', detail:'You have copied supplier url.'});
//   }
//
//   showAttachmentFiles() {  //переключение на вкладку с вложенными файлами
//     this.suppFilesLenght = 5    //при переключении сворачиваем файлы (отображаем только 5 файлов)
//     this.showAttachmentButton = true;  //показываем, что на вкладке с вложенными файлами
//     this.showMoreButtonClicked = false  //как будто не кликали на кнопку "Показать еще"
//   }
//
//   showArchivedFiles() {  //переключение на вкладку с удаленными файлами
//     this.suppFilesLenght = 5  //при переключении отображаем только 5 файлов
//     this.showAttachmentButton = false  //показываем, что на вкладке не с вложенными файлами
//     this.showMoreButtonClicked = false  //как будто не кликали на кнопку "Показать еще"
//   }
//
//
//   createCombined(issue: object | null) {
//       this.dialogService.open(CreateTaskComponent, {
//         showHeader: false,
//         modal: true,
//         data: [issue, '']
//       }).onClose.subscribe(res => {  //приходит айди созданной задачи в issue
//         let issueId = res;
//         let relTask = {id: 0, suppliers_id: this.supplier_id, task_id: issueId}  //заполняю для добавления в таблицу supp_task_relation
//         this.eqService.addRelatedSupplierTasks(JSON.stringify(relTask)).subscribe((res) => {  //приходит айди для таблицы supp_task_relation
//           this.issueManager.getIssueDetails(issueId).then(issue => {
//             //добавляю в таблицу this.relatedTasks для отображения на странице
//             this.relatedTasks.push({id: res, issue_id: issueId, issue_typ: issue.issue_type, issue_name: issue.name, started_by: issue.started_by, responsible: issue.responsible, assigned_to: issue.assigned_to, status: issue.status})
//           });
//         })
//       });
//   }
//
//
//   showEditBlock(blockName: string) {  //отображаем блок редактирования для blockName (если '', то все скрыты)
//     this.edit = blockName;
//     this.supplierForm.patchValue({
//       name: this.prev_sup_data.name,  //если ввести и отменить, чтоб отображалось то, что должно быть (сохранено)
//       description: this.prev_sup_data.description,
//       comment: this.prev_sup_data.comment,
//       status: this.prev_sup_data.status,
//       manufacturer: this.prev_sup_data.manufacturer
//     });
//   }
//
//   setStatusId(statusTitle: string): number {  //ищем id статуса по name из таблицы suppliers_status
//     let i: any = this.statusSrc.filter((item) => item.name == statusTitle)
//     return i[0].id
//   }
//
//   refactorHistoryTitle(title: string): string {
//     switch (title) {
//       case 'changed manufacturer':
//         return 'изменил(а) производителя'
//       case 'changed comment':
//         return 'изменил(а) комментарий'
//       case 'changed name':
//         return 'изменил(а) наименование'
//       case 'changed description':
//         return 'изменил(а) описание'
//       case 'changed status':
//         return 'изменил(а) статус'
//       default:
//         return title;
//     }
//   }
//
//
//   getFileExtensionIcon(fileUrl: string) {
//     const fileName = this.extractFileName(fileUrl);
//     switch (fileName.toLowerCase().split('.').pop()) {
//       case 'pdf':
//         return 'pdf.svg';
//       case 'dwg':
//         return 'dwg.svg';
//       case 'xls':
//         return 'xls.svg';
//       case 'xlsx':
//         return 'xls.svg';
//       case 'doc':
//         return 'doc.svg';
//       case 'docx':
//         return 'doc.svg';
//       case 'png':
//         return 'png.svg';
//       case 'jpg':
//         return 'jpg.svg';
//       case 'txt':
//         return 'txt.svg';
//       case 'zip':
//         return 'zip.svg';
//       case 'mp4':
//         return 'mp4.svg';
//       default:
//         return 'file.svg';
//     }
//   }
//
//   trimFileName(fileUrl: string, length: number = 10): string {
//     const fileName = this.extractFileName(fileUrl);
//     let split = fileName.split('.');
//     let name = split[0];
//     let extension = split[1];
//     if (name.length > length) {
//       return name.substr(0, length - 2) + '..' + name.substr(name.length - 2, 2) + '.' + extension;
//     } else {
//       return fileName;
//     }
//   }
//
//   extractFileName(fileUrl: string): string {
//     const parts = fileUrl.split('/');
//     return parts[parts.length - 1];
//   }
//
//
//   getDateOnly(dateLong: number): string {  //преобразовать поле create_date в человеческий вид
//     if (dateLong == 0){
//       let date = new Date()
//       return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
//     }
//     let date = new Date(dateLong);
//     return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
//   }
//
//   getDate(dateLong: number): string{
//     let date = new Date(dateLong);
//     return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear() + ' ' + date.getHours() + ':' + ('0' + (date.getMinutes())).slice(-2);
//   }
//
//   deleteRelatedTask(taskId: number) {  //удаляем из таблицы sup_task_relations строку по айди
//     const dialog = this.dialogService.open(AgreeModalComponent, {  //открываем модалку подтверждения удаления файла
//       modal: true,
//       header: this.t.tr('Удалить связанную задачу?'),
//       data: {
//         //title: 'Удалить поставщика?',
//         supplier_id: this.supplier_id
//       }
//     })
//     dialog.onClose.subscribe((res) => {
//       if (res) { // User clicked OK
//         console.log('User confirmed delete related task');
//         this.eqService.deleteRelatedTask(taskId).subscribe(() => {
//           // console.log("delete Related Task with id = " + taskId);
//           this.relatedTasks = this.relatedTasks.filter((task) => {
//             // console.log(task)
//             return task.id !== taskId
//           })
//           // console.log(this.relatedTasks);
//         })
//       } else {
//         console.log('User canceled'); // User clicked Cancel
//       }
//     })
//     // console.log(taskId);
//
//   }
//
//
//   openFile(url: string) {
//     window.open(url);
//   }
//
//   openMaterial(material: IEqSupRelatedMaterials) {
//     console.log(material)
//   }
//
//   viewTask(issueId: number, project: string, docNumber: string, department: string) {
//     if (docNumber != '') {
//       let foranProject = project
//       let findProject = this.projectNames.find((x: any) => x != null && (x.name == project || x.pdsp == project || x.rkd == project));
//       if (findProject != null){
//         foranProject = findProject.foran;
//       }
//
//       switch (department) {
//         case 'Hull': window.open(`/hull-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
//         case 'System': window.open(`/pipe-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
//         case 'Devices': window.open(`/device-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
//         case 'Trays': window.open(`/trays?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
//         case 'Cables': window.open(`/cables?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
//         case 'Electric': window.open(`/electric-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
//         case 'Accommodation': window.open(`/accommodation-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
//         case 'Design': window.open(`/design-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
//         case 'General': window.open(`/general-esp?issueId=${issueId}&foranProject=${foranProject}&docNumber=${docNumber}&department=${department}&nc=1`, '_blank'); break;
//         default: break;
//       }
//     }
//
//   }
//
//
//   deleteSupplier(id:number) {
//     console.log("deleteSupplier");
//     const dialog = this.dialogService.open(AgreeModalComponent, {  //открываем модалку подтверждения удаления файла
//       modal: true,
//       header: this.t.tr('Удалить поставщика?'),
//       data: {
//         //title: 'Удалить поставщика?',
//         supplier_id: this.supplier_id
//       }
//     })
//     dialog.onClose.subscribe((res) => {
//       if (res) { // User clicked OK
//         console.log('User confirmed deleteFile');
//         this.eqService.deleteSupplier(this.sup_data.id)
//           .subscribe(
//             () => {
//               console.log('Поставщик удален успешно');
//               this.ref.close(new CloseCode(1, id));
//             },
//             error => {
//               console.error('Ошибка при удалении поставщика');
//             }
//           );
//       }
//       else {
//         console.log('User canceled'); // User clicked Cancel
//       }
//     })
//   }
//   close() {
//     this.supplierService.setWaitingCreateFiles([]);
//     this.ref.close(new CloseCode(0));
//   }
//
//
//
//   editSupplier(name_value: string, prev_data: string, new_data: string) {
//     // if (name_value && prev_data !== new_data) {
//     //   const history = new SupplierHistory(this.auth.getUser().id, name_value, prev_data, new_data, this.supplier_id)
//     //   this.eqService.addSupplierHistory( JSON.stringify(history)).subscribe((res) => {
//     //     this.eqService.getSupplierHistory(this.supplier_id).subscribe((res) => {
//     //       res.sort((a:any, b:any) => a.update_date - b.update_date)  //отсортируем по дате добавления
//     //       this.historyArray = res;
//     //     })
//     //   })
//     // }
//
//     const supplierToDB = new SupplierToDB();
//     supplierToDB.equip_id= this.eq_data.id;
//     supplierToDB.user_id = this.eq_data.responsible_id; //или уже id поменявшего?
//     supplierToDB.id = this.dialogConfig.data.supplier.id;
//     supplierToDB.comment= this.supplierForm.value.comment;
//     supplierToDB.sup_id = this.supplier_id; //тут надо полученное снова ставить на это место
//     supplierToDB.manufacturer = this.supplierForm.value.manufacturer;
//     supplierToDB.description = this.supplierForm.value.description;
//     supplierToDB.status_id = this.setStatusId(this.supplierForm.value.status)
//     console.log(JSON.stringify(supplierToDB));
//
//     this.eqService.addSupplier(JSON.stringify(supplierToDB)).subscribe(res => {  //Добавляем постащика в БД, в результате получаем его id
//       if (res.includes('error')){
//         alert(res);
//       }
//       else{
//         // console.log('supplier with id = '+supplierToDB.id +'changed');
//         // console.log("Это то, что я хочу добавть то есть this.supplierFiles")
//         // console.log(this.supplierFiles)
//         // this.supplierFiles.forEach(file => { //добавляем файлы в БД
//         //   file.supplier_id = parseInt(res);  //кладем id добавленного поставщика в supplier_id файла
//         //   console.log('createSupplier() + file');
//         //   console.log(file);
//         //   this.supplierService.addSupplierFiles(JSON.stringify(file)).subscribe(() => {
//         //     this.supplierFiles.forEach(file => {
//         //
//         //       if (this.supplierFilesSrc.length > 5) {
//         //         this.showmore = false;
//         //         this.showMoreFilesButtonIsDisabled = false;
//         //       }
//         //     })
//         //
//         //     this.supplierFiles = [];
//         //   });
//         //   this.supplierService.getEquipmentFiles(this.sup_data.id).subscribe((res) => {
//         //    // this.showMoreArchivedFilesButtonIsDisabled =  res.filter((f:any) => f.archived == 1).length > 5 ? false : true;
//         //     this.supplierFilesSrc = res.filter((f:any) => f.archived == 0).slice(0, 5);
//         //     //this.showMoreFilesButtonIsDisabled = res.filter((f:any) => f.archived == 0).length > 5 ? false : true;
//         //   })
//         //
//         // })
//         // this.supplierService.setCreateFiles([]);
//         // console.log('closed uploading files: add-supplier');
//         // console.log(this.supplierFiles);
//         //this.ref.close(new CloseCode(0));
//       }
//     });
//
//     this.prev_sup_data = this.supplierForm.value;
//
//     this.edit = '';  //скроем все блоки, в которых можно редактировать данные поставщика
//   }
//
//   contentClick(content: string): void{
//     this.collapsed.includes(content) ? this.collapsed.splice(this.collapsed.indexOf(content), 1) : this.collapsed.push(content);
//   }
//
//   openIssue(id: number) {
//     // console.log(id)
//     window.open('/?taskId=' + id, '_blank');
//   }
//
//
//   formatValue(name: any, value: any) {
//     if (value == ''){
//       return 'Нет';
//     }
//     else{
//       switch (name){
//         case 'changed status': return this.issueManager.localeStatus(value, true);
//         default: return value;
//       }
//     }
//   }
//
//   toggleShowMoreButton() {
//     let array: SupplierFiles[];
//     if (this.showAttachmentButton === true) {  //если раскрыт массив с файлами вложения
//       array = this.supplierFilesSrc
//     } else if (this.showAttachmentButton === false) {  //если раскрыт массив с удаленными файлами
//       array = this.archivedSupplierFilesSrc
//     }
//
//     this.showMoreButtonClicked = !this.showMoreButtonClicked
//     if (this.showMoreButtonClicked) {
//       // @ts-ignore
//       this.suppFilesLenght = array.length;  //если мы кликнули на кнопку показать еще, то показываем весь массив
//     } else {
//       this.suppFilesLenght = 5;  ////если мы не кликнули на кнопку показать еще, то показываем часть массива
//     }
//     // @ts-ignore
//     this.getSupFiles(array)  //а тут устанавливаем отображаемый массив с нужно длинной уже  this.suppFilesLenght
//
//   }
//
//   getSupFiles( array: SupplierFiles[] ) {
//     return array.slice(0, this.suppFilesLenght);
//   }
// }
