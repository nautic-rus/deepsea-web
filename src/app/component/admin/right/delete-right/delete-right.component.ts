import { Component, OnInit } from '@angular/core';
import {LanguageService} from "../../../../domain/language.service";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {UserService} from "../../user/user.service";
import {RightService} from "../right.service";

@Component({
  selector: 'app-delete-right',
  templateUrl: './delete-right.component.html',
  styleUrls: ['./delete-right.component.css']
})
export class DeleteRightComponent implements OnInit {

  constructor(public t: LanguageService, public ref: DynamicDialogRef, public conf: DynamicDialogConfig, public rightService: RightService) { }

  ngOnInit(): void {
  }

  close(){
    this.ref.close('exit');
  }
  commit() {
    this.rightService.deleteRight(this.conf.data).subscribe({
      next: res => {
        console.log(res);
        this.ref.close('success');
      },
      error: err => {
        console.log(err);
        this.ref.close('error');
      }
    });
  }


}
