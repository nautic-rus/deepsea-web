import { Component, OnInit } from '@angular/core';
import {GANTT_GLOBAL_CONFIG} from "@worktile/gantt";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {IssueManagerService} from "../../domain/issue-manager.service";
import _ from "underscore";
import {Issue} from "../../domain/classes/issue";
declare var LeaderLine: any;

@Component({
  selector: 'app-gantt',
  templateUrl: './gantt.component.html',
  styleUrls: ['./gantt.component.css'],
  providers: [
    {
      provide: GANTT_GLOBAL_CONFIG,
      useValue: {
        dateFormat: {
          yearQuarter: `QQQ 'of' yyyy`,
          month: 'LLLL',
          yearMonth: `LLLL yyyy'(week' w ')'`
        }
      }
    }
  ]
})
export class GanttComponent implements OnInit {
  project: string = 'NR002';
  projects: string[] = ['NR002', 'NR004'];
  assignee: string = 'all';
  assignees: any[] = [];
  issueType = 'RKD';
  sourceIssues: any[] = [];
  issues: any[] = [];

  issues1: any[] = [];
  currentDate = new Date().getTime();
  msPerDay = 1000 * 60 * 60 * 24;
  daysBeforeInitial = 15;
  daysAfterInitial = 30;
  startDate = new Date(this.currentDate - this.msPerDay * this.daysBeforeInitial);
  endDate = new Date(this.currentDate + this.msPerDay * this.daysAfterInitial);
  days: any[] = [];
  dayWidth = 50;
  dayHeight = 30;
  issueHeight = 24;
  timeLineLength = this.endDate.getTime() - this.startDate.getTime();
  timeLineLengthPx = this.timeLineLength / this.msPerDay * this.dayWidth;
  msPerPx = this.timeLineLength / this.timeLineLengthPx;
  arrowPadding = 16;
  anchorSize = 12;
  leaders: any = [];


  constructor(private auth: AuthManagerService, private issueManager: IssueManagerService) { }

  ngOnInit(): void {
   this.fillDays();

    this.issueManager.getIssues('op').then(res => {
      this.sourceIssues = res;
      this.fillIssues();
    });
    this.assignees.push({
      label: 'All',
      value: 'All'
    });
    this.assignee = 'All';
    this.auth.getUsers().then(res => {
      _.sortBy(res.filter(x => x.visibility.includes('c')), x => this.auth.getUserName(x.login)).forEach(user => {
        this.assignees.push({
          label: this.auth.getUserName(user.login),
          value: user.login
        })
      });
    });
  }

  isBetween(startDate: number, endDate: number, date: number){
    return startDate <= date && date <= endDate;
  }
  fillIssues(){
    this.issues.splice(0, this.issues.length);
    this.sourceIssues.filter(x => this.isIssueVisible(x)).forEach(value => {
      this.issues.push({
        id: value.id.toString(),
        title: value.name,
        doc_number: value.doc_number,
        start: value.start_date,
        end: value.due_date,
        assigned_to: this.auth.getUserName(value.assigned_to)
      });
    });
    this.issues = [...this.issues];
  }
  isIssueVisible(issue: Issue){
    let res = true;
    if (this.project != issue.project){
      res = false;
    }
    if (this.assignee != 'All' && this.assignee != issue.assigned_to){
      res = false;
    }
    return res;
  }

  projectChanged() {
    this.fillIssues();
  }

  assigneeChanged() {
    this.fillIssues();
  }

  dragOver(event: DragEvent) {
    event.stopPropagation();
    event.preventDefault();
  }

  startOffset = 0;
  dragWidth = 0;
  dragItem: HTMLElement | null = null;
  dragIndex = -1;
  action = 'move';
  moveSide = 'right';
  getHeaderRowStyle(){
    return{
      height: this.dayHeight + 'px',
      'min-width': this.timeLineLengthPx + 'px',
      'background-color': 'rgba(248,246,246,0.7)',
      position: 'sticky',
      top: 0,
      left: 0
    }
  }
  getRowStyle(){
    return{
      height: this.dayHeight + 'px',
      'min-width': this.timeLineLengthPx + 'px',
      'background-color': '#F9F9FB',
      'border-bottom': '1px solid #e0e0e0',
      position: 'relative'
    }
  }
  getIssueRowStyle(issue: any) {
    return{
      position: 'absolute',
      top: '2px',
      left: this.getDayFrom(issue.startDate) + 'px',
      width: this.getDayFrom(issue.endDate, issue.startDate) + 'px',
      height: this.issueHeight + 'px',
      'background-color': 'rgba(33, 150, 243, 0.12)',
      'border': '1px solid rgba(33, 150, 243, 0.12)',
      'border-radius': '12px',
    }
  }
  dragStart(event: DragEvent, element: HTMLElement, i: number, action = 'move', side = 'right') {
    this.action = action;
    this.dragIndex = i;
    // @ts-ignore
    var dragImgEl = document.createElement('span');
    dragImgEl.setAttribute('style', 'display: none' );
    document.body.appendChild(dragImgEl);
    // @ts-ignore
    event.dataTransfer.setDragImage(dragImgEl, 0, 0);
    // @ts-ignore
    event.dataTransfer.effectAllowed = 'move';
    this.moveSide = side;
    this.dragItem = element;
  }
  checkBounds(issue: any){
    let width = issue.endDate - issue.startDate;
    if (issue.startDate < this.startDate.getTime()){
      issue.startDate = this.startDate.getTime();
      issue.endDate = issue.startDate + width;
    }
    if (issue.endDate > this.endDate.getTime()){
      issue.endDate = this.endDate.getTime();
      issue.startDate = issue.endDate - width;
    }
    this.leaders.forEach((leader: any) => {
      leader.position();
    });
  }
  moveOverTimelineThis(event: DragEvent, issue: any, i: number) {
    event.preventDefault();
    event.stopPropagation();
    if (this.dragIndex == i && this.action == 'move'){
      // @ts-ignore
      let width = issue.endDate - issue.startDate;
      let diff = width / 2 / this.msPerPx - event.offsetX;
      if (!(Math.abs(diff) < 1)){
        issue.startDate = issue.startDate - width / 2 + event.offsetX * this.msPerPx;
        issue.endDate = issue.startDate + width;
      }
      this.checkBounds(issue);
    }
    else if (this.dragIndex == i && this.action == 'resize') {
      if (this.moveSide == 'right'){
        issue.endDate = issue.startDate + event.offsetX * this.msPerPx;
      }
      else{
        issue.startDate = issue.startDate + event.offsetX * this.msPerPx;
      }
    }
  }
  moveOverTimeline(event: DragEvent, issue: any, i: number) {
    event.preventDefault();
    event.stopPropagation();
    if (this.dragIndex == i && this.action == 'move') {
      // @ts-ignore
      let width = issue.endDate - issue.startDate;
      issue.startDate = this.startDate.getTime() + event.offsetX * this.msPerPx - width / 2;
      issue.endDate = issue.startDate + width;
      this.checkBounds(issue);
    }
    else if (this.dragIndex == i && this.action == 'resize') {
      if (this.moveSide == 'right') {
        issue.endDate = this.startDate.getTime() + event.offsetX * this.msPerPx;
      }
      else{
        issue.startDate = this.startDate.getTime() + event.offsetX * this.msPerPx;
      }
    }
  }

  getDayFrom(number: number, date = this.startDate.getTime()) {
    return Math.round((number - date) / this.msPerPx);
  }

  moveResize(event: MouseEvent, issue: any, index: number, side = 'right') {
    event.preventDefault();
    event.stopPropagation();
    if (this.action == 'resize' && this.dragIndex == index){
      this.moveSide = side;
      let diff = event.offsetX - this.arrowPadding / 2;
      if (side == 'right'){
        issue.endDate = issue.endDate + diff * this.msPerPx;
      }
      else{
        issue.startDate = issue.startDate + diff * this.msPerPx;
      }
      this.checkBounds(issue);
    }
  }


  getRightArrow(issue: any) {
    return{
      position: 'absolute',
      left: this.getDayFrom(issue.endDate) + 'px',
      width: this.arrowPadding,
      height: this.dayHeight + 'px',
    }
  }
  getLeftArrow(issue: any) {
    return{
      position: 'absolute',
      left: (this.getDayFrom(issue.startDate) - this.arrowPadding) + 'px',
      width: this.arrowPadding,
      height: this.dayHeight + 'px',
    }
  }
  getDate(dateLong: number): string{
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
  }
  getDateWithTime(dateLong: number): string{
    let date = new Date(dateLong);
    return  ('0' + date.getHours()).slice(-2) + ":" + ('0' + (date.getMinutes() + 1)).slice(-2) + ' ' + ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
  }
  periodChanged() {
    this.fillDays();
  }

  fillDays() {
    this.days.splice(0, this.days.length);
    this.issues1.splice(0, this.issues1.length);
    for (let day = this.startDate.getTime(); day <= this.endDate.getTime(); day = day + this.msPerDay){
      let date = new Date(day);
      this.days.push({
        name: ('0' + date.getDate()).slice(-2) + '/' + (date.getMonth() + 1),
        date: date,
      });
      this.issues1.push({
        startDate: 1645700244263,
        endDate: 1645900244263
      })
    }
  }

  drawLine() {
    new LeaderLine(document.getElementById('1'), document.getElementById('2'));
  }

  getLeftAnchor(issue: any) {
    return{
      position: 'absolute',
      left: (this.getDayFrom(issue.startDate)) + 'px',
      width: this.arrowPadding,
      height: this.anchorSize
    }
  }

  getRightAnchor(issue: any) {
    return{
      position: 'absolute',
      left: (this.getDayFrom(issue.endDate) - this.anchorSize) + 'px',
      width: this.arrowPadding,
      height: this.anchorSize
    }
  }

  onAnchorDrop($event: DragEvent) {

  }

  onAnchorDropOver(event: DragEvent, element: HTMLElement) {
    if (this.action == 'anchor'){
      event.preventDefault();
      event.stopPropagation();
      let leader = new LeaderLine(this.dragItem, element, {
        path: 'grid',
        startPlug: 'disc',
        color: '#cecece',
        gradient: true,
        size: 1.5
      });
      this.leaders.push(leader);
    }
  }
}
