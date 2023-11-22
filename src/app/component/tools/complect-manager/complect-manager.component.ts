import { Component, OnInit } from '@angular/core';
import {SpecManagerService} from "../../../domain/spec-manager.service";
import {ActivatedRoute, Router} from "@angular/router";
import _, {any} from "underscore";
import {DialogService} from "primeng/dynamicdialog";
import {AddComplectComponent} from "./add-complect/add-complect.component";
import {LanguageService} from "../../../domain/language.service";

@Component({
  selector: 'app-complect-manager',
  templateUrl: './complect-manager.component.html',
  styleUrls: ['./complect-manager.component.css']
})
export class ComplectManagerComponent implements OnInit {

  project = 'N002';
  complects: any[] = [];
  projects: string[] = [];
  selectedComplect: any;
  systems: any[] = [];
  selectedSystems: any[] = [];
  zones: any[] = [];
  selectedZones: any[] = [];
  constructor(public route: ActivatedRoute, public router: Router, public s: SpecManagerService, public d: DialogService, public t: LanguageService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.project = params.project != null ? params.project : this.project;

      this.fillProjects();
      this.fillSystems();
      this.fillZones();
      this.fillComplects();
    });
  }
  fillZones(){
    this.s.getZones(this.project).subscribe(res => {
      this.zones = _.sortBy(res, x => x.code);
    });
  }
  fillSystems(){
    this.s.getSystems(this.project).subscribe(res => {
      this.systems = _.sortBy(res, x => x.code);
    });
  }
  fillProjects(){
    this.s.getProjects().subscribe(res => {
      this.projects = _.sortBy(res, x=> x);
    });
  }
  fillComplects(){
    this.s.getEleComplects(this.project).subscribe(res => {
      this.complects = _.sortBy(res, x => x.drawingId);
    });
  }

  projectChanged() {
    this.router.navigate([], {queryParams: {project: this.project}});
  }

  save() {
    this.selectedComplect.systemNames = this.selectedSystems.map(x => x.code);
    this.selectedComplect.zoneNames = this.selectedZones.map(x => x.code);
    this.s.updateEleComplect(this.selectedComplect).subscribe(res => {
      alert('Изменения сохранены');
      this.fillComplects();
    });
  }

  selectComplect(compl: any) {
    this.selectedComplect = compl;
    this.selectedSystems = this.systems.filter(x => compl.systemNames.includes(x.code));
    this.selectedZones = this.zones.filter(x => compl.zoneNames.includes(x.code));
    this.zones = _.sortBy(this.zones, x => this.selectedZones.includes(x) ? '0' + x.code : '1' + x.code);
    this.systems = _.sortBy(this.systems, x => this.selectedSystems.includes(x) ? '0' + x.code : '1' + x.code);
  }

  addComplect() {
    this.d.open(AddComplectComponent, {
      showHeader: false,
      modal: true,
      data: [this.project]
    }).onClose.subscribe(event => {
      if (event == 'success'){
        this.fillComplects();
      }
    });
  }

  deleteComplect(compl: any) {
    if (confirm('Вы подтверждаете удаление комплекта "' + compl.drawingId + '"?')){
      this.s.deleteEleComplect(compl.drawingId).subscribe(res => {
        this.selectedComplect = null;
        this.fillComplects();
      });
    }
  }
}
