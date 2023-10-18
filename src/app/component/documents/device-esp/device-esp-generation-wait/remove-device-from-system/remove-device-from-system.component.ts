import { Component, OnInit } from '@angular/core';
import {MaterialManagerService} from "../../../../../domain/material-manager.service";
import {LanguageService} from "../../../../../domain/language.service";
import {SpecManagerService} from "../../../../../domain/spec-manager.service";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {AuthManagerService} from "../../../../../domain/auth-manager.service";

@Component({
  selector: 'app-remove-device-from-system',
  templateUrl: './remove-device-from-system.component.html',
  styleUrls: ['./remove-device-from-system.component.css']
})
export class RemoveDeviceFromSystemComponent implements OnInit {

  constructor(public m: MaterialManagerService, public t: LanguageService, public s: SpecManagerService, public ref: DynamicDialogRef, public auth: AuthManagerService, public conf: DynamicDialogConfig) { }

  ngOnInit(): void {
    //      data: [this.docNumber, device.material.code, device.units, device.count, device.userId, '']
  }

  close(){
    this.ref.close('exit');
  }
  commit() {
    console.log(this.conf.data[0], this.conf.data[1], this.conf.data[2], this.conf.data[3], this.conf.data[4]);
    this.s.removeDeviceFromSystem(this.conf.data[0], this.conf.data[1], this.conf.data[2], this.conf.data[3], this.conf.data[4], '', '').then(res => {
      this.ref.close('success');
    });
  }

}
