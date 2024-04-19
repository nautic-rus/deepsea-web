import { Component, OnInit } from '@angular/core';
import {DeleteComponent} from "../task/delete/delete.component";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {ActControlComponent} from "./act-control/act-control.component";
import {ActivatedRoute, Router} from "@angular/router";
import {StorageManagerService} from "../../domain/storage-manager.service";
import {ContextMenu} from "primeng/contextmenu";
import _ from "underscore";

@Component({
  selector: 'app-warehouse',
  templateUrl: './warehouse.component.html',
  styleUrls: ['./warehouse.component.css']
})
export class WarehouseComponent implements OnInit {

  fileGroups: string[] = [
    'Договоры',
    'Сертификаты',
    'Паспорт',
    'Чертежи',
    'Ведомости',
    'Упаковочный лист (ЗИП)',
    'Руководства по эксплуатации',
    '3D модели',
    'Фото'
  ];
  orders = [
    '115-2223',
    '200-1080',
    '302-1022',
    '401-1145',
    '502-0078',
  ];
  suppliers: string[] = [
    'ООО "МБТ"',
    'ООО "Артек"',
    'ООО "Формула"',
    'ООО "Тонгдекс"',
    'ООО "Фанпрайм"',
    'ООО "ТвитИндастрис"',
    'ООО "ЛонгФаурс"',
  ];
  statuses: string[] = [
    'Создан',
    'Принят',
    'Отстуствует',
    'Используется'
  ];
  dragOver = '';
  storageId: number = 0;
  storageFiles: any[] = [];
  storageLocations: any[] = [];
  storageUnit: any;
  selectedFileGroup: string = 'Недавно загруженные';
  loadFileGroup: string = '';
  awaitForLoad: any[] = [];
  fileMenu = [
    {
      label: 'Скачать',
      icon: 'pi pi-fw pi-download',
      command: (event: any) => this.downloadFile()
    },
    {
      label: 'Удалить',
      icon: 'pi pi-fw pi-trash',
      command: (event: any) => this.deleteFile()
    },
  ];
  contextMenuFile: any;
  edit: string = '';
  editLoc: number = -1;
  editValue: string = '';
  minDate = new Date();
  date_supply = new Date();
  editLocValue: any;

  constructor(private dialogService: DialogService, public ref: DynamicDialogRef, public a: ActivatedRoute, public s: StorageManagerService, public r: Router) { }

  ngOnInit(): void {
    this.a.queryParams.subscribe(params => {
      if (params['storageId'] != null){
        this.storageId = +params['storageId'];
        if (params['navi'] == null){
          this.r.navigate([], {queryParams: {navi: 0}, queryParamsHandling: 'merge'});
        }
        if (this.storageId == 0){
          this.s.getNewStorageUnit().subscribe(res => {
            this.r.navigate([], {queryParams: {storageId: res.id}});
          });
        }
        else{
          this.fillFiles();
          this.fillLocations();
          this.s.getStorageUnits().subscribe(res => {
            this.storageUnit = res.find((x: any) => x.id == this.storageId);
          });
        }
      }
    });
    this.checkNewPhotos();
  }
  checkNewPhotos(){
    setTimeout(() => {
      this.s.getStorageFiles().subscribe(res => {
        let photos = res.filter((x: any) => x.removed == 0 && x.unit_id == this.storageId && x.kind == 'Фото');
        photos.forEach((p: any) => {
          let find = this.storageFiles.find(x => x.url == p.url);
          if (find == null){
            this.storageFiles.push(p);
          }
        });
      });
      this.checkNewPhotos();
    }, 5000);
  }
  fillFiles(){
    this.s.getStorageFiles().subscribe(res => {
      this.storageFiles = res.filter((x: any) => x.removed == 0 && x.unit_id == this.storageId);
    });
  }
  fillLocations(){
    this.s.getStorageLocations().subscribe(res => {
      this.storageLocations = _.sortBy(res.filter((x: any) => x.removed == 0 && x.unit_id == this.storageId), x => x.id);
      console.log(res);
    });
  }
  actControlOpen(act: string) {
    this.dialogService.open(ActControlComponent, {
      showHeader: false,
      modal: true,
      data: act
    }).onClose.subscribe(res => {
      if (res == 'success'){
        this.ref.close();
      }
    });
  }

  protected readonly window = window;

  getFilesOfGroup(fileGroup: string) {
    return this.storageFiles.filter((x: any) => x.kind == fileGroup || fileGroup == 'Недавно загруженные').reverse();
  }

  selectFileGroup(fileGroup: string) {
    this.loadFileGroup = fileGroup;
    this.selectedFileGroup = fileGroup;
  }
  handleFileInput(files: FileList | null) {
    if (files != null){
      for (let x = 0; x < files.length; x++){
        let file = files.item(x);
        if (file != null){
          let fileName = file.name;
          this.awaitForLoad.push(fileName);
          this.s.uploadFile(file, fileName).subscribe(res => {
            this.awaitForLoad.splice(this.awaitForLoad.indexOf(fileName), 1);
            let sFile = Object({
              id: 0,
              name: fileName,
              url: res,
              kind: this.loadFileGroup,
              unit_id: this.storageId,
              removed: 0,
              date_created: 0
            });
            this.s.updateStorageFile(sFile).subscribe(() => {
              this.fillFiles();
            });
          });
        }
      }
    }
  }

  openFile(url: string) {
    window.open(url, '_blank');
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
  extractFileName(fileUrl: string): string {
    const parts = fileUrl.split('/');
    return parts[parts.length - 1];
  }

  getQrCode() {
    return 'https://deep-sea.ru/storage-upload-photo?navi=0&storageId=' + this.storageId;
  }

  onFilesDrop(event: DragEvent) {
    event.preventDefault();
    // @ts-ignore
    this.handleFileInput(event.dataTransfer.files);
  }

  private deleteFile() {
    this.contextMenuFile.removed = 1;
    this.s.updateStorageFile(this.contextMenuFile).subscribe(() => {
      this.fillFiles();
    });
  }

  private downloadFile() {
    window.open(this.contextMenuFile.url, '_blank');
  }

  openFileMenu(file: any, fileContextMenu: ContextMenu, event: any) {
    this.contextMenuFile = file;
    fileContextMenu.show(event);
  }
  getDateOnly(dateLong: number): string {
    if (dateLong == null){
      let date = new Date()
      return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
    }
    if (dateLong == 0){
      return '--/--/--';
    }
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
  }

  applyEdit() {
    if (this.edit == 'date_supply'){
      this.storageUnit.date_supply = this.date_supply.getTime();
    }
    this.edit = '';
    this.s.updateStorageUnit(this.storageUnit).subscribe(() => {});
  }

  cancelEdit() {
    switch (this.edit){
      case 'name': this.storageUnit.name = this.editValue; break;
      case 'code': this.storageUnit.code = this.editValue; break;
      case 'count': this.storageUnit.count = this.editValue; break;
      case 'order': this.storageUnit.order = this.editValue; break;
      case 'supplier': this.storageUnit.supplier = this.editValue; break;
      case 'date_supply': this.storageUnit.date_supply = this.editValue; break;
      case 'pack_list': this.storageUnit.pack_list = this.editValue; break;
      case 'comment': this.storageUnit.comment = this.editValue; break;
      default: break;
    }
    this.edit = '';
  }

  startEdit(name: string, value: string) {
    this.edit = name;
    this.editValue = value;
    this.date_supply = new Date(value);
    if (name == 'date_supply' && +value == 0){
      this.date_supply = new Date();
    }
  }

  addLocation() {
    let s = new Object({
      id: 0,
      unit_id: this.storageId,
      name: 'Название',
      place: '1-A',
      count: '1',
      removed: 0
    });
    this.s.updateStorageLocation(s).subscribe(res => {
      this.fillLocations();
    });
  }

  startEditLoc(i: number, loc: any) {
    this.editLoc = i;
    this.editLocValue = JSON.parse(JSON.stringify(loc));
  }

  applyLocEdit(loc: any) {
    this.s.updateStorageLocation(loc).subscribe(res => {
      this.fillLocations();
    });
    this.editLoc = -1;
  }

  cancelLocEdit() {
    this.fillLocations();
    this.editLoc = -1;
  }

  deleteLoc(loc: any) {
    loc.removed = 1;
    this.s.updateStorageLocation(loc).subscribe(res => {
      this.fillLocations();
    });
  }
}
