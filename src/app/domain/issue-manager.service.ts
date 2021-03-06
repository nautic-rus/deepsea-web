import { Injectable } from '@angular/core';
import {CookieService} from "ngx-cookie-service";
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import {MessageService} from "primeng/api";
import * as props from "../props";
import {FileAttachment} from "./classes/file-attachment";
import {Issue} from "./classes/issue";
import {IssueMessage} from "./classes/issue-message";
import {ViewedIssue} from "./classes/viewed-issue";
import {AuthManagerService} from "./auth-manager.service";
import {HullPL} from "./classes/hull-pl";
import {LanguageService} from "./language.service";
import {DayCalendar} from "./classes/day-calendar";
import {IssuePeriod} from "./classes/issue-period";
import {IssueType} from "./classes/issue-type";
import {TimeControlInterval} from "./classes/time-control-interval";
import {SfiCode} from "./classes/sfi-code";
import {Weather} from "./classes/weather";
import {IssueCheck} from "./classes/issue-check";

@Injectable({
  providedIn: 'root'
})
export class IssueManagerService {
  constructor(private lang: LanguageService, private cookie: CookieService, private http: HttpClient, private router: Router, private messageService: MessageService, public auth: AuthManagerService) {

  }
  async uploadFile(file: File, user: string, fileName: string = file.name) {
    const formData: FormData = new FormData();
    formData.append('file', file, fileName);
    return await this.http.post<FileAttachment>(props.http + '/createFileUrl', formData, {params: {user}}).toPromise();
  }
  async uploadFileToCloud(file: File, filePath: string, login: string, password: string) {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    return await this.http.post<FileAttachment>(props.http + '/createFileCloudUrl', formData, {params: {filePath, login, password}}).toPromise();
  }
  async assignUser(id: number, user: string, startDate: string, dueDate: string, overtime: string, action: string, author: string){
    return await this.http.get<string[]>(props.http + '/assignIssue', {params: {id, user, startDate, dueDate, overtime, action, author}}).toPromise();
  }
  async changeResponsible(id: number, user: string){
    return await this.http.get<string[]>(props.http + '/changeResponsible', {params: {id, user}}).toPromise();
  }
  async sendToApproval(id: number, users: string[], filesToApproval: FileAttachment[], textToApproval: string, taskStatus: string, taskRevision: string){
    return await this.http.get<string[]>(props.http + '/sendToApproval', {params: {id, users: JSON.stringify(users), filesToApproval: JSON.stringify(filesToApproval), textToApproval, taskStatus, taskStatusApproval: 'New', taskTypeApproval: 'Approval', taskRevision}}).toPromise();
  }
  async getIssueDepartments() {
    return await this.http.get<string[]>(props.http + '/issueDepartments').toPromise();
  }
  async getIssueProjects() {
    return await this.http.get<string[]>(props.http + '/issueProjects').toPromise();
  }
  async getIssuePeriods() {
    return await this.http.get<IssuePeriod[]>(props.http + '/issuePeriods').toPromise();
  }
  async getIssueTypes() {
    return await this.http.get<IssueType[]>(props.http + '/issueTypes').toPromise();
  }
  async getTaskPriorities() {
    return await this.http.get<string[]>(props.http + '/issuePriorities').toPromise();
  }
  async startIssue(issue: Issue){
    return await this.http.post<string>(props.http + '/startIssue', JSON.stringify(issue)).toPromise();
  }
  async getIssues(login: string): Promise<Issue[]> {
    return await this.http.get<Issue[]>(props.http + '/issues', {params: {user: login}}).toPromise();
  }
  async getIssuesViewed(login: string): Promise<ViewedIssue[]> {
    return await this.http.get<ViewedIssue[]>(props.http + '/issuesViewed', {params: {user: login}}).toPromise();
  }
  async getIssueDetails(id: number): Promise<Issue> {
    return await this.http.get<Issue>(props.http + '/issueDetails', {params: {id}}).toPromise();
  }
  async getHullPartList(docNum: string): Promise<HullPL> {
    return await this.http.get<HullPL>(props.httpSpec + '/getHullPartList', {params: {docNum}}).toPromise();
  }
  async getCheckTemplates(user: string): Promise<any[]> {
    return await this.http.get<any[]>(props.http + '/checkTemplates', {params: {user}}).toPromise();
  }
  async initHullPartList(project: string, taskId: number, docNum: string, docName: string, user: string): Promise<string> {
    return await this.http.get<string>(props.httpSpec + '/initHullPartList', {params: {project, taskId, docNum, docName, user}}).toPromise();
  }
  async updateIssue(user: string, message: string, issue: Issue): Promise<Issue> {
    return await this.http.post<Issue>(props.http + '/updateIssue', JSON.stringify(issue), {params: {user, message}}).toPromise();
  }
  async setHullPartList(project: string, docNumber: string, user: string, revision: string) {
    return await this.http.get(props.httpSpec + '/setHullPartList', {responseType: 'text', params: {project, docNumber, user, revision}}).toPromise();
  }
  async setIssueStatus(id: string, user: string, status: string): Promise<string> {
    return await this.http.get<string>(props.http + '/setIssueStatus', {params: {id: id, user: user, status: status}}).toPromise();
  }
  async setIssueMessage(id: string, message: IssueMessage): Promise<string> {
    return await this.http.post<string>(props.http + '/setIssueMessage', JSON.stringify(message), {params: {id}}).toPromise();
  }
  async setIssueChecks(issue_id: number, checks: IssueCheck[]): Promise<string> {
    return await this.http.post<string>(props.http + '/setIssueChecks', JSON.stringify(checks), {params: {issue_id}}).toPromise();
  }
  async updateIssueCheck(issue_id: number, user: string, check_description: string, check_group: string, check_status: number): Promise<string> {
    return await this.http.get<string>(props.http + '/updateIssueCheck', {params: {issue_id, user, check_description, check_group, check_status}}).toPromise();
  }
  async removeIssue(id: number, user: string): Promise<string>{
    return await this.http.get<string>(props.http + '/removeIssue', {params: {id, user}}).toPromise();
  }
  async deleteFile(url: string): Promise<string>{
    return await this.http.get<string>(props.http + '/deleteFile', {params: {url}}).toPromise();
  }
  async deleteRevisionFile(file_url: string, user: string): Promise<string>{
    return await this.http.get<string>(props.http + '/deleteRevisionFile', {params: {file_url, user}}).toPromise();
  }
  async setIssueViewed(id: number, user: string): Promise<string>{
    return await this.http.get<string>(props.http + '/setIssueViewed', {params: {id, user}}).toPromise();
  }
  async setDayCalendar(user: string, day: string, status: string): Promise<string>{
    return await this.http.get<string>(props.http + '/setDayCalendar', {params: {user, day, status}}).toPromise();
  }
  async setRevisionFiles(id: number, revision: string, files: string): Promise<string>{
    return await this.http.post<string>(props.http + '/setRevisionFiles', files, {params: {id, revision}}).toPromise();
  }
  async getRevisionFiles(): Promise<any>{
    return await this.http.get<any>(props.http + '/revisionFiles').toPromise();
  }
  async setIssueLabor(user: string, issue_id: number, labor_value: number, labor_comment: string, date: number){
    return await this.http.get<string>(props.http + '/setLabor', {params: {user, issue_id, labor_value, labor_comment, date}}).toPromise();
  }
  async getCalendar(): Promise<DayCalendar[]>{
    return await this.http.get<DayCalendar[]>(props.http + '/daysCalendar').toPromise();
  }
  async getTimeControl(user: number){
    return await this.http.get<TimeControlInterval[]>(props.http + '/timeControl', {params: {user}}).toPromise();
  }
  async getTimeAndWeather(){
    return await this.http.get<Weather>(props.http + '/timeAndWeather').toPromise();
  }
  async shareRights(user: string, with_user: string){
    return await this.http.get<string>(props.http + '/shareRights', {params: {user, with_user}}).toPromise();
  }
  async getSfiCodes(){
    return await this.http.get<SfiCode[]>(props.http + '/sfiCodes').toPromise();
  }
  async getForanParts(project = 'N004'){
    return await this.http.get(props.httpSpec + '/foranPartsExcel', { responseType: 'text', params: {project}}).toPromise();
  }
  async getIssueSpentTime(){
    return await this.http.get<any[]>(props.http + '/issueSpentTime', {responseType: "json"}).toPromise();
  }
  async clearRevisionFiles(issueId: number, user: string, fileGroup: string, revision: string) {
    return await this.http.get(props.http + '/clearRevisionFiles', { responseType: 'text', params: {issueId, user, fileGroup, revision}}).toPromise();
  }
  async getNestingFiles() {
    return await this.http.get<FileAttachment[]>(props.http + '/nestingFiles').toPromise();
  }
  async getAmountTask(project:string, department:string, status: string) {
    return await this.http.get(props.http + '/getAmountTask',{params: {project, department, status}}).toPromise(); //reques amount of task
  }
  async dingUser(user: string, message: string) {
    return await this.http.get(props.http + '/sendNotificationToUser',{params: {user, message}}).toPromise();
  }
  localeStatus(input: string, styled = true): string {
    switch (this.lang.language) {
      case 'ru':{
        switch (input) {
          case 'In Work': return styled ? '<span style="color: #256029; background-color: #c8e6c9; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">?? ????????????</span>' : '?? ????????????';
          case 'Resolved': return styled ? '<span style="color: #805b36; background-color: #ffd8b2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">??????????????????</span>' : '??????????????????';
          case 'New': return styled ? '<span style="color: #23547b; background-color: #b3e5fc; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">??????????</span>' : '??????????';
          case 'Rejected': return styled ? '<span style="color: #c63737; background-color: #ffcdd2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">??????????????????</span>' : '??????????????????';
          case 'Check': return styled ? '<span style="color: #694382; background-color: #eccfff; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">???? ????????????????</span>' : '???? ????????????????';
          case 'In Rework': return styled ? '<span style="color: #3f6b73; background-color: #cbebf1; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">???? ??????????????????</span>' : '???? ??????????????????';
          case 'Paused': return styled ? '<span style="color: #8a5340; background-color: #feedaf; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">????????????????????????????</span>' : '????????????????????????????';
          case 'Archive': return styled ? '<span style="color: #8a5340; background-color: #feedaf; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">??????????</span>' : '??????????';
          case 'Not resolved': return styled ? '<span style="color: #8a5340; background-color: #feedaf; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">???? ??????????????????</span>' : '???? ??????????????????';
          case 'Closed': return styled ? '<span style="color: #805b36; background-color: #ffd8b2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">??????????????</span>' : '??????????????';
          case 'Send to Approval': return styled ? '<span style="color: #805b36; background-color: #ffd8b2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">???? ????????????????????????</span>' : '???? ????????????????????????';
          case 'Approved': return styled ? '<span style="color: #2e604b; background-color: #ceede1; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">??????????????????????</span>' : '??????????????????????';
          case 'Not Approved': return styled ? '<span style="color: #a3392b; background-color: #F5BBB2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">???? ??????????????????????</span>' : '???? ??????????????????????';
          case 'Ready to Send': return styled ? '<span style="color: #4A7863; background-color: #DCEFED; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">?????????? ?? ????????????????</span>' : '?????????? ?? ????????????????';
          case 'On reApproval': return styled ? '<span style="color: #813A18; background-color: #FFB38F; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">?????????????????? ????????????????????????</span>' : '?????????????????? ????????????????????????';
          case 'Send to Yard Approval': return styled ? '<span style="color: #895169; background-color: #f8c1d5; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">?????????????????? ???? ??????????</span>' : '?????????????????? ???? ??????????';
          case 'Ready to Delivery': return styled ? '<span style="color: #393346; background-color: #cbc4d7; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">?????????? ?? ????????????????</span>' : '?????????? ?? ????????????????';
          case 'Delivered': return styled ? '<span style="color: #454955; background-color: #dae4ff; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">??????????????????</span>' : '??????????????????';
          case 'Send to RS': return styled ? '<span style="color: #082128; background-color: #cee4eb; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">?????????????????? ?? ????</span>' : '?????????????????? ?? ????';
          case 'Approved by RS': return styled ? '<span style="color: #ab433f; background-color: #fde0e0; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">?????????????????????? ?? ????</span>' : '?????????????????????? ?? ????';
          case 'Send to Owner': return styled ? '<span style="color: #686e46; background-color: #e1efa1; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">?????????????????? ??????????????????</span>' : '?????????????????? ??????????????????';
          case 'AssignedTo': return styled ? '<span style="color: #606a33; background-color: #dbe9a0; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">????????????????</span>' : '????????????????';
          case 'Comments fixed': return styled ? '<span style="color: #9d7900; background-color: #ffefb2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">?????????????????? ??????????????????</span>' : '?????????????????? ??????????????????';
          case 'Cancel': return styled ? '<span style="color: #c63737; background-color: #ffcdd2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">??????????????????????</span>' : '??????????????????????';

          default: return input;
        }
      }
      default:{
        switch (input) {
          case 'In Work': return styled ? '<span style="color: #256029; background-color: #c8e6c9; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">In Work</span>' : 'In Work';
          case 'Resolved': return styled ? '<span style="color: #805b36; background-color: #ffd8b2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Completed</span>' : 'Completed';
          case 'New': return styled ? '<span style="color: #23547b; background-color: #b3e5fc; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">New</span>' : 'New';
          case 'Rejected': return styled ? '<span style="color: #c63737; background-color: #ffcdd2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Declined</span>' : 'Declined';
          case 'Check': return styled ? '<span style="color: #694382; background-color: #eccfff; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">On Check</span>' : 'On Check';
          case 'In Rework': return styled ? '<span style="color: #3f6b73; background-color: #cbebf1; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">In Rework</span>' : 'In Rework';
          case 'Paused': return styled ? '<span style="color: #8a5340; background-color: #feedaf; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Paused</span>' : 'Stopped';
          case 'Archive': return styled ? '<span style="color: #8a5340; background-color: #feedaf; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Archive</span>' : 'Archive';
          case 'Not resolved': return styled ? '<span style="color: #8a5340; background-color: #feedaf; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Not resolved</span>' : 'Not resolved';
          case 'Closed': return styled ? '<span style="color: #805b36; background-color: #ffd8b2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Closed</span>' : 'Closed';
          case 'Send to Approval': return styled ? '<span style="color: #805b36; background-color: #ffd8b2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">On Approval</span>' : 'On Approval';
          case 'Approved': return styled ? '<span style="color: #2e604b; background-color: #ceede1; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Approved</span>' : 'Approved';
          case 'Not Approved': return styled ? '<span style="color: #a3392b; background-color: #F5BBB2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Not Approved</span>' : 'Not Approved';
          case 'Ready to Send': return styled ? '<span style="color: #3e6654; background-color: #DCEFED; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Ready to Send</span>' : 'Ready to Send';
          case 'On reApproval': return styled ? '<span style="color: #813A18; background-color: #FFB38F; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Retry Approval</span>' : 'Retry Approval';
          case 'Send to Yard Approval': return styled ? '<span style="color: #895169; background-color: #f8c1d5; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Sent to shipyard</span>' : 'Sent to shipyard';
          case 'Ready to Delivery': return styled ? '<span style="color: #393346; background-color: #cbc4d7; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Ready to delivery</span>' : 'Ready to delivery';
          case 'Delivered': return styled ? '<span style="color: #454955; background-color: #dae4ff; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Delivered</span>' : 'Delivered';
          case 'Send to RS': return styled ? '<span style="color: #082128; background-color: #cee4eb; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Sent to RS</span>' : 'Sent to RS';
          case 'Approved by RS': return styled ? '<span style="color: #ab433f; background-color: #fde0e0; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Approved by RS</span>' : 'Approved by RS';
          case 'Send to Owner': return styled ? '<span style="color: #686e46; background-color: #e1efa1; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Sent to Owner</span>' : 'Sent to Owner';
          case 'AssignedTo': return styled ? '<span style="color: #606a33; background-color: #dbe9a0; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Assigned</span>' : 'Assigned';
          case 'Comments fixed': return styled ? '<span style="color: #9d7900; background-color: #ffefb2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Comments fixed</span>' : 'Comments fixed';
          case 'Cancel': return styled ? '<span style="color: #c63737; background-color: #ffcdd2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Cancel</span>' : 'Cancel';
          default: return input;
        }
      }
    }
  }

  localeStatusAsButton(input: string, styled = true): string {
    switch (this.lang.language) {
      case 'ru':{
        switch (input) {
          case 'In Work': return styled ? '<div class="buttons-pick-work"><span class="icon-work cxy"><img src="assets/icons/work.svg"></span><span class="cxy button-text">?? ????????????</span></div>' : '?? ????????????';
          case 'Resolved': return styled ? '<div class="buttons-pick-resolved"><span class="icon-resolved cxy"><img src="assets/icons/like.svg"></span><span class="cxy button-text">??????????????????</span></div>' : '??????????????????';
          case 'Reject': return styled ? '<div class="buttons-pick-reject"><span class="icon-reject cxy"><img src="assets/icons/rejected.svg"></span><span class="cxy button-text">??????????????????</span></div>' : '??????????????????';
          case 'Check': return styled ? '<div class="buttons-pick-check"><span class="icon-check cxy"><img src="assets/icons/check.svg"></span><span class="cxy button-text">???? ????????????????</span></div>' : '???? ????????????????';
          case 'Not resolved': return styled ? '<div class="buttons-pick-not-resolved"><span class="icon-not-resolved cxy"><img src="assets/icons/dislike.svg"></span><span class="cxy button-text">???? ??????????????????</span></div>' : '???? ??????????????????';
          case 'Closed': return styled ? '<div class="buttons-pick-close"><span class="icon-close cxy"><img src="assets/icons/close-task.svg"></span><span class="cxy button-text">??????????????</span></div>' : '??????????????';
          case 'Archive': return styled ? '<div class="buttons-pick-archive"><span class="icon-archive cxy"><img src="assets/icons/archive.svg"></span><span class="cxy button-text">?? ??????????</span></div>' : '?? ??????????';
          case 'In Rework': return styled ? '<div class="buttons-pick-rework"><span class="icon-rework cxy"><img src="assets/icons/rework.svg"></span><span class="cxy button-text">???? ??????????????????</span></div>' : '???? ??????????????????';
          case 'Paused': return styled ? '<div class="buttons-pick-pause"><span class="icon-pause cxy"><img src="assets/icons/pause.svg"></span><span class="cxy button-text">??????????????????????????</span></div>' : '??????????????????????????';
          case 'Send to Approval': return styled ? '<div class="buttons-pick-send-approval"><span class="icon-send-approval cxy"><img src="assets/icons/approval.svg"></span><span class="cxy button-text">???? ????????????????????????</span></div>' : '???? ????????????????????????';
          case 'Approved': return styled ? '<div class="buttons-pick-approval"><span class="icon-approval cxy"><img src="assets/icons/like.svg"></span><span class="cxy button-text">??????????????????????</span></div>' : '??????????????????????';
          case 'Not Approved': return styled ? '<div class="buttons-pick-not-approval"><span class="icon-not-approval cxy"><img src="assets/icons/dislike.svg"></span><span class="cxy button-text">???? ??????????????????????</span></div>' : '???? ??????????????????????';
          case 'Ready to Send': return styled ? '<div class="buttons-pick-send"><span class="icon-send cxy"><img src="assets/icons/send.svg" height="16"></span><span class="cxy button-text">?????????? ?? ????????????????</span></div>' : '?????????? ?? ????????????????';
          case 'On reApproval': return styled ? '<div class="buttons-pick-reapproval"><span class="icon-reapproval cxy"><img src="assets/icons/approval.svg" height="18"></span><span class="cxy button-text">?????????????????? ????????????????????????</span></div>' : '?????????????????? ????????????????????????';
          case 'Send to Yard Approval': return styled ? '<div class="buttons-pick-shipyard"><span class="icon-shipyard cxy"><img src="assets/icons/anchor.png" height="16"></span><span class="cxy button-text">?????????????????? ???? ??????????</span></div>' : '?????????????????? ???? ??????????';
          case 'AssignedTo': return styled ? '<div class="buttons-pick-assign"><span class="icon-assign cxy"><img src="assets/icons/assign.png"></span><span class="cxy button-text">??????????????????</span></div>' : '??????????????????';
          case 'Ready to Delivery': return styled ? '<div class="buttons-pick-delivery"><span class="icon-delivery cxy"><img src="assets/icons/delivery.png"></span><span class="cxy button-text">?????????? ?? ????????????????</span></div>' : '?????????? ?? ????????????????';
          case 'Delivered': return styled ? '<div class="buttons-pick-delivered"><span class="icon-delivered cxy"><img src="assets/icons/delivered.png"></span><span class="cxy button-text">??????????????????</span></div>' : '??????????????????';
          case 'Send to RS': return styled ? '<div class="buttons-pick-rs"><span class="icon-rs cxy"><img src="assets/icons/rs.png"></span><span class="cxy button-text">?????????????????? ?? ????</span></div>' : '?????????????????? ?? ????';
          case 'Approved by RS': return styled ? '<div class="buttons-pick-approved-rs"><span class="icon-approved-rs cxy"><img src="assets/icons/rs.png"></span><span class="cxy button-text">?????????????????????? ?? ????</span></div>' : '?????????????????????? ?? ????';
          case 'Send to Owner': return styled ? '<div class="buttons-pick-owner"><span class="icon-owner cxy"><img src="assets/icons/owner.png"></span><span class="cxy button-text">?????????????????? ??????????????????</span></div>' : '?????????????????? ??????????????????';
          case 'Comments fixed': return styled ? '<div class="buttons-pick-fixed"><span class="icon-fixed cxy"><img src="assets/icons/fixed.svg"></span><span class="cxy button-text">?????????????????? ??????????????????</span></div>' : '?????????????????? ??????????????????';
          case 'New Revision': return styled ? '<div class="buttons-pick-revision"><span class="icon-revision cxy"><img src="assets/icons/revision.svg" height="16"></span><span class="cxy button-text">?????????? ??????????????</span></div>' : '?????????? ??????????????';
          case 'Cancel': return styled ? '<div class="buttons-pick-reject"><span class="icon-reject cxy"><img src="assets/icons/rejected.svg"></span><span class="cxy button-text">????????????????????????</span></div>' : '????????????????????????';
          case 'Recovery': return styled ? '<div class="buttons-pick-recover"><span class="icon-recover cxy"><img src="assets/icons/recover.svg" height="16"></span><span class="cxy button-text">????????????????????????</span></div>' : '????????????????????????';

          default: return input;
        }
      }
      default:{
        switch (input) {
          case 'In Work': return styled ? '<div class="buttons-pick-work"><span class="icon-work cxy"><img src="assets/icons/work.svg"></span><span class="cxy button-text">To work</span></div>' : 'To work';
          case 'Resolved': return styled ? '<div class="buttons-pick-resolved"><span class="icon-resolved cxy"><img src="assets/icons/like.svg"></span><span class="cxy button-text">Resolved</span></div>' : 'Resolved';
          case 'Rejected': return styled ? '<div class="buttons-pick-reject"><span class="icon-reject cxy"><img src="assets/icons/rejected.svg"></span><span class="cxy button-text">Reject</span></div>' : 'Reject';
          case 'Check': return styled ? '<div class="buttons-pick-check"><span class="icon-check cxy"><img src="assets/icons/check.svg"></span><span class="cxy button-text">To check</span></div>' : 'To check';
          case 'Not resolved': return styled ? '<div class="buttons-pick-not-resolved"><span class="icon-not-resolved cxy"><img src="assets/icons/dislike.svg"></span><span class="cxy button-text">Not resolved</span></div>' : 'Not resolved';
          case 'Closed': return styled ? '<div class="buttons-pick-close"><span class="icon-close cxy"><img src="assets/icons/close-task.svg"></span><span class="cxy button-text">Close</span></div>' : 'Close';
          case 'Archive': return styled ? '<div class="buttons-pick-archive"><span class="icon-archive cxy"><img src="assets/icons/archive.svg"></span><span class="cxy button-text">To archive</span></div>' : 'To archive';
          case 'In Rework': return styled ? '<div class="buttons-pick-rework"><span class="icon-rework cxy"><img src="assets/icons/rework.svg"></span><span class="cxy button-text">To rework</span></div>' : 'To rework';
          case 'Paused': return styled ? '<div class="buttons-pick-pause"><span class="icon-pause cxy"><img src="assets/icons/pause.svg"></span><span class="cxy button-text">Pause</span></div>' : 'Pause';
          case 'Send to Approval': return styled ? '<div class="buttons-pick-send-approval"><span class="icon-send-approval cxy"><img src="assets/icons/approval.svg"></span><span class="cxy button-text">To approval</span></div>' : 'To approval';
          case 'Approved': return styled ? '<div class="buttons-pick-approval"><span class="icon-approval cxy"><img src="assets/icons/like.svg"></span><span class="cxy button-text">Approved</span></div>' : 'Approved';
          case 'Not Approved': return styled ? '<div class="buttons-pick-not-approval"><span class="icon-not-approval cxy"><img src="assets/icons/dislike.svg"></span><span class="cxy button-text">Not approved</span></div>' : 'Not approved';
          case 'Ready to Send': return styled ? '<div class="buttons-pick-send"><span class="icon-send cxy"><img src="assets/icons/send.svg" height="16"></span><span class="cxy button-text">Ready to send</span></div>' : 'Ready to send';
          case 'On reApproval': return styled ? '<div class="buttons-pick-reapproval"><span class="icon-reapproval cxy"><img src="assets/icons/approval.svg" height="18"></span><span class="cxy button-text">reApproval</span></div>' : 'reApproval';
          case 'Send to Yard Approval': return styled ? '<div class="buttons-pick-shipyard"><span class="icon-shipyard cxy"><img src="assets/icons/anchor.png" height="16"></span><span class="cxy button-text">Send to shipyard</span></div>' : 'Send to shipyard';
          case 'AssignedTo': return styled ? '<div class="buttons-pick-assign"><span class="icon-assign cxy"><img src="assets/icons/assign.png"></span><span class="cxy button-text">Assigned to</span></div>' : 'Assigned to';
          case 'Ready to Delivery': return styled ? '<div class="buttons-pick-delivery"><span class="icon-delivery cxy"><img src="assets/icons/delivery.png" height="24"></span><span class="cxy button-text">Ready to delivery</span></div>' : 'Ready to delivery';
          case 'Delivered': return styled ? '<div class="buttons-pick-delivered"><span class="icon-delivered cxy"><img src="assets/icons/delivered.png"></span><span class="cxy button-text">Delivered</span></div>' : 'Delivered';
          case 'Send to RS': return styled ? '<div class="buttons-pick-rs"><span class="icon-rs cxy"><img src="assets/icons/rs.png"></span><span class="cxy button-text">Sent to RS</span></div>' : 'Send to RS';
          case 'Approved by RS': return styled ? '<div class="buttons-pick-approved-rs"><span class="icon-approved-rs cxy"><img src="assets/icons/rs.png"></span><span class="cxy button-text">Approved by RS</span></div>' : 'Approved by RS';
          case 'Send to Owner': return styled ? '<div class="buttons-pick-owner"><span class="icon-owner cxy"><img src="assets/icons/owner.png"></span><span class="cxy button-text">Sent to Owner</span></div>' : 'Sent to Owner';
          case 'Comments fixed': return styled ? '<div class="buttons-pick-fixed"><span class="icon-fixed cxy"><img src="assets/icons/fixed.svg"></span><span class="cxy button-text">Comments fixed</span></div>' : 'Comments fixed';
          case 'New Revision': return styled ? '<div class="buttons-pick-revision"><span class="icon-revision cxy"><img src="assets/icons/revision.svg" height="16"></span><span class="cxy button-text">New revision</span></div>' : 'New revision';
          case 'Cancel': return styled ? '<div class="buttons-pick-reject"><span class="icon-reject cxy"><img src="assets/icons/rejected.svg"></span><span class="cxy button-text">Cancel</span></div>' : 'Cancel';
          case 'Recovery': return styled ? '<div class="buttons-pick-recover"><span class="icon-recover cxy"><img src="assets/icons/recover.svg" height="16"></span><span class="cxy button-text">Recovery</span></div>' : 'Recovery';

          default: return input;
        }
      }
    }
  }


  // localeStatusAsButton(input: string, styled = true): string {
  //   switch (input) {
  //     case 'In Work': return (this.lang.language == 'ru' ? (styled ? ' <div class="buttons-pick-work"><span class="icon-work cxy"><img src="assets/icons/work.svg"></span><span class="cxy button-text">?? ????????????</span></div>' : '?? ????????????') : (styled ? ' <div class="buttons-pick-work"><span class="icon-work cxy"><img src="assets/icons/work.svg"></span><span class="cxy button-text">In Work</span></div>' : 'In Work'));
  //     case 'Resolved': return styled ? '<div class="buttons-pick-resolved"><span class="icon-resolved cxy"><img src="assets/icons/like.svg"></span><span class="cxy button-text">??????????????????</span></div>' : '??????????????????';
  //     case 'Rejected': return styled ? '<div class="buttons-pick-reject"><span class="icon-reject cxy"><img src="assets/icons/rejected.svg"></span><span class="cxy button-text">??????????????????</span></div>' : '??????????????????';
  //     case 'Check': return styled ? '<div class="buttons-pick-check"><span class="icon-check cxy"><img src="assets/icons/check.svg"></span><span class="cxy button-text">???? ????????????????</span></div>' : '???? ????????????????';
  //     case 'Not resolved': return styled ? '<div class="buttons-pick-not-resolved"><span class="icon-not-resolved cxy"><img src="assets/icons/dislike.svg"></span><span class="cxy button-text">???? ??????????????????</span></div>' : '???? ??????????????????';
  //     case 'Closed': return styled ? '<div class="buttons-pick-close"><span class="icon-close cxy"><img src="assets/icons/close-task.svg"></span><span class="cxy button-text">??????????????</span></div>' : '??????????????';
  //     case 'Archive': return styled ? '<div class="buttons-pick-archive"><span class="icon-archive cxy"><img src="assets/icons/archive.svg"></span><span class="cxy button-text">?? ??????????</span></div>' : '?? ??????????';
  //     case 'In Rework': return styled ? '<div class="buttons-pick-rework"><span class="icon-rework cxy"><img src="assets/icons/rework.svg"></span><span class="cxy button-text">???? ??????????????????</span></div>' : '???? ??????????????????';
  //     case 'Paused': return styled ? '<div class="buttons-pick-pause"><span class="icon-pause cxy"><img src="assets/icons/pause.svg"></span><span class="cxy button-text">??????????????????????????</span></div>' : '??????????????????????????';
  //     case 'Send to Approval': return styled ? '<div class="buttons-pick-send-approval"><span class="icon-send-approval cxy"><img src="assets/icons/approval.svg"></span><span class="cxy button-text">???? ????????????????????????</span></div>' : '???? ????????????????????????';
  //     case 'Approved': return styled ? '<div class="buttons-pick-approval"><span class="icon-approval cxy"><img src="assets/icons/like.svg"></span><span class="cxy button-text">??????????????????????</span></div>' : '??????????????????????';
  //     case 'Not approved': return styled ? '<div class="buttons-pick-not-approval"><span class="icon-not-approval cxy"><img src="assets/icons/dislike.svg"></span><span class="cxy button-text">???? ??????????????????????</span></div>' : '???? ??????????????????????';
  //     case 'Ready to Send': return styled ? '<div class="buttons-pick-send"><span class="icon-send cxy"><img src="assets/icons/send.png" height="18"></span><span class="cxy button-text">?????????? ?? ????????????????</span></div>' : '?????????? ?? ????????????????';
  //     case 'On reApproval': return styled ? '<div class="buttons-pick-reapproval"><span class="icon-reapproval cxy"><img src="assets/icons/approval.svg" height="18"></span><span class="cxy button-text">?????????????????? ????????????????????????</span></div>' : '?????????????????? ????????????????????????';
  //     case 'Send to ShipYard': return styled ? '<div class="buttons-pick-shipyard"><span class="icon-shipyard cxy"><img src="assets/icons/anchor.png" height="16"></span><span class="cxy button-text">?????????????????? ???? ??????????</span></div>' : '?????????????????? ???? ??????????';
  //     case 'AssignedTo': return styled ? '<div class="buttons-pick-shipyard"><span class="icon-shipyard cxy"><img src="assets/icons/anchor.png" height="16"></span><span class="cxy button-text">??????????????????</span></div>' : '??????????????????';
  //
  //     default: return input;
  //   }
  // }
  localeHistory(input: string){
    switch (this.lang.language) {
      case 'ru':{
        switch (input) {
          case 'status': return '????????????';
          default: return input;
        }
      }
      default:{
        switch (input) {
          case 'status': return 'status';
          default: return input;
        }
      }
    }

  }
  localeHistoryEn(input: string){
    switch (input) {
      case 'status': return 'status';
      default: return input;
    }
  }
  localeTaskType(input: string){
    switch (this.lang.language) {
      case 'ru':{
        switch (input) {
          case 'IT': return 'IT';
          case 'OTHER': return '????????????';
          case 'RKD': return '??????';
          case 'RKD-TURK': return '??????-??';
          case 'APPROVAL': return '????????????????????????';
          case 'PDSP': return '????????';
          case 'ORIZ': return '??????????????????????????';
          case 'DEVELOPMENT': return '?????????????? ???? ????????????????????';
          default: return input;
        }
      }
      default:{
        switch (input) {
          case 'IT': return 'IT';
          case 'OTHER': return 'Other';
          case 'RKD': return 'RKD';
          case 'RKD-TURK': return 'RKD-T';
          case 'APPROVAL': return 'Approval';
          case 'PDSP': return 'PDSP';
          case 'ORIZ': return 'Adjustment';
          case 'DEVELOPMENT': return 'Development';
          default: return input;
        }
      }
    }

  }
  localeTaskPriority(input: string){
    switch (this.lang.language) {
      case 'ru':{
        switch (input) {
          case 'Low': return '????????????';
          case 'Medium': return '??????????????';
          case 'High': return '??????????????';
          default: return input;
        }
      }
      default:{
        return input;
      }
    }
  }
  localeTaskDepartment(input: string){
    switch (this.lang.language) {
      case 'ru':{
        switch (input) {
          case 'General': return '??????????????????????????';
          case 'Hull': return '????????????';
          case 'System': return '??????????????';
          case 'Electric': return '??????????????????';
          case 'Equipment': return '????????????????????';
          case 'Outfitting': return '??????????????????';
          default: return input;
        }
      }
      default:{
        return input;
      }
    }
  }
  localeUserDepartment(input: string){
    switch (this.lang.language) {
      case 'ru':{
        switch (input) {
          case 'Management': return '??????????????????????';
          case 'Hull department': return '?????????????????? ??????????';
          case 'System department': return '?????????????????? ??????????';
          case 'Electrical department': return '???????????????????????????????????? ??????????';
          case 'Devices department': return '?????????? ??????????????????';
          case 'Outfitting department': return '?????????? ??????????????????';
          case 'Design department': return '?????????? ??????????????';
          case 'IT': return 'IT-??????????';
          default: return input;
        }
      }
      default:{
        return input;
      }
    }
  }
  trim(input: string, length: number = 50): string{
    if (input.length <= length){
      return input;
    }
    else {
      return input.substr(0, length) + '...';
    }
  }
  getAssignedTo(user: string) {
    let res = this.auth.getUserName(user);
    if (res == ''){
      res = '???? ????????????????';
    }
    return res;
  }
  getAssignedToTrim(user: string) {
    let res = this.auth.getUserTrimName(user);
    if (res == ''){
      res = '???? ????????????????';
    }
    return res;
  }

  localeTaskPeriod(stage_name: string) {
    if (this.lang.language == 'ru'){
      return stage_name.replace("Stage", "????????");
    }
    else{
      return  stage_name;
    }
  }
  getDateOnly(dateLong: number): string{
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
    // let date = new Date(dateLong);
    // let ye = new Intl.DateTimeFormat('ru', { year: '2-digit' }).format(date);
    // let mo = new Intl.DateTimeFormat('ru', { month: '2-digit' }).format(date);
    // let da = new Intl.DateTimeFormat('ru', { day: '2-digit' }).format(date);
    // return da + '.' + mo + '.' + ye;
  }

}
