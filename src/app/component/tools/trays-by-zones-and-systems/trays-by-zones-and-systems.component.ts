import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {SpecManagerService} from "../../../domain/spec-manager.service";
import {LanguageService} from "../../../domain/language.service";
import _ from "underscore";

@Component({
  selector: 'app-trays-by-zones-and-systems',
  templateUrl: './trays-by-zones-and-systems.component.html',
  styleUrls: ['./trays-by-zones-and-systems.component.css']
})
export class TraysByZonesAndSystemsComponent implements OnInit {
  collapsed: string[] = [];
  trays: any = [];
  grouped: any = [];
  constructor(private route: ActivatedRoute, private router: Router, private s: SpecManagerService, public l: LanguageService) { }


  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      let project = params.project != null ? params.project : '';
      let docNumber = params.docNumber != null ? params.docNumber : '';
      if (project != '' && docNumber != ''){
        this.s.getTraysByZonesAndSystems(project, docNumber).then(res => {
          console.log(res);
          this.trays = res;
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

  contentClick(content: string): void{
    this.collapsed.includes(content) ? this.collapsed.splice(this.collapsed.indexOf(content), 1) : this.collapsed.push(content);
  }
}
