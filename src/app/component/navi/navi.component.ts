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
  collapsed = true;
  collapsedMenu: string[] = [];
  menus = [
    {id: 'home', label: 'Home', url: '', icon: 'assets/icons/home1.svg', height: 17, child: [], params: {}},
    {id: 'sections', label: 'Sections', url: 'sections', icon: 'assets/icons/sections1.svg', height: 17, child: [], params: {}},
    {id: 'materials', label: 'Materials', url: 'materials', icon: 'assets/icons/cube.svg', height: 22, child: [], params: {}},
    {id: 'documents', label: 'Documents', url: '', icon: 'assets/icons/docs.svg', height: 17, params: {}, child: [
      {id: 'hull-documents', label: 'Hull', url: 'documents', icon: 'assets/icons/hull.svg', height: 20, params: {'department': 'Hull'}},
      { id: 'pipe-documents', label: 'Pipe', url: 'documents', icon: 'assets/icons/pipe.svg', height: 16, params: {'department': 'Pipe'}}
    ].filter(x => this.auth.getUser().visible_pages.includes(x.id))},
    {id: 'tools', label: 'Tools', url: 'tools', icon: 'assets/icons/wrench.svg', height: 17, child: [], params: {}},
    {id: 'eleccables', label: 'Cables', url: 'elec-cables', icon: 'assets/icons/elec.svg', height: 20, child: [], params: {}},
    {id: 'nesting', label: 'Nesting', url: '', icon: 'assets/icons/nesting.svg', height: 20, child: [
        {id: 'nesting', label: 'Hull', url: 'nesting', icon: 'assets/icons/hull.svg', height: 20, params: {}},
        {id: 'nesting-pipe', label: 'Pipe', url: 'nesting-pipe', icon: 'assets/icons/pipe.svg', height: 16, params: {}}
    ].filter(x => this.auth.getUser().visible_pages.includes(x.id)), params: {}},
    {id: 'billing', label: 'Billing', url: '', icon: 'assets/icons/bill.svg', height: 22, child: [
      {id: 'billing', label: 'Hull', url: 'billing', icon: 'assets/icons/hull.svg', height: 20, params: {}},
      {id: 'pipe-billing', label: 'Pipe', url: 'pipe-billing', icon: 'assets/icons/pipe.svg', height: 16, params: {}}
    ].filter(x => this.auth.getUser().visible_pages.includes(x.id)), params: {}},
    {id: 'weight', label: 'Weight', url: 'weight', icon: 'assets/icons/weight.svg', height: 22, child: [], params: {}},
    {id: 'weight-control', label: 'Weight control', url: 'weight-control', icon: 'assets/icons/preferences.svg', height: 22, child: [], params: {}},
    {id: 'user-watch', label: 'Spy', url: 'user-watch', icon: 'assets/icons/camera.svg', height: 22, child: [], params: {}},

  ].filter(x => this.auth.getUser().visible_pages.includes(x.id));

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
  shareRights() {
    this.dialogService.open(ShareRightsComponent, {
      showHeader: false,
      modal: true,
    });
  }
  isShared(){
    return this.auth.users.find(x => x.shared_access.includes(this.auth.getUser().login)) != null;
  }
  sharedWith(): any{
    let findUser = this.auth.users.find(x => x.shared_access.includes(this.auth.getUser().login));
    if (findUser != null){
      return findUser;
    }
    else{
      return {};
    }
  }
  isDesktop() {
    return this.device.isDesktop() && window.innerWidth > 1296;
  }
  getTime() {
    let time = new Date(this.weather.time);
    return (('0' + time.getHours()).slice(-2)) + ':' + ('0' + time.getMinutes()).slice(-2)
  }

  unShare() {
    this.auth.shareRights('', this.sharedWith().login).then(res => {
      location.reload();
    });
  }


  collapseStyle() {
    if (this.collapsed){
      return {

      };
    }
    else{
      return {
        width: '220px'
      };
    }
  }

  collapseLeftNavi() {
    setTimeout(() => {
      this.collapsed = true;
    }, 200)
  }

  collapseLeftNaviOpen() {
    setTimeout(() => {
      this.collapsed = false
    }, 100);
  }

  addCollapse(collapse: string) {
    this.collapsedMenu.includes(collapse) ? this.collapsedMenu.splice(this.collapsedMenu.indexOf(collapse)) : this.collapsedMenu.push(collapse);
  }

  onMiddleClick(event: MouseEvent, url: string) {
    if (event.button == 1){
      window.open(url, '_blank');
    }
  }
}
