import { Component, OnInit } from '@angular/core';
import {DynamicDialogRef} from "primeng/dynamicdialog";
import {LanguageService} from "../../../domain/language.service";
import {MessageService} from "primeng/api";

@Component({
  selector: 'app-filter-name',
  templateUrl: './filter-name.component.html',
  styleUrls: ['./filter-name.component.css']
})
export class FilterNameComponent implements OnInit {

  name: string = '';

  constructor(public dialogRef: DynamicDialogRef, public t: LanguageService, private messageService: MessageService) {}

  ngOnInit(): void {
  }

  cancel() {
    this.dialogRef.close()
  }

  close() {
    this.dialogRef.close(this.name);
  }

}
