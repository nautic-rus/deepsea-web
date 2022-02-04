import { Component, OnInit } from '@angular/core';
import {LanguageService} from "../../domain/language.service";
import {IssueManagerService} from "../../domain/issue-manager.service";
import {AuthManagerService} from "../../domain/auth-manager.service";
import _ from "underscore";
import {SpecManagerService} from "../../domain/spec-manager.service";

@Component({
  selector: 'app-elec-cables',
  templateUrl: './elec-cables.component.html',
  styleUrls: ['./elec-cables.component.css']
})
export class ElecCablesComponent implements OnInit {

  cables: any[] = [];

  trayBundlesProject = 'P701';
  trayBundlesProjects = ['P701', 'P707'];
  selectedTrayBundle: any;
  trayBundles: any[] = [];

  constructor(public t: LanguageService, public issues: IssueManagerService, public auth: AuthManagerService, private s: SpecManagerService) { }

  ngOnInit(): void {
    this.trayBundleProjectChanged();
  }
  trayBundleProjectChanged(){
    this.s.getTrayBundles(this.trayBundlesProject).then(res => {
      this.trayBundles = _.sortBy(res.filter((x: any) => x.drawingId != null && x.drawingId != ''), x => x.drawingId);
      if (this.trayBundles.length > 0){
        this.selectedTrayBundle = this.trayBundles[0].drawingId;
      }
    });
  }

  getCables(number: number = 0) {
    this.s.getCables(this.trayBundlesProject, this.selectedTrayBundle, number).then(res => {
      console.log(res);
      this.cables = res;
    });
  }
}
