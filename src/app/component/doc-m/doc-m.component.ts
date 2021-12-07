import { Component, OnInit} from '@angular/core';
import {Issue} from "../../domain/classes/issue";
import {LanguageService} from "../../domain/language.service";
import {IssueManagerService} from "../../domain/issue-manager.service";
import {AuthManagerService} from "../../domain/auth-manager.service";
import _ from "underscore";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-doc-m',
  templateUrl: './doc-m.component.html',
  styleUrls: ['./doc-m.component.css']
})
export class DocMComponent implements OnInit {

  issue: Issue = new Issue();

  constructor(public route: ActivatedRoute, public t: LanguageService, public issues: IssueManagerService, public auth: AuthManagerService) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      let id = params.id ? params.id : 0;
      this.issues.getIssueDetails(id).then(res => {
        this.issue = res;
      });
    });
  }

  commit() {
  }

  close() {
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
}
