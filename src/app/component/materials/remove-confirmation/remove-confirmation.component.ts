import { Component, OnInit } from '@angular/core';
import {LanguageService} from "../../../domain/language.service";
import {DynamicDialogRef} from "primeng/dynamicdialog";

@Component({
  selector: 'app-remove-confirmation',
  templateUrl: './remove-confirmation.component.html',
  styleUrls: ['./remove-confirmation.component.css']
})
export class RemoveConfirmationComponent implements OnInit {

  constructor(public t: LanguageService, public ref: DynamicDialogRef) { }

  ngOnInit(): void {
  }
  close(){
    this.ref.close('exit');
  }
  commit() {
    this.ref.close('success');
  }

}
