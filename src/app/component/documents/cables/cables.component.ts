import {Component, OnInit} from '@angular/core';
import {Issue} from "../../../domain/classes/issue";
import {ActivatedRoute, Router} from "@angular/router";
import {Trays} from "../../../domain/interfaces/trays";
import {Cable} from "../../../domain/interfaces/cable";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import _, {indexOf} from "underscore";
import {CableService} from "./cable.service";
import {LanguageService} from "../../../domain/language.service";
import {Equipment} from "../../../domain/classes/equipment";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {ScrollService} from "./scroll.service";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {FileAttachment} from "../../../domain/classes/file-attachment";
import {ClearFilesComponent} from "../hull-esp/clear-files/clear-files.component";
import {DialogService} from "primeng/dynamicdialog";
import {SpecManagerService} from "../../../domain/spec-manager.service";
import {UploadRevisionFilesComponent} from "../hull-esp/upload-revision-files/upload-revision-files.component";
import JSZip from "jszip";
import {saveAs} from "file-saver";
import {forkJoin} from "rxjs";
import {EquipmentConnection} from "../../../domain/interfaces/equipConnect";

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
  cablesSource: Cable[] = [];
  equipmentCables: Cable[] = [];
  equipments: Equipment[] = [];
  equipmentsSource: Equipment[] = [];
  eqConnection: EquipmentConnection[] = [];
  eqCpSource: EquipmentConnection[] = [];
  issueRevisions: string[] = [];
  miscIssues: Issue[] = [];
  colsTrays: any[] = [];
  noResultCables = false;
  selectedHeadTab: string = 'Files';
  equipmentHeadTab: string = 'Cables'
  selectedEq: Equipment;
  selectedView: string = 'tiles';
  tooltips: string[] = [];
  cable_rout: string[] = [];
  selectedTab: string = 'Cables';
  url: string = "https://threejs.org/editor/";
  urlSafe: SafeResourceUrl;
  searchPlates: string = '';

  //right panel
  cloudDate = false;
  dxfEnabled = false;
  cmap = '';
  cutEnabled = false;
  cmapFormat = '';
  cmapuser = '';
  cmapdate = 0;
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
    },
    {
      name: 'Correction',
      icon: 'assets/icons/cutting.svg',
      collapsed: true,
      need_rights: false
    }
  ];
  fileSort = 'name';
  sortReverse = false;
  waitForZipFiles = false;
  selectedRevision = 'PROD';


  constructor(private s: SpecManagerService, private dialogService: DialogService, public auth: AuthManagerService, private scrollService: ScrollService, public sanitizer: DomSanitizer, private route: ActivatedRoute, private router: Router, public issueManager: IssueManagerService, public cableService: CableService, public l: LanguageService) {
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

    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
  }

  fillRevisions() {
    this.issueRevisions.splice(0, this.issueRevisions.length);
    this.issueManager.getIssueDetails(this.issueId).then(res => {
      this.issue = res;
      this.miscIssues.splice(0, this.miscIssues.length);
      this.issueManager.getIssues('op').then(issues => {
        //issues.filter(x => x.doc_number == this.issue.doc_number).forEach(x => this.miscIssues.push(x));
        this.miscIssues.push(this.issue);
        issues.filter(x => this.issue.combined_issues.map(y => y.id).includes(x.id)).forEach(x => this.miscIssues.push(x));
        issues.filter(x => this.issue.child_issues.map(y => y.id).includes(x.id)).forEach(x => this.miscIssues.push(x));        this.miscIssues.forEach(x => {
          issues.filter(y => y.parent_id == x.id).forEach(ch => {
            this.miscIssues.push(ch);
          })
        });
      });

      this.fillCables();
      this.fillEquipment();
    });
  }


  fillCables(): void {
    this.cableService.getCablesBySystems(this.project, this.docNumber)
      .subscribe(cables => {
        if (cables.length > 0) {
          let re = "/\\(([^)]+)\\)/";
          this.cables = _.sortBy(cables, x => x.id);
          console.log(cables)
          this.cablesSource = _.sortBy(cables, x => x.id);
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

          this.equipmentsSource = this.equipments;

          console.log(this.equipments)
        } else {
          this.noResultCables = true;
        }
      });
  }

  fillEquipment(): void {
    this.cableService.getEquipmentBySystems(this.project, this.docNumber)
      .subscribe(equipments => {
        this.eqConnection = _.sortBy(equipments, x => this.addLeftZeros(x.LABEL, 5))

        this.eqConnection.forEach((eq: any) => {
          eq.LABEL = this.addLeftZeros(eq.LABEL, 10);
          eq.workShopMaterialName = eq.workShopMaterial.name;
        });
        console.log(this.eqConnection)
      })
  }

  searchChanged() {
    if (this.selectedTab == 'Cables') {
      if (this.searchPlates.trim() == '') {
        this.cables = this.cablesSource;
      } else {
        this.cables = this.cablesSource.filter((x: any) => {
          return x == null || (x.code.toString() + x.description.toString() + x.stock_code.toString() + x.from_system.toString() + x.from_eq_id.toString() + x.from_eq_desc.toString() + x.from_eq.toString() + x.from_stock_code.toString() + x.from_zone.toString() + x.from_zone_desc.toString() + x.from_system.toString() + x.to_eq_id.toString() + x.to_eq_desc.toString() + x.to_eq.toString() + x.to_stock_code.toString() + x.to_zone.toString() + x.to_zone_desc.toString()).trim().toLowerCase().includes(this.searchPlates.toString().trim().toLowerCase())
        });
      }
    }
    if (this.selectedTab == 'Equipment') {
      if (this.searchPlates.trim() == '') {
        this.equipments = this.equipmentsSource;
      } else {
        this.equipments = this.equipmentsSource.filter((x: any) => {
          return x == null || (x.id.toString() + x.name.toString() + x.desc.toString() + x.zone.toString() + x.zone_desc.toString() + x.system.toString() + x.stock_code.toString()).trim().toLowerCase().includes(this.searchPlates.toString().trim().toLowerCase())
        });
      }
    }
  }

  addLeftZeros(input: string, length: number){
    let res = input;
    while (res.length < length){
      res = '0' + res;
    }
    return res;
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

  viewEqInfo(eq: Equipment) {
    this.selectedEq = eq;
    console.log(this.selectedEq);
  }

  onClickFromEquipment(cable: Cable) {
    this.selectedEq = this.equipments.filter(_ =>
      _.id == cable.from_eq_id &&
      _.name == cable.from_eq &&
      _.desc == cable.from_eq_desc &&
      _.zone == cable.from_zone &&
      _.zone_desc == cable.from_zone_desc &&
      _.system == cable.from_system &&
      _.x == cable.from_x &&
      _.y == cable.from_y &&
      _.z == cable.from_z &&
      _.stock_code == cable.from_stock_code)[0]
    console.log(this.selectedEq)
    this.selectedTab = 'Equipment'
    this.setEquipmentCables()
    setTimeout(()=>{
      this.scrollToId(this.equipments.indexOf(this.selectedEq).toString());
    }, 1);
    return this.selectedEq
  }

  onClickToEquipment(cable: Cable) {
    this.selectedEq = this.equipments.find(_ =>
      _.id == cable.to_eq_id &&
      _.name == cable.to_eq &&
      _.desc == cable.to_eq_desc &&
      _.zone == cable.to_zone &&
      _.zone_desc == cable.to_zone_desc &&
      _.system == cable.to_system &&
      _.x == cable.to_x &&
      _.y == cable.to_y &&
      _.z == cable.to_z &&
      _.stock_code == cable.to_stock_code)!
    console.log(this.selectedEq)
    this.selectedTab = 'Equipment'
    this.setEquipmentCables()
    setTimeout(()=>{
      this.scrollToId(this.equipments.indexOf(this.selectedEq).toString());
    }, 1);
    return this.selectedEq
  }

  onSelectEquipment(eq: Equipment) {
    this.selectedEq = eq;
    this.setEquipmentCables()
    this.setEquipmentInfo()
  }

  scrollToId(id: string) {
    this.scrollService.scrollToElementById(id);
    // const element = document.getElementById(id)!;
    // element.scrollIntoView();
  }


  setEquipmentCables() {
    this.equipmentCables = this.cablesSource.filter(cable =>
      (cable.to_eq == this.selectedEq.name &&
        cable.to_eq_id == this.selectedEq.id)
      || (cable.from_eq == this.selectedEq.name && cable.from_eq_id == this.selectedEq.id)
    )
  }

  setEquipmentInfo() {
    this.eqCpSource = this.eqConnection.filter(eq =>
      (eq.OID == this.selectedEq.id)
    )
    console.log(this.selectedEq)
    console.log(this.eqCpSource)
  }

  // right panel

  copyTrmCode(code: string, index: string) {
    navigator.clipboard.writeText(code);
    this.tooltips.push(index);
    setTimeout(() => {
      this.tooltips.splice(this.tooltips.indexOf(index), 1);
    }, 1500);
    //this.messageService.add({key:'task', severity:'success', summary:'Copied', detail:'You have copied issue url.'});
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

  // end of right panel



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
