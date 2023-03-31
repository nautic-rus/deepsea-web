import {Component, OnInit} from '@angular/core';
import {Issue} from "../../../domain/classes/issue";
import {ActivatedRoute, Router} from "@angular/router";
import {Trays} from "../../../domain/interfaces/trays";
import {Cable} from "../../../domain/interfaces/cable";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import _ from "underscore";
import {CableService} from "./cable.service";
import {LanguageService} from "../../../domain/language.service";
import {Equipment} from "../../../domain/interfaces/equipment";

@Component({
  selector: 'app-cables',
  templateUrl: './cables.component.html',
  styleUrls: ['./cables.component.css']
})
export class CablesComponent implements OnInit {

  issue: Issue = new Issue();
  docNumber = '';
  project = '';
  department = '';
  issueId = 0;
  cables: Cable[] = [];
  equipments: Equipment[] = [];
  issueRevisions: string[] = [];
  miscIssues: Issue[] = [];
  colsTrays: any[] = [];
  noResultCables = false;
  selectedHeadTab: string = 'Files';
  equipmentHeadTab: string = 'Cables'
  selectedEq: string = '';
  selectedView: string = 'tiles';
  tooltips: string[] = [];
  cable_rout: string[] = [];
  selectedTab: string = 'Cables';

  constructor(private route: ActivatedRoute, private router: Router, public issueManager: IssueManagerService, public cableService: CableService, public l: LanguageService) {
  }

  ngOnInit(): void {
    this.setCols();
    this.route.queryParams.subscribe(params => {
      this.project = params.foranProject != null ? params.foranProject : '';
      this.docNumber = params.docNumber != null ? params.docNumber : '';
      this.department = params.department != null ? params.department : '';
      this.issueId = params.issueId != null ? params.issueId : 0;

      if (this.issue.id == 0) {
        this.fillRevisions();
      }
    });
  }

  fillRevisions() {
    this.issueRevisions.splice(0, this.issueRevisions.length);
    this.issueManager.getIssueDetails(this.issueId).then(res => {
      this.issue = res;
      this.miscIssues.splice(0, this.miscIssues.length);
      this.issueManager.getIssues('op').then(issues => {
        issues.filter(x => x.doc_number == this.issue.doc_number).forEach(x => this.miscIssues.push(x));
        this.miscIssues.forEach(x => {
          issues.filter(y => y.parent_id == x.id).forEach(ch => {
            this.miscIssues.push(ch);
          })
        });
      });

      this.fillCables();
    });
  }


  fillCables(): void {
    this.cableService.getCablesBySystems(this.project, this.docNumber)
      .subscribe(cables => {
        if (cables.length > 0) {
          let re = "/\\(([^)]+)\\)/";
          this.cables = _.sortBy(cables, x => x.stock_code);
          // this.equipments = _.map(_.groupBy(this.cables, x => (x.from_eq, x.to_eq)), x => Object({
          //   from_eq: x[0].from_eq,
          //   values: x
          // }))
          this.equipments = _.map(this.cables, x => ({
            id: x.from_eq_id,
            name: x.from_eq,
            desc: x.from_eq_desc,
            zone: x.from_zone,
            zone_desc: x.from_zone_desc,
            system: x.from_system,
            x: x.from_x,
            y: x.from_y,
            z: x.from_z,
            stock_code: x.from_stock_code
          })).concat(_.map(this.cables, x => ({
            id: x.to_eq_id,
            name: x.to_eq,
            desc: x.to_eq_desc,
            zone: x.to_zone,
            zone_desc: x.to_zone_desc,
            system: x.to_system,
            x: x.to_x,
            y: x.to_y,
            z: x.to_z,
            stock_code: x.to_stock_code
          }))) as Equipment[]

          this.equipments = _.sortBy(_.uniq(this.equipments, x =>
            [x.id, x.name, x.desc, x.zone, x.zone_desc, x.x, x.y, x.z, x.stock_code].join('-')
          ), x => x.name)


          console.log(this.equipments)
        } else {
          this.noResultCables = true;
        }
      });
  }

  openIssue(id: number) {
    window.open('/?taskId=' + id, '_blank');
  }

  copyTrmCode(code: string, index: string) {
    navigator.clipboard.writeText(code);
    this.tooltips.push(index);
    setTimeout(() => {
      this.tooltips.splice(this.tooltips.indexOf(index), 1);
    }, 1500);
    //this.messageService.add({key:'task', severity:'success', summary:'Copied', detail:'You have copied issue url.'});
  }

  showTooltip(index: string) {
    return this.tooltips.includes(index);
  }

  round(value: number) {
    return Math.round(value * 100) / 100;
  }

  getNodeByRout(rout: string) {
    let re = "\\(([^)]+)\\)";
    let res = rout.match(re)
    console.log(res);
  }

  setCols() {
    this.colsTrays = [
      {
        field: 'system',
        header: 'System',
        headerLocale: 'System',
        sort: true,
        filter: false,
        skip: false,
        defaultValue: '',
        hidden: false,
        date: false,
      },
      {
        field: 'oid',
        header: 'OID',
        headerLocale: 'OID',
        sort: true,
        filter: false,
        skip: false,
        defaultValue: '',
        hidden: false,
        date: false,
      },
      {
        field: 'trayDesc',
        header: 'Description',
        headerLocale: 'Description',
        sort: true,
        filter: false,
        skip: false,
        defaultValue: '',
        hidden: false,
        date: false,
      },
      {
        field: 'stockCode',
        header: 'StockCode',
        headerLocale: 'StockCode',
        sort: true,
        filter: false,
        skip: false,
        defaultValue: '',
        hidden: false,
        date: true
      },
      {
        field: 'zone',
        header: 'Zone',
        headerLocale: 'Zone',
        sort: true,
        filter: false,
        skip: false,
        defaultValue: '',
        hidden: false,
        date: false,
      },
      {
        field: 'line',
        header: 'Line',
        headerLocale: 'Line',
        sort: true,
        filter: false,
        skip: false,
        defaultValue: '',
        hidden: false,
        date: false,
      },
      {
        field: 'weight',
        header: 'Weight',
        headerLocale: 'Weight',
        sort: true,
        filter: false,
        skip: false,
        defaultValue: '',
        hidden: false,
        date: false,
      },
      {
        field: 'length',
        header: 'Length',
        headerLocale: 'Length',
        sort: true,
        filter: false,
        skip: false,
        defaultValue: '',
        hidden: false,
        date: false,
      },
      {
        field: 'cType',
        header: 'cType',
        headerLocale: 'cType',
        sort: true,
        filter: false,
        skip: false,
        defaultValue: '',
        hidden: false,
        date: false,
      },
      {
        field: 'tType',
        header: 'Type',
        headerLocale: 'Type',
        sort: true,
        filter: false,
        skip: false,
        defaultValue: '',
        hidden: false,
        date: false,
      },
      {
        field: 'x_n1',
        header: 'X1',
        headerLocale: 'X1',
        sort: true,
        filter: false,
        skip: false,
        defaultValue: '',
        hidden: false,
        date: false,
      },
      {
        field: 'y_n1',
        header: 'Y1',
        headerLocale: 'Y1',
        sort: true,
        filter: false,
        skip: false,
        defaultValue: '',
        hidden: false,
        date: false,
      },
      {
        field: 'y_n1',
        header: 'Y1',
        headerLocale: 'Y1',
        sort: true,
        filter: false,
        skip: false,
        defaultValue: '',
        hidden: false,
        date: false,
      },
      {
        field: 'z_n1',
        header: 'Z1',
        headerLocale: 'Z1',
        sort: true,
        filter: false,
        skip: false,
        defaultValue: '',
        hidden: false,
        date: false,
      },
      {
        field: 'x_n2',
        header: 'X2',
        headerLocale: 'X2',
        sort: true,
        filter: false,
        skip: false,
        defaultValue: '',
        hidden: false,
        date: false,
      },
      {
        field: 'y_n2',
        header: 'y2',
        headerLocale: 'y2',
        sort: true,
        filter: false,
        skip: false,
        defaultValue: '',
        hidden: false,
        date: false,
      },
      {
        field: 'z_n2',
        header: 'Z2',
        headerLocale: 'Z2',
        sort: true,
        filter: false,
        skip: false,
        defaultValue: '',
        hidden: false,
        date: false,
      },
    ]
  }


}
