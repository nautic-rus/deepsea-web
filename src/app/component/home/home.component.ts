import { Component, OnInit } from '@angular/core';
import { Product } from "./product";
import {Router} from "@angular/router";
import {ProductService} from "./product.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  products: Product[] = [];

  constructor(private productService: ProductService, private router: Router) { }

  ngOnInit() {
    this.productService.getProductsSmall().then(data => this.products = data);
    };
  }
