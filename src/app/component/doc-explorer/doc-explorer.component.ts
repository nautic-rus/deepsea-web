import {ApplicationRef, Component, OnInit, ViewChild} from '@angular/core';
import {Issue} from "../../domain/classes/issue";
import {IssueManagerService} from "../../domain/issue-manager.service";
import * as _ from "underscore";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {VarMap} from "../../domain/classes/var-map";
import {IssueMessage} from "../../domain/classes/issue-message";
import {FileAttachment} from "../../domain/classes/file-attachment";
import Delta from "quill-delta";
import {mouseWheelZoom} from "mouse-wheel-zoom";

@Component({
  selector: 'app-doc-explorer',
  templateUrl: './doc-explorer.component.html',
  styleUrls: ['./doc-explorer.component.css']
})
export class DocExplorerComponent implements OnInit {
  projects: string[] = ['NR002'];
  project = this.projects[0];
  issues: Issue[] = [];
  selectedIssue: Issue = new Issue();
  messageFilter = 'all';
  comment = false;
  showHistory = ['_taskStatus'];
  message = '';
  awaitForLoad: string[] = [];
  loaded: FileAttachment[] = [];
  showImages = false;
  // @ts-ignore
  @ViewChild('img') img;
  image = '';
  // @ts-ignore
  wz;
  // @ts-ignore
  editor;
  quillModules =
    {
      imageResize: {},
      clipboard: {
        matchers: [
          // @ts-ignore
          ['img', (node, delta) => {
            let image = delta.ops[0].insert.image;
            if ((image.indexOf(";base64")) != -1){
              let ext = image.substring("data:image/".length, image.indexOf(";base64"))
              let fileName = 'clip' + this.generateId(8)  + '.' + ext;
              const find = this.loaded.find(x => x.name == fileName);
              if (find != null){
                this.loaded.splice(this.loaded.indexOf(find), 1);
              }
              this.awaitForLoad.push(fileName);
              this.appRef.tick();
              fetch(image).then(res => res.blob()).then(blob => {
                const file = new File([blob], fileName,{ type: "image/png" });
                this.issueManager.uploadFile(file).then(res => {
                  this.loaded.push(res);
                  this.appRef.tick();
                  this.message += '<img style="cursor: pointer" src="' + res.url + '"/>';
                  this.appRef.tick();
                });
              });
              return new Delta();
            }
            else{
              return delta;
            }
            //return delta;
          }]
        ]
      },
      keyboard: {
        bindings: {
          tab: {
            key: 9,
            handler: function () {
              return true;
            }
          }
        }
      }
    }
  constructor(public issueManager: IssueManagerService, public auth: AuthManagerService, private appRef: ApplicationRef) { }

  ngOnInit(): void {
    this.issueManager.getIssues('op').then(data => {
      this.issues = _.sortBy(data.filter(x => x.taskType == 'RKD' || x.taskType == 'RKD-TURK'), x => x.docNumber);
    });
  }
  showComment() {
    this.comment = true;
    this.message = '';
    this.awaitForLoad = [];
    this.loaded = [];
    setTimeout(() => {
      this.editor.focus();
    })
  }
  selectIssue(issue: Issue) {
    this.issueManager.getIssueDetails(issue.id, this.auth.getUser().login).then(issue => {
      this.selectedIssue = issue;
    });
  }
  getMessages(issue: Issue) {
    // @ts-ignore
    return _.sortBy(issue.messages, x => x.date).reverse().slice(0, issue.messages.length - 1);
  }
  getDate(dateLong: number): string{
    let date = new Date(dateLong);
    let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
    let mo = new Intl.DateTimeFormat('en', { month: 'long' }).format(date);
    let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);
    let hours = new Intl.DateTimeFormat('en', { hour: '2-digit' }).format(date);
    let minutes = new Intl.DateTimeFormat('en', { minute: '2-digit' }).format(date);
    return da + ' ' + mo + ' ' + ye + ' ' + ('0' + hours).slice(-2) + ':' + ('0' + minutes).slice(-2);
  }
  openFile(url: string) {
    window.open(url);
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
      case 'mp4': return 'mp4.svg';
      default: return 'file.svg';
    }
  }
  trimFileName(input: string, length: number = 9): string{
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
  filterVariables(variables: VarMap[]) {
    return variables.filter(x => this.showHistory.includes(x.name));
  }

  getAuthor(author: string) {
    return this.auth.getUserName(author);
  }
  getPrevValue(messages: IssueMessage[], name: string, date: number): string {
    let res = '';
    _.sortBy(messages.filter(x => x.date < date), x => x.date).forEach(x => {
      let find = x.variables.find(v => v.name == name);
      if (find != null){
        res = find.value;
      }
    });
    return res;
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
  handleImageInput(files: FileList | null) {
    if (files != null){
      for (let x = 0; x < files.length; x++){
        let file = files.item(x);
        if (file != null){
          // @ts-ignore
          const find = this.loaded.find(x => x.name == file.name);
          if (find != null){
            this.loaded.splice(this.loaded.indexOf(find), 1);
          }
          this.awaitForLoad.push(file.name);
        }
      }
      for (let x = 0; x < files.length; x++){
        let file = files.item(x);
        if (file != null){
          this.issueManager.uploadFile(file).then(res => {
            this.message += '<img style="cursor: pointer" src="' + res.url + '"/>';
            this.loaded.push(res);
          });
        }
      }
    }
  }
  handleFileInput(files: FileList | null) {
    if (files != null){
      for (let x = 0; x < files.length; x++){
        let file = files.item(x);
        if (file != null){
          // @ts-ignore
          const find = this.loaded.find(x => x.name == file.name);
          if (find != null){
            this.loaded.splice(this.loaded.indexOf(find), 1);
          }
          this.awaitForLoad.push(file.name);
        }
      }
      for (let x = 0; x < files.length; x++){
        let file = files.item(x);
        if (file != null){
          this.issueManager.uploadFile(file).then(res => {
            this.loaded.push(res);
          });
        }
      }
    }
  }
  isLoaded(file: string) {
    return this.loaded.find(x => x.name == file);
  }
  onEditorDrop(event: any) {
    event.preventDefault();
    let files = event.dataTransfer.files;
    if (files != null){
      for (let x = 0; x < files.length; x++){
        let file = files.item(x);
        if (file != null){
          const acceptedImageTypes = ['.jpg', '.jpeg', '.png'];
          let isImage = false;
          acceptedImageTypes.forEach(x => {
            if (file.name.includes(x)){
              isImage = true;
            }
          });
          if (isImage) {
            const find = this.loaded.find(x => x.name == file.name);
            if (find != null) {
              this.loaded.splice(this.loaded.indexOf(find), 1);
            }
            this.awaitForLoad.push(file.name);
            this.issueManager.uploadFile(file).then(res => {
              this.message += '<img style="cursor: pointer" src="' + res.url + '"/>';
              this.loaded.push(res);
            });
          }
        }
      }
    }
  }
  editorClicked(event: any) {
    event.preventDefault();
    event.stopPropagation();
    if (event.target.localName == 'img'){
      this.showImage(event.target.currentSrc);
      //window.open(event.target.currentSrc);
    }
    else if (event.target.localName == 'a'){
      window.open(event.target.href, '_blank');
    }
  }
  showImage(url: string){
    this.image = url;
    this.showImages = true;
    setTimeout(() => {
      if (this.wz == null){
        this.wz = mouseWheelZoom({
          // @ts-ignore
          element: document.querySelector('[data-wheel-zoom]'),
          zoomStep: .25
        });
      }
      this.wz.setSrcAndReset(url);
    });
  }
  remove(file: string) {
    let find = this.loaded.find(x => x.name == file);
    if (find != null){
      this.loaded.splice(this.loaded.indexOf(find), 1);
    }
    let findAwait = this.awaitForLoad.find(x => x == file);
    if (findAwait != null){
      this.awaitForLoad.splice(this.awaitForLoad.indexOf(findAwait), 1);
    }
  }
  closeShowImage() {
    this.showImages = false;
    this.img = '';
    this.wz.setSrcAndReset('');
  }
  sendMessage() {
    let message = new IssueMessage();
    message.author = this.auth.getUser().login;
    message.content = this.message;
    message.fileAttachments = this.loaded;

    // @ts-ignore
    this.issueManager.setIssueMessage(this.selectedIssue.id, message).then(res => {
      this.issueManager.getIssueDetails(this.selectedIssue.id, this.auth.getUser().login).then(issue => {
        this.selectedIssue = issue;
      });
    });
    this.comment = false;
  }
  editorInit(event: any) {
    this.editor = event;
  }
  onEditorPressed(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'Enter') {
      this.sendMessage();
    }
  }
}
