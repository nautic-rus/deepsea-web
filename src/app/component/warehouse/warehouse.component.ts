import { Component, OnInit } from '@angular/core';
import {DeleteComponent} from "../task/delete/delete.component";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {ActControlComponent} from "./act-control/act-control.component";

@Component({
  selector: 'app-warehouse',
  templateUrl: './warehouse.component.html',
  styleUrls: ['./warehouse.component.css']
})
export class WarehouseComponent implements OnInit {

  fileGroups: string[] = [
    'Сертификаты',
    'Паспорт',
    'Чертежи',
    'Упаковочный лист (ЗИП)',
    'Руководства по эксплуатации',
    '3D модели',
    'Фото'
  ];
  constructor( private dialogService: DialogService, public ref: DynamicDialogRef) { }

  ngOnInit(): void {
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
    return [];
  }
}
