import { Component, OnInit } from '@angular/core';
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {AuthManagerService} from "../../../domain/auth-manager.service";

@Component({
  selector: 'app-obj-view-url-create-device',
  templateUrl: './obj-view-url-create-device.component.html',
  styleUrls: ['./obj-view-url-create-device.component.css']
})
export class ObjViewUrlCreateDeviceComponent implements OnInit {

  eqUrl = '';
  hullUrl = '';
  structureUrl = '';
  url = 'https://deep-sea.ru/3d-device?';
  url1 = 'http://localhost:4200/3d-device?';
  hcol = '#00ff00';
  scol = '#0077ff';
  ecol = '#c55e13';
  backgroundColor = '#a8c3ed';
  constructor(public issues: IssueManagerService, public auth: AuthManagerService) { }

  ngOnInit(): void {
  }
  onFilesDrop(event: DragEvent) {
    event.preventDefault();
    // @ts-ignore
    this.handleFileInput(event.dataTransfer.files);
  }
  handleFileInput(files: FileList | null, kind: string) {
    if (files != null){
      for (let x = 0; x < files.length; x++){
        let file = files.item(x);
        if (file != null){
          this.issues.uploadFile(file, this.auth.getUser().login).then(res => {
            if (kind == 'eq'){
              this.eqUrl = res.url;
            }
            else if (kind == 'hull'){
              this.hullUrl = res.url;
            }
            else if (kind == 'structure'){
              this.structureUrl = res.url;
            }
          });
        }
      }
    }
  }

  getQrCodeValue() {
    let colors = 'bcol=' + this.backgroundColor.replace('#', '') + '&hcol=' + this.hcol.replace('#', '') + '&ecol=' + this.ecol.replace('#', '') + '&scol=' + this.scol.replace('#', '');
    let files = '';
    if (this.hullUrl != ''){
      files += 'hurl=' + this.hullUrl + '&';
    }
    if (this.eqUrl != ''){
      files += 'eurl=' + this.eqUrl + '&';
    }
    if (this.structureUrl != ''){
      files += 'surl=' + this.structureUrl + '&';
    }
    return this.url + files + colors;
  }

  openPreview() {
    window.open(this.getQrCodeValue(), '_blank', 'height=720,width=1280');
  }

}
