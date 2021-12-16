import {ApplicationRef, Component, OnInit} from '@angular/core';
import {LanguageService} from "../../../domain/language.service";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {Issue} from "../../../domain/classes/issue";
import {TaskComponent} from "../../task/task.component";
import _ from "underscore";
import {QrCodeComponent} from "ng-qrcode";
import * as props from '../../../props';
import {timeout} from "rxjs/operators";
import { Clipboard } from '@angular/cdk/clipboard';
import {Router} from "@angular/router";


@Component({
  selector: 'app-view-document',
  templateUrl: './view-document.component.html',
  styleUrls: ['./view-document.component.css']
})
export class ViewDocumentComponent implements OnInit {
  issue: Issue = new Issue();
  qrCodeValue: any;

  constructor(public t: LanguageService, public issues: IssueManagerService, public auth: AuthManagerService, public ref: DynamicDialogRef, private router: Router, public conf: DynamicDialogConfig, private dialogService: DialogService, public issueManager: IssueManagerService) {
    this.issue = this.conf.data;
    this.qrCodeValue = (props.baseUrl + 'doc-m/?id=' + this.issue.id).toString();
  }

  ngOnInit(): void {

  }

  commit() {
    this.ref.close();
  }

  close() {
    this.ref.close();
  }

  getRevisionFiles(revision: string) {
    return this.issue.revision_files.filter(x => x.revision == revision);
  }
  openFile(url: string) {
    window.open(url);
  }
  getFileExtensionIcon(file: string) {
    switch (file.toLowerCase().split('.').pop()){
      case 'pdf': return 'pdf.svg';
      case 'dwg': return 'dwg.svg';
      case 'xls': return 'xls.svg';
      case 'xlsx': return 'xls.svg';
      case 'doc': return 'doc.svg';
      case 'docx': return 'doc.svg';
      case 'png': return 'png.svg';
      case 'jpg': return 'jpg.svg';
      case 'txt': return 'txt.svg';
      case 'zip': return 'zip.svg';
      case 'mp4': return 'mp4.svg';
      default: return 'file.svg';
    }
  }
  trimFileName(input: string, length: number = 9): string{
    let split = input.split('.');
    let name = split[0];
    let extension = split[1];
    if (input.length > length){
      return name.substr(0, length) + '...' + name.substr(name.length - 2, 2) + '.' + extension;
    }
    else{
      return input;
    }
  }
  getDate(dateLong: number): string{
    if (dateLong == 0){
      return '--/--/----';
    }
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
  }
  showOlderRevisions(){
    return _.uniq(this.issue.revision_files.map(x => x.revision)).length > 1;
  }
  getOlderRevisions(){
    let res: any[] = [];
    _.sortBy(_.uniq(this.issue.revision_files.map(x => x.revision))).forEach(rev => {
      if (rev != this.issue.revision){
        res.push({
          name: rev,
          files: this.issue.revision_files.filter(x => x.revision == rev)
        });
      }
    });
    return res;
  }

  getESP() {
    let foranProject = this.issue.project.replace('NR', 'N');
    let docNumber = this.issue.doc_number;
    if (this.issue.department == 'Hull'){
      this.router.navigate(['hull-esp'], {queryParams: {project: foranProject, docNumber: docNumber}})
    }
    this.ref.close();
  }
}
