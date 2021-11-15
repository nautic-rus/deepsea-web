import { Injectable } from '@angular/core';
import {CookieService} from "ngx-cookie-service";
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import {MessageService} from "primeng/api";
import * as props from "../props";
import {IdName} from "./classes/id-name";
import {FileAttachment} from "./classes/file-attachment";
import {Issue} from "./classes/issue";
import {IssueDef} from "./classes/issue-def";
import {IssueMessage} from "./classes/issue-message";
import {List} from "underscore";
import {ViewedIssue} from "./classes/viewed-issue";
import {AuthManagerService} from "./auth-manager.service";
import {HullPL} from "./classes/hull-pl";
import {LanguageService} from "./language.service";
import {DayCalendar} from "./classes/day-calendar";

@Injectable({
  providedIn: 'root'
})
export class IssueManagerService {
  constructor(private lang: LanguageService, private cookie: CookieService, private http: HttpClient, private router: Router, private messageService: MessageService, public auth: AuthManagerService) {

  }
  async uploadFile(file: File, user: string) {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    return await this.http.post<FileAttachment>(props.http + '/createFileUrl', formData, {params: {user}}).toPromise();
  }
  async uploadFileToCloud(file: File, filePath: string, login: string, password: string) {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    return await this.http.post<FileAttachment>(props.http + '/createFileCloudUrl', formData, {params: {filePath, login, password}}).toPromise();
  }
  async assignUser(id: string, user: string, startDate: string, dueDate: string, overtime: string, action: string, author: string){
    return await this.http.get<string[]>(props.http + '/assignIssue', {params: {id, user, startDate, dueDate, overtime, action, author}}).toPromise();
  }
  async changeResponsible(id: string, user: string){
    return await this.http.get<string[]>(props.http + '/changeResponsible', {params: {id, user}}).toPromise();
  }
  async sendToApproval(id: string, users: string[], filesToApproval: FileAttachment[], textToApproval: string, taskStatus: string, taskRevision: string){
    return await this.http.get<string[]>(props.http + '/sendToApproval', {params: {id, users: JSON.stringify(users), filesToApproval: JSON.stringify(filesToApproval), textToApproval, taskStatus, taskStatusApproval: 'New', taskTypeApproval: 'Approval', taskRevision}}).toPromise();
  }
  async getIssueDepartments() {
    return await this.http.get<string[]>(props.http + '/issueDepartments').toPromise();
  }
  async getIssueProjects() {
    return await this.http.get<string[]>(props.http + '/issueProjects').toPromise();
  }
  async getIssuePeriods() {
    return await this.http.get<string[]>(props.http + '/issuePeriods').toPromise();
  }
  async getIssueTypes() {
    return await this.http.get<string[]>(props.http + '/issueTypes').toPromise();
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
  async getIssueDetails(id: string): Promise<Issue> {
    return await this.http.get<Issue>(props.http + '/issueDetails', {params: {id}}).toPromise();
  }
  async getHullPartList(docNum: string): Promise<HullPL> {
    return await this.http.get<HullPL>(props.httpMaterials + '/getHullPartList', {params: {docNum}}).toPromise();
  }
  async initHullPartList(project: string, taskId: string, docNum: string, docName: string, user: string): Promise<string> {
    return await this.http.get<string>(props.httpMaterials + '/initHullPartList', {params: {project, taskId, docNum, docName, user}}).toPromise();
  }
  async updateIssue(user: string, message: string, issue: Issue): Promise<Issue> {
    return await this.http.post<Issue>(props.http + '/updateIssue', JSON.stringify(issue), {params: {user, message}}).toPromise();
  }
  async setIssueStatus(id: string, user: string, status: string): Promise<string> {
    return await this.http.get<string>(props.http + '/setIssueStatus', {params: {id: id, user: user, status: status}}).toPromise();
  }
  async setIssueMessage(id: string, message: IssueMessage): Promise<string> {
    return await this.http.post<string>(props.http + '/setIssueMessage', JSON.stringify(message), {params: {id}}).toPromise();
  }
  async removeIssue(id: string, user: string): Promise<string>{
    return await this.http.get<string>(props.http + '/removeIssue', {params: {id, user}}).toPromise();
  }
  async deleteFile(url: string): Promise<string>{
    return await this.http.get<string>(props.http + '/deleteFile', {params: {url}}).toPromise();
  }
  async setIssueViewed(id: string, user: string): Promise<string>{
    return await this.http.get<string>(props.http + '/setIssueViewed', {params: {id, user}}).toPromise();
  }
  async setDayCalendar(user: string, day: string, status: string): Promise<string>{
    return await this.http.get<string>(props.http + '/setDayCalendar', {params: {user, day, status}}).toPromise();
  }
  async getCalendar(): Promise<DayCalendar[]>{
    return await this.http.get<DayCalendar[]>(props.http + '/daysCalendar').toPromise();
  }
  localeStatus(input: string, styled = true): string {
    switch (this.lang.language) {
      case 'ru':{
        switch (input) {
          case 'In Work': return styled ? '<span style="color: #256029; background-color: #c8e6c9; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">В работе</span>' : 'В работе';
          case 'Resolved': return styled ? '<span style="color: #805b36; background-color: #ffd8b2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Исполнено</span>' : 'Исполнено';
          case 'New': return styled ? '<span style="color: #23547b; background-color: #b3e5fc; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Новый</span>' : 'Новый';
          case 'Rejected': return styled ? '<span style="color: #c63737; background-color: #ffcdd2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Отклонено</span>' : 'Отклонено';
          case 'Check': return styled ? '<span style="color: #694382; background-color: #eccfff; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">На проверке</span>' : 'На проверке';
          case 'In Rework': return styled ? '<span style="color: #3f6b73; background-color: #cbebf1; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">На доработке</span>' : 'На доработке';
          case 'Paused': return styled ? '<span style="color: #8a5340; background-color: #feedaf; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Приостановлено</span>' : 'Приостановлено';
          case 'Archive': return styled ? '<span style="color: #8a5340; background-color: #feedaf; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Архив</span>' : 'Архив';
          case 'Not resolved': return styled ? '<span style="color: #8a5340; background-color: #feedaf; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Не исполнено</span>' : 'Не исполнено';
          case 'Closed': return styled ? '<span style="color: #805b36; background-color: #ffd8b2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Закрыто</span>' : 'Закрыто';
          case 'Send to Approval': return styled ? '<span style="color: #805b36; background-color: #ffd8b2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">На согласовании</span>' : 'На согласовании';
          case 'Approved': return styled ? '<span style="color: #5d9980; background-color: #c1fde5; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Согласовано</span>' : 'Согласовано';
          case 'Not approved': return styled ? '<span style="color: #a3392b; background-color: #F5BBB2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Не согласовано</span>' : 'Не согласовано';
          case 'Ready to send': return styled ? '<span style="color: #4A7863; background-color: #DCEFED; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Готов к отправке</span>' : 'Готов к отправке';
          case 'On reApproval': return styled ? '<span style="color: #813A18; background-color: #FFB38F; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Повторное согласование</span>' : 'Повторное согласование';

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
          case 'Paused': return styled ? '<span style="color: #8a5340; background-color: #feedaf; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Stopped</span>' : 'Stopped';
          case 'Archive': return styled ? '<span style="color: #8a5340; background-color: #feedaf; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Archive</span>' : 'Archive';
          case 'Not resolved': return styled ? '<span style="color: #8a5340; background-color: #feedaf; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Not resolved</span>' : 'Not resolved';
          case 'Closed': return styled ? '<span style="color: #805b36; background-color: #ffd8b2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Closed</span>' : 'Closed';
          case 'Send to Approval': return styled ? '<span style="color: #805b36; background-color: #ffd8b2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">On Approval</span>' : 'On Approval';
          case 'Approved': return styled ? '<span style="color: #5d9980; background-color: #c1fde5; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Approved</span>' : 'Approved';
          case 'Not approved': return styled ? '<span style="color: #a3392b; background-color: #F5BBB2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Not Approved</span>' : 'Not Approved';
          case 'Ready to send': return styled ? '<span style="color: #4A7863; background-color: #DCEFED; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Ready to Send</span>' : 'Ready to Send';
          case 'On reApproval': return styled ? '<span style="color: #813A18; background-color: #FFB38F; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Retry Approval</span>' : 'Retry Approval';

          default: return input;
        }
      }
    }
  }
  localeStatusEn(input: string, styled = true): string {
    switch (input) {
      case 'In Work': return styled ? '<span style="color: #256029; background-color: #c8e6c9; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">In work</span>' : 'В работе';
      case 'Resolved': return styled ? '<span style="color: #805b36; background-color: #ffd8b2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Resolved</span>' : 'Исполнено';
      case 'New': return styled ? '<span style="color: #23547b; background-color: #b3e5fc; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">New</span>' : 'Новый';
      case 'Rejected': return styled ? '<span style="color: #c63737; background-color: #ffcdd2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Rejected</span>' : 'Отклонено';
      case 'Check': return styled ? '<span style="color: #694382; background-color: #eccfff; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Check</span>' : 'На проверке';
      case 'In Rework': return styled ? '<span style="color: #3f6b73; background-color: #cbebf1; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">In rework</span>' : 'На доработке';
      case 'Paused': return styled ? '<span style="color: #8a5340; background-color: #feedaf; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Paused</span>' : 'Приостановлено';
      case 'Archive': return styled ? '<span style="color: #8a5340; background-color: #feedaf; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Archive</span>' : 'Архив';
      case 'Not resolved': return styled ? '<span style="color: #8a5340; background-color: #feedaf; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Not resolved</span>' : 'Не исполнено';
      case 'Closed': return styled ? '<span style="color: #805b36; background-color: #ffd8b2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Closed</span>' : 'Закрыто';
      case 'Send to Approval': return styled ? '<span style="color: #805b36; background-color: #ffd8b2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Send to Approval</span>' : 'На согласовании';
      case 'Approved': return styled ? '<span style="color: #5d9980; background-color: #c1fde5; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Approved</span>' : 'Согласовано';
      case 'Not approved': return styled ? '<span style="color: #a3392b; background-color: #F5BBB2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Not approved</span>' : 'Не согласовано';
      case 'Ready to send': return styled ? '<span style="color: #4A7863; background-color: #DCEFED; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">Ready to send</span>' : 'Готов к отправке';
      case 'On reApproval': return styled ? '<span style="color: #813A18; background-color: #FFB38F; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">On reApproval</span>' : 'Повторное согласование';

      default: return input;
    }
  }
  localeStatusAsButton(input: string, styled = true): string {
    switch (input) {
      case 'In Work': return (this.lang.language == 'ru' ? (styled ? ' <div class="buttons-pick-work"><span class="icon-work cxy"><img src="assets/icons/work.svg"></span><span class="cxy button-text">В работу</span></div>' : 'В работу') : (styled ? ' <div class="buttons-pick-work"><span class="icon-work cxy"><img src="assets/icons/work.svg"></span><span class="cxy button-text">In Work</span></div>' : 'In Work'));
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
      case 'Not approved': return styled ? '<div class="buttons-pick-not-approval"><span class="icon-not-approval cxy"><img src="assets/icons/dislike.svg"></span><span class="cxy button-text">Не согласовано</span></div>' : 'Не согласовано';
      case 'Ready to send': return styled ? '<div class="buttons-pick-send"><span class="icon-send cxy"><img src="assets/icons/send.png" height="18"></span><span class="cxy button-text">Готов к отправке</span></div>' : 'Готов к отправке';
      case 'On reApproval': return styled ? '<div class="buttons-pick-reapproval"><span class="icon-reapproval cxy"><img src="assets/icons/approval.svg" height="18"></span><span class="cxy button-text">Повторное согласование</span></div>' : 'Повторное согласование';
      case 'Send to ShipYard': return styled ? '<div class="buttons-pick-shipyard"><span class="icon-shipyard cxy"><img src="assets/icons/anchor.png" height="16"></span><span class="cxy button-text">Отправить на верфь</span></div>' : 'Отправить на верфь';
      case 'AssignedTo': return styled ? '<div class="buttons-pick-shipyard"><span class="icon-shipyard cxy"><img src="assets/icons/anchor.png" height="16"></span><span class="cxy button-text">Назначить</span></div>' : 'Назначить';

      default: return input;
    }
  }
  localeHistory(input: string){
    switch (input) {
      case 'status': return 'Статус';
      default: return input;
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
          case 'ORIZ': return 'Корректировка';
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
          case 'Outfitting': return 'Достройка';
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
      res = 'Не назначен';
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
}
