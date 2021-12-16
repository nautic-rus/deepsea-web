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
  parts: any = [];
  noResult = false;
  docNumber = '';
  project = '';
  constructor(private route: ActivatedRoute, private router: Router, private s: SpecManagerService, public l: LanguageService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.project = params.project != null ? params.project : '';
      this.docNumber = params.docNumber != null ? params.docNumber : '';
      if (this.project != '' && this.docNumber != ''){
        this.s.getHullPatList(this.project, this.docNumber).then(res => {
          if (res != ''){
            this.parts = res;
          }
          else{
            this.noResult = true;
          }
        });
      }
      else{
        this.router.navigate(['']);
      }
    });
  }
}
