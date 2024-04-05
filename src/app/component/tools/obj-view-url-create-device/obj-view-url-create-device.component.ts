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
  curl = '';
  purl = '';
  url = 'https://deep-sea.ru/3d-device?';
  url1 = 'http://localhost:4200/3d-device?';
  hcol = '#ed2d2d';
  scol = '#c9d156';
  ecol = '#d1c7c0';
  ccol = '#ff06a8';
  pcol = '#9900ff';
  backgroundColor = '#b9d2fa';
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
            else if (kind == 'ele'){
              this.curl = res.url;
            }
            else if (kind == 'pipe'){
              this.purl = res.url;
            }
          });
        }
      }
    }
  }

  getQrCodeValue() {
    let colors = 'bcol=' + this.backgroundColor.replace('#', '') +
      '&hcol=' + this.hcol.replace('#', '') +
      '&ecol=' + this.ecol.replace('#', '') +
      '&scol=' + this.scol.replace('#', '') +
      '&ccol=' + this.ccol.replace('#', '') +
      '&pcol=' + this.pcol.replace('#', '');
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
    if (this.curl != ''){
      files += 'curl=' + this.curl + '&';
    }
    if (this.purl != ''){
      files += 'purl=' + this.purl + '&';
    }
    return this.url + files + colors;
  }

  openPreview() {
    window.open(this.getQrCodeValue(), '_blank', 'height=720,width=1280');
  }

}
