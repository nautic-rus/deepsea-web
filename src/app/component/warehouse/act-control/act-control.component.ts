import { Component, OnInit } from '@angular/core';
import {DynamicDialogRef} from "primeng/dynamicdialog";
import {Rights} from "../../../domain/interfaces/rights";
import {Page} from "../../../domain/interfaces/page";

@Component({
  selector: 'app-act-control',
  templateUrl: './act-control.component.html',
  styleUrls: ['./act-control.component.css']
})
export class ActControlComponent implements OnInit {

  act: string = '';
  document: string = '';
  order: string = '';
  supplier: string = '';
  name: string = '';
  count: string = '';
  certificate: string = '';
  doc: string = '';
  remark: string = '';
  notes: string = '';
  orders: Rights[] = [];
  selectedOrders: string[] = [];
  calendarDay = new Date();

  constructor(public ref: DynamicDialogRef, ) { }

  ngOnInit(): void {
  }
  close() {
    this.ref.close();
  }

}
