import { Component, OnInit } from '@angular/core';
import {DeleteComponent} from "../task/delete/delete.component";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {ActControlComponent} from "./act-control/act-control.component";
import {ActivatedRoute} from "@angular/router";
import {StorageManagerService} from "../../domain/storage-manager.service";
import {ContextMenu} from "primeng/contextmenu";

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
  dragOver = '';
  storageId: number = 0;
  storageFiles: any[] = [];
  storageUnit: any;
  selectedFileGroup: string = 'Недавно загруженные';
  loadFileGroup: string = '';
  awaitForLoad: any[] = [];
  fileMenu = [
    {
      label: 'Open',
      icon: 'pi pi-fw pi-download',
      command: (event: any) => this.downloadFile()
    },
    {
      label: 'Delete',
      icon: 'pi pi-fw pi-trash',
      command: (event: any) => this.deleteFile()
    },
  ];
  contextMenuFile: any;

  constructor(private dialogService: DialogService, public ref: DynamicDialogRef, public a: ActivatedRoute, public s: StorageManagerService) { }

  ngOnInit(): void {
    this.a.queryParams.subscribe(params => {
      if (params['storageId'] != null){
        this.storageId = +params['storageId'];
        this.fillFiles();
        this.s.getStorageUnits().subscribe(res => {
          console.log(res);
          this.storageUnit = res.find((x: any) => x.id == this.storageId);
        });
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
}
