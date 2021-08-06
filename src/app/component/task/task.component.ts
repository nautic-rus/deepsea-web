import { Component, OnInit } from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {Issue} from "../../domain/classes/issue";
import * as _ from 'underscore';
import {IssueManagerService} from "../../domain/issue-manager.service";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {Editor} from "primeng/editor";
import {IssueMessage} from "../../domain/classes/issue-message";

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit {

  issue: Issue = new Issue();
  message = '';
  comment = false;
  messageFilter = 'all';
  constructor(public ref: DynamicDialogRef, public conf: DynamicDialogConfig, private issueManager: IssueManagerService, private auth: AuthManagerService) { }

  ngOnInit(): void {
    this.issue = this.conf.data as Issue;
  }
  getDate(dateLong: number): string{
    let date = new Date(dateLong);
    let ye = new Intl.DateTimeFormat('ru', { year: 'numeric' }).format(date);
    let mo = new Intl.DateTimeFormat('ru', { month: 'long' }).format(date);
    let da = new Intl.DateTimeFormat('ru', { day: '2-digit' }).format(date);
    let hours = new Intl.DateTimeFormat('ru', { hour: '2-digit' }).format(date);
    let minutes = new Intl.DateTimeFormat('ru', { minute: '2-digit' }).format(date);
    return da + ' ' + mo + ' ' + ye + ' ' + ('0' + hours).slice(-2) + ':' + ('0' + minutes).slice(-2);
  }

  getMessages(issue: Issue) {
    // @ts-ignore
    return _.sortBy(issue.messages, x => x.date).reverse();
  }

  getAvailableStatuses(issue: Issue) {
    const res = [];
    // @ts-ignore
    if (!issue.availableStatuses.includes(issue.status)){
      res.push(issue.status);
    }
    // @ts-ignore
    issue.availableStatuses.forEach(x => res.push(x));
    return res;
  }

  statusChanged() {
    // @ts-ignore
    this.issueManager.setIssueStatus(this.issue.id, this.auth.getUser().login, this.issue.status).then(issue => {
      this.issueManager.getIssueDetails(this.issue.id, this.auth.getUser().login).then(issue => {
        this.issue = issue;
      });
    });
  }

  openFile(url: string) {
    window.open(url);
  }

  showComment(editor: Editor) {
    this.comment = true;
    setTimeout(() => {
      editor.quill.focus();
    })
  }
  getFileExtensionIcon(file: string) {
    switch (file.toLowerCase().split('.').pop()){
      case 'pdf': return 'pdf.svg';
      case 'dwg': return 'dwg.svg';
      case 'xls': return 'xls.svg';
      case 'xlsx': return 'xls.svg';
      case 'doc': return 'doc.svg';
      case 'docx': return 'doc.svg';
      case 'png': return 'png.svg';
      case 'jpg': return 'jpg.svg';
      case 'txt': return 'txt.svg';
      case 'zip': return 'zip.svg';
      default: return 'file.svg';
    }
  }
  sendMessage() {
    let message = new IssueMessage();
    message.author = this.auth.getUser().login;
    message.content = this.message;
    // @ts-ignore
    this.issueManager.setIssueMessage(this.issue.id, message).then(res => {
      this.issueManager.getIssueDetails(this.issue.id, this.auth.getUser().login).then(issue => {
        this.issue = issue;
      });
    });
    this.comment = false;
  }
  trimFileName(input: string, length: number = 12): string{
    let split = input.split('.');
    let name = split[0];
    let extension = split[1];
    if (input.length > length){
      return name.substr(0, length) + '...' + name.substr(name.length - 2, 2) + '.' + extension;
    }
    else{
      return input;
    }
  }
}
