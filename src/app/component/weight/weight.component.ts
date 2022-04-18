import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-weight',
  templateUrl: './weight.component.html',
  styleUrls: ['./weight.component.css']
})
export class WeightComponent implements OnInit {

  projects: string[] = ['N002', 'N004'];
  project = '';
  blocks: any[] = ['U101', 'U102', 'U103', 'U104', 'U105', 'U106', 'U107', 'U108', 'U109', 'U110', 'U111', 'U112', 'U113', 'U114', 'U115', 'U116', 'U117', 'U118', 'U119', 'U120'];

  constructor(public router: Router) { }

  ngOnInit(): void {
  }

  projectChanged() {
    this.router.navigate([], {queryParams: {foranProject: this.project}}).then(() => {
      //this.fill();
    });
  }

}
