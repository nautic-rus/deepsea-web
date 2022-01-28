import { Component, OnInit } from '@angular/core';
import {LanguageService} from "../../../../domain/language.service";
import {DynamicDialogRef} from "primeng/dynamicdialog";

@Component({
  selector: 'app-clear-files',
  templateUrl: './clear-files.component.html',
  styleUrls: ['./clear-files.component.css']
})
export class ClearFilesComponent implements OnInit {

  constructor(public t: LanguageService, public ref: DynamicDialogRef) { }

  ngOnInit(): void {
  }
  close(){
    this.ref.close('exit');
  }
  commit() {
    this.ref.close('success');
  }
}
