import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {SpecManagerService} from "../../../domain/spec-manager.service";

@Component({
  selector: 'app-trays-by-zones-and-systems',
  templateUrl: './trays-by-zones-and-systems.component.html',
  styleUrls: ['./trays-by-zones-and-systems.component.css']
})
export class TraysByZonesAndSystemsComponent implements OnInit {

  trays: any = [];
  constructor(private route: ActivatedRoute, private router: Router, private s: SpecManagerService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      let project = params.project != null ? params.project : '';
      let zones = params.zones != null ? params.zones : '';
      let systems = params.systems != null ? params.systems : '';
      if (project != '' && zones != '' && systems != ''){
        this.s.getTraysByZonesAndSystems(project, zones, systems).then(res => {
          this.trays = JSON.parse(res);
        });
      }
      else{
        this.router.navigate(['']);
      }
    });
  }
}
