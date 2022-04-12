import { Component, OnInit } from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {Issue} from "../../../domain/classes/issue";
import {LanguageService} from "../../../domain/language.service";
import {SpecManagerService} from "../../../domain/spec-manager.service";
import _ from "underscore";

@Component({
  selector: 'app-parts-qty',
  templateUrl: './parts-qty.component.html',
  styleUrls: ['./parts-qty.component.css']
})
export class PartsQtyComponent implements OnInit {
  plates: any[] = [];
  parts: any[] = [];
  filters:  { part_number: any[],  block: any[], material_name: any[] } = { part_number: [], block: [], material_name: [] };
  plate: any;
  project = '';

  constructor(public ref: DynamicDialogRef, public t: LanguageService, private conf: DynamicDialogConfig, public s: SpecManagerService) {

  }

  ngOnInit(): void {
    this.project = this.conf.data[0];
    this.plate = this.conf.data[1];
    this.s.hullPlates(this.project, this.plate.mat, this.plate.scantling.split('x')[0]).then(res => {
      this.parts = _.sortBy(res, x => x.code);
    });
  }
  close() {
    this.ref.close();
  }
}
