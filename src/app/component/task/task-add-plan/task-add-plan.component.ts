import { Component, OnInit } from '@angular/core';
import {ConsumedHour, PlanHour} from "../../work-hours/work-hours.component";
import {Issue} from "../../../domain/classes/issue";
import {LanguageService} from "../../../domain/language.service";
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {MessageService} from "primeng/api";
import _, {any, where} from "underscore";
import {DailyTask} from "../../../domain/interfaces/daily-task";
import {TaskComponent} from "../task.component";
import {DayInterval, PlanByDays, PlanInterval} from "../../plan/plan.component";

@Component({
  selector: 'app-task-add-plan',
  templateUrl: './task-add-plan.component.html',
  styleUrls: ['./task-add-plan.component.css']
})
export class TaskAddPlanComponent implements OnInit {


  hoursAmount = 0;
  calendarDay: Date = new Date();
  comment = '';
  today: Date = new Date();
  disabledDates: Date[] = [];
  infoText = '';
  hoursLeft = 0;
  hoursLeftByTask = 0;
  hoursLeftByTaskToday = 0;
  consumed: ConsumedHour[] = [];
  userPlanHours: PlanHour[] = [];
  userPlanHoursToday: PlanHour[] = [];
  taskHours: PlanHour[] = [];
  issue: Issue;
  availableToday: PlanHour[] = [];
  planTasks: any[] = [];
  userIssues: Issue[] = [];

  plan: PlanByDays[] = [];
  ints: DayInterval[] = [];
  userPlan: PlanByDays[] = [];
  planToday: PlanByDays;
  plannedTodayWarning = false;
  minDate = new Date();

  constructor(public t: LanguageService, public ref: DynamicDialogRef, private issues: IssueManagerService, private auth: AuthManagerService, public conf: DynamicDialogConfig, private messageService: MessageService, public dialogService: DialogService) { }

  ngOnInit(): void {
    this.minDate = new Date(this.minDate.getTime() - 24 * 60 * 60 * 1000);
    while (this.minDate.getDay() == 0 || this.minDate.getDay() == 6){
      this.minDate = new Date(this.minDate.getTime() - 24 * 60 * 60 * 1000);
    }
    this.disabledDates = this.getDisabledDates(this.minDate, this.calendarDay);
    this.issue = this.conf.data as Issue;
    this.fillByDate();
  }
  fillByDate(){
    this.auth.getPlanByDays(this.calendarDay.getTime()).subscribe(res => {
      this.plan = res.flatMap((x: any) => x.plan);
      this.ints = res.flatMap((x: any) => x.plan.flatMap((y: any) => y.ints));
      let findUserPlan = res.find((x: any) => x.userId == this.auth.getUser().id);
      if (findUserPlan != null){
        this.userPlan = findUserPlan.plan;
      }
      let year = this.calendarDay.getFullYear();
      let month =  this.calendarDay.getMonth();
      let day = this.calendarDay.getDate();
      if (this.userPlan != null){
        let planToday = this.userPlan.find(x => x.day == day && x.month == month && x.year == year);
        if (planToday != null){
          this.hoursLeft = 0;
          this.planToday = planToday;
          this.plannedTodayWarning = planToday.ints.filter(x => x.taskId == this.issue.id).length == 0;
        }
      }
    });
  }
  commit(){
    this.auth.addManHours(this.issue.id, this.auth.getUser().id, this.calendarDay.getTime(), this.hoursAmount, this.comment).subscribe(res => {
      if (res.includes('success')){
        this.ref.close('success');
      }
      else{
        alert(res);
      }
    });
    // this.auth.insertConsumedPlanInterval(this.issue.id, this.auth.getUser().id, this.calendarDay.getTime(), this.hoursAmount, 0).subscribe(res => {
    //   if (res.includes('success')){
    //     this.ref.close('success');
    //   }
    //   else{
    //     alert(res);
    //   }
    // });
  }
  generateId(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() *
        charactersLength));
    }
    return result;
  }
  close() {
    this.ref.close('exit');
  }

  openTask(taskId: number) {
    this.issues.getIssueDetails(taskId).then(res => {
      this.dialogService.open(TaskComponent, {
        showHeader: false,
        modal: true,
        data: res
      });
    });
  }

  plannedToday(d1: number, d2: number, today: number = this.calendarDay.getTime()){
    return (this.sameDay(d1, today) || this.sameDay(d2, today) || (d1 < today && today < d2));
  }
  sameDay(date1: number, date2: number){
    let d1 = new Date(date1);
    let d2 = new Date(date2);
    return d1.getFullYear() == d2.getFullYear() && d1.getMonth() == d2.getMonth() && d1.getDate() == d2.getDate();
  }

  getDisabledDates(minDate: Date, calendarDay: Date) {
    let disabled = [];
    let start = minDate;
    while (start < calendarDay){
      if (start.getDay() == 0 || start.getDay() == 6){
        disabled.push(start);
      }
      start = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    }
    return disabled;
  }
}
