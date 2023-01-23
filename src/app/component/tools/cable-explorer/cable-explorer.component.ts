import { Component, OnInit } from '@angular/core';
import {SpecManagerService} from "../../../domain/spec-manager.service";
import {LV} from "../../../domain/classes/lv";
import _ from "underscore";

@Component({
  selector: 'app-cable-explorer',
  templateUrl: './cable-explorer.component.html',
  styleUrls: ['./cable-explorer.component.css']
})
export class CableExplorerComponent implements OnInit {

  projects: LV[] = [new LV('Not selected'), new LV('N002'), new LV('N004'), new LV('P701'), new LV('P707')];
  zones: LV[] = [];
  selectedProject = '';
  selectedZone = '';
  cables: any[] = [];
  cablesSrc: any[] = [];
  filters: { fromZone: LV[], toZone: LV[] } = { fromZone: [], toZone: [] };

  constructor(public spec: SpecManagerService) { }

  ngOnInit(): void {

  }
  fillCables(){
    this.spec.getElecInfo(this.selectedProject).then(res => {
      this.cablesSrc = res;
      this.cables = res;
      this.filters.fromZone = _.sortBy(_.uniq(res.map(x => x.fromZone)), x => x).map(x => new LV(x));
      this.filters.toZone = _.sortBy(_.uniq(res.map(x => x.toZone)), x => x).map(x => new LV(x));
      this.zones = [new LV('No zone')].concat(_.sortBy(_.uniq(this.filters.toZone.map(x => x.label).concat(this.filters.fromZone.map(x => x.label))), x => x).map(x => new LV(x)));
    });
  }
  filterZone(){
    this.cables = this.cablesSrc.filter(x => x.fromZone == this.selectedZone || x.toZone == this.selectedZone);
  }

}
