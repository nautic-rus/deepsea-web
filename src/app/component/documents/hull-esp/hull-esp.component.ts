import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {SpecManagerService} from "../../../domain/spec-manager.service";
import {LanguageService} from "../../../domain/language.service";

@Component({
  selector: 'app-hull-esp',
  templateUrl: './hull-esp.component.html',
  styleUrls: ['./hull-esp.component.css']
})
export class HullEspComponent implements OnInit {
  trays: any = [];
  constructor(private route: ActivatedRoute, private router: Router, private s: SpecManagerService, public l: LanguageService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      let project = params.project != null ? params.project : '';
      let docNumber = params.docNumber != null ? params.docNumber : '';
      if (project != '' && docNumber != ''){
        this.s.getHullPartListFromBsTree(project, docNumber).then(res => {
          this.trays = JSON.parse(res);
        });
      }
      else{
        this.router.navigate(['']);
      }
    });
  }
}
