import { Component, OnInit } from '@angular/core';
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {Issue} from "../../../domain/classes/issue";
import {skipWhile} from "rxjs/operators";
import {FileAttachment} from "../../../domain/classes/file-attachment";
import _ from "underscore";
import {ClearFilesComponent} from "../hull-esp/clear-files/clear-files.component";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {UploadRevisionFilesComponent} from "../hull-esp/upload-revision-files/upload-revision-files.component";
import {LanguageService} from "../../../domain/language.service";

@Component({
  selector: 'app-upload-multiple-files',
  templateUrl: './upload-multiple-files.component.html',
  styleUrls: ['./upload-multiple-files.component.css']
})
export class UploadMultipleFilesComponent implements OnInit {

  issue: Issue;
  fileGroups: any[] = [];
  hullFileGroups = [
    {
      name: 'Drawings',
      icon: 'assets/icons/drawings.svg',
      collapsed: false,
      need_rights: false
    },
    {
      name: 'Part List',
      icon: 'assets/icons/files.svg',
      collapsed: false,
      need_rights: false
    },
    {
      name: 'Cutting Map',
      icon: 'assets/icons/cutting.svg',
      collapsed: true,
      need_rights: false
    },
    {
      name: 'Nesting Plates',
      icon: 'assets/icons/cutting.svg',
      collapsed: true,
      need_rights: false
    },
    {
      name: 'Nesting Profiles',
      icon: 'assets/icons/cutting.svg',
      collapsed: true,
      need_rights: false
    },
    {
      name: 'Profile Sketches',
      icon: 'assets/icons/cutting.svg',
      collapsed: true,
      need_rights: false
    },
    {
      name: 'Bending Templates',
      icon: 'assets/icons/cutting.svg',
      collapsed: true,
      need_rights: false
    },
    {
      name: 'Other',
      icon: 'assets/icons/cutting.svg',
      collapsed: true,
      need_rights: false
    },
    {
      name: 'Correction',
      icon: 'assets/icons/cutting.svg',
      collapsed: true,
      need_rights: false
    }
  ];
  isCorrection = false;
  isSendNotification = true;
  revs = ['-', '0', '1', '2', '3', '4', '5', 'A', 'B', 'C', 'D', 'E', 'F'];
  rev = '-';
  changeRev = true;
  comment = '';
  loaded: FileAttachment[] = [];

  constructor(public conf: DynamicDialogConfig, private dialogService: DialogService, public issueManager: IssueManagerService, public auth: AuthManagerService, public ref: DynamicDialogRef, public t: LanguageService) {
    this.issue = conf.data[0];
    this.rev = this.issue.revision;
    this.changeRev = this.issue.issue_type != 'PDSP';
    switch (this.issue.department) {
      default: this.fileGroups = this.hullFileGroups;
    }
  }
  getRevisionFilesOfGroup(fileGroup: string): FileAttachment[] {
    let files = this.loaded.filter(x => (x.group == fileGroup || fileGroup == 'all'));
    return _.sortBy(files, x => x.upload_date).reverse();
  }
  ngOnInit(): void {
  }

  addFilesToGroup(name: string) {
    this.dialogService.open(UploadRevisionFilesComponent, {
      showHeader: false,
      modal: true,
      data: [this.issue.id, name, true, false]
    }).onClose.subscribe(res => {
      this.issueManager.getIssueDetails(this.issue.id).then(issue => {
        this.issue = issue;
      });
      if (res != 'exit'){
        this.loaded = this.loaded.concat(res);
      }
    });
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
  getDate(dateLong: number): string{
    if (dateLong == 0){
      return '--/--/----';
    }
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
  }
  trimFileName(input: string, length: number = 10): string{
    let split = input.split('.');
    let name = split[0];
    let extension = split[1];
    if (name.length > length){
      return name.substr(0, length - 2) + '..' + name.substr(name.length - 2, 2) + '.' + extension;
    }
    else{
      return input;
    }
  }
  openFile(file: FileAttachment) {
    window.open(file.url, '_blank');
  }
  deleteFile(file: FileAttachment){
    this.loaded.splice(this.loaded.indexOf(file), 1);
  }

  close() {
    this.ref.close();
  }

  commit() {
    if (this.issue.revision != this.rev){
      this.issue.revision = this.rev;
      this.issueManager.updateIssue(this.auth.getUser().login, 'hidden', this.issue).then(() => {});
    }
    this.issueManager.setRevisionFiles(this.issue.id, 'PROD', JSON.stringify(this.loaded)).then(() => {
      this.issueManager.notifyDocUpload(this.issue.id, this.isCorrection ? 'correction' : 'common', this.comment).subscribe(res => {
        this.ref.close();
      });
    });
  }

  clearFilesOfGroup(name: string) {
    this.loaded = this.loaded.filter(x => x.group != name);
  }
}
