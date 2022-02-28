import { Component } from '@angular/core';
import {AuthManagerService} from "./domain/auth-manager.service";
import {ActivatedRoute, Router, RouterOutlet} from "@angular/router";
import {animate, animateChild, group, query, style, transition, trigger} from '@angular/animations';
import {PrimeNGConfig} from "primeng/api";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('routeAnimations', [
      transition('* => BpmnComponent', [
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
      transition('* => LoginComponent', [
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
      transition('* => ToolsComponent', [
        query(':enter, :leave', [
          style({
            position: 'fixed',
            width: '100%',
            height: '100%',
            opacity: 0
          })
        ], { optional: true } ),
      ]),
      transition('* => DocExplorerComponent', [
        query(':enter, :leave', [
          style({
            position: 'fixed',
            width: '95%',
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
      transition('* => SectionsComponent', [
        query(':enter, :leave', [
          style({
            position: 'fixed',
            width: '95%',
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
      transition('* => HullEspComponent', [
        query(':enter, :leave', [
          style({
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
      transition('* => TraysByZonesAndSystemsComponent', [
        query(':enter, :leave', [
          style({
            position: 'fixed',
            width: 'calc(100% - var(--navi-width))',
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
      transition('* => EmployeesComponent', [
        query(':enter, :leave', [
          style({
            position: 'fixed',
            width: '95%',
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
      transition('* => DxfViewComponent', [
        query(':enter, :leave', [
          style({
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
      transition('* => NestingComponent', [
        query(':enter, :leave', [
          style({
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
      transition('* => ElecCablesComponent', [
        query(':enter, :leave', [
          style({
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
      transition('* <=> *', [
        query(':enter, :leave', [
          style({
            position: 'fixed',
            width: 'calc(100% - var(--nav-width))',
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
  naviDisabled = false;

  constructor(public auth: AuthManagerService, private primengConfig: PrimeNGConfig, private route: ActivatedRoute) {
    this.primengConfig.ripple = true;
    this.route.queryParams.subscribe(params => {
      this.naviDisabled = params.navi == 0;
      console.log(this.naviDisabled);
    });
  }
  prepareRoute(outlet: RouterOutlet): any {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData.animation;
  }

}
