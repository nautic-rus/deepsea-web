import { Component, OnInit } from '@angular/core';
import {GANTT_GLOBAL_CONFIG} from "@worktile/gantt";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {IssueManagerService} from "../../domain/issue-manager.service";
import _ from "underscore";
import {Issue} from "../../domain/classes/issue";

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
  daysBefore = 14;
  daysAfter = 36;
  startDate = new Date(this.currentDate - this.msPerDay * this.daysBefore).getTime();
  endDate = new Date(this.startDate + this.msPerDay * this.daysAfter).getTime();
  days: any[] = [];
  dayWidth = 50;
  dayHeight = 30;
  timeLineLength = this.endDate - this.startDate;
  msPerPx = this.timeLineLength / (this.daysBefore + this.daysAfter + 1) / this.dayWidth;


  constructor(private auth: AuthManagerService, private issueManager: IssueManagerService) { }

  ngOnInit(): void {
    for (let day = this.startDate; day < this.endDate; day = day + this.msPerDay){
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
  getRowStyle(){
    return{
      height: this.dayHeight + 'px',
      width: (this.timeLineLength * 50) + 'px',
      'background-color': 'rgba(248,246,246,0.7)',
    }
  }
  getIssueRowStyle(issue: any) {
    return{
      position: 'absolute',
      left: this.getDayFrom(issue.startDate) + 'px',
      width: this.getDayFrom(issue.endDate, issue.startDate) + 'px',
      height: this.dayHeight + 'px',
      'background-color': 'rgba(74,120,99,0.81)',
    }
  }
  dragStart(event: DragEvent, row: HTMLElement, i: number, action = 'move') {
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
  }
  moveOverTimelineThis(event: DragEvent, issue: any, i: number) {
    event.preventDefault();
    event.stopPropagation();
    if (this.dragIndex == i && this.action == 'move'){
      // @ts-ignore
      let width = this.getDayFrom(issue.endDate, issue.startDate) / 2;
      issue.startDate = issue.startDate + (event.offsetX - width)  * this.msPerPx;
      issue.endDate = issue.endDate + (event.offsetX - width) * this.msPerPx;
    }
  }
  moveOverTimeline(event: DragEvent, issue: any, i: number) {
    event.preventDefault();
    event.stopPropagation();
    if (this.dragIndex == i && this.action == 'move') {
      // @ts-ignore
      let width = issue.endDate - issue.startDate;
      issue.startDate = this.startDate + event.offsetX * this.msPerPx + width;
      issue.endDate = issue.startDate + width;
    }
    else if (this.dragIndex == i && this.action == 'resize') {
      // @ts-ignore
      let width = issue.endDate - issue.startDate;
      issue.endDate = this.startDate + event.offsetX * this.msPerPx;
    }
  }

  getDayFrom(number: number, date = this.startDate) {
    return Math.round((number - date) / this.msPerPx);
  }

  moveResize(event: MouseEvent, issue: any) {
    event.preventDefault();
    event.stopPropagation();
    // @ts-ignore
    // issue.endDate = issue.endDate + (event.offsetX - 15 / 2) * this.msPerPx;
  }


  getRightArrow(issue: any) {
    return{
      position: 'absolute',
      left: (this.getDayFrom(issue.endDate) + 15) + 'px',
      height: this.dayHeight + 'px',
    }
  }
}
