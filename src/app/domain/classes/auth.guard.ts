import { Injectable } from '@angular/core';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  CanActivate, Params,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import {AuthManagerService} from "../auth-manager.service";

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthManagerService, private router: Router) {
  }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    let params = Object();
    let paramsMap = route.queryParamMap;
    paramsMap.keys.forEach(k => params[k] = paramsMap.get(k));
    params['redirect'] = location.pathname;
    params['guard'] = '1';
    return this.auth.checkAuth(params);
  }

}
