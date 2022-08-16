import {ApplicationRef, Component, OnInit} from '@angular/core';
import {SpecManagerService} from "../../../domain/spec-manager.service";
import {DeviceDetectorService} from "ngx-device-detector";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {ActivatedRoute, Router} from "@angular/router";
import {LanguageService} from "../../../domain/language.service";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {DialogService} from "primeng/dynamicdialog";

@Component({
  selector: 'app-device-esp',
  templateUrl: './device-esp.component.html',
  styleUrls: ['./device-esp.component.css']
})
export class DeviceEspComponent implements OnInit {

  docNumber = '';
  project = '';
  department = '';
  issueId = 0;
  dxfDoc: string = '';

  devices: any[] = [];
  constructor(public device: DeviceDetectorService, public auth: AuthManagerService, private route: ActivatedRoute, private router: Router, private s: SpecManagerService, public l: LanguageService, public issueManager: IssueManagerService, private dialogService: DialogService, private appRef: ApplicationRef) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.project = params.foranProject != null ? params.foranProject : '';
      this.docNumber = params.docNumber != null ? params.docNumber : '';
      this.department = params.department != null ? params.department : '';
      this.issueId = params.issueId != null ? params.issueId : 0;
      this.dxfDoc = params.dxf != null ? params.dxf : '';

      this.s.getDevices(this.docNumber).then(res => {
        this.devices = res;
        console.log(this.devices);
      });
    });
  }

}
