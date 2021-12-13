import { Component, OnInit } from '@angular/core';
import {Issue} from "../../domain/classes/issue";
import {LanguageService} from "../../domain/language.service";

@Component({
  selector: 'app-labor-costs',
  templateUrl: './labor-costs.component.html',
  styleUrls: ['./labor-costs.component.css']
})
export class LaborCostsComponent implements OnInit {
  issues: Issue[] = [];
  filters:  { status: any[],  revision: any[] } = { status: [], revision: [] };

  constructor(public l: LanguageService,) { }

  ngOnInit(): void {
  }

}
