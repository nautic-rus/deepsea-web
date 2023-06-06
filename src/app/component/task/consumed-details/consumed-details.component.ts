import { Component, OnInit } from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {Issue} from "../../../domain/classes/issue";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {ConsumedHour, PlanHour} from "../../work-hours/work-hours.component";
import _ from "underscore";
import {LanguageService} from "../../../domain/language.service";

@Component({
  selector: 'app-consumed-details',
  templateUrl: './consumed-details.component.html',
  styleUrls: ['./consumed-details.component.css']
})
export class ConsumedDetailsComponent implements OnInit {

  issue: Issue;
  planHours: PlanHour[] = [];
  cons: any[] = [];
  consumed: ConsumedHour[] = [];
  constructor(public config: DynamicDialogConfig, public auth: AuthManagerService, public ref: DynamicDialogRef, public t: LanguageService) { }

  ngOnInit(): void {
    this.issue = this.config.data;
    this.auth.getConsumedPlanHours(0).subscribe(consumed => {
      this.consumed = consumed;
      let consumedByIssue = this.consumed.filter(x => x.task_id == this.issue.id);
      _.uniq(consumedByIssue.map(x => x.user_id)).forEach(userId => {
        this.auth.getUsersPlanHours(userId, 0, 1).subscribe(planHours => {
          this.planHours = this.planHours.concat(planHours);
        });
      });
      let cons: any[] = [];
      _.forEach(_.groupBy(this.consumed.filter(x => x.task_id == this.issue.id), x => (x.date_inserted, x.user_id, x.comment)), gr => {
        cons.push({date: gr[0].date_inserted, user: gr[0].user_id, comment: gr[0].comment, value: gr.length});
        this.cons = this.cons.concat(cons);
      });
    });
  }

  getConsumed(){
    let res: any[] = [];
    _.forEach(_.groupBy(this.consumed.filter(x => x.task_id == this.issue.id), x => (x.date_inserted, x.user_id, x.comment)), gr => {
      res.push({date: gr[0].date_inserted, user: gr[0].user_id, comment: gr[0].comment, value: gr.length});
    });
    return res;
  }
  getDate(dateLong: number): string{
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
  }

  close() {
    this.ref.close();
  }
}
