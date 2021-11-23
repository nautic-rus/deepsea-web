import { Component, OnInit } from '@angular/core';
import {LanguageService} from "../../../domain/language.service";
import {DynamicDialogRef} from "primeng/dynamicdialog";

@Component({
  selector: 'app-confirm-already-exist-send-to-yard',
  templateUrl: './confirm-already-exist-send-to-yard.component.html',
  styleUrls: ['./confirm-already-exist-send-to-yard.component.css']
})
export class ConfirmAlreadyExistSendToYardComponent implements OnInit {

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
