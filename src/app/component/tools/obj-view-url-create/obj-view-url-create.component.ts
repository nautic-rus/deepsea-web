import { Component, OnInit } from '@angular/core';
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {AuthManagerService} from "../../../domain/auth-manager.service";

@Component({
  selector: 'app-obj-view-url-create',
  templateUrl: './obj-view-url-create.component.html',
  styleUrls: ['./obj-view-url-create.component.css']
})
export class ObjViewUrlCreateComponent implements OnInit {
  fileUrl = '';
  url = 'https://deep-sea.ru/3d?url=' + this.fileUrl;
  loaded: any;
  materialColor = '#00ff00';
  backgroundColor = '#a8c3ed';
  constructor(public issues: IssueManagerService, public auth: AuthManagerService) { }

  ngOnInit(): void {
  }
  onFilesDrop(event: DragEvent) {
    event.preventDefault();
    // @ts-ignore
    this.handleFileInput(event.dataTransfer.files);
  }
  handleFileInput(files: FileList | null) {
    if (files != null){
      for (let x = 0; x < files.length; x++){
        let file = files.item(x);
        if (file != null){
          this.issues.uploadFile(file, this.auth.getUser().login).then(res => {
            this.loaded = res;
            this.fileUrl = res.url;
            console.log(this.fileUrl);
          });
        }
      }
    }
  }

  getQrCodeValue() {
    return this.url + this.fileUrl + '&bcol=' + this.backgroundColor.replace('#', '') + '&mcol=' + this.materialColor.replace('#', '');
  }

  openPreview() {
    window.open(this.getQrCodeValue(), '_blank', 'height=720,width=1280');
  }
}
