import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {SpecManagerService} from "../../../domain/spec-manager.service";
import {LanguageService} from "../../../domain/language.service";
import _ from "underscore";
import {UploadRevisionFilesComponent} from "../../documents/hull-esp/upload-revision-files/upload-revision-files.component";
import {DialogService} from "primeng/dynamicdialog";
import {GenerationWaitComponent} from "./generation-wait/generation-wait.component";

@Component({
  selector: 'app-trays-by-zones-and-systems',
  templateUrl: './trays-by-zones-and-systems.component.html',
  styleUrls: ['./trays-by-zones-and-systems.component.css']
})
export class TraysByZonesAndSystemsComponent implements OnInit {
  collapsed: string[] = [];
  trays: any = [];
  equipment: any = [];
  bundle: any = Object();
  grouped: any = [];
  selectedTab: string = 'Trays';
  project: string = '';
  docNumber: string = '';
  waitingForResponse = false;
  constructor(private route: ActivatedRoute, private router: Router, private s: SpecManagerService, public l: LanguageService, private dialogService: DialogService) { }


  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.project = params.project != null ? params.project : '';
      this.docNumber = params.docNumber != null ? params.docNumber : '';
      if (this.project != '' && this.docNumber != ''){
        this.s.getTraysByZonesAndSystems(this.project, this.docNumber).then(res => {
          console.log(res);
          this.bundle = res.complect;
          this.trays = res.trays;
          this.equipment = _.sortBy(res.eqs, x => this.addLeftZeros(x.LABEL, 5));
          _.forEach(_.groupBy(_.sortBy(this.trays, x => x.mountData.label), x => x.mountData.label + x.mountData.trmCode + x.mountData.name), group => {
            this.grouped.push(group);
          });
        });
      }
      else{
        //this.router.navigate(['']);
      }
    });
  }
  addLeftZeros(input: string, length: number){
    let res = input;
    while (res.length < length){
      res = '0' + res;
    }
    return res;
  }
  contentClick(content: string): void{
    this.collapsed.includes(content) ? this.collapsed.splice(this.collapsed.indexOf(content), 1) : this.collapsed.push(content);
  }

  generatePdf(revision = false) {
    this.dialogService.open(GenerationWaitComponent, {
      showHeader: false,
      modal: true,
      data: [this.project, this.docNumber, revision]
    });
  }
}
