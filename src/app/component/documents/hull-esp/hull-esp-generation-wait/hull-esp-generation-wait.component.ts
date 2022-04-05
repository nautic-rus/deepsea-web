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

  issue: Issue = new Issue();

  selectRevision = true;
  generationWait = false;

  resUrls: string[] = [];
  revs = ['-', '0', '1', '2', '3', '4', '5', 'A', 'B', 'C', 'D', 'E'];
  rev: string = this.revs[0];
  updateRevision = false;

  constructor(private auth: AuthManagerService, private issues: IssueManagerService, private route: ActivatedRoute, private router: Router, private s: SpecManagerService, public l: LanguageService, public conf: DynamicDialogConfig, public t: LanguageService, public ref: DynamicDialogRef) { }


  ngOnInit(): void {
    this.issue = this.conf.data;
    this.rev = this.issue.revision;
  }
  close(){
    this.ref.close('exit');
  }

  getEsp() {
    this.selectRevision = false;
    this.generationWait = true;
    let newRevision = this.rev;
    this.s.getHullEspFiles(this.issue.project.replace('NR', 'N'), this.issue.doc_number, this.issue.name, this.rev).then(res => {
      this.generationWait = false;
      this.resUrls.splice(0, this.resUrls.length);
      this.resUrls.push(res);
      let files: FileAttachment[] = [];

      if (!this.updateRevision){
        newRevision = this.issue.revision;
      }

      this.resUrls.forEach(fileUrl => {
        let file = new FileAttachment();
        file.url = fileUrl;
        file.revision = newRevision;
        file.author = this.auth.getUser().login;
        file.group = 'Part List';
        file.name = this.issue.doc_number + '.' + fileUrl.split('.').pop();
        files.push(file);
      });
      this.issues.clearRevisionFiles(this.issue.id, this.auth.getUser().login, 'Part List', this.issue.revision).then(() => {
        this.issues.setRevisionFiles(this.issue.id, newRevision, JSON.stringify(files)).then(() => {
          if (this.updateRevision){
            this.issue.revision = this.rev;
            this.issues.updateIssue(this.auth.getUser().login, 'hidden', this.issue).then(() => {
              let newFiles: FileAttachment[] = [];
              this.issue.revision_files.filter(x => x.group == 'Cutting Map' || x.group == 'Nesting Plates' || x.group == 'Nesting Profiles' || x.group == 'Profile Sketches').forEach(file => {
                let newFile = JSON.parse(JSON.stringify(file));
                newFile.revision = newRevision;
                newFiles.push(newFile);
              });
              this.issues.setRevisionFiles(this.issue.id, newRevision, JSON.stringify(newFiles)).then(res => {

              });
            });
          }
        });
      });
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
