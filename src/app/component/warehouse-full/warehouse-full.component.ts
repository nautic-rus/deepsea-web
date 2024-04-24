import { Component, OnInit } from '@angular/core';
import {LanguageService} from "../../domain/language.service";
import {StorageManagerService} from "../../domain/storage-manager.service";
import {Rights} from "../../domain/interfaces/rights";
import {ActivatedRoute, Router} from "@angular/router";
import _ from "underscore";

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
  invoices: any[] = [];
  invoicesSrc: any[] = [];
  loading = true;
  orders: string[] = [];
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
      this.storages.map(x => x.order).forEach(x => {
        if (!this.orders.includes(x)){
          this.orders.push(x);
        }
      });
      this.selectedOrders = this.orders;
      _.forEach(_.groupBy(this.storages, x => x.invoice_name), group => {
        let h = group[0];
        this.invoicesSrc.push(Object({
          name: h.invoice_name,
          date: this.getDateOnly(h.invoice_date),
          storages: group
        }));
        this.invoices = [...this.invoicesSrc];
      });
      this.loading = false;
    });
  }

  createNew(storageId: number) {
    window.open('/warehouse?storageId=' + storageId + '&navi=0', '_blank');
  }
  getDateOnly(dateLong: number): string {
    if (dateLong == null){
      let date = new Date()
      return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
    }
    if (dateLong == 0){
      return '--/--/--';
    }
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
  }

  filterInvoices(value: string) {
    this.invoices = this.invoicesSrc.filter(x => x.name.toLowerCase().includes(value.toLowerCase().trim()) || x.storages.find((y: any) => y.name.toLowerCase().includes(value.toLowerCase().trim())));
  }

  ordersChanged() {
    this.invoices = this.invoicesSrc.filter(x => x.storages.find((y: any) => this.selectedOrders.includes(y.order)));
  }
}
