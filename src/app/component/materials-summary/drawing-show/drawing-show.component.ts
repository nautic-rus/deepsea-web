import { Component, OnInit } from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {LanguageService} from "../../../domain/language.service";
import {User} from "../../../domain/classes/user";
import {AuthManagerService} from "../../../domain/auth-manager.service";

@Component({
  selector: 'app-drawing-show',
  templateUrl: './drawing-show.component.html',
  styleUrls: ['./drawing-show.component.css']
})
export class DrawingShowComponent implements OnInit {

  material: any;
  drawing: any;

  constructor(public ref: DynamicDialogRef, public t: LanguageService, private conf: DynamicDialogConfig, public auth: AuthManagerService) { }

  ngOnInit(): void {
    this.drawing = this.conf.data[0];
    console.log(this.drawing);
  }

  close() {
    this.ref.close();
  }
  round(input: number, digit = 100) {
    return Math.round(input * digit) / digit;
  }
  getDate(dateLong: number): string{
    if (dateLong == 0){
      return '--/--/----';
    }
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
  }
  getUser(author: string) {
    return this.auth.getUserName(author);
  }

}
