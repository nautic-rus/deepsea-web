import { Component, OnInit } from '@angular/core';
import {AuthManagerService} from "../../domain/auth-manager.service";
import {interval} from "rxjs";

export interface HostsStatus{
  acad: string;
  deepSea: string;
  deepSeaSpec: string;
  deepSeaOld: string;
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
  hostsStatus: HostsStatus = {acad: '', deepSea: '', deepSeaSpec: '', deepSeaOld: ''};
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
        { name: 'DeepSea', status: this.hostsStatus.deepSea },
        { name: 'DeepSeaSpec', status: this.hostsStatus.deepSeaSpec },
        { name: 'DeepSeaOld', status: this.hostsStatus.deepSeaOld },
        { name: 'DeepSeaAcad', status: this.hostsStatus.acad },
      ];
    });
  }

  getStatusStyle(deepSeaStatus: string) {
    switch (deepSeaStatus){
      case 'Online': return { color: 'green' };
      case 'Offline': return { color: 'red' };
      case 'Restarting': return { color: 'purple' };
      case 'Error': return { color: 'red' };
      default: return { color: 'blue' };
    }
  }

  restartHost(app: HostApp) {
    switch (app.name){
      case 'DeepSea': this.auth.publishDeepSea().subscribe(() => this.fetchHostStatus()); break;
      case 'DeepSeaSpec': this.auth.publishDeepSeaSpec().subscribe(() => this.fetchHostStatus()); break;
      case 'DeepSeaOld': this.auth.restartDeepSeaOld().subscribe(() => this.fetchHostStatus()); break;
      case 'DeepSeaAcad': this.auth.restartAcad().subscribe(() => this.fetchHostStatus()); break;
      default: break;
    }
  }
}
