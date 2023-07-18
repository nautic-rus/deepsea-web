import { Component, OnInit } from '@angular/core';
import {LanguageService} from "../../../../domain/language.service";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {UserService} from "../../user/user.service";
import {RoleService} from "../role.service";

@Component({
  selector: 'app-delete-role',
  templateUrl: './delete-role.component.html',
  styleUrls: ['./delete-role.component.css']
})
export class DeleteRoleComponent implements OnInit {

  constructor(public t: LanguageService, public ref: DynamicDialogRef, public conf: DynamicDialogConfig, public roleService: RoleService) { }

  ngOnInit(): void {
  }

  close(){
    this.ref.close('exit');
  }
  commit() {
    this.roleService.deleteRole(this.conf.data).subscribe({
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
