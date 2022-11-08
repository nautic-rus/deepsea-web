import { Component, OnInit } from '@angular/core';
import {LanguageService} from "../../../domain/language.service";
import {SpecManagerService} from "../../../domain/spec-manager.service";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {MaterialManagerService} from "../../../domain/material-manager.service";

@Component({
  selector: 'app-remove-weight',
  templateUrl: './remove-weight.component.html',
  styleUrls: ['./remove-weight.component.css']
})
export class RemoveWeightComponent implements OnInit {


  constructor(public m: MaterialManagerService, public t: LanguageService, public s: SpecManagerService, public ref: DynamicDialogRef, public auth: AuthManagerService, public conf: DynamicDialogConfig) { }

  ngOnInit(): void {
  }
  close(){
    this.ref.close('exit');
  }
  commit() {
    this.m.removeWeightControl(this.conf.data, this.auth.getUser().login).then(res => {
      this.ref.close('success');
    });
  }

}
