import {ApplicationRef, Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {SpecManagerService} from "../../../domain/spec-manager.service";
import {LanguageService} from "../../../domain/language.service";
import {Issue} from "../../../domain/classes/issue";
import {IssueManagerService} from "../../../domain/issue-manager.service";
import {DialogService} from "primeng/dynamicdialog";
import {UploadRevisionFilesComponent} from "./upload-revision-files/upload-revision-files.component";
import _ from "underscore";
import JSZip from "jszip";
import {FileAttachment} from "../../../domain/classes/file-attachment";
import {saveAs} from "file-saver";
import {AssignNewRevisionComponent} from "./assign-new-revision/assign-new-revision.component";
import Delta from "quill-delta";
import {IssueMessage} from "../../../domain/classes/issue-message";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {mouseWheelZoom} from "mouse-wheel-zoom";
import {UserCardComponent} from "../../employees/user-card/user-card.component";
import {GenerationWaitComponent} from "../../tools/trays-by-zones-and-systems/generation-wait/generation-wait.component";
import {HullEspGenerationWaitComponent} from "./hull-esp-generation-wait/hull-esp-generation-wait.component";
import {DeviceDetectorService} from "ngx-device-detector";
import {group} from "@angular/animations";
import * as XLSX from "xlsx";
import {DeleteComponent} from "../../task/delete/delete.component";
import {ClearFilesComponent} from "./clear-files/clear-files.component";
import {File} from "@angular/compiler-cli/src/ngtsc/file_system/testing/src/mock_file_system";
import {forkJoin, from, merge, of, zip} from "rxjs";
import {map} from "rxjs/operators";
import {GroupedParts} from "./interfaces/grouped-parts";
import {GenerateEspComponent} from "./generate-esp/generate-esp.component";

@Component({
  selector: 'app-hull-esp',
  templateUrl: './hull-esp.component.html',
  styleUrls: ['./hull-esp.component.css']
})
export class HullEspComponent implements OnInit {
  parts: any = [];
  groupedParts: GroupedParts[] = [];
  noResult = false;
  docNumber = '';
  project = '';
  department = '';
  selectedRevision = 'PROD';
  messageFilter = 'all';
  comment = false;
  issueId = 0;
  issue: Issue = new Issue();
  selectedPart = Object();
  cmapView: Window | null = null;
  awaitForLoad: string[] = [];
  loaded: FileAttachment[] = [];
  message = '';
  showImages = false;
  // @ts-ignore
  @ViewChild('img') img;
  image = '';
  // @ts-ignore
  wz;
  // @ts-ignore
  editor;
  groupedByPartCode = false;
  waitForZipFiles = false;
  dxfEnabled = false;
  cutEnabled = false;
  dxfEnabledForNesting = false;
  dxfView: Window | null = null;
  dxfDoc: string = '';
  search: string = '';
  searchNesting: string = '';
  selectedHeadTab: string = 'Files';
  nestContent: any[] = [];
  nestContentRead = false;
  collapsed: string[] = [];
  miscIssues: Issue[] = [];
  cloudLoading = false;
  cloudDate = false;
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
                this.issueManager.uploadFile(file, this.auth.getUser().login).then(res => {
                  this.loaded.push(res);
                  this.appRef.tick();
                  this.message += '<img style="cursor: pointer" src="' + res.url + '"/>';
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
  sortValues: any[] = [
    'by Date',
    'by Name',
  ];
  sortValue = this.sortValues[1];
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
      name: 'Cutting Map',
      icon: 'assets/icons/cutting.svg',
      collapsed: true,
      need_rights: false
    },
    {
      name: 'Nesting Plates',
      icon: 'assets/icons/cutting.svg',
      collapsed: true,
      need_rights: false
    },
    {
      name: 'Nesting Profiles',
      icon: 'assets/icons/cutting.svg',
      collapsed: true,
      need_rights: false
    },
    {
      name: 'Profile Sketches',
      icon: 'assets/icons/cutting.svg',
      collapsed: true,
      need_rights: false
    },
    {
      name: 'Bending Templates',
      icon: 'assets/icons/cutting.svg',
      collapsed: true,
      need_rights: false
    },
    {
      name: 'Other',
      icon: 'assets/icons/cutting.svg',
      collapsed: true,
      need_rights: false
    }
  ];
  selectedTab = this.fileGroups[0].name;
  issueRevisions: string[] = [];
  filters:  { ELEM_TYPE: any[], MATERIAL: any[], SYMMETRY: any[] } = { ELEM_TYPE: [],  MATERIAL: [], SYMMETRY: [] };
  cmap = '';
  cmapFormat = '';
  cmapuser = '';
  cmapdate = 0;
  fileSort = 'name';
  sortReverse = false;
  revEsp = '';
  revEspNoDate = '';
  revUser = '';
  kindEsp = '';

  constructor(public device: DeviceDetectorService, public auth: AuthManagerService, private route: ActivatedRoute, private router: Router, private s: SpecManagerService, public l: LanguageService, public issueManager: IssueManagerService, private dialogService: DialogService, private appRef: ApplicationRef) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.project = params.foranProject != null ? params.foranProject : '';
      this.docNumber = params.docNumber != null ? params.docNumber : '';
      this.department = params.department != null ? params.department : '';
      this.issueId = params.issueId != null ? params.issueId : 0;
      this.dxfDoc = params.dxf != null ? params.dxf : '';
      this.search = params.search != null ? params.search : '';
      this.searchNesting = params.searchNesting != null ? params.searchNesting : '';

      this.issueManager.getIssueProjects().then(projects => {
        let findProject = projects.find(x => x.name == this.project);
        if (findProject != null) {
          this.project = findProject.foran;
        }
        if (this.issue.id == 0){
          this.fillRevisions();
          setTimeout(() => {
            this.parts.forEach((part: any) => {
              if (part.NESTING == 'LOADING ...'){
                part.NESTING = '';
              }
              if (part.SKETCH == 'LOADING ...'){
                part.SKETCH = '';
              }
            });
          }, 5000);
        }
      });
    });
  }
  closeShowImage() {
    this.showImages = false;
    this.img = '';
    this.wz.setSrcAndReset('');
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
  getNoneZeroResult(input: string) {
    return input.length == 0 ? '<div class="text-none">Нет</div>' : input;
  }
  getNoneZeroInput(input: string) {
    return input == '-' ? '<div class="text-none">Нет</div>' : input;
  }
  getDateNoTime(dateLong: number): string{
    if (this.cloudDate){
      return this.getCloudDateNoTime(dateLong);
    }
    if (dateLong == 0) {
      return '';
    }
    else{
      let date = new Date(dateLong);
      return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
    }
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
  getFilters(values: any[], field: string): any[] {
    let res: any[] = [];
    let uniq = _.uniq(values, x => x[field]);
    uniq.forEach(x => {
      res.push({
        label: x[field],
        value: x[field]
      })
    });
    return _.sortBy(res, x => x.label);
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
            this.issueManager.uploadFile(file, this.auth.getUser().login).then(res => {
              this.message += '<img style="cursor: pointer" src="' + res.url + '"/>';
              this.loaded.push(res);
            });
          }
        }
      }
    }
  }
  fillParts(){
    this.issueManager.getIssueProjects().then(projects => {
      let findProject = projects.find(x => x.name == this.project);
      let project = this.project;
      if (findProject != null){
        project = findProject.foran;
      }
      this.s.getHullPatList(project, this.docNumber).then(res => {
        console.log(res);
        if (res != null && res != ''&& res.elements.length > 0){
          this.issue.revision = res.rev;
          this.revEsp = res.rev + ' (' + this.getDateModify(res.date) + ')';
          this.revEspNoDate = res.rev;
          this.revUser = this.auth.getUserName(res.user);
          this.kindEsp = res.kind;
          this.parts = res.elements;
          _.forEach(
            _.groupBy(this.parts, x => x.ELEM_TYPE.replace('FS', 'PL') + '-' + x.THICKNESS + '-' + (x.ELEM_TYPE.replace('FS', 'PL') == 'PL' ? '' : x.WIDTH) + '-' + x.MATERIAL),
            group => {
              let sum = 0;
              group.forEach(x => sum += x.WEIGHT_UNIT);
              this.groupedParts.push(
                {
                  material: group[0].MATERIAL,
                  sumWeight: this.round(sum),
                  thickness: group[0].THICKNESS,
                  width: group[0].WIDTH,
                  type: group[0].ELEM_TYPE.replace('FS', 'PL'),
                }
              )
            }
          );
          this.groupedParts = _.sortBy(this.groupedParts, x => x.type + '-' + this.addLeftZeros(x.thickness.toString()));

          //this.parts.forEach((x: any) => x.NEST_ID = x.NEST_ID.replace('MU', 'U'));
          this.filters.ELEM_TYPE = this.getFilters(this.parts, 'ELEM_TYPE');
          this.filters.MATERIAL = this.getFilters(this.parts, 'MATERIAL');
          this.filters.SYMMETRY = this.getFilters(this.parts, 'SYMMETRY');
          this.noResult = false;
        }
        else{
          this.noResult = true;
        }
        this.fillSketches();
      });
    });
  }
  addLeftZeros(input: string, length = 10){
    let res = input;
    while (res.length < length){
      res = '0' + res;
    }
    return res;
  }
  getParts(){
    return this.parts.filter((x: any) => this.isPartVisible(x));
  }
  isPartVisible(part: any){
    return true;
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
          this.issueManager.uploadFile(file, this.auth.getUser().login).then(res => {
            this.message += '<img style="cursor: pointer" src="' + res.url + '"/>';
            this.loaded.push(res);
          });
        }
      }
    }
  }
  sendMessage() {
    let message = new IssueMessage();
    message.author = this.auth.getUser().login;
    message.content = this.message;
    message.file_attachments = this.loaded;
    message.prefix = 'turkey';
    message.to_be_replied = this.auth.hasPerms('needs-reply') ? 1 : 0;
    // @ts-ignore
    this.issueManager.setIssueMessage(this.issue.id, message).then(res => {
      this.issueManager.getIssueDetails(this.issue.id).then(issue => {
        this.issue = issue;
      });
    });
    this.comment = false;
  }
  openUserInfo(author: string) {
    this.dialogService.open(UserCardComponent, {
      showHeader: false,
      modal: true,
      data: author
    });
  }
  getAuthor(author: string) {
    return this.auth.getUserName(author);
  }

  localeGender(userId: string){
    let find = this.auth.users.find(x => x.login == userId);
    return find != null && find.gender == 'female' && this.l.language == 'ru' ? 'а' : '';
  }
  getMessages(issue: Issue) {
    let res: any[] = [];
    issue.messages.filter(x => x.prefix == 'turkey').forEach(x => res.push(x));
    //issue.history.forEach(x => res.push(x));
    // @ts-ignore
    return _.sortBy(res, x => x.date != null ? x.date : x.update_date).reverse();
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
          this.issueManager.uploadFile(file, this.auth.getUser().login).then(res => {
            this.loaded.push(res);
          });
        }
      }
    }
  }
  isLoaded(file: string) {
    return this.loaded.find(x => x.name == file);
  }
  isDesktop() {
    return this.device.isDesktop() && window.innerWidth > 1296;
  }
  fillSketches(){
    let nesting = this.getRevisionFilesOfGroup('Profile Sketches', this.selectedRevision);
    this.parts.forEach((p: any) => {
      p.SKETCH = 'LOADING ...';
      p.NESTING = 'LOADING ...';
    });
    this.nestContentRead = true;
    _.sortBy(nesting, x => x.upload_date).filter(x => x.name.includes('profiles')).forEach(file => {
      fetch(file.url).then(response => response.text()).then(text => {
        this.nestContent.splice(0, this.nestContent.length);
        text.split(';').filter(x => x.trim() != '').forEach(row => {
          let splitRow = row.split(':');
          this.nestContent.push({
            file: splitRow[0].trim(),
            parts: splitRow[1].trim().split(',')
          });
        });
        this.parts.forEach((part: any) => {
          if (part.PART_CODE != null && part.SYMMETRY != null && part.ELEM_TYPE != 'PL'){
            let search = part.PART_CODE + '-' + part.SYMMETRY;
            let findNest = _.sortBy(this.nestContent.filter((x: any) => x.parts.includes(search)), x => x.date).reverse();
            if (findNest.length > 0){
              part.SKETCH = findNest ? findNest[0].file.replace('.dxf', '').replace('-rev', '_rev') : '';
            }
          }
          else{
            part.SKETCH = '';
          }
          if (part.PART_CODE != null && part.SYMMETRY != null && part.NEST_ID != null && part.NEST_ID != ''){
            if (part.NEST_ID.includes('U0')){
              if (part.NEST_ID[0] == 'a'){
                part.NESTING = 'P-' + this.project + '-' + part.NEST_ID.substr(1, 5) + '-' + part.NEST_ID.substr(6);
              }
              else{
                part.NESTING = 'N-' + this.project + '-' + part.NEST_ID.substr(1, 5) + '-' + part.NEST_ID.substr(6);
              }
            }
            else{
              if (part.NEST_ID[0] == 'a'){
                part.NESTING = 'P-' + this.project + '-' + part.NEST_ID.substr(1, 4) + '-' + part.NEST_ID.substr(5);
              }
              else{
                part.NESTING = 'N-' + this.project + '-' + part.NEST_ID.substr(1, 4) + '-' + part.NEST_ID.substr(5);
              }
            }
          }
          else{
            part.NESTING = '';
          }
        });
        this.parts.forEach((part: any) => {
          if (part.NESTING == 'LOADING ...'){
            part.NESTING = '';
          }
          if (part.SKETCH == 'LOADING ...'){
            part.SKETCH = '';
          }
        });
        this.parts = [...this.parts];
      });
    });
    if (nesting.find(x => x.name.includes('profiles')) == null){
      this.parts.forEach((part: any) => {
        if (part.PART_CODE != null && part.SYMMETRY != null && part.NEST_ID != null && part.NEST_ID != ''){
          if (part.NEST_ID.includes('U0')){
            if (part.NEST_ID[0] == 'a'){
              part.NESTING = 'P-' + this.project + '-' + part.NEST_ID.substr(1, 5) + '-' + part.NEST_ID.substr(6);
            }
            else{
              part.NESTING = 'N-' + this.project + '-' + part.NEST_ID.substr(1, 5) + '-' + part.NEST_ID.substr(6);
            }
          }
          else{
            if (part.NEST_ID[0] == 'a'){
              part.NESTING = 'P-' + this.project + '-' + part.NEST_ID.substr(1, 4) + '-' + part.NEST_ID.substr(5);
            }
            else{
              part.NESTING = 'N-' + this.project + '-' + part.NEST_ID.substr(1, 4) + '-' + part.NEST_ID.substr(5);
            }
          }
        }
        else{
          part.NESTING = '';
        }
      });
      this.parts.forEach((part: any) => {
        if (part.NESTING == 'LOADING ...'){
          part.NESTING = '';
        }
        if (part.SKETCH == 'LOADING ...'){
          part.SKETCH = '';
        }
      });
      this.parts = [...this.parts];
    }
  }
  fillRevisions(){
    this.issueRevisions.splice(0, this.issueRevisions.length);
    this.issueManager.getIssueDetails(this.issueId).then(res => {
      console.log(res);
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
      // this.issueRevisions.push(this.issue.revision);
      // this.issue.revision_files.map(x => x.revision).forEach(gr => {
      //   if (!this.issueRevisions.includes(gr)){
      //     this.issueRevisions.push(gr);
      //   }
      // });
      //this.issueRevisions = _.sortBy(this.issueRevisions, x => x).reverse();
      //this.selectedRevision = this.issueRevisions[0];
      this.fillParts();
    });
  }
  editorClicked(event: any) {

    event.preventDefault();
    event.stopPropagation();
    if (event.target.localName == 'img'){
      this.showImage(event.target.currentSrc);
    }
    else if (event.target.localName == 'a'){
      window.open(event.target.href, '_blank');
    }
  }
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
  round(input: number) {
    return Math.round(input * 100) / 100;
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
  getDateModify(dateLong: number){
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
  }
  getBlockName() {
    if (this.parts.length > 0){
      return this.issue.name;
    }
    else{
      return this.issue.name;
    }
  }
  getDeliveredStatus(status: string, styled = true): any {
    let tr = this.localeStatus(status);
    switch (status){
      case 'Completed': return styled ? '<span style="color: #256029; background-color: #c8e6c9; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">' + tr + '</span>' : tr;
      case 'In Work': return styled ? '<span style="color: #805b36; background-color: #ffd8b2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">' + tr + '</span>' : tr;
      case 'New': return styled ? '<span style="color: #23547b; background-color: #b3e5fc; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">' + tr + '</span>' : tr;
      case 'AssignedTo': return styled ? '<span style="color: #606a33; background-color: #dbe9a0; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">' + tr + '</span>' : tr;
      case 'Rejected': return styled ? '<span style="color: #d78a16; background-color: #feeccd; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">' + tr + '</span>' : tr;
      case 'Check': return styled ? '<span style="color: #694382; background-color: #eccfff; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">' + tr + '</span>' : tr;
      case 'In Rework': return styled ? '<span style="color: #3f6b73; background-color: #cbebf1; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">' + tr + '</span>' : tr;
      case 'Paused': return styled ? '<span style="color: #8a5340; background-color: #feedaf; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">' + tr + '</span>' : tr;
      case 'Archive': return styled ? '<span style="color: #606a26; background-color: #C4E1A8; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">' + tr + '</span>' : tr;
      case 'Not resolved': return styled ? '<span style="color: #d78a16; background-color: #feeccd; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">' + tr + '</span>' : tr;
      case 'Closed': return styled ? '<span style="color: #606a26; background-color: #C4E1A8; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">' + tr + '</span>' : tr;
      case 'Send to Approval': return styled ? '<span style="color: #805b36; background-color: #ffd8b2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">' + tr + '</span>' : tr;
      case 'Approved': return styled ? '<span style="color: #2e604b; background-color: #ceede1; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">' + tr + '</span>' : tr;
      case 'Not approved': return styled ? '<span style="color: #a3392b; background-color: #F5BBB2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">' + tr + '</span>' : tr;
      case 'Ready to send': return styled ? '<span style="color: #4A7863; background-color: #DCEFED; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">' + tr + '</span>' : tr;
      case 'On reApproval': return styled ? '<span style="color: #d78a16; background-color: #feeccd; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">' + tr + '</span>' : tr;
      case 'Ready to Delivery': return styled ? '<span style="color: #393346; background-color: #cbc4d7; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">' + tr + '</span>' : tr;
      case 'Send to Yard Approval': return styled ? '<span style="color: #895169; background-color: #f8c1d5; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">' + tr + '</span>' : tr;
      case 'Delivered': return styled ? '<span style="color: #454955; background-color: #dae4ff; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">' + tr + '</span>' : tr;
      default: return status;
    }
  }
  localeStatus(status: string){
    if (this.l.language == 'ru'){
      switch (status) {
        case 'Completed' : return 'Завершён';
        case 'In Work': return 'В работе';
        default: return status;
      }
    }
    else{
      return status;
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

    //
    // Promise.all(files.map(x => fetch(x.url))).then(blobs => {
    //   let zip = new JSZip();
    //   blobs.forEach(blob => {
    //     // @ts-ignore
    //     let name: string = blob.url.split('/').pop();
    //     while (zipped.includes(name)){
    //       name = name.split('.').reverse().pop() + '$.' + name.split('.').pop();
    //     }
    //     zipped.push(name);
    //     zip.file(name, blob.blob());
    //   });
    //   zip.generateAsync({type:"blob"}).then(res => {
    //     this.waitForZipFiles = false;
    //     saveAs(res, this.issue.doc_number + '-' + new Date().getTime() + '.zip');
    //   });
    // });
  }
  askForSendToCloud(){
    this.dialogService.open(AssignNewRevisionComponent, {
      showHeader: false,
      modal: true,
      data: this.issue
    }).onClose.subscribe(res => {
      this.issueManager.getIssueDetails(this.issue.id).then(issue => {
        this.issue = issue;
        this.fillRevisions();
      });
    });
  }

  showComment() {
    this.comment = true;
    this.message = '';
    this.awaitForLoad = [];
    this.loaded = [];
    setTimeout(() => {
      this.editor.focus();
    })
  }
  onEditorPressed(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'Enter') {
      this.sendMessage();
    }
  }
  editorInit(event: any) {
    this.editor = event;
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
    if (this.issue.cloud_files.length == 0 || fileGroup == 'Other'){
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
  createEsp() {
    this.dialogService.open(HullEspGenerationWaitComponent, {
      showHeader: false,
      modal: true,
      data: [this.issue, this.project]
    }).onClose.subscribe(() => {
      this.fillRevisions();
    });
  }

  getCount(parts: any[], PART_CODE: any) {
    if (this.groupedByPartCode){
      return parts.filter(x => x.PART_CODE == PART_CODE).length;
    }
    else{
      return 1;
    }
  }
  selectPart(part: any){
    this.selectedPart = part;
    if (this.dxfView != null && !this.dxfView.closed){
      this.dxfView.postMessage(this.selectedPart, '*');
    }
    if (this.dxfEnabled){
      let search = this.trimLeftZeros(part.PART_CODE) + (part.SYMMETRY != 'C' ? part.SYMMETRY : '');
      this.router.navigate([], {queryParams: {dxf: null, search: null}, queryParamsHandling: 'merge'}).then(() => {
        this.router.navigate([], {queryParams: {dxf: this.getRevisionFilesOfGroup('Drawings', this.selectedRevision).find(x => x.name.includes('.dxf'))?.url, search}, queryParamsHandling: 'merge'});
      });
    }
  }
  trimLeftZeros(input: string){
    let result = input;
    while (result[0] == '0' && result.length > 0){
      result = result.substr(1);
    }
    return result;
  }
  isDisabledDxf(){
    return this.issue == null || this.issue.revision_files == null || this.getRevisionFilesOfGroup('Drawings', this.selectedRevision).find(x => x.name.includes('.dxf')) == null;
  }
  showDxf(){
    if (this.dxfEnabledForNesting){
      this.dxfEnabledForNesting = false;
    }
    else{
      this.dxfEnabled = !this.dxfEnabled;
    }
    this.router.navigate([], {queryParams: {dxf: null, search: null, searchNesting: null}, queryParamsHandling: 'merge'}).then(() => {
      this.router.navigate([], {queryParams: {dxf: this.getRevisionFilesOfGroup('Drawings', this.selectedRevision).find(x => x.name.includes('.dxf'))?.url}, queryParamsHandling: 'merge'});
    });
  }
  showDxfTablet(){
    if (this.dxfEnabledForNesting){
      this.dxfEnabledForNesting = false;
    }
    else{
      this.dxfEnabled = !this.dxfEnabled;
    }

    if (this.dxfView != null && !this.dxfView.closed){
      this.dxfView.close();
    }
    let url = '/dxf-view?navi=0&window=1&dxf=' + this.getRevisionFilesOfGroup('Drawings', this.selectedRevision).find(x => x.name.includes('.dxf'))?.url + (this.search != '' ? '&search=' + this.search : '') + (this.dxfEnabledForNesting ? '&searchNesting=' + this.selectedPart.PART_CODE : '');
    this.dxfEnabledForNesting = false;
    this.dxfEnabled = false;
    this.dxfView = window.open(url, '_blank', 'height=720,width=1280');
  }
  openDxf() {
    if (this.dxfView != null && !this.dxfView.closed){
      this.dxfView.close();
    }
    let url = '/dxf-view?navi=0&window=1&dxf=' + this.dxfDoc + (this.search != '' ? '&search=' + this.search : '') + (this.dxfEnabledForNesting ? '&searchNesting=' + this.selectedPart.PART_CODE : '');
    this.dxfEnabledForNesting = false;
    this.dxfEnabled = false;
    this.dxfView = window.open(url, '_blank', 'height=720,width=1280');
  }
  exitDxf(){
    this.dxfEnabled = false;
    this.cutEnabled = false;
    this.dxfEnabledForNesting = false;
  }
  exitDxfTablet(){
    this.dxfEnabled = false;
    this.dxfEnabledForNesting = false;
  }

  isDisabledNest(part: any) {
    let nesting = part.NESTING != null && part.NESTING[0] == 'N' ? this.getRevisionFilesOfGroup('Nesting Plates', this.selectedRevision) : (this.getRevisionFilesOfGroup('Nesting Profiles', this.selectedRevision));
    let searchDxf = nesting.find(x => x.name.includes(part.NESTING) && part.NESTING != '');
    // if (searchDxf == null){
    //   searchDxf = nesting.find(x => {
    //     let xNesting = this.replaceAll(this.replaceAll(this.replaceAll(x.name, '_0_', '-'), '_', '-'), '.dxf', '');
    //     console.log(xNesting);
    //     return part.NESTING.includes(xNesting) && part.NESTING != '';
    //   })
    // }
    return searchDxf == null;
  }
  replaceAll(input: string, r1: string, r2: string){
    let res = input;
    while (res.includes(r1)){
      res = res.replace(r1, r2)
    }
    return res;
  }
  isDisabledNestTemplate(part: any) {
    let nesting = this.getRevisionFilesOfGroup('Profile Sketches', this.selectedRevision);
    let searchDxf = nesting.find(x => x.name.includes(part.SKETCH) && part.SKETCH != '');
    return searchDxf == null;
  }

  showNesting(part: any) {
    this.selectedPart = part;
    this.dxfEnabledForNesting = true;
    let nesting = part.NESTING[0] == 'N' ? this.getRevisionFilesOfGroup('Nesting Plates', this.selectedRevision) : (this.getRevisionFilesOfGroup('Nesting Profiles', this.selectedRevision));
    let searchDxf = nesting.find(x => x.name.includes(part.NESTING));
    if (searchDxf != null){
      if (!this.dxfEnabled){
        this.dxfEnabled = !this.dxfEnabled;
      }
      this.router.navigate([], {queryParams: {dxf: null, search: null, searchNesting: null}, queryParamsHandling: 'merge'}).then(() => {
        // @ts-ignore
        this.router.navigate([], {queryParams: {dxf: searchDxf.url, search: null, searchNesting: part.PART_CODE + part.SYMMETRY}, queryParamsHandling: 'merge'});
      });

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


  showNestingTablet(part: any) {
    this.selectedPart = part;
    this.dxfEnabledForNesting = true;
    let search = '';
    if (part.NEST_ID != null){
      if (part.NEST_ID[0] == 'a'){
        search = this.project + '_' + part.NEST_ID.substr(1, 4) + '_' + part.NEST_ID.substr(5, 4);
      }
      else{
        search = this.project + '_' + part.NEST_ID.substr(1, 4) + '_0_' + part.NEST_ID.substr(5, 4);
      }
    }

    let nesting = this.getRevisionFilesOfGroup('Nesting Plates', this.selectedRevision).concat(this.getRevisionFilesOfGroup('Nesting Profiles', this.selectedRevision));
    let searchDxf = nesting.find(x => x.name.includes(search));
    if (searchDxf != null){
      if (this.dxfView != null && !this.dxfView.closed){
        this.dxfView.close();
      }
      let url = '/dxf-view?navi=0&window=1&dxf=' + searchDxf.url + (this.search != '' ? '&search=' + this.search : '') + (this.dxfEnabledForNesting ? '&searchNesting=' + this.selectedPart.PART_CODE : '');
      this.dxfEnabledForNesting = false;
      this.dxfEnabled = false;
      this.dxfView = window.open(url, '_blank', 'height=720,width=1280');
    }

  }
  showNestingTemplate(part: any) {
    this.selectedPart = part;
    this.dxfEnabledForNesting = true;
    let nesting = this.getRevisionFilesOfGroup('Profile Sketches', this.selectedRevision);
    let searchDxf = nesting.find(x => x.name.includes(part.SKETCH));
    if (searchDxf != null){
      if (!this.dxfEnabled){
        this.dxfEnabled = !this.dxfEnabled;
      }
      this.router.navigate([], {queryParams: {dxf: null, search: null, searchNesting: null}, queryParamsHandling: 'merge'}).then(() => {
        // @ts-ignore
        this.router.navigate([], {queryParams: {dxf: searchDxf.url, search: null, searchNesting: part.PART_CODE + '-' + part.SYMMETRY}, queryParamsHandling: 'merge'});
      });
    }
  }

  showNestingTabletTemplate(part: any) {
    this.selectedPart = part;
    this.dxfEnabledForNesting = true;
    let search = '';
    search = part.PART_CODE + '-' + part.SYMMETRY;
    if (search != ''){
      let nesting = this.getRevisionFilesOfGroup('Profile Sketches', this.selectedRevision);
      if (!this.nestContentRead){
        this.nestContentRead = true;
        nesting.filter(x => x.name.includes('profiles')).forEach(file => {
          fetch(file.url).then(response => response.text()).then(text => {
            text.split(';').filter(x => x.trim() != '').forEach(row => {
              let splitRow = row.split(':');
              this.nestContent.push({
                file: splitRow[0].trim(),
                parts: splitRow[1].trim().split(',')
              });
            });
          });
        });
      }
      let find = this.nestContent.find(x => x.parts.includes(search));
      if (find != null){
        let searchDxf = nesting.find(x => x.name == find.file);
        if (searchDxf != null){
          if (this.dxfView != null && !this.dxfView.closed){
            this.dxfView.close();
          }
          let url = '/dxf-view?navi=0&window=1&dxf=' + searchDxf.url + (this.search != '' ? '&search=' + this.search : '') + (this.dxfEnabledForNesting ? '&searchNesting=' + this.selectedPart.PART_CODE : '');
          this.dxfEnabledForNesting = false;
          this.dxfEnabled = false;
          this.dxfView = window.open(url, '_blank', 'height=720,width=1280');
        }
      }
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

  exportSketches() {
    let fileName = 'export_' + this.generateId(8) + '.xlsx';
    let data: any[] = [];
    this.parts.filter((x: any) => x.SKETCH != null && x.SKETCH != '').forEach((part: any) => {
      data.push({
        PART_CODE: part.PART_CODE,
        PART_TYPE: part.PART_TYPE,
        THICKNESS: part.ELEM_TYPE == 'PL' ? part.THICKNESS : part.WIDTH + 'x' + part.THICKNESS,
        MATERIAL: part.MATERIAL,
        SYMMETRY: part.SYMMETRY,
        WEIGHT: this.round(part.WEIGHT_UNIT),
        NEST_ID: part.NEST_ID,
        SKETCH: part.SKETCH
      });
    });
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = {Sheets: {'data': worksheet}, SheetNames: ['data']};
    XLSX.writeFile(workbook, fileName);
  }

  viewRevisionChanged() {
    this.fillSketches();
  }

  getArchive() {
    return _.sortBy(this.issue.archive_revision_files, x => x.removed_date).reverse();
  }
  showCuttingFile(file: FileAttachment) {
    console.log(file);
    this.cmap = file.url;
    this.dxfEnabled = false;
    this.cutEnabled = false;
    this.router.navigate([], {queryParams: {cmap: null, cmapuser: null, cmapdate: null}, queryParamsHandling: 'merge'}).then(() => {
      setTimeout(() => {
        this.cutEnabled = true;
        console.log(this.cutEnabled);
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

  openCMAP() {
    if (this.cmapView != null && !this.cmapView.closed){
      this.cmapView.close();
    }
    let url = '/gcode?navi=0&window=1&cmap=' + this.cmap + '&cmapuser=' + this.cmapuser + '&cmapdate=' + this.cmapdate;
    this.dxfEnabledForNesting = false;
    this.dxfEnabled = false;
    this.dxfView = window.open(url, '_blank', 'height=720,width=1280');
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

  newImportantMessage() {
    let res = 0;
    let completed = false;
    _.sortBy(this.getMessages(this.issue), x => x.date).reverse().forEach(msg => {
      if (msg.to_be_replied == 1 && msg.author != this.auth.getUser().login && !completed){
        res += 1;
      }
      else{
        completed = true;
      }
    });
    return res;
  }

  openIssue(id: number) {
    window.open('/?taskId=' + id, '_blank');
  }
  getIssuesOfType(child_issues: Issue[], issue_type: string) {
    return child_issues.filter(x => x.issue_type == issue_type);
  }
  contentClick(content: string): void{
    this.collapsed.includes(content) ? this.collapsed.splice(this.collapsed.indexOf(content), 1) : this.collapsed.push(content);
  }
  mw(value: number){
    return {
      'min-width': value + '%'
    }
  }

  setFileSort(value: string) {
    this.fileSort = value;
    this.sortReverse = !this.sortReverse;
  }

  openCloud() {
    this.cloudLoading = true;
    this.issueManager.createCloudPath(this.issue.id).then(res => {
      this.cloudLoading = false;
      console.log(res);
      if (!res.includes('ERROR')){
        window.open(res);
      }
    });
  }

  showHelp() {
    window.open('/assets/help/hull-help.mp4', '_blank');
  }

  refreshEsp() {
    this.dialogService.open(GenerateEspComponent, {
      showHeader: false,
      modal: true,
      data: [this.issue, this.project, this.kindEsp, this.revEspNoDate]
    }).onClose.subscribe(() => {
      this.fillRevisions();
    });
  }
}
