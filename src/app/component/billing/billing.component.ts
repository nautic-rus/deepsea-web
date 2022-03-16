import { Component, OnInit } from '@angular/core';
import {SpecManagerService} from "../../domain/spec-manager.service";
import {ActivatedRoute} from "@angular/router";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {collect} from "underscore";

@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.css']
})
export class BillingComponent implements OnInit {

  plates = [];
  profiles = [];

  projects: string[] = ['N002', 'N004', 'P701', 'P707'];
  project = '';


  constructor(public s: SpecManagerService, public route: ActivatedRoute, public auth: AuthManagerService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.project = params.foranProject != null ? params.foranProject : 'N004';
      this.projects = this.projects.filter(x => this.auth.getUser().visible_projects.includes(x));
      if (!this.projects.includes(this.project)) {
        this.project = this.projects[0];
      }
    });
    this.s.getHullBillProfiles(this.project).then(res => {
      this.profiles = res;
      console.log(res);
    });
    this.s.getHullBillPlates(this.project).then(res => {
      this.plates = res;
      console.log(res);
    });
  }

}
