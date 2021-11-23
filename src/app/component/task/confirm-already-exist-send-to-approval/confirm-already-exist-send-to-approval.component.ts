import { Component, OnInit } from '@angular/core';
import {LanguageService} from "../../../domain/language.service";
import {DynamicDialogRef} from "primeng/dynamicdialog";

@Component({
  selector: 'app-confirm-already-exist-send-to-approval',
  templateUrl: './confirm-already-exist-send-to-approval.component.html',
  styleUrls: ['./confirm-already-exist-send-to-approval.component.css']
})
export class ConfirmAlreadyExistSendToApprovalComponent implements OnInit {

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
