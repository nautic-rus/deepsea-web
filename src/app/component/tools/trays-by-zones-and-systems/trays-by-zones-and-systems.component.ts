import { Component, OnInit } from '@angular/core';
import {Issue} from "../../../domain/classes/issue";
import {DynamicDialogConfig} from "primeng/dynamicdialog";

@Component({
  selector: 'app-trays-by-zones-and-systems',
  templateUrl: './trays-by-zones-and-systems.component.html',
  styleUrls: ['./trays-by-zones-and-systems.component.css']
})
export class TraysByZonesAndSystemsComponent implements OnInit {

  trays: any = [];
  constructor(public conf: DynamicDialogConfig) { }

  ngOnInit(): void {
    this.trays = this.conf.data;
  }

}
