import { Component, OnInit } from '@angular/core';
import {LanguageService} from "../../../domain/language.service";
import {DynamicDialogRef} from "primeng/dynamicdialog";

@Component({
  selector: 'app-untie',
  templateUrl: './untie.component.html',
  styleUrls: ['./untie.component.css']
})
export class UntieComponent implements OnInit {

  constructor(public t: LanguageService, public ref: DynamicDialogRef) { }

  ngOnInit(): void {
  }
  close(){
    this.ref.close('exit');
  }


}
