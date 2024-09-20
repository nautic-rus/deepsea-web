import { Component, OnInit } from '@angular/core';
import {Issue} from "../../../../domain/classes/issue";
import {AuthManagerService} from "../../../../domain/auth-manager.service";
import {IssueManagerService} from "../../../../domain/issue-manager.service";
import {ActivatedRoute, Router} from "@angular/router";
import {SpecManagerService} from "../../../../domain/spec-manager.service";
import {LanguageService} from "../../../../domain/language.service";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {FileAttachment} from "../../../../domain/classes/file-attachment";

@Component({
  selector: 'app-accommodations-esp-generation-wait',
  templateUrl: './accommodations-esp-generation-wait.component.html',
  styleUrls: ['./accommodations-esp-generation-wait.component.css']
})
export class AccommodationsEspGenerationWaitComponent implements OnInit {

  issue: Issue = new Issue();

  selectRevision = true;
  generationWait = false;

  resUrls: string[] = [];
  revs = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'NO REV'];
  rev: string = this.revs[0];
  langs = ['en', 'ru'];
  lang = this.langs[0];
  updateRevision = false;

  constructor(private auth: AuthManagerService, private issues: IssueManagerService, private route: ActivatedRoute, private router: Router, private s: SpecManagerService, public l: LanguageService, public conf: DynamicDialogConfig, public t: LanguageService, public ref: DynamicDialogRef) { }


  ngOnInit(): void {
    this.issue = this.conf.data.issue;
  }
  close(){
    this.ref.close('exit');
  }

  getEsp() {
    this.selectRevision = false;
    this.generationWait = true;
    this.s.getAccommodationsEspFiles(this.issue.doc_number, this.rev, this.lang).then(res => {
      this.generationWait = false;
      this.resUrls.splice(0, this.resUrls.length);
      this.resUrls.push(res);
      let files: FileAttachment[] = [];

      this.resUrls.forEach(fileUrl => {
        let file = new FileAttachment();
        file.url = fileUrl;
        file.revision = this.rev;
        file.author = this.auth.getUser().login;
        file.group = 'Part List';
        file.name = this.issue.doc_number + '.' + fileUrl.split('.').pop();
        file.name = this.issue.doc_number + '_rev' + this.rev + '.' + fileUrl.split('.').pop();
        files.push(file);
      });

      // this.issues.updateIssue(this.auth.getUser().login, 'hidden', this.issue).then(() => {
      //   this.issues.clearRevisionFiles(this.issue.id, this.auth.getUser().login, 'Part List', 'PROD').then(() => {
      //     this.issues.setRevisionFiles(this.issue.id, 'PROD', JSON.stringify(files)).then(res => {
      //
      //     });
      //   });
      // });
    });
  }

  getFileName(file: string) {
    return file.split('/').pop();
  }

  openFile(file: string) {
    window.open(file);
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
  getDate(dateLong: number): string{
    if (dateLong == 0){
      return '--/--/----';
    }
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
  }
}
