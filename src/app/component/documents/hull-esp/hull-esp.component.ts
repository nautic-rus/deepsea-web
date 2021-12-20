import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {SpecManagerService} from "../../../domain/spec-manager.service";
import {LanguageService} from "../../../domain/language.service";
import {Issue} from "../../../domain/classes/issue";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {SendToCloudComponent} from "../../task/send-to-cloud/send-to-cloud.component";
import {DialogService} from "primeng/dynamicdialog";
import {UploadRevisionFilesComponent} from "./upload-revision-files/upload-revision-files.component";

@Component({
  selector: 'app-hull-esp',
  templateUrl: './hull-esp.component.html',
  styleUrls: ['./hull-esp.component.css']
})
export class HullEspComponent implements OnInit {
  parts: any = [];
  noResult = false;
  docNumber = '';
  project = '';
  department = '';
  issueId = 0;
  selectedTab = 'files';
  issue: Issue = new Issue();
  selectedPart = Object();
  constructor(private route: ActivatedRoute, private router: Router, private s: SpecManagerService, public l: LanguageService, private issueManager: IssueManagerService, private dialogService: DialogService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.project = params.foranProject != null ? params.foranProject : '';
      this.docNumber = params.docNumber != null ? params.docNumber : '';
      this.department = params.department != null ? params.department : '';
      this.issueId = params.issueId != null ? params.issueId : 0;

      this.issueManager.getIssueDetails(this.issueId).then(res => {
        this.issue = res;
      });

      this.s.getHullPatList(this.project, this.docNumber).then(res => {
        console.log(res);
        if (res != ''){
          this.parts = res;
        }
        else{
          this.noResult = true;
        }
      });
    });
  }

  round(input: number) {
    return Math.round(input * 100) / 100;
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

  getBlockName() {
    if (this.parts.length > 0){
      return this.parts[0].BLOCKNAME;
    }
    else{
      return this.issue.name;
    }
  }

  addFilesToGroup(file_group: string) {
    this.dialogService.open(UploadRevisionFilesComponent, {
      showHeader: false,
      modal: true,
      data: [this.issue.id, file_group]
    }).onClose.subscribe(res => {
      this.issueManager.getIssueDetails(this.issue.id).then(issue => {
        this.issue = issue;
      });
    });
  }
}
