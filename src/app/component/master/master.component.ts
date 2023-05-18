import { Component, OnInit } from '@angular/core';
import {AuthManagerService} from "../../domain/auth-manager.service";
import {timeout} from "rxjs/operators";
import {interval} from "rxjs";

export interface HostsStatus{
  acad: number;
  deepSea: number;
  deepSeaSpec: number;
  deepSeaOld: number;
}
@Component({
  selector: 'app-master',
  templateUrl: './master.component.html',
  styleUrls: ['./master.component.css']
})
export class MasterComponent implements OnInit {

  constructor(public auth: AuthManagerService) { }
  hostsStatus: HostsStatus = {acad: 0, deepSea: 0, deepSeaSpec: 0, deepSeaOld: 0};

  ngOnInit(): void {
    interval(3000).subscribe(tick => {
      this.auth.hostsStatus().subscribe(status => {
        this.hostsStatus = status;
      });
    });
  }
  getDeepSeaStatus(){
    return this.hostsStatus.deepSea == 0 ? 'Offline' : 'Online';
  }
  getDeepSeaSpecStatus(){
    return this.hostsStatus.deepSeaSpec == 0 ? 'Offline' : 'Online';
  }
  getDeepSeaOldStatus(){
    return this.hostsStatus.deepSeaSpec == 0 ? 'Offline' : 'Online';
  }
  getAcadStatus(){
    return this.hostsStatus.acad == 0 ? 'Offline' : 'Online';
  }
}
