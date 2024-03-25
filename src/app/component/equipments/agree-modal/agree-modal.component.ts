import { Component, OnInit } from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";

@Component({
  selector: 'app-agree-modal',
  templateUrl: './agree-modal.component.html',
  styleUrls: ['./agree-modal.component.css']
})
export class AgreeModalComponent implements OnInit {

  //title: string = this.conf.data.title;
  //filesArray = this.conf.data.filesArray
  constructor(public conf: DynamicDialogConfig, public ref: DynamicDialogRef) { }

  ngOnInit(): void {
  }

  onConfirm(): void {
    this.ref.close(true);
  }

  onCancel(): void {
    this.ref.close(false);
  }

}
