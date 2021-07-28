import { Component, OnInit } from '@angular/core';
import {Customer, Representative} from "../../customer";
import {CustomerService} from "../../customer.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  customers: Customer[] = [];
  selectedCustomers: Customer[] = [];
  representatives: Representative[] = [];
  statuses: any[] = [];
  loading: boolean = true;
  activityValues: number[] = [0, 100];
  constructor(private customerService: CustomerService) { }

  ngOnInit() {
    this.customerService.getCustomersLarge().then(customers => {
      this.customers = customers;
      this.loading = false;
    });
  }
}
