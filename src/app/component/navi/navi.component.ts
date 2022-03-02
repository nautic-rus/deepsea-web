import { Component, OnInit } from '@angular/core';
import {AuthManagerService} from "../../domain/auth-manager.service";
import {ActivatedRoute} from "@angular/router";
import {LanguageService} from "../../domain/language.service";
import {IssueManagerService} from "../../domain/issue-manager.service";
import {TimeControlInterval} from "../../domain/classes/time-control-interval";
import _ from "underscore";
import {DialogService} from "primeng/dynamicdialog";
import {ShareRightsComponent} from "./share-rights/share-rights.component";
import {Weather} from "../../domain/classes/weather";
import {DeviceDetectorService} from "ngx-device-detector";

@Component({
  selector: 'app-navi',
  templateUrl: './navi.component.html',
  styleUrls: ['./navi.component.css']
})
export class NaviComponent implements OnInit {

  constructor(public device: DeviceDetectorService, public t: LanguageService, public auth: AuthManagerService, private route: ActivatedRoute, private issueManager: IssueManagerService, private dialogService: DialogService) { }
  tc: TimeControlInterval[] = [];
  weather: Weather = new Weather();
  tcFilled = false;
  ngOnInit(): void {
    this.issueManager.getTimeControl(this.auth.getUser().tcid).then(res => {
      this.tc = res;
      this.tcFilled = true;
    });
    this.issueManager.getTimeAndWeather().then(res => {
      this.weather = res;
      this.timeTick();
    });
  }
  timeTick(){
    setTimeout(() => {
      this.weather.time += 1000;
      this.timeTick();
    }, 1000);
  }
  isOnline(){
    return !this.tcFilled || this.getDateIntervals().find(x => x.closeDoor == 0) != null;
  }
  getDateIntervals(t = new Date()){
    return _.sortBy(this.tc.filter(x => {
      let d = new Date(x.startDate);
      return (t.getFullYear() == d.getFullYear() && t.getMonth() == d.getMonth() && t.getDate() == d.getDate());
    }), x => x.startTime);
  }
  getSharedWith(){
    let res: string[] = [];
    this.auth.users.forEach(user => {
      user.shared_access.filter(x => x == this.auth.getUser().login).forEach(sh => {
        res.push(sh);
      })
    });
    return res;
  }
  shareRights() {
    this.dialogService.open(ShareRightsComponent, {
      showHeader: false,
      modal: true,
    });
  }
  isDesktop() {
    return this.device.isDesktop() && window.innerWidth > 1078;
  }
  getTime() {
    let time = new Date(this.weather.time);
    return (('0' + time.getHours()).slice(-2)) + ':' + ('0' + time.getMinutes()).slice(-2)
  }
}
