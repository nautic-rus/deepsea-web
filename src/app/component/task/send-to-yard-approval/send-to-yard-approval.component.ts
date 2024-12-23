import {ApplicationRef, Component, OnInit, ViewChild} from '@angular/core';
import {FileAttachment} from "../../../domain/classes/file-attachment";
import {Issue} from "../../../domain/classes/issue";
import {User} from "../../../domain/classes/user";
import {LanguageService} from "../../../domain/language.service";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import Delta from "quill-delta";
import {mouseWheelZoom} from "mouse-wheel-zoom";

@Component({
  selector: 'app-send-to-yard-approval',
  templateUrl: './send-to-yard-approval.component.html',
  styleUrls: ['./send-to-yard-approval.component.css']
})
export class SendToYardApprovalComponent implements OnInit {
  dragOver = false;
  loaded: FileAttachment[] = [];
  awaitForLoad: string[] = [];
  selectedUsers: string[] = ['lvov', 'n.novikov', 'voronin'];
  issue: Issue = new Issue();
  users: User[] = [];

  constructor(public t: LanguageService, public issues: IssueManagerService, public auth: AuthManagerService, public ref: DynamicDialogRef, private appRef: ApplicationRef, public conf: DynamicDialogConfig, private dialogService: DialogService) {
    this.issue = conf.data;
    this.issues.getIssueTypes().then(res => {
      var findType = res.find(x => x.type_name == this.issue.issue_type);
      if (findType != null){
        this.selectedUsers = findType.yard_approval.split(',');
      }
    });
  }
  ngOnInit(): void {
    this.users = this.getUsersApproval();
  }
  getUsersApproval() {
    return this.auth.users.filter(x => x.visibility.includes('a') || x.visibility.includes('c'));
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
          this.issues.uploadFile(file, this.auth.getUser().login).then(res => {
            console.log(res);
            this.loaded.push(res);
          });
        }
      }
    }
  }
  onFilesDrop(event: DragEvent) {
    event.preventDefault();
    // @ts-ignore
    this.handleFileInput(event.dataTransfer.files);
  }
  isLoaded(file: string) {
    return this.loaded.find(x => x.name == file);
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
                this.issues.uploadFile(file, this.auth.getUser().login).then(res => {
                  this.loaded.push(res);
                  this.appRef.tick();
                  this.taskDetails += '<img src="' + res.url + '"/>';
                  // this.editor.updateContents(new Delta().insert({image: res.url}));
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
  quillCreated(event: any) {
    this.editor = event;
  }
  editorClicked(event: any) {
    event.preventDefault();
    event.stopPropagation();
    if (event.target.localName == 'img'){
      this.showImage(event.target.currentSrc);
      //window.open(event.target.currentSrc);
    }
  }
  // @ts-ignore
  @ViewChild('img') img;
  // @ts-ignore
  wz;
  image = '';
  showImages = false;
  taskDetails = '';
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
  closeShowImage() {
    this.showImages = false;
    this.img = '';
    this.wz.setSrcAndReset('');
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
          const q = "'";
          this.issues.uploadFile(file, this.auth.getUser().login).then(res => {
            this.taskDetails += '<img src="' + res.url + '"/>';
            console.log(res);
            this.loaded.push(res);
          });
        }
      }
    }
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
            this.issues.uploadFile(file, this.auth.getUser().login).then(res => {
              this.taskDetails += '<img src="' + res.url + '"/>';
              this.loaded.push(res);
            });
          }
        }
      }
    }
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
  commit() {
    this.sendCommit();
  }
  sendCommit(){
    this.selectedUsers.forEach(user => {
      const issue = new Issue();
      issue.name = 'Согласование ' + this.issue.doc_number;
      issue.details = this.taskDetails;
      issue.issue_type = 'APPROVAL';
      issue.started_by = this.auth.getUser().login;
      issue.responsible = user;
      issue.status = 'New';
      issue.action = 'New';
      issue.file_attachments = this.loaded;
      issue.parent_id = this.issue.id;
      issue.doc_number = this.issue.doc_number;
      issue.project = this.issue.project;
      issue.department = this.issue.department;
      this.issues.startIssue(issue).then(res => {
        this.issues.setIssueViewed(+res, this.auth.getUser().login).then(() => {

        });
      });
    });

    this.issue.first_send_date = new Date().getTime();
    this.issues.updateIssue(this.auth.getUser().login, "hidden", this.issue).then(() => {
      this.issue.status = 'Send to Yard Approval';
      this.issue.action = this.issue.status;
      this.issues.updateIssue(this.auth.getUser().login, 'status', this.issue).then(() => {
        this.issues.setIssueViewed(this.issue.id, this.auth.getUser().login).then(() => {
          this.ref.close();
        });
      });
    });


  }
  isDisabled() {
    return this.selectedUsers.length == 0;
  }
  close(){
    this.ref.close('exit');
  }

}
