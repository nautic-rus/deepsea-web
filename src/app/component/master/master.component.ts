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
export interface HostApp{
  name: string;
  status: string;
}
@Component({
  selector: 'app-master',
  templateUrl: './master.component.html',
  styleUrls: ['./master.component.css']
})
export class MasterComponent implements OnInit {

  constructor(public auth: AuthManagerService) { }
  hostsStatus: HostsStatus = {acad: 0, deepSea: 0, deepSeaSpec: 0, deepSeaOld: 0};
  apps: HostApp[] = [];

  ngOnInit(): void {
    this.fetchHostStatus();
    interval(3000).subscribe(tick => {
      this.fetchHostStatus();
    });
  }
  fetchHostStatus(){
    this.auth.hostsStatus().subscribe(status => {
      this.hostsStatus = status;
      this.apps = [
        { name: 'DeepSea', status: this.getDeepSeaStatus() },
        { name: 'DeepSeaSpec', status: this.getDeepSeaSpecStatus() },
        { name: 'DeepSeaOld', status: this.getDeepSeaOldStatus() },
        { name: 'DeepSeaAcad', status: this.getDeepSeaAcadStatus() },
      ];
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
  getDeepSeaAcadStatus(){
    return this.hostsStatus.acad == 0 ? 'Offline' : 'Online';
  }

  getStatusStyle(deepSeaStatus: string) {
    switch (deepSeaStatus){
      case 'Online': return { color: 'green' };
      case 'Offline': return { color: 'red' };
      default: return { color: 'yellow' };
    }
  }
}
