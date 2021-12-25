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
  revs = ['0', '1', '2', '3', '4', '5'];
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
}
