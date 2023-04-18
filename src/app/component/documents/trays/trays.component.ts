import {ApplicationRef, Component, OnInit} from '@angular/core';
import {Issue} from "../../../domain/classes/issue";
import {LanguageService} from "../../../domain/language.service";
import {ActivatedRoute, Router} from "@angular/router";
import {FileAttachment} from "../../../domain/classes/file-attachment";
import {DeviceDetectorService} from "ngx-device-detector";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {SpecManagerService} from "../../../domain/spec-manager.service";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {DialogService} from "primeng/dynamicdialog";
import _, {any} from "underscore";
import {UploadRevisionFilesComponent} from "../hull-esp/upload-revision-files/upload-revision-files.component";
import JSZip from "jszip";
import {saveAs} from "file-saver";
import {ClearFilesComponent} from "../hull-esp/clear-files/clear-files.component";
import {AddMaterialToEspComponent} from "../device-esp/add-material-to-esp/add-material-to-esp.component";
import {Trays} from "../../../domain/interfaces/trays";
import {TrayService} from "./tray.service";
import {CableBoxes} from "../../../domain/interfaces/cableBoxes";
import * as XLSX from "xlsx";
import {TrayEspGenerationWaitComponent} from "./tray-esp-generation-wait/tray-esp-generation-wait.component";
import {forkJoin} from "rxjs";
import {Material} from "../../../domain/classes/material";
import {MaterialManagerService} from "../../../domain/material-manager.service";

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
  selectedHeadTab: string = 'Files';
  fileGroups = [
    {
      name: 'Drawings',
      icon: 'assets/icons/drawings.svg',
      collapsed: false,
      need_rights: false
    },
    {
      name: 'Part List',
      icon: 'assets/icons/files.svg',
      collapsed: false,
      need_rights: false
    }
  ];
  cloudDate = false;
  selectedRevision = 'PROD';
  fileSort = 'name';
  sortReverse = false;
  waitForZipFiles = false;
  cmapuser = '';
  dxfEnabled = false;
  cmapdate = 0;
  cmapFormat = '';
  cutEnabled = false;
  cmap = '';
  miscIssues: Issue[] = [];
  units: string = "006";
  summaryLength: number = 0;
  label: string = '';
  forLabel: string = '';
  angleStockCode: string = 'MTLESNSTLXXX0047';
  step: number = 1.2;
  length: number = 0.3;
  angle: Trays;


  constructor(public specService: SpecManagerService, public materialService: MaterialManagerService, public trayService: TrayService, public device: DeviceDetectorService, public auth: AuthManagerService, private route: ActivatedRoute, private router: Router, private s: SpecManagerService, public l: LanguageService, public issueManager: IssueManagerService, private dialogService: DialogService, private appRef: ApplicationRef) {
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
      this.miscIssues.splice(0, this.miscIssues.length);
      this.issueManager.getIssues('op').then(issues => {
        issues.filter(x => x.doc_number == this.issue.doc_number).forEach(x => this.miscIssues.push(x));
        this.miscIssues.forEach(x => {
          issues.filter(y => y.parent_id == x.id).forEach(ch => {
            this.miscIssues.push(ch);
          })
        });
      });

      this.fillTrays();
      this.fillCableBoxes();
    });
  }

  fillTrays(): void {
    this.trayService.getTraysBySystems(this.project, this.docNumber)
      .subscribe(trays => {
        if (trays.length > 0) {
          // this.angle = trays.filter((x: any) => x.stockCode == this.angleStockCode)[0];
          // console.log(this.angle);
          // this.addAngle();
          // trays = trays.filter((x: any) => x.stockCode != this.angleStockCode);
          this.trays = _.sortBy(trays, x => x.stockCode);
          this.traysByCode = _.map(_.groupBy(this.trays, x => x.stockCode), x => Object({
            stockCode: x[0].stockCode,
            trayDesc: x[0].trayDesc,
            desc: x[0].material.name,
            totalLength: this.getAngleLength(x),
            values: x
          }));
          // this.angle1 = trays.map((x: any) => x.stockCode = this.angleStockCode)
        } else {
          this.noResultTrays = true;
        }
      });
  }

  fillCableBoxes(): void {
    this.trayService.getCableBoxesBySystems(this.project, this.docNumber)
      .subscribe(boxes => {
        if (boxes.length > 0) {
          this.cableBoxes = _.sortBy(boxes, x => x.userId);
          this.cableBoxesByCode = _.sortBy(_.map(_.groupBy(this.cableBoxes, x => (x.stockCode + x.code)), x => Object({
            stockCode: x[0].stockCode,
            code: x[0].code,
            desc: x[0].material.name,
            values: x
          })), x => x.stockCode);
        } else {
          this.noResultBoxes = true;
        }
      });
  }

  getGroupLength(group: any[]) {
    let res = 0;
    group.forEach(x => {
      res += x.length;
    });
    return this.round(res);
  }

  getGroupWeight(group: any[]) {
    let res = 0;
    group.forEach(x => {
      res += x.weight;
    });
    return this.round(res);
  }

  getAngleLength(group: any[]) {
    let res = 0;
    group.forEach(x => {
      res += x.length;
    });
    // this.summaryLength += angleLength;
    return this.round(this.length * Math.ceil(res / this.step) * 2);
  }

  getSummaryLength() {
    // console.log(this.traysByCode.totalLength);
    // this.trays.forEach(tray => {
    //   this.summaryLength += this.length * tray.length / this.step;
    //   console.log(this.summaryLength);
    // })
    // return this.round(this.summaryLength);
    this.summaryLength = 0;
    this.traysByCode.forEach((group: any) => {
      this.summaryLength += group.totalLength;
    })
    this.summaryLength = this.round(this.summaryLength);
    this.addAngle();
  }

  getName(str: any, subStr: any) {
    return str.isEmpty ? subStr : str;
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

  createEsp() {
    this.dialogService.open(TrayEspGenerationWaitComponent, {
      showHeader: false,
      modal: true,
      data: [this.issue, this.project]
    }).onClose.subscribe(() => {
      this.fillRevisions();
    });
  }

  exportSketches() {
    let fileName = 'export_' + this.generateId(8) + '.xlsx';
    let data: any[] = [];

    data.push({
      N: "SUMMARY",
      MATERIAL: "-",
      UNITS: "-",
      QTY: "-",
      WGT_KG: "-",
      STOCK_CODE: "-"
    });

    _.forEach(_.groupBy(_.sortBy(this.trays, x => "" + '#' + x.material.name + '#' + x.stockCode), x => {return x.stockCode}), group => {
      let summ = 0;
      let weight = 0;
      group.forEach((tray: any) => {
        weight += tray.weight;
        summ += tray.length;
      });
      summ = this.round(summ);
      data.push({
        N: "",
        MATERIAL: group[0].material.name,
        UNITS: this.getUnitName(group[0].material.units),
        QTY: summ,
        WGT_KG: this.round(weight),
        STOCK_CODE: group[0].stockCode
      });
    });

    _.forEach(_.groupBy(_.sortBy(this.cableBoxes, x => x.userId + '#' + x.material.name + '#' + x.stockCode), x => {return x.stockCode}), group => {
      let summ = 0;
      let weight = 0;
      group.forEach((box: any) => {
        weight += box.weight;
        summ += box.length;
      });
      summ = group.length;
      data.push({
        N: "",
        MATERIAL: group[0].material.name,
        UNITS: this.getUnitName(group[0].material.units),
        QTY: summ,
        WGT_KG: this.round(weight),
        STOCK_CODE: group[0].stockCode
      });
    });

    data.push({
      N: "",
      MATERIAL: this.angle.material.translations[0].name,
      UNITS: this.getUnitName(this.angle.material.units),
      QTY: this.angle.length,
      WGT_KG: this.angle.weight,
      STOCK_CODE: this.angle.stockCode
    });

    data.push({
      N: "CABLE BOXES",
      MATERIAL: "-",
      UNITS: "-",
      QTY: "-",
      WGT_KG: "-",
      STOCK_CODE: "-"
    });

    _.forEach(_.sortBy(this.cableBoxes, x => x.userId), box => {
      data.push({
        N: box.userId,
        MATERIAL: box.material.name,
        UNITS: this.getUnitName(box.material.units),
        QTY: "1",
        WGT_KG: this.round(box.weight),
        STOCK_CODE: box.stockCode
      });
    });



    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = {Sheets: {'data': worksheet}, SheetNames: ['data']};
    worksheet['!cols'] = [{wch:15},{wch:60},{wch:5},{wch:5},{wch:10},{wch:20}];

    XLSX.writeFile(workbook, fileName);
  }

  getUnitName(unit: any): string {
    let result: string = '';
    switch (unit.toString()) {
      case "006":
        result = "метр";
        break;
      case "796":
        result = "шт";
        break;
    }
    return result
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

  addMaterial() {
    this.dialogService.open(AddMaterialToEspComponent, {
      showHeader: false,
      modal: true,
      data: [this.docNumber, '-', '']
    }).onClose.subscribe(res => {
      this.issueManager.getIssueDetails(this.issue.id).then(issue => {
        this.issue = issue;
        this.fillRevisions();
      });
    });
  }

  addAngle() {
    console.log("ADD ANGLEEEEE")
    this.specService.removeDeviceFromSystem(this.docNumber, this.angle.stockCode, this.angle.material.units, this.round(this.angle.length).toString(), this.label, this.forLabel).then(res => {
      this.specService.addDeviceToSystem(this.docNumber, this.angle.stockCode, this.angle.material.units, this.round(this.angle.length).toString(), this.label, this.forLabel);
    });
  }

  getRevisionFilesOfGroupAux(fileGroup: string, revision: string): FileAttachment[] {
    let files = this.issue.revision_files.filter(x => (x.group == fileGroup || fileGroup == 'all') && x.revision == revision);
    if (this.fileSort == 'name'){
      return this.sortReverse ? _.sortBy(files, x => x.name).reverse() : _.sortBy(files, x => x.name);
    }
    else {
      return this.sortReverse ? _.sortBy(files, x => x.upload_date).reverse() : _.sortBy(files, x => x.upload_date);
    }
  }

  getRevisionFilesOfGroup(fileGroup: string, revision: string): FileAttachment[] {
    if (this.issue.cloud_files.length == 0){
      return this.getRevisionFilesOfGroupAux(fileGroup, revision);
    }
    this.cloudDate = true;
    let files = this.issue.cloud_files.filter(x => (x.group == fileGroup || fileGroup == 'all'));
    if (this.fileSort == 'name'){
      return this.sortReverse ? _.sortBy(files, x => x.name).reverse() : _.sortBy(files, x => x.name);
    }
    else {
      return this.sortReverse ? _.sortBy(files, x => x.upload_date).reverse() : _.sortBy(files, x => x.upload_date);
    }
  }

  addFilesToGroup(file_group: string, revision: string) {
    this.dialogService.open(UploadRevisionFilesComponent, {
      showHeader: false,
      modal: true,
      data: [this.issue.id, file_group]
    }).onClose.subscribe(res => {
      this.issueManager.getIssueDetails(this.issue.id).then(issue => {
        this.issue = issue;
        this.fillRevisions();
      });
    });
  }

  downloadFiles(group: string, revision: string, format = 'cnc') {
    if (group == 'Cutting Map'){
      this.downloadFilesCVC(group, revision, format);
      return;
    }
    let files = this.getRevisionFilesOfGroup(group, revision);
    let zipped: string[] = [];
    this.waitForZipFiles = true;
    Promise.all(files.map(x => fetch(x.url))).then(blobs => {
      let zip = new JSZip();
      blobs.forEach(blob => {
        // @ts-ignore
        let name: string = blob.url.split('/').pop();
        while (zipped.includes(name)){
          name = name.split('.').reverse().pop() + '$.' + name.split('.').pop();
        }
        zipped.push(name);
        zip.file(name, blob.blob());
      });
      zip.generateAsync({type:"blob"}).then(res => {
        this.waitForZipFiles = false;
        saveAs(res, this.issue.doc_number + '-' + new Date().getTime() + '.zip');
      });
    });
  }

  downloadFilesCVC(group: string, revision: string, format = 'cnc') {
    let files = this.getRevisionFilesOfGroup(group, revision);
    let zipped: string[] = [];
    this.waitForZipFiles = true;
    forkJoin(files.map(x => fetch(x.url))).subscribe(blobs => {
      forkJoin(blobs.map(file => file.text())).subscribe(texts => {

        if (format == 'txt'){
          let zip = new JSZip();
          texts.forEach(txt => {
            // @ts-ignore
            let name: string = blobs[texts.indexOf(txt)].url.split('/').pop();
            while (zipped.includes(name)) {
              name = name.split('.').reverse().pop() + '$.' + name.split('.').pop();
            }
            name = name.replace('C-' + this.project + '-', '');
            // @ts-ignore
            zip.file(name, txt);
          });
          zip.generateAsync({type: "blob"}).then(res => {
            this.waitForZipFiles = false;
            saveAs(res, this.issue.doc_number + '-' + new Date().getTime() + '.zip');
          });
          return;
        }

        forkJoin(texts.map(text => {
          this.cmapuser = this.auth.getUserName(files[texts.indexOf(text)].author);
          this.cmapdate = files[texts.indexOf(text)].upload_date;
          if (format == 'essi'){
            return this.s.createESSI(text.split('\n'), this.cmapuser + ' at ' + new Date(this.cmapdate).toDateString());
          }
          else if (format == 'tap'){
            return this.s.createTAP(text.split('\n'), this.cmapuser + ' at ' + new Date(this.cmapdate).toDateString());
          }
          else{
            return this.s.createCNC(text.split('\n'), this.cmapuser + ' at ' + new Date(this.cmapdate).toDateString());
          }
        })).subscribe(cncs => {
          let zip = new JSZip();
          cncs.forEach(cnc => {
            // @ts-ignore
            let name: string = blobs[cncs.indexOf(cnc)].url.split('/').pop();
            while (zipped.includes(name)){
              name = name.split('.').reverse().pop() + '$.' + name.split('.').pop();
            }

            if (format == 'essi'){
              name = name.replace('.txt', '.ESI');
            }
            else if (format == 'tap'){
              name = name.replace('.txt', '.TAP');
            }
            else{
              name = name.replace('.txt', '.MPG');
            }


            name = name.replace('C-' + this.project + '-', '');
            zipped.push(name);
            // @ts-ignore
            zip.file(name, cnc.join('\n'));
          });
          zip.generateAsync({type: "blob"}).then(res => {
            this.waitForZipFiles = false;
            saveAs(res, this.issue.doc_number + '-' + new Date().getTime() + '.zip');
          });
        });
      });
    });
  }

  setFileSort(value: string) {
    this.fileSort = value;
    this.sortReverse = !this.sortReverse;
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

  trimFileName(input: string, length: number = 10): string{
    let split = input.split('.');
    let name = split[0];
    let extension = split[1];
    if (name.length > length){
      return name.substr(0, length - 2) + '..' + name.substr(name.length - 2, 2) + '.' + extension;
    }
    else{
      return input;
    }
  }

  getDate(dateLong: number): string{
    if (this.cloudDate){
      return this.getCloudDateNoTime(dateLong);
    }
    if (dateLong == 0){
      return '--/--/----';
    }
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
  }

  getCloudDateNoTime(dateLong: number): string{
    if (dateLong == 0) {
      return '';
    }
    else{
      let date = new Date(0);
      date.setUTCSeconds(dateLong);
      return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
    }
  }

  showDxfInViewer(url: string) {
    if (!this.dxfEnabled){
      this.dxfEnabled = !this.dxfEnabled;
    }
    this.router.navigate([], {queryParams: {dxf: null, search: null, searchNesting: null}, queryParamsHandling: 'merge'}).then(() => {
      // @ts-ignore
      this.router.navigate([], {queryParams: {dxf: url, search: null, searchNesting: null}, queryParamsHandling: 'merge'});
    });
  }

  showCuttingFile(file: FileAttachment) {
    this.cmap = file.url;
    this.dxfEnabled = false;
    this.cutEnabled = false;
    this.router.navigate([], {queryParams: {cmap: null, cmapuser: null, cmapdate: null}, queryParamsHandling: 'merge'}).then(() => {
      setTimeout(() => {
        this.cutEnabled = true;
        // @ts-ignore
        this.router.navigate([], {queryParams: {cmap: file.url, cmapuser: this.auth.getUserName(file.author), cmapdate: file.upload_date}, queryParamsHandling: 'merge'});
        const style = document.createElement('style');
        style.innerHTML = `
          .editBlock pre {
            height: 42vh !important;
          }
          .viewContainer .TwoDView {
            height: 45vh !important;
          }
        `;
        document.head.appendChild(style);
      });
    });
  }

  openFile(file: FileAttachment, cmapFormat = 'cnc') {
    if (file.group == 'Cutting Map'){
      this.cmap = file.url;
      this.cmapFormat = cmapFormat;
      this.cmapuser = this.auth.getUserName(file.author);
      this.downloadOpenedCMAP();
    }
    else{
      window.open(file.url, '_blank');
    }
  }

  deleteFile(fileUrl: string){
    this.dialogService.open(ClearFilesComponent, {
      showHeader: false,
      modal: true,
      data: this.issue
    }).onClose.subscribe(res => {
      if (res == 'success'){
        this.issueManager.deleteRevisionFile(fileUrl, this.auth.getUser().login).then(() => {
          this.fillRevisions();
        });
      }
    });
  }

  downloadOpenedCMAP() {
    if (this.cmap != ''){
      fetch(this.cmap).then(res => {
        res.text().then(text => {
          if (this.cmapFormat == 'cnc'){
            this.s.createCNC(text.split('\n'), this.cmapuser + ' at ' + new Date(this.cmapdate).toDateString()).then(res => {

              var element = document.createElement('a');
              element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(res.join('\n')));
              // @ts-ignore
              element.setAttribute('download', this.cmap.split('/').pop().replace('C-' + this.project + '-', '').replace('.txt', '.MPG'));

              element.style.display = 'none';
              document.body.appendChild(element);

              element.click();

              document.body.removeChild(element);
            });
          }
          else if (this.cmapFormat == 'tap'){
            this.s.createTAP(text.split('\n'), this.cmapuser + ' at ' + new Date(this.cmapdate).toDateString()).then(res => {

              var element = document.createElement('a');
              element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(res.join('\n')));
              // @ts-ignore
              element.setAttribute('download', this.cmap.split('/').pop().replace('C-' + this.project + '-', '').replace('.txt', '.TAP'));

              element.style.display = 'none';
              document.body.appendChild(element);

              element.click();

              document.body.removeChild(element);
            });
          }
          else{
            this.s.createESSI(text.split('\n'), this.cmapuser + ' at ' + new Date(this.cmapdate).toDateString()).then(res => {

              var element = document.createElement('a');
              element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(res.join('\n')));
              // @ts-ignore
              element.setAttribute('download', this.cmap.split('/').pop().replace('C-' + this.project + '-', '').replace('.txt', '.ESI'));
              element.style.display = 'none';
              document.body.appendChild(element);

              element.click();

              document.body.removeChild(element);
            });
          }
        });
      });
    }
  }

  clearFiles(fileGroup: string, revision: string) {
    this.dialogService.open(ClearFilesComponent, {
      showHeader: false,
      modal: true,
      data: this.issue
    }).onClose.subscribe(res => {
      if (res == 'success'){
        this.issueManager.clearRevisionFiles(this.issue.id, this.auth.getUser().login, fileGroup, revision).then(() => {
          this.fillRevisions();
        });
      }
    });
  }

  openIssue(id: number) {
    window.open('/?taskId=' + id, '_blank');
  }

  getArchive() {
    return _.sortBy(this.issue.archive_revision_files, x => x.removed_date).reverse();
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
