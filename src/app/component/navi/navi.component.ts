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
import {RoleComponent} from "../admin/role/role.component";
import {UserComponent} from "../admin/user/user.component";

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
    {id: 'home', label: 'Home', url: '', icon: 'assets/icons/home1.svg', height: 14, child: [], params: {}},
    {id: 'equipments', label: 'Equipments', url: 'equipments', icon: 'assets/icons/equipments.svg', height: 14, child: [], params: {}}, //equipments
    {id: 'sections', label: 'Sections', url: 'sections', icon: 'assets/icons/sections1.svg', height: 13, child: [], params: {}},
    {id: 'materials', label: 'Materials', url: 'materials', icon: 'assets/icons/cube.svg', height: 17, child: [], params: {}},
    {id: 'materials-summary', label: 'Statement', url: 'materials-summary', icon: 'assets/icons/stats1.svg', height: 17, child: [], params: {}},
    {id: 'doclist', label: 'Documents', url: 'doclist', icon: 'assets/icons/docs.svg', height: 13, child: [], params: {}},
    {id: 'documents', label: 'Documents', url: '', icon: 'assets/icons/docs.svg', height: 13, params: {}, child: [
      {id: 'hull-documents', label: 'Hull', url: 'documents', icon: '', height: 1, params: {'department': 'Hull'}},
      {id: 'pipe-documents', label: 'Systems', url: 'documents', icon: '', height: 1, params: {'department': 'System'}},
      {id: 'trays', label: 'Trays', url: 'documents', icon: '', height: 1, params: {'department': 'Trays'}},
      {id: 'cables', label: 'Cables', url: 'documents', icon: '', height: 1, params: {'department': 'Cables'}},
      {id: 'equipments', label: 'Equipments', url: 'documents', icon: '', height: 1, params: {'department': 'Equipments'}},
      {id: 'electric-documents', label: 'Electric', url: 'documents', icon: '', height: 1, params: {'department': 'Electric'}},
      {id: 'device-documents', label: 'Devices', url: 'documents', icon: '', height: 1, params: {'department': 'Devices'}},
      {id: 'accommodation-documents', label: 'Accommodation', url: 'documents', icon: '', height: 1, params: {'department': 'Accommodation'}},
      {id: 'montage', label: 'Montage List', url: 'montage', icon: '', height: 1, params: {}},
    ]},
    {id: 'tools', label: 'Tools', url: 'tools', icon: 'assets/icons/wrench.svg', height: 13, child: [], params: {}},
    {id: 'eleccables', label: 'Cables', url: 'elec-cables', icon: 'assets/icons/elec.svg', height: 14, child: [], params: {}},
    {id: 'nesting', label: 'Nesting', url: 'nesting', icon: 'assets/icons/cut2.svg', height: 17, child: [], params: {}},
    // {id: 'nesting', label: 'Nesting', url: '', icon: 'assets/icons/nesting.svg', height: 20, child: [
    //     {id: 'nesting', label: 'Hull', url: 'nesting', icon: 'assets/icons/hull.svg', height: 20, params: {}},
    //     {id: 'nesting-pipe', label: 'Pipe', url: 'nesting-pipe', icon: 'assets/icons/pipe.svg', height: 16, params: {}}
    // ].filter(x => this.auth.getUser().visible_pages.includes(x.id)), params: {}},
    {id: 'billing', label: 'Billing', url: '', icon: 'assets/icons/bill.svg', height: 17, child: [
      {id: 'billing', label: 'Hull', url: 'billing', icon: '', height: 1, params: {}},
      {id: 'pipe-billing', label: 'Systems', url: 'pipe-billing', icon: '', height: 1, params: {}}
    ].filter(x => this.auth.getUser().visible_pages.includes(x.id)), params: {}},
    {id: 'weight', label: 'Weight', url: 'weight', icon: 'assets/icons/weight.svg', height: 14, child: [], params: {}},
    {id: 'weight-control', label: 'Weight control', url: 'weight-control', icon: 'assets/icons/preferences.svg', height: 14, child: [], params: {}},
    {id: 'labor', label: 'Man hours', url: 'labor', icon: 'assets/icons/man-hours.svg', height: 16, child: [], params: {}},
    // {id: 'labor-costs', label: 'Labor costs', url: 'labor-costs', icon: 'assets/icons/labor.svg', height: 22, child: [], params: {}},
    {id: 'diary', label: 'Calendar', url: 'diary', icon: 'assets/icons/calendar.svg', height: 14, child: [], params: {}},
    {id: 'employees', label: 'Daily Reports', url: 'employees', icon: 'assets/icons/clock1.svg', height: 14, child: [], params: {}},
    {id: 'work-hours', label: 'Planer', url: 'work-hours', icon: 'assets/icons/planner1.svg', height: 12, child: [], params: {}},
    {id: 'reports', label: 'Reports', url: '', icon: 'assets/icons/stats.svg', height: 14, child: [
        {id: 'reports', label: 'User Reports', url: 'man-hours-chart', icon: '', height: 1, params: {}},
        {id: 'reports', label: 'Project Progress', url: 'project-progress-chart', icon: '', height: 1, params: {}},
      ], params: {}},
    {id: 'qna', label: 'Q & A', url: 'qna', icon: 'assets/icons/book.svg', height: 17, child: [], params: {}},
  ].filter(x => this.auth.getUser().visible_pages.includes(x.id));

  ngOnInit(): void {
    this.issueManager.getTimeControl(this.auth.getUser().tcid).then(res => {
      this.tc = res;
      this.tcFilled = true;
    });
    this.issueManager.getIssues(this.auth.getUser().login).then(res => {
      this.issuesImportantCount = res.filter(x => x.assigned_to == this.auth.getUser().login || x.responsible == this.auth.getUser().login).filter(x => x.priority == 'High').filter(x => !x.closing_status.includes(x.status)).length;
    });
    //console.log(this.menus);
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

  translate(label: string) {
    if (this.t.language == 'en'){
      return label;
    }
    else{
      switch (label){
        case 'Home': return 'Главная';
        case 'Equipments': return 'Оборудование';  //добавила блок с оборудованием
        case 'Sections': return 'Секции';
        case 'Materials': return 'Материалы';
        case 'Statement': return 'Ведомости';
        case 'Documents': return 'Документы';
        case 'Hull': return 'Корпус';
        case 'Systems': return 'Системы';
        case 'Trays': return 'Кабель-каналы';
        case 'Cables': return 'Кабели';
        case 'Electric': return 'Электрика';
        case 'Devices': return 'Устройства';
        case 'Accommodation': return 'Достройка';
        case 'Montage List': return 'Монтаж';
        case 'Tools': return 'Инструменты';
        case 'Nesting': return 'Раскрой';
        case 'Billing': return 'Расчет';
        case 'Weight': return 'Вес';
        case 'Weight control': return 'Контроль веса';
        case 'Man hours': return 'Трудозатраты';
        case 'Calendar': return 'Календарь';
        case 'Daily Reports': return 'Отчеты';
        case 'Planer': return 'Планировщик';
        case 'Q & A': return 'Книга вопросов';
        default: return label;
      }
    }

  }

}


