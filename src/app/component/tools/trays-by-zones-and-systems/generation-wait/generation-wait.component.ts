import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {SpecManagerService} from "../../../../domain/spec-manager.service";
import {LanguageService} from "../../../../domain/language.service";
import _ from "underscore";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";

@Component({
  selector: 'app-generation-wait',
  templateUrl: './generation-wait.component.html',
  styleUrls: ['./generation-wait.component.css']
})
export class GenerationWaitComponent implements OnInit {

  project: string = '';
  docNumber: string = '';
  selectRevision = false;

  generationWait = false;

  resUrls: string[] = [];
  revs = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  rev: string = this.revs[0];

  constructor(private route: ActivatedRoute, private router: Router, private s: SpecManagerService, public l: LanguageService, public conf: DynamicDialogConfig, public t: LanguageService, public ref: DynamicDialogRef) { }


  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.project = this.conf.data[0];
      this.docNumber =  this.conf.data[1];
      this.selectRevision = this.conf.data[2];
      if (!this.selectRevision){
        this.getTraySpec('');
      }
    });
  }
  close(){
    this.ref.close('exit');
  }

  getTraySpec(rev: string) {
    this.selectRevision = false;
    this.generationWait = true;
    this.s.getTraySpec(this.project, this.docNumber, rev).then(res => {
      this.generationWait = false;
      this.resUrls = res;
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
