import { Component, OnInit } from '@angular/core';
import {LanguageService} from "../../../../domain/language.service";
import {SpecManagerService} from "../../../../domain/spec-manager.service";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {AuthManagerService} from "../../../../domain/auth-manager.service";

@Component({
  selector: 'app-checked-confirmation',
  templateUrl: './checked-confirmation.component.html',
  styleUrls: ['./checked-confirmation.component.css']
})
export class CheckedConfirmationComponent implements OnInit {

  constructor(public t: LanguageService, public s: SpecManagerService, public ref: DynamicDialogRef, public auth: AuthManagerService, public conf: DynamicDialogConfig) { }

  project = '';
  id = 0;

  ngOnInit(): void {
    this.project = this.conf.data[0];
    this.id = this.conf.data[1];
  }
  close(){
    this.ref.close('exit');
  }
  commit() {
    this.s.updateStatusEqFoundations(this.project, this.id, this.auth.getUser().login).then(res => {
      this.ref.close('success');
    });
  }

}
