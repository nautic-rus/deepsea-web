import { Component, OnInit } from '@angular/core';
import {LanguageService} from "../../../domain/language.service";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {AuthManagerService} from "../../../domain/auth-manager.service";

@Component({
  selector: 'app-download-all-docs',
  templateUrl: './download-all-docs.component.html',
  styleUrls: ['./download-all-docs.component.css']
})
export class DownloadAllDocsComponent implements OnInit {

  ids: number[];
  email: string;
  constructor(public t: LanguageService, public conf: DynamicDialogConfig, public ref: DynamicDialogRef, public issue: IssueManagerService, public auth: AuthManagerService) { }

  ngOnInit(): void {
    this.ids = this.conf.data[0];
    this.email = this.auth.getUser().email;
  }
  close(){
    this.ref.close('exit');
  }

  download() {
    this.issue.downloadAllDocs(this.ids, this.auth.getUserName(this.auth.getUser().login), this.email).subscribe(res => {

    });
    this.ref.close('success');
  }
}
