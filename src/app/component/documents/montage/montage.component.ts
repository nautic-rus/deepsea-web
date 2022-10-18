import { Component, OnInit } from '@angular/core';
import {SpecManagerService} from "../../../domain/spec-manager.service";
import {Router} from "@angular/router";
import _ from "underscore";

@Component({
  selector: 'app-montage',
  templateUrl: './montage.component.html',
  styleUrls: ['./montage.component.css']
})
export class MontageComponent implements OnInit {

  constructor(public s: SpecManagerService, public router: Router) { }

  drawings: any[] = [];
  equips: any[] = [];
  projects: string[] = ['N002', 'N004'];
  project = 'N004';

  ngOnInit(): void {
    this.s.getEqFoundations(this.project).then(res => {
      console.log(res);
      this.equips = res;
      this.drawings.splice(0, this.drawings.length);
      _.forEach(_.groupBy(_.sortBy(this.equips, x => x.BSFOUNDATION + x.EUSERID), (x: any) => x.BSFOUNDATION), group => {
        this.drawings.push(Object({name: group[0].BSFOUNDATION, group: group}));
      });

    });
  }
  projectChanged() {
    this.router.navigate([], {queryParams: {foranProject: this.project}}).then(() => {
      //this.fill();
    });
  }



}
