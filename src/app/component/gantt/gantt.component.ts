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
  minWidth = this.msPerDay;


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
  dragIssue: any = null;
  mouseMove: any = {};
  mouseUp: any = {};
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



  dragStart(event: DragEvent, issue: any) {
    event.preventDefault();
    this.mouseMove = (e: any) => {
      let width = issue.endDate - issue.startDate;
      issue.startDate = issue.startDate + e.movementX * this.msPerPx;
      issue.endDate = issue.startDate + width;
      this.checkBounds(issue);
    }
    this.mouseUp = (e: any) => {
      document.removeEventListener('mousemove', this.mouseMove);
      document.removeEventListener('mouseup', this.mouseUp);
    }
    document.addEventListener('mousemove', this.mouseMove);
    document.addEventListener('mouseup', this.mouseUp);
  }
  dragStartMove(event: DragEvent, issue: any, i: number, side = 'right') {
    event.preventDefault();
    this.moveSide = side;
    this.mouseMove = (e: any) => {
      if (this.moveSide == 'right' && issue.startDate + this.msPerDay < issue.endDate + e.movementX * this.msPerPx){
        issue.endDate = issue.endDate + e.movementX * this.msPerPx;
      }
      if (this.moveSide == 'left' && issue.startDate + e.movementX * this.msPerPx + this.msPerDay < issue.endDate){
        issue.startDate = issue.startDate + e.movementX * this.msPerPx;
      }
      this.checkBounds(issue);
    }
    this.mouseUp = (e: any) => {
      document.removeEventListener('mousemove', this.mouseMove);
      document.removeEventListener('mouseup', this.mouseUp);
    }
    document.addEventListener('mousemove', this.mouseMove);
    document.addEventListener('mouseup', this.mouseUp);
  }
  dragStartAnchor(event: DragEvent, element: HTMLDivElement) {
    event.preventDefault();
    this.dragItem = element;
    let moveElem = document.createElement('div');
    moveElem.style.left = event.clientX + 'px';
    moveElem.style.top = event.clientY + 'px';
    moveElem.style.position = 'fixed';
    moveElem.style.display = 'block';
    document.body.appendChild(moveElem);
    let line = new LeaderLine(element, moveElem);
    this.mouseMove = (e: any) => {
      moveElem.style.left = e.clientX + 'px';
      moveElem.style.top = e.clientY + 'px';
      line.position();
    }
    this.mouseUp = (e: any) => {
      document.removeEventListener('mousemove', this.mouseMove);
      document.removeEventListener('mouseup', this.mouseUp);
      line.remove();
    }
    document.addEventListener('mousemove', this.mouseMove);
    document.addEventListener('mouseup', this.mouseUp);
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


  getDayFrom(number: number, date = this.startDate.getTime()) {
    return Math.round((number - date) / this.msPerPx);
  }

  moveResize(event: MouseEvent, issue: any, index: number, side = 'right') {
    event.preventDefault();
    event.stopPropagation();
    if (this.moveSide == side && this.action == 'resize' && this.dragIndex == index){
      let diff = event.offsetX - this.arrowPadding / 2;
      if (side == 'right'){
        if (issue.startDate + this.minWidth < issue.endDate + diff * this.msPerPx){
          issue.endDate = issue.endDate + diff * this.msPerPx;
        }
      }
      else{
        if (issue.startDate + diff * this.msPerPx + this.minWidth < issue.endDate){
          issue.startDate = issue.startDate + diff * this.msPerPx;
        }
      }
      this.checkBounds(issue);
    }
  }


  getRightArrow(issue: any) {
    return{
      position: 'absolute',
      left: (this.getDayFrom(issue.endDate) - 12) + 'px',
      top: '2px',
      width: '12px',
      height: this.issueHeight + 'px',
      cursor: 'ew-resize',
      'background-color': 'rgba(33, 150, 243, 0.12)',
      'border-top-right-radius': '12px',
      'border-bottom-right-radius': '12px',
      'z-index': 10,
    }
  }
  getLeftArrow(issue: any) {
    return{
      position: 'absolute',
      left: (this.getDayFrom(issue.startDate)) + 'px',
      top: '2px',
      width: '12px',
      height: this.issueHeight + 'px',
      cursor: 'ew-resize',
      'background-color': 'rgba(33, 150, 243, 0.12)',
      'border-top-left-radius': '12px',
      'border-bottom-left-radius': '12px',
      'z-index': 10,
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


  getLeftAnchor(issue: any) {
    return{
      position: 'absolute',
      left: (this.getDayFrom(issue.startDate) - 20) + 'px',
      width: this.arrowPadding,
      height: this.anchorSize,
    }
  }

  getRightAnchor(issue: any) {
    return{
      position: 'absolute',
      left: (this.getDayFrom(issue.endDate) - this.anchorSize + 20) + 'px',
      width: this.arrowPadding,
      height: this.anchorSize,
    }
  }

  onAnchorDrop(event: MouseEvent, element: HTMLElement) {
    let leader = new LeaderLine(this.dragItem, element, {
      startSocketGravity: [0, 0],
      endSocketGravity: [0, 0],
      path: 'grid',
      startPlug: 'behind',
      color: '#cecece',
      gradient: true,
      size: 1.5,
    });
    this.leaders.push(leader);
    let svgs = document.getElementsByClassName('leader-line');
    let svg = svgs.item(svgs.length - 1) as HTMLElement;
    svg.addEventListener('mouseenter', (event) => {
      leader.color = '#E91E63';
      document.body.style.cursor = 'url("assets/icons/remove.png"), auto';
    });
    svg.addEventListener('mouseleave', (event) => {
      leader.color = '#cecece';
      document.body.style.cursor = 'auto';
    });
    svg.addEventListener('click', (event) => {
      leader.remove();
      this.leaders.splice(leader._id - 1, 1);
      document.body.style.cursor = 'auto';
    });
  }

  dragEnd(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    console.log('drag end');
    document.removeEventListener('mousemove', this.mouseMove);
  }

  dragOverMove(){

  }

}
