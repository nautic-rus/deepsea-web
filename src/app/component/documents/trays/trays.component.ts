import {ApplicationRef, Component, OnInit, ViewChild} from '@angular/core';
import {Issue} from "../../../domain/classes/issue";
import {LanguageService} from "../../../domain/language.service";
import {ActivatedRoute, Router} from "@angular/router";
import {FileAttachment} from "../../../domain/classes/file-attachment";
import {File} from "@angular/compiler-cli/src/ngtsc/file_system/testing/src/mock_file_system";
import Delta from "quill-delta";
import {DeviceDetectorService} from "ngx-device-detector";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {SpecManagerService} from "../../../domain/spec-manager.service";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {DialogService} from "primeng/dynamicdialog";
import _, {sortBy} from "underscore";
import {IssueMessage} from "../../../domain/classes/issue-message";
import {UserCardComponent} from "../../employees/user-card/user-card.component";
import {mouseWheelZoom} from "mouse-wheel-zoom";
import {UploadRevisionFilesComponent} from "../hull-esp/upload-revision-files/upload-revision-files.component";
import JSZip from "jszip";
import {saveAs} from "file-saver";
import {
  AccommodationsEspGenerationWaitComponent
} from "../accommodation-esp/accommodations-esp-generation-wait/accommodations-esp-generation-wait.component";
import {ClearFilesComponent} from "../hull-esp/clear-files/clear-files.component";
import {AddMaterialToEspComponent} from "../device-esp/add-material-to-esp/add-material-to-esp.component";
import {Trays} from "../../../domain/interfaces/trays";
import {TrayService} from "./tray.service";
import {sort, sum} from "d3";
import {CableBoxes} from "../../../domain/interfaces/cableBoxes";
import {
  DeviceEspGenerationWaitComponent
} from "../device-esp/device-esp-generation-wait/device-esp-generation-wait.component";

@Component({
  selector: 'app-trays',
  templateUrl: './trays.component.html',
  styleUrls: ['./trays.component.css']
})
export class TraysComponent implements OnInit {

  issue: Issue = new Issue();
  selectedView: string = 'tiles';
  search: string = '';
  noResultTrays = false;
  noResultBoxes = false;
  docNumber = '';
  project = '';
  department = '';
  issueId = 0;
  dxfDoc: string = '';
  trays: Trays[] = [];
  cableBoxes: CableBoxes[] = [];
  issueRevisions: string[] = [];
  traysArchive: any;
  traysArchiveContent: any[] = [];
  colsTrays: any[] = [];
  traysByCode: any = [];
  cableBoxesByCode: any = [];
  cableBoxesById: any = [];
  tooltips: string[] = [];
  length: number = 0;

  constructor(public trayService: TrayService, public device: DeviceDetectorService, public auth: AuthManagerService, private route: ActivatedRoute, private router: Router, private s: SpecManagerService, public l: LanguageService, public issueManager: IssueManagerService, private dialogService: DialogService, private appRef: ApplicationRef) {
  }

  ngOnInit(): void {
    this.setCols();
    this.route.queryParams.subscribe(params => {
      this.project = params.foranProject != null ? params.foranProject : '';
      this.docNumber = params.docNumber != null ? params.docNumber : '';
      this.department = params.department != null ? params.department : '';
      this.issueId = params.issueId != null ? params.issueId : 0;
      this.dxfDoc = params.dxf != null ? params.dxf : '';

      if (this.issue.id == 0) {
        this.fillRevisions();
      }
    });
  }

  fillRevisions() {
    this.issueRevisions.splice(0, this.issueRevisions.length);
    this.issueManager.getIssueDetails(this.issueId).then(res => {
      this.issue = res;
      this.issueRevisions.push(this.issue.revision);
      this.issue.revision_files.map(x => x.revision).forEach(gr => {
        if (!this.issueRevisions.includes(gr)) {
          this.issueRevisions.push(gr);
        }
      });
      this.issueRevisions = _.sortBy(this.issueRevisions, x => x).reverse();

      let findSpools = this.issue.revision_files.find(x => x.group == 'Pipe Spools' && x.name.includes('.zip'));
      if (findSpools != null) {
        this.traysArchive = findSpools;
        this.traysArchiveContent.splice(0, this.traysArchiveContent.length);
        fetch(findSpools.url).then(response => response.blob()).then(blob => {
          JSZip.loadAsync(blob).then(res => {
            Object.keys(res.files).forEach(file => {
              let name = file.split('/');
              if (name.length > 1 && name[1] != '') {
                this.traysArchiveContent.push(name[1]);
              }
            });
          });
        });

      }

      this.fillTrays();
      this.fillCableBoxes();
    });
  }

  fillTrays(): void {
    this.trayService.getTraysBySystems(this.project, this.docNumber)
      .subscribe(trays => {
        if (trays.length > 0) {
          console.log(trays);
          this.trays = _.sortBy(trays, x => x.stockCode);
          this.traysByCode = _.map(_.groupBy(this.trays, x => x.stockCode), x => Object({
            stockCode: x[0].stockCode,
            trayDesc: x[0].trayDesc,
            desc: x[0].material.name,
            values: x
          }));
        } else {
          this.noResultTrays = true;
        }
      });
  }

  fillCableBoxes(): void {
    this.trayService.getCableBoxesBySystems(this.project, this.docNumber)
      .subscribe(boxes => {
        if (boxes.length > 0) {
          console.log(boxes);
          this.cableBoxes = _.sortBy(boxes, x => x.userId);
          this.cableBoxesByCode = _.map(_.groupBy(this.cableBoxes, x => (x.stockCode + x.code)), x => Object({
            stockCode: x[0].stockCode,
            code: x[0].code,
            desc: x[0].material.name,
            values: x
          }));
          this.cableBoxesById = _.map(_.groupBy(this.cableBoxes, x => x.userId), x => Object({
            userId: x[0].userId,
            values: x
          }));
        } else {
          this.noResultBoxes = true;
        }
      });
  }

  getGroupLength(group: any[]) {
    let res = 0;
    console.log(group);
     group.forEach(x => {
       res += x.length;
     });
     return res;
  }

  getGroupWeight(group: any[]) {
    let res = 0;
    console.log(group);
    group.forEach(x => {
      res += x.weight;
    });
    return res;
  }

  round(value: number) {
    return Math.round(value * 100) / 100;
  }

  mw(value: number) {
    return {
      'min-width': value + '%'
    }
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

  createEsp(value: string = '1') {
    this.dialogService.open(DeviceEspGenerationWaitComponent, {
      showHeader: false,
      modal: true,
      data: {issue: this.issue, spools: value}
    }).onClose.subscribe(() => {
      this.fillRevisions();
    });
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
