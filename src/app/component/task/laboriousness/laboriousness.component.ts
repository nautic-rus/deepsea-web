import { Component, OnInit } from '@angular/core';
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {LanguageService} from "../../../domain/language.service";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {Issue} from "../../../domain/classes/issue";
import {MessageService} from "primeng/api";
import {DailyTask} from "../../../domain/interfaces/daily-task";
import {ConsumedHour, PlanHour} from "../../work-hours/work-hours.component";
import _ from "underscore";
import {ShowTaskComponent} from "../../navi/daily-tasks/show-task/show-task.component";
import {TaskComponent} from "../task.component";

@Component({
  selector: 'app-laboriousness',
  templateUrl: './laboriousness.component.html',
  styleUrls: ['./laboriousness.component.css']
})
export class LaboriousnessComponent implements OnInit {

  hoursAmount = 0;
  calendarDay: Date = new Date();
  comment = '';
  today: Date = new Date();
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
  constructor(public t: LanguageService, public ref: DynamicDialogRef, private issues: IssueManagerService, private auth: AuthManagerService, public conf: DynamicDialogConfig, private messageService: MessageService, public dialogService: DialogService) { }

  ngOnInit(): void {
    this.issue = this.conf.data as Issue;
    this.auth.getConsumedPlanHours(this.auth.getUser().id).subscribe(consumed => {
      this.consumed = consumed;
      let consumedIds = this.consumed.map(x => x.hour_id);
      console.log(consumedIds);
      this.auth.getUsersPlanHours(this.auth.getUser().id, 0, 1).subscribe(userPlanHours => {
        this.userPlanHours = userPlanHours;
        this.userPlanHoursToday = userPlanHours.filter(x => x.day == this.today.getDate() && x.month == this.today.getMonth() && x.year == this.today.getFullYear() && x.hour_type == 1);
        this.taskHours = userPlanHours.filter(x => x.task_id == this.issue.id);
        let availableForTask = this.taskHours.filter(x => !consumedIds.includes(x.id));
        let availableForTaskToday = this.userPlanHoursToday.filter(x => x.task_id == this.issue.id && !consumedIds.includes(x.id));
        this.availableToday = this.userPlanHoursToday.filter(x => !consumedIds.includes(x.id));
        this.hoursLeft = this.availableToday.length;
        this.hoursLeftByTask = availableForTask.length;
        this.hoursLeftByTaskToday = availableForTaskToday.length;

        this.issues.getIssues(this.auth.getUser().login).then(issues => {
          this.userIssues = issues;
          _.forEach(_.groupBy(this.userPlanHoursToday, x => x.task_id), gr => {
            console.log(gr);
            console.log(consumedIds);
            let findTask = this.userIssues.find(x => x.id == gr[0].task_id);
            if (findTask != null){
              this.planTasks.push({
                name: findTask.name + ', ' + findTask.doc_number,
                taskId: findTask.id,
                planned: gr.length,
                consumed: gr.filter(x => consumedIds.includes(x.id)).length
              });
            }
          });
        });
      });
    });
  }
  commit(){
    if (this.hoursLeft < this.hoursAmount){
      this.messageService.add({key:'task', severity:'error', summary:'Ошибка', detail:'На хватает свободных часов для списания на сегодня'});
      return;
    }
    // if (this.hoursLeftByTask < this.hoursAmount){
    //   this.messageService.add({key:'task', severity:'error', summary:'Ошибка', detail:'На хватает плановых часов задачи для списания'});
    //   return;
    // }
    let consume = _.sortBy(this.availableToday, x => x.id).slice(0, this.hoursAmount);
    console.log(consume);
    this.auth.consumePlanHours(consume, this.auth.getUser().id, this.issue.id, this.comment).subscribe(res => {
      this.close();
    });
    this.commitAux();
  }
  commitAux(){
    let issue = this.conf.data as Issue;
    let t: DailyTask = new DailyTask(
      issue.id,
      this.calendarDay.getTime(),
      new Date().getTime(),
      this.auth.getUser().login,
      issue.project,
      this.comment,
      +this.hoursAmount,
      0,
      this.auth.getUserName(this.auth.getUser().login),
      issue.doc_number,
      '',
      0,
      0,
      '',
      '',
      '',
      false,
    );
    if (+this.hoursAmount + issue.labor > issue.plan_hours){
      // this.messageService.add({
      //   severity: 'error',
      //   summary: 'Ошибка',
      //   detail: 'Количество затраченых на работу часов больше чем плановое количество'
      // });
      // return;
    }
    this.issues.addDailyTask(t.toJson()).then(r => {
      this.ref.close('success');
    });
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

  notPlannedToday() {
    return this.planTasks.filter(x => x.taskId == this.issue.id).length == 0;
  }
}
