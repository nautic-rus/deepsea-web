import { Component, OnInit } from '@angular/core';
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {LanguageService} from "../../../domain/language.service";
import {RightService} from "./right.service";
import {Rights} from "../../../domain/interfaces/rights";
import {Roles} from "../../../domain/interfaces/roles";
import {DeleteProjectComponent} from "../project/delete-project/delete-project.component";
import {MessageService} from "primeng/api";
import {DeleteRightComponent} from "./delete-right/delete-right.component";

@Component({
  selector: 'app-right',
  templateUrl: './right.component.html',
  styleUrls: ['./right.component.css']
})
export class RightComponent implements OnInit {
  right: Rights;
  name: string = '';

  constructor(private messageService: MessageService, private dialogService: DialogService, public conf: DynamicDialogConfig, public t: LanguageService, public ref: DynamicDialogRef, public rightService: RightService) { }

  ngOnInit(): void {
    this.right = this.conf.data as Rights;
    this.name = this.right.name;
  }
  deleteRight() {
    this.dialogService.open(DeleteRightComponent, {
      showHeader: false,
      modal: true,
      data: this.right.name
    }).onClose.subscribe(res => {
      if (res == 'success'){
        this.ref.close(res);
        this.messageService.add({key:'admin', severity:'success', summary: this.t.tr('Удаление доступа'), detail: this.t.tr('Доступ удалён')});
        // this.loading = false;
      } else {
        // this.loading = false;
        this.messageService.add({key:'admin', severity:'error', summary: this.t.tr('Удаление доступа'), detail: this.t.tr('Не удалось удалить доступ')});
      }
    })
  }
  saveRight() {
    this.rightService.saveRight(this.right, this.name).subscribe({
      next: res => {
        console.log(res);
        this.ref.close(res);
      },
      error: err => {
        console.log(err);
        this.ref.close(err);
      }
    });
  }
  close() {
    this.ref.close();
  }


}
