import {Component, OnInit} from '@angular/core';
import {LanguageService} from "../../../../domain/language.service";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {UserService} from "../../user/user.service";
import {ProjectService} from "../project.service";

@Component({
  selector: 'app-delete-project',
  templateUrl: './delete-project.component.html',
  styleUrls: ['./delete-project.component.css']
})
export class DeleteProjectComponent implements OnInit {

  constructor(public t: LanguageService, public ref: DynamicDialogRef, public conf: DynamicDialogConfig, public projectService: ProjectService, public userService: UserService) {
  }

  ngOnInit(): void {
  }

  close() {
    this.ref.close('exit');
  }

  commit() {
    this.projectService.deleteProject(this.conf.data).subscribe({
      next: res => {
        console.log(res);
        // this.userService.deleteUsersProject(this.conf.data).subscribe({
        //   next: res => {
        //     console.log(res);
        //     this.ref.close('success');
        //   },
        //   error: err => {
        //     console.log(err);
        //     this.ref.close('error');
        //   }
        // })
        this.ref.close('success');
      },
      error: err => {
        console.log(err);
        this.ref.close('error');
      }
    })
  }
}
