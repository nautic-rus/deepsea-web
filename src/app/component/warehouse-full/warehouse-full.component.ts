import { Component, OnInit } from '@angular/core';
import {LanguageService} from "../../domain/language.service";
import {StorageManagerService} from "../../domain/storage-manager.service";
import {Rights} from "../../domain/interfaces/rights";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-warehouse-full',
  templateUrl: './warehouse-full.component.html',
  styleUrls: ['./warehouse-full.component.css']
})
export class WarehouseFullComponent implements OnInit {

  projects: any[] = [];
  project = 0;
  selectedView: string = 'tiles';
  storages: any[] = [];
  loading = true;
  orders: Rights[] = [];
  selectedOrders: string[] = [];
  constructor(public t: LanguageService, public s: StorageManagerService, public a: ActivatedRoute, public r: Router) { }

  ngOnInit(): void {
    this.a.queryParams.subscribe(params => {
      if (params['navi'] == null){
        this.r.navigate([], {queryParams: {navi: 0}});
      }
    });
    this.s.getStorageUnits().subscribe(storages => {
      console.log(storages);
      this.storages = storages;
      this.loading = false;
    });
  }

  createNew(storageId: number) {
    window.open('/warehouse?storageId=' + storageId + '&navi=0', '_blank');
  }
}
