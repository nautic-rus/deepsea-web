import { Component, OnInit } from '@angular/core';
import {LanguageService} from "../../domain/language.service";
import {SpecManagerService} from "../../domain/spec-manager.service";
import _ from "underscore";

@Component({
  selector: 'app-nesting-pipe',
  templateUrl: './nesting-pipe.component.html',
  styleUrls: ['./nesting-pipe.component.css']
})
export class NestingPipeComponent implements OnInit {

  projects: string[] = ['N002', 'N004'];
  project = 'N004';
  search: string = '';
  pipeSegsSrc: any[] = [];
  pipeSegs: any[] = [];
  systems: any[] = [];
  zones: any[] = [];

  constructor(public l: LanguageService, public s: SpecManagerService) { }

  ngOnInit(): void {
    this.s.getPipeSegsByProject(this.project).then(res => {
      this.pipeSegsSrc = res;
      this.systems = _.sortBy(_.map(_.groupBy(this.pipeSegsSrc, x => x.system), x => x[0].system), x => x).map(x => Object({name: x, selected: false}));
      this.zones = _.sortBy(_.map(_.groupBy(this.pipeSegsSrc, x => x.zone), x => x[0].zone), x => x).map(x => Object({name: x, selected: false}));

      console.log(res);
      this.pipeSegs = _.sortBy(_.map(_.groupBy(this.pipeSegsSrc.filter(x => x.spool != ''), x => x.spool), x => Object({spool: x[0].spool, })), x => x.spool);
      console.log(this.pipeSegs);
    });
  }


  selectSystem(system: any) {
    system.selected = true;
  }

  selectZone(zone: any) {
    zone.selected = true;
  }
}
