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
      collapsed: false,
      need_rights: false
    },
    {
      name: 'Nesting Plates',
      icon: 'assets/icons/cutting.svg',
      collapsed: false,
      need_rights: false
    },
    {
      name: 'Nesting Profiles',
      icon: 'assets/icons/cutting.svg',
      collapsed: false,
      need_rights: false
    },
    {
      name: 'Profile Sketches',
      icon: 'assets/icons/cutting.svg',
      collapsed: false,
      need_rights: false
    },
    {
      name: 'Bending Templates',
      icon: 'assets/icons/cutting.svg',
      collapsed: false,
      need_rights: false
    },
    {
      name: 'Other',
      icon: 'assets/icons/cutting.svg',
      collapsed: false,
      need_rights: false
    },
    {
      name: 'Correction',
      icon: 'assets/icons/cutting.svg',
      collapsed: false,
      need_rights: false
    }
  ];
  pipeFileGroups = [
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
      name: 'Pipe Spools',
      icon: 'assets/icons/cutting.svg',
      collapsed: false,
      need_rights: false
    },
    {
      name: 'Spool Models',
      icon: 'assets/icons/cutting.svg',
      collapsed: false,
      need_rights: false
    },
    {
      name: 'Other',
      icon: 'assets/icons/cutting.svg',
      collapsed: false,
      need_rights: false
    },
    {
      name: 'Correction',
      icon: 'assets/icons/cutting.svg',
      collapsed: false,
      need_rights: false
    }
  ];
  elecFileGroups = [
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
      name: 'Other',
      icon: 'assets/icons/cutting.svg',
      collapsed: false,
      need_rights: false
    },
    {
      name: 'Correction',
      icon: 'assets/icons/cutting.svg',
      collapsed: false,
      need_rights: false
    }
  ];
  generalFileGroups = [
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
      name: 'Other',
      icon: 'assets/icons/cutting.svg',
      collapsed: false,
      need_rights: false
    },
    {
      name: 'Correction',
      icon: 'assets/icons/cutting.svg',
      collapsed: false,
      need_rights: false
    }
  ];
  isCorrection = false;
  isSendNotification = true;
  closeTask = false;
  revs = ['-', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10','11','12','13','14','15','16','17','18','19','20', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
  rev = '-';
  changeRev = true;
  comment = '';
  loaded: FileAttachment[] = [];
  awaitForLoad: any[] = [];
  dragFileGroup: string = '';

  constructor(public conf: DynamicDialogConfig, private dialogService: DialogService, public issueManager: IssueManagerService, public auth: AuthManagerService, public ref: DynamicDialogRef, public t: LanguageService) {
    this.issue = conf.data[0];
    this.rev = this.issue.revision;
    this.changeRev = this.issue.issue_type != 'PDSP';
    let dep = this.issue.department;
    if (this.issue.assistant != '' && this.issue.assistant != dep){
      dep = this.issue.assistant;
    }
    switch (dep) {
      case 'Hull': this.fileGroups = this.hullFileGroups; break;
      case 'System': this.fileGroups = this.pipeFileGroups; break;
      case 'Electric': this.fileGroups = this.elecFileGroups; break;
      case 'General': this.fileGroups = this.generalFileGroups; break;
      default: this.fileGroups = this.generalFileGroups; break;
    }
  }
  getRevisionFilesOfGroup(fileGroup: string): FileAttachment[] {
    let files = this.loaded.filter(x => (x.group == fileGroup || fileGroup == 'all'));
    return _.sortBy(files, x => x.upload_date).reverse();
  }
  ngOnInit(): void {
  }
  reformatFileName(name: string, fileGroup: string){
    let result = name;
    if (fileGroup == 'Drawings'){
      //result = this.issue.doc_number + name.split('.').pop();
    }
    if (fileGroup == 'Nesting Plates'){
      result = 'N-' + name.replace('_0_', '_').split('_').join('-');
    }
    if (fileGroup == 'Nesting Profiles'){
      if (name.includes('.pdf')){
        //result = 'Nesting Profiles' + '.pdf';
      }
      else{
        result = 'P-' + name.split('_').join('-');
      }
    }
    if (fileGroup == 'Profile Sketches' && !name.includes('.txt')){
      if (name.includes('.pdf')){
        //result = 'Profile Sketches' + '.pdf';
      }
      else{
        result = name.split('_').join('-');
      }
    }
    if (fileGroup == 'Cutting Map' && !name.includes('C-')){
      result = 'C-' + this.issue.project.replace('NR', 'N') + '-' + name.split('_')[0] + '-' + name.split('_')[1] + '.txt';
      if (name.includes('rev')){
        result = 'C-' + this.issue.project.replace('NR', 'N') + '-' + name.split('_')[0] + '-' + name.split('_')[1]  + '-' + name.split('_')[3];
      }
    }
    return result.replace('-rev', '_rev');
  }
  handleFileInput(files: FileList | null, fileGroup: string) {
    if (files != null){
      for (let x = 0; x < files.length; x++){
        let file = files.item(x);
        if (file != null){
          let fileName = this.reformatFileName(file.name, fileGroup);
          // @ts-ignore
          const find = this.loaded.find(x => x.name == fileName);
          if (find != null){
            this.loaded.splice(this.loaded.indexOf(find), 1);
          }
          this.awaitForLoad.push(fileName);
        }
      }
      for (let x = 0; x < files.length; x++){
        let file = files.item(x);
        if (file != null){
          let fileName = this.reformatFileName(file.name, fileGroup);
          this.issueManager.uploadFile(file, this.auth.getUser().login, fileName).then(res => {
            res.group = fileGroup;
            this.loaded.push(res);
            console.log(this.loaded);
          });
        }
      }
    }
  }
  onFilesDrop(event: DragEvent, fileGroup: string) {
    event.preventDefault();
    // @ts-ignore
    this.handleFileInput(event.dataTransfer.files, fileGroup);
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
    if (this.closeTask){
      this.issue.status = 'Delivered';
      this.issue.action = this.issue.status;
      this.issueManager.updateIssue(this.auth.getUser().login, 'status', this.issue).then(() => {
        this.ref.close();
      });
    }
    if (this.issue.revision != this.rev){
      this.issue.revision = this.rev;
      this.issueManager.updateIssue(this.auth.getUser().login, 'hidden', this.issue).then(() => {
        this.issueManager.setRevisionFiles(this.issue.id, 'PROD', JSON.stringify(this.loaded)).then(() => {
          if (this.isSendNotification){
            this.issueManager.notifyDocUpload(this.issue.id, this.isCorrection ? 'correction' : 'common', this.comment, this.loaded.length).subscribe(res => {
              this.ref.close();
            });
          }
          else {
            this.ref.close();
          }
        });
      });
    }
    else {
      this.issueManager.setRevisionFiles(this.issue.id, 'PROD', JSON.stringify(this.loaded)).then(() => {
        if (this.isSendNotification){
          this.issueManager.notifyDocUpload(this.issue.id, this.isCorrection ? 'correction' : 'common', this.comment, this.loaded.length).subscribe(res => {
            this.ref.close();
          });
        }
        else {
          this.ref.close();
        }
      });
    }
  }

  clearFilesOfGroup(name: string) {
    this.loaded = this.loaded.filter(x => x.group != name);
  }

  dragEnter(event: DragEvent, name: string) {
    this.dragFileGroup = name;
  }

  dragLeave(event: DragEvent, name: string) {
    this.dragFileGroup = '';
  }
}
