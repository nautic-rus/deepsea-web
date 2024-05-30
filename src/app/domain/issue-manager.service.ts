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
import {DailyTask} from "./interfaces/daily-task";
import {EquipmentsFiles} from "./classes/equipments-files";

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

  async uploadEquipmentFile(file: File, user: string, fileName: string = file.name) {
    const formData: FormData = new FormData();
    formData.append('file', file, fileName);
    return await this.http.post<EquipmentsFiles>(props.http + '/createFileUrl', formData, {params: {user}}).toPromise();
  }

  async uploadFileToCloud(file: File, filePath: string, login: string, password: string) {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    return await this.http.post<FileAttachment>(props.http + '/createFileCloudUrl', formData, {params: {filePath, login, password}}).toPromise();
  }
  async assignUser(id: number, user: string, startDate: string, dueDate: string, overtime: string, action: string, author: string, hidden: number = 0){
    return await this.http.get<string[]>(props.http + '/assignIssue', {params: {id, user, startDate, dueDate, overtime, action, author, hidden}}).toPromise();
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
  getDepartments() {
    return this.http.get<any[]>(props.http + '/departments');
  }
  notifyDocUpload(taskId: number, kind: string = 'common', comment: string = '', count = 0) {
    return this.http.get<any[]>(props.http + '/notifyDocUpload', {params: {taskId, kind, comment, count}});
  }
  getProjectContracts(project: string) {
    return this.http.get<string[]>(props.http + '/projectContracts', {params: {project}});
  }
  async getIssueProjects() {
    return await this.http.get<any[]>(props.http + '/issueProjects').toPromise();
  }
  getSpecProjects() {
    return this.http.get<any[]>(props.http + '/issueProjects');
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

  getIssuesCorrection() {
    return this.http.get<any[]>(props.http + '/issues-correction');
  }

  getIssuesAll() {
    return this.http.get<any[]>(props.http + '/issuesAll');
  }
  getIssuesAllShort() {
    return this.http.get<any[]>(props.http + '/issuesAllShort');
  }
  async getQuestions(): Promise<Issue[]> {
    return await this.http.get<Issue[]>(props.http + '/questions').toPromise();
  }
  async getIssuesViewed(login: string): Promise<ViewedIssue[]> {
    return await this.http.get<ViewedIssue[]>(props.http + '/issuesViewed', {params: {user: login}}).toPromise();
  }
  async getIssueDetails(id: number): Promise<Issue> {
    return await this.http.get<any>(props.http + '/issueDetails', {params: {id}}).toPromise();
  }
  async getIssueDetailsByDocNumber(docNumber: string): Promise<Issue> {
    return await this.http.get<Issue>(props.http + '/issueDetails', {params: {docNumber}}).toPromise();
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
  async combineIssues(firstIssue: number, secondIssue: number, user: string): Promise<string> {
    return await this.http.get<string>(props.http + '/combineIssues', {params: {firstIssue, secondIssue, user}}).toPromise();
  }
  unCombineIssues(firstIssue: number, secondIssue: number, user: string) {
    return this.http.get<string>(props.http + '/unCombineIssues', {params: {firstIssue, secondIssue, user}});
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
  async getReasonsOfChange(){
    return await this.http.get<any[]>(props.http + '/reasonsOfChange').toPromise();
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
  async createCloudPath(id: number) {
    return await this.http.get<string>(props.http + '/createDocumentCloudDirectory', { params: {id}}).toPromise();
  }
  async setIssuePeriods(id: number, start: number, end: number) {
    return await this.http.get<string>(props.http + '/setIssuePeriods', { params: {id, start, end}}).toPromise();
  }
  async getProjectNames() {
    return await this.http.get<any>(props.http + '/projectNames').toPromise();
  }
  async getCloudFiles(filter: string) {
    return await this.http.get<FileAttachment[]>(props.http + '/cloudFiles', { params: {filter}}).toPromise();
  }
  async getNestingFiles() {
    return await this.http.get<FileAttachment[]>(props.http + '/nestingFiles').toPromise();
  }
  async getAmountTask(project:string, department:string, status: string) {
    return await this.http.get<string>(props.http + '/getAmountTask',{params: {project, department, status}}).toPromise(); //reques amount of task
  }
  async dingUser(user: string, message: string) {
    return await this.http.get(props.http + '/sendNotificationToUser',{params: {user, message}}).toPromise();
  }
  async deleteDailyTask(id: number) {
    return await this.http.get(props.http + '/deleteDailyTask',{params: {id}}).toPromise();
  }
  async addDailyTask(task: string) {
    return await this.http.post(props.http + '/addDailyTask', task).toPromise();
  }
  async getDailyTasks() {
    return await this.http.get<DailyTask[]>(props.http + '/dailyTasks').toPromise();
  }
  async subscribeForIssue(user: string, issue: number, options: string) {
    return await this.http.get(props.http + '/subscribeForIssue', {params: {user, issue, options}}).toPromise();
  }
  async setPlanHours(issue_id: number, user: string, hours: number) {
    return await this.http.get(props.http + '/setPlanHours', {params: {issue_id, user, hours}}).toPromise();
  }
  async lockPlanHours(issue_id: number, state: number) {
    return await this.http.get(props.http + '/lockPlanHours', {params: {issue_id, state}}).toPromise();
  }
  downloadAllDocs(docs: number[], user: string, email: string) {
    return this.http.post<string>(props.http + '/issuesFiles', docs, {params: {user, email}});
  }
  localeStatus(input: string, styled = true): string {
    switch (this.lang.language) {
      case 'ru':{
        switch (input) {
          case 'In Work': return styled ? '<span style="color: #256029; background-color: #c8e6c9; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">В работе</span>' : 'В работе';
          case 'Resolved': return styled ? '<span style="color: #805b36; background-color: #ffd8b2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Исполнено</span>' : 'Исполнено';
          case 'New': return styled ? '<span style="color: #23547b; background-color: #b3e5fc; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Новый</span>' : 'Новый';
          case 'Rejected': return styled ? '<span style="color: #c63737; background-color: #ffcdd2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Отклонено</span>' : 'Отклонено';
          case 'Check': return styled ? '<span style="color: #694382; background-color: #eccfff; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">На проверке</span>' : 'На проверке';
          case 'In Rework': return styled ? '<span style="color: #3f6b73; background-color: #cbebf1; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">На доработке</span>' : 'На доработке';
          case 'Paused': return styled ? '<span style="color: #8a5340; background-color: #feedaf; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Приостановлено</span>' : 'Приостановлено';
          case 'Archive': return styled ? '<span style="color: #8a5340; background-color: #feedaf; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Архив</span>' : 'Архив';
          case 'Not resolved': return styled ? '<span style="color: #8a5340; background-color: #feedaf; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Не исполнено</span>' : 'Не исполнено';
          case 'Closed': return styled ? '<span style="color: #454955; background-color: #dae4ff; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Закрыто</span>' : 'Закрыто';
          case 'Send to Approval': return styled ? '<span style="color: #805b36; background-color: #ffd8b2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">На согласовании</span>' : 'На согласовании';
          case 'Approved': return styled ? '<span style="color: #2e604b; background-color: #ceede1; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Согласовано</span>' : 'Согласовано';
          case 'Not Approved': return styled ? '<span style="color: #a3392b; background-color: #F5BBB2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Не согласовано</span>' : 'Не согласовано';
          case 'Not approved': return styled ? '<span style="color: #a3392b; background-color: #F5BBB2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Не согласовано</span>' : 'Не согласовано';
          case 'Ready to Send': return styled ? '<span style="color: #4A7863; background-color: #DCEFED; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Готов к отправке</span>' : 'Готов к отправке';
          case 'On reApproval': return styled ? '<span style="color: #813A18; background-color: #FFB38F; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Повторное согласование</span>' : 'Повторное согласование';
          case 'Send to Yard Approval': return styled ? '<span style="color: #895169; background-color: #f8c1d5; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Отправлен на верфь</span>' : 'Отправлен на верфь';
          case 'Ready to Delivery': return styled ? '<span style="color: #393346; background-color: #cbc4d7; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Готов к поставке</span>' : 'Готов к поставке';
          case 'Delivered': return styled ? '<span style="color: #454955; background-color: #dae4ff; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Поставлен</span>' : 'Поставлен';
          case 'Send to RS': return styled ? '<span style="color: #082128; background-color: #cee4eb; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Отправлен в РС</span>' : 'Отправлен в РС';
          case 'Approved by RS': return styled ? '<span style="color: #ab433f; background-color: #fde0e0; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Согласовано в РС</span>' : 'Согласовано в РС';
          case 'Send to Owner': return styled ? '<span style="color: #686e46; background-color: #e1efa1; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Отправлен заказчику</span>' : 'Отправлен заказчику';
          case 'AssignedTo': return styled ? '<span style="color: #606a33; background-color: #dbe9a0; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Назначен</span>' : 'Назначен';
          case 'Comments fixed': return styled ? '<span style="color: #9d7900; background-color: #ffefb2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Замечания устранены</span>' : 'Замечания устранены';
          case 'Cancel': return styled ? '<span style="color: #c63737; background-color: #ffcdd2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Аннулирован</span>' : 'Аннулирован';
          case 'To publish': return styled ? '<span style="color: #9C6480; background-color: #F2CFE2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">На публикации</span>' : 'На публикации';
          case 'Published': return styled ? '<span style="color: #7D588C; background-color: #DFC9E7; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Опубликовано</span>' : 'Опубликовано';
          case 'Accepted': return styled ? '<span style="color: #5D7991; background-color: #C6D8E8; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Принято</span>' : 'Принято';
          case 'Hold': return styled ? '<span style="color: #9d4c22; background-color: #fc763585; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">На удержании</span>' : 'На удержании';
          case 'Assign responsible': return styled ? '<span style="color: #686e46; background-color: #e1efa1; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Назначен ответственный</span>' : 'Назначен ответственный';
          case 'Joined': return styled ? '<span style="color: #07594D; background-color: #067b6b40; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Объединен</span>' : 'Объединен';
          case 'Checked': return styled ? '<span style="color: #507667; background-color: #82d8b596; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Проверено</span>' : 'Проверено';

          default: return input;
        }
      }
      default:{
        switch (input) {
          case 'In Work': return styled ? '<span style="color: #256029; background-color: #c8e6c9; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">In Work</span>' : 'In Work';
          case 'Resolved': return styled ? '<span style="color: #805b36; background-color: #ffd8b2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Resolved</span>' : 'Resolved';
          case 'New': return styled ? '<span style="color: #23547b; background-color: #b3e5fc; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">New</span>' : 'New';
          case 'Rejected': return styled ? '<span style="color: #c63737; background-color: #ffcdd2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Rejected</span>' : 'Rejected';
          case 'Check': return styled ? '<span style="color: #694382; background-color: #eccfff; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">On Check</span>' : 'On Check';
          case 'In Rework': return styled ? '<span style="color: #3f6b73; background-color: #cbebf1; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">In Rework</span>' : 'In Rework';
          case 'Paused': return styled ? '<span style="color: #8a5340; background-color: #feedaf; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Paused</span>' : 'Paused';
          case 'Archive': return styled ? '<span style="color: #8a5340; background-color: #feedaf; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Archive</span>' : 'Archive';
          case 'Not resolved': return styled ? '<span style="color: #8a5340; background-color: #feedaf; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Not resolved</span>' : 'Not resolved';
          case 'Closed': return styled ? '<span style="color: #454955; background-color: #dae4ff; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Closed</span>' : 'Closed';
          case 'Send to Approval': return styled ? '<span style="color: #805b36; background-color: #ffd8b2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">On Approval</span>' : 'On Approval';
          case 'Approved': return styled ? '<span style="color: #2e604b; background-color: #ceede1; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Approved</span>' : 'Approved';
          case 'Not Approved': return styled ? '<span style="color: #a3392b; background-color: #F5BBB2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Not Approved</span>' : 'Not Approved';
          case 'Not approved': return styled ? '<span style="color: #a3392b; background-color: #F5BBB2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Not Approved</span>' : 'Not Approved';
          case 'Ready to Send': return styled ? '<span style="color: #3e6654; background-color: #DCEFED; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Ready to Send</span>' : 'Ready to Send';
          case 'On reApproval': return styled ? '<span style="color: #813A18; background-color: #FFB38F; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">On reApproval</span>' : 'Retry Approval';
          case 'Send to Yard Approval': return styled ? '<span style="color: #895169; background-color: #f8c1d5; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Sent to shipyard</span>' : 'Sent to shipyard';
          case 'Ready to Delivery': return styled ? '<span style="color: #393346; background-color: #cbc4d7; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Ready to delivery</span>' : 'Ready to delivery';
          case 'Delivered': return styled ? '<span style="color: #454955; background-color: #dae4ff; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Delivered</span>' : 'Delivered';
          case 'Send to RS': return styled ? '<span style="color: #082128; background-color: #cee4eb; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Sent to RS</span>' : 'Sent to RS';
          case 'Approved by RS': return styled ? '<span style="color: #ab433f; background-color: #fde0e0; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Approved by RS</span>' : 'Approved by RS';
          case 'Send to Owner': return styled ? '<span style="color: #686e46; background-color: #e1efa1; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Sent to Owner</span>' : 'Sent to Owner';
          case 'AssignedTo': return styled ? '<span style="color: #606a33; background-color: #dbe9a0; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Assigned</span>' : 'Assigned';
          case 'Comments fixed': return styled ? '<span style="color: #9d7900; background-color: #ffefb2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Comments fixed</span>' : 'Comments fixed';
          case 'Cancel': return styled ? '<span style="color: #c63737; background-color: #ffcdd2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Cancel</span>' : 'Cancel';
          case 'To publish': return styled ? '<span style="color: #9C6480; background-color: #F2CFE2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">To publish</span>' : 'To publish';
          case 'Published': return styled ? '<span style="color: #7D588C; background-color: #DFC9E7; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Published</span>' : 'Published';
          case 'Accepted': return styled ? '<span style="color: #5D7991; background-color: #C6D8E8; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Accepted</span>' : 'Accepted';
          case 'Hold': return styled ? '<span style="color: #9d4c22; background-color: #fc763585; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Hold</span>' : 'Hold';
          case 'Assign responsible': return styled ? '<span style="color: #686e46; background-color: #e1efa1; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Assign responsible</span>' : 'Assign responsible';
          case 'Joined': return styled ? '<span style="color: #07594D; background-color: #067b6b40; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Joined</span>' : 'Joined';
          case 'Checked': return styled ? '<span style="color: #507667; background-color: #82d8b596; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 10px; letter-spacing: .3px;">Checked</span>' : 'Checked';


          default: return input;
        }
      }
    }
  }

  localeStatusAsButton(input: string, styled = true): string {
    switch (this.lang.language) {
      case 'ru':{
        switch (input) {
          case 'In Work': return styled ? '<div class="buttons-pick-work"><span class="icon-work cxy"><img src="assets/icons/work.svg"></span><span class="cxy button-text">В работу</span></div>' : 'В работу';
          case 'Resolved': return styled ? '<div class="buttons-pick-resolved"><span class="icon-resolved cxy"><img src="assets/icons/like.svg"></span><span class="cxy button-text">Исполнено</span></div>' : 'Исполнено';
          case 'Rejected': return styled ? '<div class="buttons-pick-reject"><span class="icon-reject cxy"><img src="assets/icons/rejected.svg"></span><span class="cxy button-text">Отклонить</span></div>' : 'Отклонить';
          case 'Check': return styled ? '<div class="buttons-pick-check"><span class="icon-check cxy"><img src="assets/icons/check.svg"></span><span class="cxy button-text">На проверку</span></div>' : 'На проверку';
          case 'Not resolved': return styled ? '<div class="buttons-pick-not-resolved"><span class="icon-not-resolved cxy"><img src="assets/icons/dislike.svg"></span><span class="cxy button-text">Не исполнено</span></div>' : 'Не исполнено';
          case 'Closed': return styled ? '<div class="buttons-pick-close"><span class="icon-close cxy"><img src="assets/icons/close-task.svg"></span><span class="cxy button-text">Закрыть</span></div>' : 'Закрыть';
          case 'Archive': return styled ? '<div class="buttons-pick-archive"><span class="icon-archive cxy"><img src="assets/icons/archive.svg"></span><span class="cxy button-text">В архив</span></div>' : 'В архив';
          case 'In Rework': return styled ? '<div class="buttons-pick-rework"><span class="icon-rework cxy"><img src="assets/icons/rework.svg"></span><span class="cxy button-text">На доработку</span></div>' : 'На доработку';
          case 'Paused': return styled ? '<div class="buttons-pick-pause"><span class="icon-pause cxy"><img src="assets/icons/pause.svg"></span><span class="cxy button-text">Приостановить</span></div>' : 'Приостановить';
          case 'Send to Approval': return styled ? '<div class="buttons-pick-send-approval"><span class="icon-send-approval cxy"><img src="assets/icons/approval.svg"></span><span class="cxy button-text">На согласование</span></div>' : 'На согласование';
          case 'Approved': return styled ? '<div class="buttons-pick-approval"><span class="icon-approval cxy"><img src="assets/icons/like.svg"></span><span class="cxy button-text">Согласовано</span></div>' : 'Согласовано';
          case 'Not Approved': return styled ? '<div class="buttons-pick-not-approval"><span class="icon-not-approval cxy"><img src="assets/icons/dislike.svg"></span><span class="cxy button-text">Не согласовано</span></div>' : 'Не согласовано';
          case 'Ready to Send': return styled ? '<div class="buttons-pick-send"><span class="icon-send cxy"><img src="assets/icons/send.svg" height="16"></span><span class="cxy button-text">Готов к отправке</span></div>' : 'Готов к отправке';
          case 'On reApproval': return styled ? '<div class="buttons-pick-reapproval"><span class="icon-reapproval cxy"><img src="assets/icons/approval.svg" height="18"></span><span class="cxy button-text">Повторное согласование</span></div>' : 'Повторное согласование';
          case 'Send to Yard Approval': return styled ? '<div class="buttons-pick-shipyard"><span class="icon-shipyard cxy"><img src="assets/icons/anchor.png" height="16"></span><span class="cxy button-text">Отправить на верфь</span></div>' : 'Отправить на верфь';
          case 'AssignedTo': return styled ? '<div class="buttons-pick-assign"><span class="icon-assign cxy"><img src="assets/icons/assign.png"></span><span class="cxy button-text">Назначить</span></div>' : 'Назначить';
          case 'Ready to Delivery': return styled ? '<div class="buttons-pick-delivery"><span class="icon-delivery cxy"><img src="assets/icons/delivery.png"></span><span class="cxy button-text">Готов к поставке</span></div>' : 'Готов к поставке';
          case 'Delivered': return styled ? '<div class="buttons-pick-delivered"><span class="icon-delivered cxy"><img src="assets/icons/delivered.png"></span><span class="cxy button-text">Поставлен</span></div>' : 'Поставлен';
          case 'Send to RS': return styled ? '<div class="buttons-pick-rs"><span class="icon-rs cxy"><img src="assets/icons/rs.png"></span><span class="cxy button-text">Отправлен в РС</span></div>' : 'Отправлен в РС';
          case 'Approved by RS': return styled ? '<div class="buttons-pick-approved-rs"><span class="icon-approved-rs cxy"><img src="assets/icons/rs.png"></span><span class="cxy button-text">Согласовано в РС</span></div>' : 'Согласовано в РС';
          case 'Send to Owner': return styled ? '<div class="buttons-pick-owner"><span class="icon-owner cxy"><img src="assets/icons/owner.png"></span><span class="cxy button-text">Отправлен заказчику</span></div>' : 'Отправлен заказчику';
          case 'Comments fixed': return styled ? '<div class="buttons-pick-fixed"><span class="icon-fixed cxy"><img src="assets/icons/fixed.svg"></span><span class="cxy button-text">Замечания устранены</span></div>' : 'Замечания устранены';
          case 'New Revision': return styled ? '<div class="buttons-pick-revision"><span class="icon-revision cxy"><img src="assets/icons/revision.svg" height="16"></span><span class="cxy button-text">Новая ревизия</span></div>' : 'Новая ревизия';
          case 'Cancel': return styled ? '<div class="buttons-pick-reject"><span class="icon-reject cxy"><img src="assets/icons/rejected.svg"></span><span class="cxy button-text">Аннулировать</span></div>' : 'Аннулировать';
          case 'Recovery': return styled ? '<div class="buttons-pick-recover"><span class="icon-recover cxy"><img src="assets/icons/recover.svg" height="16"></span><span class="cxy button-text">Восстановить</span></div>' : 'Восстановить';
          case 'To publish': return styled ? '<div class="buttons-pick-publish"><span class="icon-publish cxy"><img src="assets/icons/publish.svg" height="18"></span><span class="cxy button-text">Опубликовать</span></div>' : 'Опубликовать';
          case 'Accept': return styled ? '<div class="buttons-pick-accept"><span class="icon-accept cxy"><img src="assets/icons/accept.svg" height="18"></span><span class="cxy button-text">Принять</span></div>' : 'Принять';
          case 'Reject': return styled ? '<div class="buttons-pick-reject"><span class="icon-reject cxy"><img src="assets/icons/rejected.svg"></span><span class="cxy button-text">Отклонить</span></div>' : 'Отклонить';
          case 'Hold': return styled ? '<div class="buttons-pick-problem"><span class="icon-problem cxy"><img src="assets/icons/problem.svg" height="18"></span><span class="cxy button-text">На удержание</span></div>' : 'На удержание';
          case 'Assign responsible': return styled ? '<div class="buttons-pick-rs"><span class="icon-rs cxy"><img src="assets/icons/assign.png"></span><span class="cxy button-text">Назначить ответственного</span></div>' : 'Назначить ответственного';
          case 'Joined': return styled ? '<div class="buttons-pick-join"><span class="icon-join cxy"><img src="assets/icons/join.svg" class="rotate-90" height="20"></span><span class="cxy button-text">Объединить</span></div>' : 'Объединить';
          case 'Checked': return styled ? '<div class="buttons-pick-accept"><span class="icon-accept cxy"><img src="assets/icons/accept.svg" height="18"></span><span class="cxy button-text">Проверено</span></div>' : 'Проверено';


          default: return input;
        }
      }
      default:{
        switch (input) {
          case 'In Work': return styled ? '<div class="buttons-pick-work"><span class="icon-work cxy"><img src="assets/icons/work.svg" class="rotate-90" height="20"></span><span class="cxy button-text">To work</span></div>' : 'To work';
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
          case 'To publish': return styled ? '<div class="buttons-pick-publish"><span class="icon-publish cxy"><img src="assets/icons/publish.svg" height="18"></span><span class="cxy button-text">To publish</span></div>' : 'To publish';
          case 'Accept': return styled ? '<div class="buttons-pick-accept"><span class="icon-accept cxy"><img src="assets/icons/accept.svg" height="18"></span><span class="cxy button-text">Accept</span></div>' : 'Accept';
          case 'Reject': return styled ? '<div class="buttons-pick-reject"><span class="icon-reject cxy"><img src="assets/icons/rejected.svg"></span><span class="cxy button-text">Reject</span></div>' : 'Reject';
          case 'Hold': return styled ? '<div class="buttons-pick-problem"><span class="icon-problem cxy"><img src="assets/icons/problem.svg" height="18"></span><span class="cxy button-text">Hold</span></div>' : 'Hold';
          case 'Assign responsible': return styled ? '<div class="buttons-pick-rs"><span class="icon-rs cxy"><img src="assets/icons/assign.png"></span><span class="cxy button-text">Assign responsible</span></div>' : 'Assign responsible';
          case 'Joined': return styled ? '<div class="buttons-pick-join"><span class="icon-join cxy"><img src="assets/icons/join.svg" class="rotate-90" height="20"></span><span class="cxy button-text">Join</span></div>' : 'Join';
          case 'Checked': return styled ? '<div class="buttons-pick-accept"><span class="icon-accept cxy"><img src="assets/icons/accept.svg" height="18"></span><span class="cxy button-text">Checked</span></div>' : 'Checked';


          default: return input;
        }
      }
    }
  }

  // localeStatusAsButton(input: string, styled = true): string {
  //   switch (input) {
  //     case 'In Work': return (this.lang.language == 'ru' ? (styled ? ' <div class="buttons-pick-work"><span class="icon-work cxy"><img src="assets/icons/work.svg"></span><span class="cxy button-text">В работу</span></div>' : 'В работу') : (styled ? ' <div class="buttons-pick-work"><span class="icon-work cxy"><img src="assets/icons/work.svg"></span><span class="cxy button-text">In Work</span></div>' : 'In Work'));
  //     case 'Resolved': return styled ? '<div class="buttons-pick-resolved"><span class="icon-resolved cxy"><img src="assets/icons/like.svg"></span><span class="cxy button-text">Исполнено</span></div>' : 'Исполнено';
  //     case 'Rejected': return styled ? '<div class="buttons-pick-reject"><span class="icon-reject cxy"><img src="assets/icons/rejected.svg"></span><span class="cxy button-text">Отклонить</span></div>' : 'Отклонить';
  //     case 'Check': return styled ? '<div class="buttons-pick-check"><span class="icon-check cxy"><img src="assets/icons/check.svg"></span><span class="cxy button-text">На проверку</span></div>' : 'На проверку';
  //     case 'Not resolved': return styled ? '<div class="buttons-pick-not-resolved"><span class="icon-not-resolved cxy"><img src="assets/icons/dislike.svg"></span><span class="cxy button-text">Не исполнено</span></div>' : 'Не исполнено';
  //     case 'Closed': return styled ? '<div class="buttons-pick-close"><span class="icon-close cxy"><img src="assets/icons/close-task.svg"></span><span class="cxy button-text">Закрыть</span></div>' : 'Закрыть';
  //     case 'Archive': return styled ? '<div class="buttons-pick-archive"><span class="icon-archive cxy"><img src="assets/icons/archive.svg"></span><span class="cxy button-text">В архив</span></div>' : 'В архив';
  //     case 'In Rework': return styled ? '<div class="buttons-pick-rework"><span class="icon-rework cxy"><img src="assets/icons/rework.svg"></span><span class="cxy button-text">На доработку</span></div>' : 'На доработку';
  //     case 'Paused': return styled ? '<div class="buttons-pick-pause"><span class="icon-pause cxy"><img src="assets/icons/pause.svg"></span><span class="cxy button-text">Приостановить</span></div>' : 'Приостановить';
  //     case 'Send to Approval': return styled ? '<div class="buttons-pick-send-approval"><span class="icon-send-approval cxy"><img src="assets/icons/approval.svg"></span><span class="cxy button-text">На согласование</span></div>' : 'На согласование';
  //     case 'Approved': return styled ? '<div class="buttons-pick-approval"><span class="icon-approval cxy"><img src="assets/icons/like.svg"></span><span class="cxy button-text">Согласовано</span></div>' : 'Согласовано';
  //     case 'Not approved': return styled ? '<div class="buttons-pick-not-approval"><span class="icon-not-approval cxy"><img src="assets/icons/dislike.svg"></span><span class="cxy button-text">Не согласовано</span></div>' : 'Не согласовано';
  //     case 'Ready to Send': return styled ? '<div class="buttons-pick-send"><span class="icon-send cxy"><img src="assets/icons/send.png" height="18"></span><span class="cxy button-text">Готов к отправке</span></div>' : 'Готов к отправке';
  //     case 'On reApproval': return styled ? '<div class="buttons-pick-reapproval"><span class="icon-reapproval cxy"><img src="assets/icons/approval.svg" height="18"></span><span class="cxy button-text">Повторное согласование</span></div>' : 'Повторное согласование';
  //     case 'Send to ShipYard': return styled ? '<div class="buttons-pick-shipyard"><span class="icon-shipyard cxy"><img src="assets/icons/anchor.png" height="16"></span><span class="cxy button-text">Отправить на верфь</span></div>' : 'Отправить на верфь';
  //     case 'AssignedTo': return styled ? '<div class="buttons-pick-shipyard"><span class="icon-shipyard cxy"><img src="assets/icons/anchor.png" height="16"></span><span class="cxy button-text">Назначить</span></div>' : 'Назначить';
  //
  //     default: return input;
  //   }
  // }
  localeHistory(input: string){
    switch (this.lang.language) {
      case 'ru':{
        switch (input) {
          case 'status': return 'статус';
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
          case 'OTHER': return 'Прочее';
          case 'RKD': return 'РКД';
          case 'RKD-TURK': return 'РКД-Т';
          case 'APPROVAL': return 'Согласование';
          case 'PDSP': return 'ПДСП';
          case 'OR': return 'ОР';
          case 'IZ': return 'ИЗ';
          case 'CHANGES': return 'Корректировка';
          case 'DEVELOPMENT': return 'Задание на разработку';
          case 'ED': return 'ЕД';
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
          case 'Low': return 'Низкий';
          case 'Medium': return 'Средний';
          case 'High': return 'Высокий';
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
          case 'General': return 'Общепроектные';
          case 'Hull': return 'Корпус';
          case 'System': return 'Системы';
          case 'Electric': return 'Электрика';
          case 'Equipment': return 'Устройства';
          case 'Accommodation': return 'Достройка';
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
          case 'Management': return 'Руководство';
          case 'Hull department': return 'Корпусный отдел';
          case 'System department': return 'Системный отдел';
          case 'Electrical department': return 'Электротехнический отдел';
          case 'Devices department': return 'Отдел устройств';
          case 'Accommodation department': return 'Отдел достройки';
          case 'Design department': return 'Отдел дизайна';
          case 'IT': return 'IT-отдел';
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
      res = this.lang.language == 'ru' ? 'Не назначен' : 'Not assigned';
    }
    return res;
  }
  getAssignedToTrim(user: string) {
    let res = this.auth.getUserTrimName(user);
    if (res == ''){
      res = 'Не назначен';
    }
    return res;
  }

  localeTaskPeriod(stage_name: string) {
    if (this.lang.language == 'ru'){
      return stage_name.replace("Stage", "Этап");
    }
    else{
      return  stage_name;
    }
  }
  localeModificationOfExisting(value: number) {
    if (this.lang.language == 'ru'){
      return value == 1 ? 'Да' : 'Нет';
    }
    else{
      return value == 1 ? 'Yes' : 'No';
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
  getProjectStats(project: string, docType: string){
    return this.http.get(props.http + '/projectStats', {params: {project, docType}});
  }
}
