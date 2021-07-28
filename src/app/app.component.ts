import { Component } from '@angular/core';
import {AuthManagerService} from "./domain/auth-manager.service";
import {RouterOutlet} from "@angular/router";
import {animate, animateChild, group, query, style, transition, trigger} from '@angular/animations';
import {PrimeNGConfig} from "primeng/api";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('routeAnimations', [
      transition('* <=> *', [
        query(':enter, :leave', [
          style({
            position: 'fixed',
            width: '100%',
            height: '100%',
            opacity: 0
          })
        ], { optional: true } ),
        query(':enter', [
          animate('.5s',
            style({ opacity: 1 })
          ),
        ], { optional: true } ),
      ]),
    ]),
    trigger('navi', [
      transition('* <=> *', [
        style({
          opacity: 0,
        }),
        animate('.3s .5s',
          style({ opacity: 1 })
        ),
      ]),
    ])
  ]
})
export class AppComponent {
  title = 'deepsea';
  constructor(public auth: AuthManagerService, private primengConfig: PrimeNGConfig) {
    this.primengConfig.ripple = true;
  }

  prepareRoute(outlet: RouterOutlet): any {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData.animation;
  }
}
