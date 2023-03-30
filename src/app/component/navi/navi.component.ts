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
import {DailyTasksComponent} from "./daily-tasks/daily-tasks.component";

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
  issuesImportantCount = 0;
  menus = [
    {id: 'home', label: 'Home', url: '', icon: 'assets/icons/home1.svg', height: 17, child: [], params: {}},
    {id: 'sections', label: 'Sections', url: 'sections', icon: 'assets/icons/sections1.svg', height: 17, child: [], params: {}},
    {id: 'materials', label: 'Materials', url: 'materials', icon: 'assets/icons/cube.svg', height: 22, child: [], params: {}},
    {id: 'documents', label: 'Documents', url: '', icon: 'assets/icons/docs.svg', height: 17, params: {}, child: [
      {id: 'hull-documents', label: 'Hull', url: 'documents', icon: 'assets/icons/hull.svg', height: 19, params: {'department': 'Hull'}},
      {id: 'pipe-documents', label: 'Systems', url: 'documents', icon: 'assets/icons/pipe.svg', height: 16, params: {'department': 'System'}},
      {id: 'trays', label: 'Trays', url: 'documents', icon: 'assets/icons/plug.svg', height: 18, params: {'department': 'Trays'}},
      {id: 'cables', label: 'Cables', url: 'documents', icon: 'assets/icons/plug.svg', height: 18, params: {'department': 'Cables'}},
      {id: 'electric-documents', label: 'Electric', url: 'documents', icon: 'assets/icons/light.svg', height: 18, params: {'department': 'Electric'}},
      {id: 'device-documents', label: 'Devices', url: 'documents', icon: 'assets/icons/hook.svg', height: 18, params: {'department': 'Devices'}},
      {id: 'accommodation-documents', label: 'Accommodation', url: 'documents', icon: 'assets/icons/outfitting.svg', height: 18, params: {'department': 'Accommodation'}},
      {id: 'montage', label: 'Montage List', url: 'montage', icon: 'assets/icons/pump.png', height: 20, params: {}},
    ]},
    {id: 'tools', label: 'Tools', url: 'tools', icon: 'assets/icons/wrench.svg', height: 17, child: [], params: {}},
    {id: 'eleccables', label: 'Cables', url: 'elec-cables', icon: 'assets/icons/elec.svg', height: 20, child: [], params: {}},
    {id: 'nesting', label: 'Nesting', url: 'nesting', icon: 'assets/icons/cut2.svg', height: 26, child: [], params: {}},
    // {id: 'nesting', label: 'Nesting', url: '', icon: 'assets/icons/nesting.svg', height: 20, child: [
    //     {id: 'nesting', label: 'Hull', url: 'nesting', icon: 'assets/icons/hull.svg', height: 20, params: {}},
    //     {id: 'nesting-pipe', label: 'Pipe', url: 'nesting-pipe', icon: 'assets/icons/pipe.svg', height: 16, params: {}}
    // ].filter(x => this.auth.getUser().visible_pages.includes(x.id)), params: {}},
    {id: 'billing', label: 'Billing', url: '', icon: 'assets/icons/bill.svg', height: 22, child: [
      {id: 'billing', label: 'Hull', url: 'billing', icon: 'assets/icons/hull.svg', height: 20, params: {}},
      {id: 'pipe-billing', label: 'Systems', url: 'pipe-billing', icon: 'assets/icons/pipe.svg', height: 16, params: {}}
    ].filter(x => this.auth.getUser().visible_pages.includes(x.id)), params: {}},
    {id: 'weight', label: 'Weight', url: 'weight', icon: 'assets/icons/weight.svg', height: 22, child: [], params: {}},
    {id: 'weight-control', label: 'Weight control', url: 'weight-control', icon: 'assets/icons/preferences.svg', height: 22, child: [], params: {}},
    {id: 'labor', label: 'Laboriousness', url: 'labor', icon: 'assets/icons/laboriousness1.svg', height: 22, child: [], params: {}},
    // {id: 'labor-costs', label: 'Labor costs', url: 'labor-costs', icon: 'assets/icons/labor.svg', height: 22, child: [], params: {}},
    {id: 'diary', label: 'Daily Tasks', url: 'diary', icon: 'assets/icons/user-assigned-white.svg', height: 22, child: [], params: {}},
    {id: 'employees', label: 'Daily Reports', url: 'employees', icon: 'assets/icons/clock.svg', height: 22, child: [], params: {}},
    {id: 'qna', label: 'Q & A', url: 'qna', icon: 'assets/icons/book.svg', height: 22, child: [], params: {}},
    {id: 'work-hours', label: 'Working hours', url: 'work-hours', icon: 'assets/icons/chart2.svg', height: 17, child: [], params: {}},
  ].filter(x => this.auth.getUser().visible_pages.includes(x.id));

  ngOnInit(): void {
    this.issueManager.getTimeControl(this.auth.getUser().tcid).then(res => {
      this.tc = res;
      this.tcFilled = true;
    });
    this.issueManager.getIssues(this.auth.getUser().login).then(res => {
      this.issuesImportantCount = res.filter(x => x.assigned_to == this.auth.getUser().login || x.responsible == this.auth.getUser().login).filter(x => x.priority == 'High').filter(x => !x.closing_status.includes(x.status)).length;
    });
    // this.issueManager.getTimeAndWeather().then(res => {
    //   this.weather = res;
    //   this.timeTick();
    // });
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

  fillDailyTasks() {
    this.dialogService.open(DailyTasksComponent, {
      showHeader: false,
      modal: true,
    });
  }
}
