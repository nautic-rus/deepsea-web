import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-trays-by-zones-and-systems',
  templateUrl: './trays-by-zones-and-systems.component.html',
  styleUrls: ['./trays-by-zones-and-systems.component.css']
})
export class TraysByZonesAndSystemsComponent implements OnInit {

  trays: any = [];
  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params.trays != null){
        this.trays = JSON.parse(params.trays);
      }
      this.router.navigate([], {queryParams: {trays: null}});
    });
    if (this.trays.length == 0){
      this.router.navigate(['']);
    }
  }

}
