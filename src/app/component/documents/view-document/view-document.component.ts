import {ApplicationRef, Component, OnInit} from '@angular/core';
import {LanguageService} from "../../../domain/language.service";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {Issue} from "../../../domain/classes/issue";
import {TaskComponent} from "../../task/task.component";
import _ from "underscore";

@Component({
  selector: 'app-view-document',
  templateUrl: './view-document.component.html',
  styleUrls: ['./view-document.component.css']
})
export class ViewDocumentComponent implements OnInit {
  issue: Issue = new Issue();

  constructor(public t: LanguageService, public issues: IssueManagerService, public auth: AuthManagerService, public ref: DynamicDialogRef, private appRef: ApplicationRef, public conf: DynamicDialogConfig, private dialogService: DialogService) {
    this.issue = conf.data;
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
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "-" + ('0' + (date.getMonth() + 1)).slice(-2) + "-" + date.getFullYear();
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
