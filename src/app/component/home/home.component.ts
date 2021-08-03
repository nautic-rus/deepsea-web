import { Component, OnInit } from '@angular/core';
import { Product } from "./product";
import {Router} from "@angular/router";
import {ProductService} from "./product.service";
import {IssueManagerService} from "../../domain/issue-manager.service";
import {AuthManagerService} from "../../domain/auth-manager.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  products: Product[] = [];
  newTaskVisible = false;
  constructor(private productService: ProductService, private router: Router, private issues: IssueManagerService, private auth: AuthManagerService) { }

  ngOnInit() {
    this.productService.getProductsSmall().then(data => this.products = data);
    this.issues.getIssues(this.auth.getUser().login);
  }

  newTask() {
    this.newTaskVisible = true;
  }
}
