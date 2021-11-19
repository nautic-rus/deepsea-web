import { Component, OnInit } from '@angular/core';
import {LanguageService} from "../../../domain/language.service";
import {DynamicDialogRef} from "primeng/dynamicdialog";

@Component({
  selector: 'app-confirm-already-exist',
  templateUrl: './confirm-already-exist.component.html',
  styleUrls: ['./confirm-already-exist.component.css']
})
export class ConfirmAlreadyExistComponent implements OnInit {

  constructor(public t: LanguageService, private ref: DynamicDialogRef) { }

  ngOnInit(): void {
  }
  yes(){
    this.ref.close('yes');
  }
  no(){
    this.ref.close('no');
  }
}
