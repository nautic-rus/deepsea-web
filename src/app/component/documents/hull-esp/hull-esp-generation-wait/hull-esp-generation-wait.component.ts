import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {SpecManagerService} from "../../../../domain/spec-manager.service";
import {LanguageService} from "../../../../domain/language.service";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {Issue} from "../../../../domain/classes/issue";
import {IssueManagerService} from "../../../../domain/issue-manager.service";
import {AuthManagerService} from "../../../../domain/auth-manager.service";
import {FileAttachment} from "../../../../domain/classes/file-attachment";

@Component({
  selector: 'app-hull-esp-generation-wait',
  templateUrl: './hull-esp-generation-wait.component.html',
  styleUrls: ['./hull-esp-generation-wait.component.css']
})
export class HullEspGenerationWaitComponent implements OnInit {
  project: string = '';
  docNumber: string = '';
  issue: Issue = new Issue();
  selectRevision = false;

  generationWait = false;

  resUrls: string[] = [];
  revs = ['0', '1', '2', '3', '4', '5'];
  rev: string = this.revs[0];

  constructor(private auth: AuthManagerService, private issues: IssueManagerService, private route: ActivatedRoute, private router: Router, private s: SpecManagerService, public l: LanguageService, public conf: DynamicDialogConfig, public t: LanguageService, public ref: DynamicDialogRef) { }


  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.project = this.conf.data[0];
      this.docNumber =  this.conf.data[1];
      this.issue = this.conf.data[3];
      this.selectRevision = this.conf.data[2];
      this.revs = this.revs.filter(x => x > this.issue.revision);
      this.rev = this.revs[0];
      if (!this.selectRevision){
        this.getEsp('');
      }
    });
  }
  close(){
    this.ref.close('exit');
  }

  getEsp(rev: string) {
    this.selectRevision = false;
    this.generationWait = true;
    this.s.getHullEspFiles(this.project, this.docNumber, rev).then(res => {
      this.generationWait = false;
      this.resUrls.splice(0, this.resUrls.length);
      this.resUrls.push(res);
      if (rev != ''){
        let files: FileAttachment[] = [];
        this.resUrls.forEach(fileUrl => {
          let file = new FileAttachment();
          file.url = fileUrl;
          file.revision = this.rev;
          file.author = this.auth.getUser().login;
          file.group = 'Drawings';
          file.name = this.docNumber + '.' + fileUrl.split('.').pop();
          files.push(file);
        });

        this.issues.setRevisionFiles(this.issue.id, rev, JSON.stringify(files)).then(() => {
          this.issue.revision = rev;
          this.issues.updateIssue(this.auth.getUser().login, 'hidden', this.issue);
        });
      }
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