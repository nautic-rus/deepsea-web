import { Component, OnInit } from '@angular/core';
import {DynamicDialogRef} from "primeng/dynamicdialog";
import {any} from "underscore";
import {LanguageService} from "../../../domain/language.service";

@Component({
  selector: 'app-laboriousness',
  templateUrl: './laboriousness.component.html',
  styleUrls: ['./laboriousness.component.css']
})
export class LaboriousnessComponent implements OnInit {

  hoursAmount = '';
  calendarDay = '';
  comment = '';
  today: Date = new Date();
  constructor(public t: LanguageService, public ref: DynamicDialogRef) { }

  ngOnInit(): void {
  }

  close() {
    this.ref.close();
  }
}
