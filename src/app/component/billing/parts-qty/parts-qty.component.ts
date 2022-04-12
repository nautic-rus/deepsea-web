import { Component, OnInit } from '@angular/core';
import {DynamicDialogRef} from "primeng/dynamicdialog";
import {Issue} from "../../../domain/classes/issue";
import {LanguageService} from "../../../domain/language.service";

@Component({
  selector: 'app-parts-qty',
  templateUrl: './parts-qty.component.html',
  styleUrls: ['./parts-qty.component.css']
})
export class PartsQtyComponent implements OnInit {
  plates: any[] = [];
  parts: any[] = [];
  filters:  { part_number: any[],  block: any[], material_name: any[] } = { part_number: [], block: [], material_name: [] };

  constructor(public ref: DynamicDialogRef, public t: LanguageService) { }

  ngOnInit(): void {
  }
  close() {
    this.ref.close();
  }
}
