import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {SpecManagerService} from "../../../domain/spec-manager.service";
import {LanguageService} from "../../../domain/language.service";
import {Issue} from "../../../domain/classes/issue";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {SendToCloudComponent} from "../../task/send-to-cloud/send-to-cloud.component";
import {DialogService} from "primeng/dynamicdialog";
import {UploadRevisionFilesComponent} from "./upload-revision-files/upload-revision-files.component";
import _ from "underscore";
import JSZip from "jszip";
import {FileAttachment} from "../../../domain/classes/file-attachment";
import {saveAs} from "file-saver";
import {AssignNewRevisionComponent} from "./assign-new-revision/assign-new-revision.component";

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
  selectedRevision = '';
  issueId = 0;
  issue: Issue = new Issue();
  selectedPart = Object();
  groupedByPartCode = false;
  fileGroups = [
    {
      name: 'Drawings',
      icon: 'assets/icons/drawings.svg'
    },
    {
      name: 'Part List',
      icon: 'assets/icons/files.svg'
    },
    {
      name: 'Cutting Map',
      icon: 'assets/icons/cutting.svg'
    },
    {
      name: 'Nesting Plates',
      icon: 'assets/icons/cutting.svg'
    },
    {
      name: 'Nesting Profiles',
      icon: 'assets/icons/cutting.svg'
    }
  ];
  selectedTab = this.fileGroups[0].name;
  issueRevisions: string[] = [];
  filters:  { ELEM_TYPE: any[], MATERIAL: any[]  } = { ELEM_TYPE: [],  MATERIAL: [] };

  constructor(private route: ActivatedRoute, private router: Router, private s: SpecManagerService, public l: LanguageService, private issueManager: IssueManagerService, private dialogService: DialogService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.project = params.foranProject != null ? params.foranProject : '';
      this.docNumber = params.docNumber != null ? params.docNumber : '';
      this.department = params.department != null ? params.department : '';
      this.issueId = params.issueId != null ? params.issueId : 0;

      this.fillRevisions();
      this.fillParts();

    });
  }
  getFilters(values: any[], field: string): any[] {
    let res: any[] = [];
    let uniq = _.uniq(values, x => x[field]);
    uniq.forEach(x => {
      res.push({
        label: x[field],
        value: x[field]
      })
    });
    return _.sortBy(res, x => x.label);
  }
  fillParts(){
    this.s.getHullPatList(this.project, this.docNumber).then(res => {
      if (res != ''){
        this.parts = res;
        this.filters.ELEM_TYPE = this.getFilters(this.parts, 'ELEM_TYPE');
        this.filters.MATERIAL = this.getFilters(this.parts, 'MATERIAL');
      }
      else{
        this.noResult = true;
      }
    });
  }
  getParts(){
    return this.parts.filter((x: any) => this.isPartVisible(x));
  }
  isPartVisible(part: any){
    return true;
  }
  fillRevisions(){
    this.issueManager.getIssueDetails(this.issueId).then(res => {
      this.issue = res;
      this.issueRevisions.push(this.issue.revision);
      this.issue.revision_files.map(x => x.revision).forEach(gr => {
        if (!this.issueRevisions.includes(gr)){
          this.issueRevisions.push(gr);
        }
      });
      this.issueRevisions = _.sortBy(this.issueRevisions, x => x).reverse();
      this.selectedRevision = this.issueRevisions[0];
    });
  }

  round(input: number) {
    return Math.round(input * 100) / 100;
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
  getDeliveredStatus(status: string, styled = true): any {
    let tr = this.localeStatus(status);
    switch (status){
      case 'Completed': return styled ? '<span style="color: #256029; background-color: #c8e6c9; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">' + tr + '</span>' : tr;
      case 'In Work': return styled ? '<span style="color: #805b36; background-color: #ffd8b2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">' + tr + '</span>' : tr;
      default: return status;
    }
  }
  localeStatus(status: string){
    if (this.l.language == 'ru'){
      switch (status) {
        case 'Completed' : return 'Завершён';
        case 'In Work': return 'В работе';
        default: return status;
      }
    }
    else{
      return status;
    }
  }
  addFilesToGroup(file_group: string, revision: string) {
    this.dialogService.open(UploadRevisionFilesComponent, {
      showHeader: false,
      modal: true,
      data: [this.issue.id, file_group]
    }).onClose.subscribe(res => {
      this.issueManager.getIssueDetails(this.issue.id).then(issue => {
        this.issue = issue;
        this.fillRevisions();
      });
    });
  }

  downloadFiles(group: string, revision: string) {
    let files = this.getRevisionFilesOfGroup(group, revision);
    Promise.all(files.map(x => fetch(x.url))).then(blobs => {
      let zip = new JSZip();
      files.forEach(file => {
        zip.file(file.name, blobs[files.indexOf(file)].blob());
      });
      zip.generateAsync({type:"blob"}).then(res => {
        saveAs(res, this.issue.doc_number + '-' + new Date().getTime() + '.zip');
      });
    });
  }

  askForSendToCloud(){
    this.dialogService.open(AssignNewRevisionComponent, {
      showHeader: false,
      modal: true,
      data: this.issue
    }).onClose.subscribe(res => {
      this.issueManager.getIssueDetails(this.issue.id).then(issue => {
        this.issue = issue;
        this.fillRevisions();
      });
    });
  }



  getRevisionFilesOfGroup(fileGroup: string, revision: string): FileAttachment[] {
    return this.issue.revision_files.filter(x => x.group == fileGroup && x.revision == revision);
  }

  createEsp(revision: string = '') {

  }

  getCount(parts: any[], PART_CODE: any) {
    if (this.groupedByPartCode){
      return parts.filter(x => x.PART_CODE == PART_CODE).length;
    }
    else{
      return 1;
    }
  }
}
