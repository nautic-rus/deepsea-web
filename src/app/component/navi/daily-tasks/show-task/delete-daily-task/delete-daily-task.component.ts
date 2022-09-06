import { Component, OnInit } from '@angular/core';
import {DynamicDialogRef} from "primeng/dynamicdialog";
import {LanguageService} from "../../../../../domain/language.service";

@Component({
  selector: 'app-delete-daily-task',
  templateUrl: './delete-daily-task.component.html',
  styleUrls: ['./delete-daily-task.component.css']
})
export class DeleteDailyTaskComponent implements OnInit {

  constructor(public ref: DynamicDialogRef, public t: LanguageService) { }

  ngOnInit(): void {
  }

  delete() {
    this.ref.close('success');
  }

  cancel() {
    this.ref.close('cancel');
  }
}
