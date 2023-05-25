import { Component, OnInit } from '@angular/core';
import _ from "underscore";
import {IssueManagerService} from "../../domain/issue-manager.service";
import {Issue} from "../../domain/classes/issue";
import {DailyTask} from "../../domain/interfaces/daily-task";
import {DailyTasksComponent} from "../navi/daily-tasks/daily-tasks.component";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {CalendarDay} from "../../domain/classes/calendar-day";
import {DeleteComponent} from "../task/delete/delete.component";
import {ShowTaskComponent} from "../navi/daily-tasks/show-task/show-task.component";
import {User} from "../../domain/classes/user";
import {MenuItem} from "primeng/api";
import {ConsumedHour, PlanHour, PlannedHours} from "../work-hours/work-hours.component";
export class SpecialDay{
  day: number;
  month: number;
  year: number;
  kind: string;
  constructor(day: number, month: number, year: number, kind: string) {
    this.day = day;
    this.month = month;
    this.year = year;
    this.kind = kind;
  }
}
@Component({
  selector: 'app-month-tasks',
  templateUrl: './month-tasks.component.html',
  styleUrls: ['./month-tasks.component.css']
})
export class MonthTasksComponent implements OnInit {

  date = new Date();
  daysInMonth: any[] = [];
  monthName = '';
  monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  issues: Issue[] = [];
  issuesRkd: Issue[] = [];
  tasksSrc: DailyTask[] = [];
  tasks: DailyTask[] = [];
  projects: string[] = ['NR002', 'NR004', 'OTHER'];
  selectedUser: User;
  showError = false;
  options = {
    initialDate : '2019-01-01',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    editable: true,
    selectable:true,
    selectMirror: true,
    dayMaxEvents: true
  };
  users: User[] = [];
  consumed: ConsumedHour[] = [];
  consumedIds: number[] = [];
  planned: PlanHour[] = [];


  calendar: CalendarDay[] = [];
  dayOfWeek = {
    opacity: '1',
    transition: 'opacity 4s'
  };

  items: MenuItem[] = [];
  selectedTask: any = null;
  specialDays: SpecialDay[] = [
    new SpecialDay(2, 1, 2023, "weekend"),
    new SpecialDay(3, 1, 2023, "weekend"),
    new SpecialDay(4, 1, 2023, "weekend"),
    new SpecialDay(5, 1, 2023, "weekend"),
    new SpecialDay(6, 1, 2023, "weekend"),
    new SpecialDay(22, 2, 2023, "short"),
    new SpecialDay(23, 2, 2023, "weekend"),
    new SpecialDay(7, 3, 2023, "short"),
    new SpecialDay(8, 3, 2023, "weekend"),
    new SpecialDay(1, 5, 2023, "weekend"),
    new SpecialDay(8, 5, 2023, "weekend"),
    new SpecialDay(9, 5, 2023, "weekend"),
    new SpecialDay(12, 6, 2023, "weekend"),
    new SpecialDay(3, 11, 2023, "short"),
    new SpecialDay(6, 11, 2023, "weekend"),
  ];

  constructor(public issueManager: IssueManagerService, public dialogService: DialogService, public auth: AuthManagerService, public ref: DynamicDialogRef) { }

  getDay(): number{
    return this.date.getDate();
  }
  getMonth(){
    return this.date.getMonth();
  }
  getYear(){
    return this.date.getFullYear();
  }
  getDaysOfTheMonth(month = this.getMonth(), year = this.getYear()){
    return new Date(year, month + 1, 0).getDate();
  }
  getDays(change = 0){
    return this.getDaysOfTheMonth(this.date.getMonth() + change, this.date.getFullYear());
  }
  getDayOfWeek(day: number, month: number = this.getMonth(), year: number = this.getYear()){
    return new Date(year, month, day).getDay();
  }
  // getWeekNumber(day: number, monthChange = 0){
  //   let date = new Date(this.getYear(), this.getMonth() + monthChange, day);
  //   let firstJan = new Date(date.getFullYear(), 0, 1);
  //   return Math.ceil((((date.getTime() - firstJan.getTime()) / 86400000) + firstJan.getDay() + 1) / 7) - 1;
  // }
  getWeekNumber(day: number, monthChange = 0){
    let currentDate = new Date(this.getYear(), this.getMonth() + monthChange, day);
    let startDate = new Date(currentDate.getFullYear(), 0, 1);
    let days = Math.floor((currentDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    return  Math.ceil(days / 7);
  }
  toArray42(length: number){
    let result = [];
    result.push('s');
    let additionalDays = this.getDayOfWeek(0, this.getMonth(), this.getYear());
    let daysOfPrevMonth = this.getDaysOfTheMonth(this.getMonth() - 1);
    for (let x = additionalDays; x > 0; x --){
      result.push('hb' + (daysOfPrevMonth - x + 1));
      if (result.length % 8 == 0){
        result.push('s');
      }
    }
    for (let x = 0; x < length; x++){
      result.push(x + 1);
      if (result.length % 8 == 0){
        result.push('s');
      }
    }
    additionalDays = 48 - result.length;
    for (let x = 1; x <= additionalDays; x ++){
      result.push('ha' + x);
      if (result.length % 8 == 0){
        result.push('s');
      }
    }
    return result.slice(0, 48);
  }
  isDayWeekEnd(day: number, monthChange = 0){
    let result = false;
    let date = new Date(this.getYear(), this.getMonth() + monthChange, day);
    let dayOfWeek = date.getDay();
    if (dayOfWeek == 0 || dayOfWeek == 6){
      result = true;
    }
    let findSpecial = this.specialDays.find(x => x.day == day && x.month - 1 == date.getMonth() && x.year == date.getFullYear());
    if (findSpecial != null && findSpecial.kind == "weekend"){
      result = true;
    }
    return result;
  }
  isDayCurrent(day: number, month: number = this.getMonth(), year: number = this.getYear()) {
    let date = new Date();
    return date.getDate() == day && date.getMonth() == month && date.getFullYear() == year;
  }
  isDaySunday(day: number, monthChange = 0){
    let result = false;
    let date = new Date(this.getYear(), this.getMonth() + monthChange, day);
    let dayOfWeek = date.getDay();
    if (dayOfWeek == 0){
      result = true;
    }
    return result;
  }
  getCalendar(){
    let calendar: CalendarDay[] = [];
    this.monthName = this.monthNames[this.date.getMonth()];
    let days = this.toArray42(this.getDays());
    let index = 0;
    days.forEach(day => {
      if (day == null) {
        calendar.push(new CalendarDay());
      }
      else {
        let cDay = new CalendarDay();
        cDay.number = day;
        if (!(day.toString().includes('s') || day.toString().includes('h'))){
          cDay.isSunday = this.isDaySunday(+day);
          cDay.isWeekend = this.isDayWeekEnd(+day);
          cDay.isCurrent = this.isDayCurrent(+day);
        }
        if (!isNaN(cDay.number)){
          cDay.tasks = this.getTasksOfDay(cDay.number);
          cDay.tasks.forEach((t: any) => {
            cDay.sum += t.time;
          });
        }
        if (day.toString().includes('s')){
          let monthChange = 0;
          if (days[index + 1].toString().includes('b')){
            monthChange = -1;
          }
          if (days[index + 1].toString().includes('a')){
            monthChange = 1;
          }
          cDay.weekNumber = this.getWeekNumber(+days[index + 1].toString().replace('h', '').replace('s', '').replace('b', '').replace('a', ''), monthChange);
        }
        calendar.push(cDay);
      }
      index++;
    });
    return calendar;
  }

  ngOnInit(): void {
    this.items = [
      {
        label: 'Open',
        icon: 'pi pi-fw pi-external-link',
        command: (event: any) => this.openTask(this.selectedTask)
      },
      {
        label: 'Delete',
        icon: 'pi pi-fw pi-trash',
        command: (event: any) => this.deleteDailyTask()
      }
    ];
    setTimeout(() => {
      this.users = this.auth.users.filter(x => x.visibility.includes('c') && x.groups.includes('Engineers') || x.groups.includes('Hull Engineers') || x.groups.includes('Chief of Department') || x.groups.includes('Managers') || x.groups.includes('Admin'));
      this.selectedUser = this.auth.getUser();
      this.fillTasks();
    }, 500);
  }
  fillTasks(){
    this.auth.getConsumedPlanHours(this.selectedUser.id).subscribe(consumedValue => {
      this.consumed = consumedValue;
      this.consumedIds = consumedValue.map(x => x.hour_id);
      this.auth.getUsersPlanHours(this.selectedUser.id, 0, 1).subscribe(planned => {
        this.planned = planned;
        this.issueManager.getIssues('op').then(resIssues => {
          this.issues = resIssues;
          this.calendar = this.getCalendar();
        });
      })
    });
  }
  changeUser(){
    this.fillTasks();
  }
  getTasksOfDay(day: number){
    let res: DailyTask[] = [];
    let userPlanHours = this.planned.filter(x => x.user == this.selectedUser.id && x.task_id != 0).filter(x => this.consumedIds.includes(x.id));
    let userPlanHoursToday = userPlanHours.filter(x => x.day == day && x.month == this.date.getMonth() && x.year == this.date.getFullYear() && x.hour_type == 1);
    _.forEach(_.groupBy(userPlanHoursToday, x => x.task_id), gr => {
      let id = gr[0].task_id;
      let issue = this.issues.find(x => x.id == id);
      if (issue != null){
        res.push(new DailyTask(
          id,
          this.date,
          this.date,
          this.selectedUser.login,
          issue.project,
          issue.name,
          gr.length,
          0,
          issue.assigned_to,
          issue.doc_number,
          issue.action,
          0,
          0,
          issue.action,
          issue.project,
          issue.doc_number,
          false
        ));
      }
    });
    return res;
  }
  sameDay(dLong1: number, dLong2: number) {
    let d1 = new Date(dLong1);
    let d2 = new Date(dLong2);
    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
  }
  trimText(input: string, length = 10){
    if (input == null){
      return '';
    }
    let res = input;
    if (res.length > length){
      res = res.substr(0, length) + '..';
    }
    return res;
  }
  addDayTask(day: any) {
    this.dialogService.open(DailyTasksComponent, {
      showHeader: false,
      modal: true,
      data: [day.number == -1 ? new Date() : new Date(this.date.getFullYear(), this.date.getMonth(), day.number), day.sum]
    }).onClose.subscribe(res => {
      setTimeout(() => {
        this.fillTasks();
      }, 100);
    });
  }
  openTask(task: any){
    if (task.issueId != 0){
      window.open('/?taskId=' + task.issueId, '_blank');
      return;
    }
    this.dialogService.open(ShowTaskComponent, {
      showHeader: false,
      modal: true,
      data: task,
    }).onClose.subscribe(res => {
      if (res == 'delete'){
        setTimeout(() => {
          this.fillTasks();
        }, 100);
      }
    });
  }

  deleteDailyTask() {
    this.issueManager.deleteDailyTask(this.selectedTask.id).then(() => {
    });
    this.tasks = this.tasks.filter(x => x.id != this.selectedTask.id);
    this.calendar = this.getCalendar();
  }

  changeMonth(value: number) {
    this.showError = false;
    this.date = new Date(this.date.getFullYear(), this.date.getMonth() + value, 1);
    this.fillTasks();
  }

  getTime(time: number){
    return this.getHours(time) + ':' + this.getMinutes(time);
  }
  getHours(time: number) {
    let hours = Math.floor(time).toString();
    if (hours.length == 1){
      hours = '0' + hours;
    }
    return hours;
  }
  getMinutes(time: number){
    let minutes = Math.round((time - Math.floor(time)) * 60).toString();
    if (minutes.length == 1){
      minutes = '0' + minutes;
    }
    return minutes;
  }

  selectTask(task: any) {
    this.selectedTask = task;
  }
}
