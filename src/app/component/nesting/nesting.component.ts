import {ApplicationRef, Component, OnInit, ViewChild} from '@angular/core';
import {Issue} from "../../domain/classes/issue";
import {FileAttachment} from "../../domain/classes/file-attachment";
import {DeviceDetectorService} from "ngx-device-detector";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {ActivatedRoute, Router} from "@angular/router";
import {SpecManagerService} from "../../domain/spec-manager.service";
import {LanguageService} from "../../domain/language.service";
import {IssueManagerService} from "../../domain/issue-manager.service";
import {DialogService} from "primeng/dynamicdialog";
import _ from "underscore";
import {UserCardComponent} from "../employees/user-card/user-card.component";
import {mouseWheelZoom} from "mouse-wheel-zoom";
import JSZip from "jszip";
import {saveAs} from "file-saver";
import * as XLSX from "xlsx";
import {VacantWastageComponent} from "./vacant-wastage/vacant-wastage.component";

@Component({
  selector: 'app-nesting',
  templateUrl: './nesting.component.html',
  styleUrls: ['./nesting.component.css']
})
export class NestingComponent implements OnInit {
  parts: any = [];
  nestingPlates: any = [];
  nestingSource: any = [];
  noResult = false;
  docNumber = '';
  project = '';
  department = '';
  selectedRevision = 'PROD';
  messageFilter = 'all';
  comment = false;
  issueId = 0;
  selectedNest = Object();
  awaitForLoad: string[] = [];
  loaded: FileAttachment[] = [];
  message = '';
  showImages = false;
  // @ts-ignore
  @ViewChild('table') dt: Table;
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
  cmapView: Window | null = null;
  dxfDoc: string = '';
  search: string = '';
  searchNesting: string = '';
  selectedHeadTab: string = 'Files';
  nestContent: any[] = [];
  nestContentRead = false;
  nestingFiles: any[] = [];
  issueRevisions: string[] = [];
  tooltips: string[] = [];
  filters:  { BLOCKS: any[], MATERIAL: any[]  } = { BLOCKS: [],  MATERIAL: [] };
  blocks: any[] = [];
  materials: any[] = [];
  materialsRoot: any[] = [];
  materialsRest: any[] = [];
  nestingProfiles: any[] = [];
  nestingProfilesSrc: any[] = [];
  loading = false;
  loadingMaterials = false;
  loadingNestProfiles = false;
  loadingBlocks = false;
  currentView = 'tile';
  cmap = '';
  cmapuser = '';
  cmapdate = 0;
  projects: string[] = ['N002', 'N004'];
  selectedAllBlocks = false;
  selectedAllMaterialsRoot = false;
  selectedAllMaterialsRest = false;
  previewClick: string = '';
  selectedTitle = 'Plates';
  docs: FileAttachment[] = [];
  onLoad = true;

  constructor(public device: DeviceDetectorService, public auth: AuthManagerService, private route: ActivatedRoute, private router: Router, private s: SpecManagerService, public l: LanguageService, public issueManager: IssueManagerService, private dialogService: DialogService, private appRef: ApplicationRef) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.project = params.foranProject != null ? params.foranProject : 'N004';
      //this.projects = this.projects.filter(x => this.auth.getUser().visible_projects.includes(x));
      if (!this.projects.includes(this.project)){
        this.project = this.projects[0];
      }
      this.dxfDoc = params.dxf != null ? params.dxf : '';
      this.cmap = params.cmap != null ? params.cmap : this.cmap;
      this.cmapuser = params.cmapuser != null ? params.cmapuser : '';
      this.cmapdate = params.cmapdate != null ? +params.cmapdate : 0;


      if (this.onLoad){
        this.loadingBlocks = true;
        this.loadingMaterials = true;
        this.issueManager.getProjectNames().then(projectNames => {
          let findProject = projectNames.find((x: any) => x.foran == this.project);
          if (findProject != null){
            this.issueManager.getCloudFiles(findProject.cloudRkd + '/').then(docs => {
              // console.log(findProject.cloudRkd);
              // console.log(docs);
              this.docs = docs;
              this.issueManager.getNestingFiles().then(files => {
                this.nestingFiles = files;
                this.s.getHullNestingByProjectPlates(this.project).then(res => {
                  this.nestingSource = res;
                  this.s.getHullNestingByProjectProfiles(this.project).then(resProfiles => {
                    console.log(resProfiles);
                    this.nestingProfilesSrc = resProfiles;
                  });
                  this.nestingSource.forEach((nest: any) => {
                    nest.MATERIAL = this.getNestingMaterial(nest);
                    nest.FILE = 'N-' + this.project + '-' + nest.NESTID.substr(1, 4) + '-' + nest.NESTID.substr(5);
                    nest.CMAP = 'C-' + this.project + '-' + nest.NESTID.substr(1, 4) + '-' + nest.NESTID.substr(5);
                    if (nest.NESTID.includes('U0')){
                      nest.FILE = 'N-' + this.project + '-' + nest.NESTID.substr(1, 5) + '-' + nest.NESTID.substr(6);
                      nest.CMAP = 'C-' + this.project + '-' + nest.NESTID.substr(1, 5) + '-' + nest.NESTID.substr(6);
                    }
                    nest.doughnut = [
                      {
                        name: "Usage",
                        value: nest.USAGE
                      },
                      {
                        name: "Left",
                        value: (100 - nest.USAGE)
                      }
                    ];
                    nest.stacked = [
                      {
                        name: '',
                        series: [
                          {
                            name: "Usage",
                            value: nest.USAGE
                          },
                          {
                            name: "Left",
                            value: (100 - nest.USAGE)
                          }
                        ]
                      }
                    ];
                    nest.LOCKED = false;
                  });
                  this.nestingSource = this.nestingSource.filter((x: any) => !this.isDisabledNestTemplate(x) && !this.isDisabledCuttingMap(x));

                  if (this.blocks.length == 0){
                    let blocks: string[] = [];
                    this.blocks.splice(0, this.blocks.length);
                    this.nestingSource.forEach((n: any) => {
                      if (!blocks.includes(n.BLOCKS)){
                        blocks.push(n.BLOCKS);
                      }
                    });
                    _.sortBy(blocks, x => x).forEach(block => {
                      this.blocks.push({
                        name: block,
                        selected: false
                      });
                    });
                  }



                  this.loadingBlocks = false;
                  this.loadingMaterials = false;

                  this.fetchNesting();
                  this.initMaterials();

                });
              });


            });
          }
        });
        this.onLoad = false;
      }
    });
  }
  getNestingMaterial(n: any){
    return [n.MAT, n.THICKNESS, n.LENGTH, n.WIDTH].join('x');
  }
  materialsEquals(n1: any, n2: any){
    return this.getNestingMaterial(n1) == this.getNestingMaterial(n2) && n1.PARENTNESTID == n2.PARENTNESTID;
  }
  projectChanged() {
    this.onLoad = true;
    this.blocks.splice(0, this.blocks.length);
    this.materials.splice(0, this.materials.length);
    this.nestingPlates.splice(0, this.nestingPlates.length);
    this.router.navigate([], {queryParams: {foranProject: this.project}});
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
    if (dateLong == 0) {
      return '';
    }
    else{
      let date = new Date(dateLong);
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
    issue.messages.forEach(x => res.push(x));
    issue.history.forEach(x => res.push(x));
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
  round(input: number, digit = 100) {
    return Math.round(input * digit) / digit;
  }
  openFile(url: string) {
    window.open(url);
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
    if (dateLong == 0){
      return '--/--/----';
    }
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
  }

  getDeliveredStatus(status: string, styled = true): any {
    let tr = this.localeStatus(status);
    switch (status){
      case 'Completed': return styled ? '<span style="color: #256029; background-color: #c8e6c9; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">' + tr + '</span>' : tr;
      case 'In Work': return styled ? '<span style="color: #805b36; background-color: #ffd8b2; border-radius: 2px; padding: 2px 4px; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: .3px;">' + tr + '</span>' : tr;
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


  downloadFiles() {
    this.waitForZipFiles = true;

    let files: any[] = [];
    this.nestingPlates.filter((x: any) => x != null).forEach((nest: any) => {
      let find = this.nestingFiles.find(x => x.name.includes(nest.FILE));
      if (find == null){
        find = this.docs.find(x => x.name.includes(nest.FILE));
      }
      if (find != null){
        files.push(find);
      }
    });

    let zipped: string[] = [];
    let zip = new JSZip();


    let cmap: any[] = [];



    this.nestingPlates.filter((x: any) => x != null).forEach((nest: any) => {
      let searchCMAP = this.nestingFiles.find(x => x.name.includes(nest.CMAP));
      if (searchCMAP != null){
        this.cmap = searchCMAP.url;
        this.cmapuser = searchCMAP.author;
        this.cmapdate = searchCMAP.upload_date;
        cmap.push({url: this.cmap, user: this.cmapuser, date: this.cmapdate, name: nest.CMAP + '.MPG'});
      }
    });

    Promise.all(cmap.map(x => fetch(x.url))).then(blobs => {
      Promise.all(blobs.map(x => x.text())).then(texts => {
        Promise.all(texts.map(text => this.s.createCNC(text.split('\n'), this.cmapuser + ' at ' + new Date(this.cmapdate).toDateString()))).then(blobTexts => {
          blobTexts.forEach(blobText => {
            let index = blobTexts.indexOf(blobText);
            zip.file(cmap[index].name, new Blob([blobText.join('\n')], {type: 'text/plain'}));
          });
          Promise.all(files.map(x => fetch(x.url))).then(blobs => {
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
              saveAs(res, 'export' + '-' + new Date().getTime() + '.zip');
            });
          });

        });
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
  editorInit(event: any) {
    this.editor = event;
  }

  getRevisionFilesOfGroup(fileGroup: string, revision: string): FileAttachment[] {
    return [];
  }
  getCount(parts: any[], PART_CODE: any) {
    if (this.groupedByPartCode){
      return parts.filter(x => x.PART_CODE == PART_CODE).length;
    }
    else{
      return 1;
    }
  }
  selectNest(part: any){
    this.selectedNest = part;
    if (this.dxfView != null && !this.dxfView.closed){
      this.dxfView.postMessage(this.selectedNest, '*');
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
    return this.getRevisionFilesOfGroup('Drawings', this.selectedRevision).find(x => x.name.includes('.dxf')) == null;
  }
  showDxf(){
    if (this.dxfEnabledForNesting){
      this.dxfEnabledForNesting = false;
    }
    else{
      this.dxfEnabled = !this.dxfEnabled;
      let viewport = document.getElementsByTagName('cdk-virtual-scroll-viewport').item(0);
      // @ts-ignore
      viewport.style.height = this.dxfEnabled ? '20vh' : '70vh';
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
    let url = '/dxf-view?navi=0&window=1&dxf=' + this.getRevisionFilesOfGroup('Drawings', this.selectedRevision).find(x => x.name.includes('.dxf'))?.url + (this.search != '' ? '&search=' + this.search : '') + (this.dxfEnabledForNesting ? '&searchNesting=' + this.selectedNest.PART_CODE : '');
    this.dxfEnabledForNesting = false;
    this.dxfEnabled = false;
    this.dxfView = window.open(url, '_blank', 'height=720,width=1280');
  }
  openDxf() {
    if (this.dxfView != null && !this.dxfView.closed){
      this.dxfView.close();
    }
    let url = '/dxf-view?navi=0&window=1&dxf=' + this.dxfDoc;
    this.dxfEnabledForNesting = false;
    this.dxfEnabled = false;
    this.dxfView = window.open(url, '_blank', 'height=720,width=1280');
  }
  exitDxf(){
    this.dxfEnabled = false;
    this.cutEnabled = false;
  }
  exitDxfTablet(){
    this.dxfEnabled = false;
    this.dxfEnabledForNesting = false;
    let viewport = document.getElementsByTagName('cdk-virtual-scroll-viewport').item(0);
    // @ts-ignore
    viewport.style.height = '360px';
  }

  isDisabledNest(part: any) {
    let nesting = part.NESTING != null && part.NESTING[0] == 'N' ? this.getRevisionFilesOfGroup('Nesting Plates', this.selectedRevision) : (this.getRevisionFilesOfGroup('Nesting Profiles', this.selectedRevision));
    let searchDxf = nesting.find(x => x.name.includes(part.NESTING));
    return searchDxf == null;
  }
  isDisabledNestTemplate(nest: any) {
    let searchDxf = this.nestingFiles.find(x => x.name.includes(nest.FILE));
    if (searchDxf == null){
      searchDxf = this.docs.find(x => x.name.includes(nest.FILE));
    }
    return searchDxf == null;
  }
  isDisabledCuttingMap(nest: any) {
    let searchDxf = this.nestingFiles.find(x => x.name.includes(nest.CMAP));
    if (searchDxf == null){
      searchDxf = this.docs.find(x => x.name.includes(nest.CMAP));
    }
    return searchDxf == null;
  }
  showNesting(part: any) {
    this.selectedNest = part;
    this.dxfEnabledForNesting = true;
    let nesting = part.NESTING[0] == 'N' ? this.getRevisionFilesOfGroup('Nesting Plates', this.selectedRevision) : (this.getRevisionFilesOfGroup('Nesting Profiles', this.selectedRevision));
    let searchDxf = nesting.find(x => x.name.includes(part.NESTING));
    if (searchDxf != null){
      if (!this.dxfEnabled){
        this.dxfEnabled = !this.dxfEnabled;
        let viewport = document.getElementsByTagName('cdk-virtual-scroll-viewport').item(0);
        // @ts-ignore
        viewport.style.height = this.dxfEnabled ? '20vh' : '70vh';
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
      let viewport = document.getElementsByTagName('cdk-virtual-scroll-viewport').item(0);
      // @ts-ignore
      viewport.style.height = this.dxfEnabled ? '20vh' : '70vh';
    }
    this.router.navigate([], {queryParams: {dxf: null, search: null, searchNesting: null}, queryParamsHandling: 'merge'}).then(() => {
      // @ts-ignore
      this.router.navigate([], {queryParams: {dxf: url, search: null, searchNesting: null}, queryParamsHandling: 'merge'});
    });
  }


  showNestingTablet(part: any) {
    this.selectedNest = part;
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
      let url = '/dxf-view?navi=0&window=1&dxf=' + searchDxf.url + (this.search != '' ? '&search=' + this.search : '') + (this.dxfEnabledForNesting ? '&searchNesting=' + this.selectedNest.PART_CODE : '');
      this.dxfEnabledForNesting = false;
      this.dxfEnabled = false;
      this.dxfView = window.open(url, '_blank', 'height=720,width=1280');
    }

  }
  showNestingTemplate(nest: any, index: string) {
    if (this.previewClick == index){
      this.dxfEnabled = false;
      this.cutEnabled = false;
      this.previewClick = '';
      return;
    }
    this.previewClick = index;
    let searchDxf = this.nestingFiles.find(x => x.name.includes(nest.FILE));
    if (searchDxf == null){
      searchDxf = this.docs.find(x => x.name.includes(nest.FILE));
    }
    if (searchDxf != null){
      if (!this.dxfEnabled){
        this.dxfEnabled = !this.dxfEnabled;
      }
      this.cutEnabled = false;
      this.router.navigate([], {queryParams: {dxf: null, search: null, searchNesting: null}, queryParamsHandling: 'merge'}).then(() => {
        // @ts-ignore
        this.router.navigate([], {queryParams: {dxf: searchDxf.url, search: null, searchNesting: null}, queryParamsHandling: 'merge'});
      });
    }
  }
  showNestingTabletTemplate(part: any) {
    this.selectedNest = part;
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
          let url = '/dxf-view?navi=0&window=1&dxf=' + searchDxf.url + (this.search != '' ? '&search=' + this.search : '') + (this.dxfEnabledForNesting ? '&searchNesting=' + this.selectedNest.PART_CODE : '');
          this.dxfEnabledForNesting = false;
          this.dxfEnabled = false;
          this.dxfView = window.open(url, '_blank', 'height=720,width=1280');
        }
      }
    }
  }
  exportXls() {
    let fileName = 'export_' + this.generateId(8) + '.xlsx';
    if (this.selectedTitle == 'Plates'){
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.nestingPlates.filter((x: any) => x != null));
      const workbook: XLSX.WorkBook = {Sheets: {'data': worksheet}, SheetNames: ['data']};
      XLSX.writeFile(workbook, fileName);
    }
    else{
      let blocks: string[] = [];
      this.blocks.filter(x => x.selected).forEach(block => {
        block.name.split(';').forEach((x: any) => blocks.push(x));
      });
      let profiles: any[] = [];
      this.nestingProfilesSrc.forEach(profile => {
        if (blocks.includes(profile.BLOCK)){
          profiles.push(profile);
        }
      });
      profiles.forEach(profile => profile.name = this.profileName(profile));
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(profiles);
      const workbook: XLSX.WorkBook = {Sheets: {'data': worksheet}, SheetNames: ['data']};
      XLSX.writeFile(workbook, fileName);
    }
  }

  downloadNestingFile(nest: any) {
    let searchDxf = this.nestingFiles.find(x => x.name.includes(nest.FILE));
    if (searchDxf == null){
      searchDxf = this.docs.find(x => x.name.includes(nest.FILE));
    }
    if (searchDxf != null){
      window.open(searchDxf.url);
    }
  }

  searchChanged() {
    if (this.search.trim() == ''){
      this.nestingPlates = this.nestingSource;
    }
    else{
      this.nestingPlates = this.nestingSource.filter((x: any) => {
        return x == null || (x.NESTID + x.BLOCKS + x.THICKNESS + x.LENGTH + x.WIDTH + x.MATERIAL + x.PARTSWEIGHT + x.NUMEQNEST + x.FILE + x.USAGE).trim().toLowerCase().includes(this.search.trim().toLowerCase())
      });
    }
  }
  showTooltip(index: string) {
    return this.tooltips.includes(index);
  }

  openTooltip(index: string) {
    this.tooltips.push(index);
    // setTimeout(() => {
    //   this.tooltips.splice(this.tooltips.indexOf(index), 1);
    // }, 1500);
  }
  closeToolTip(index: string){
    this.tooltips.splice(this.tooltips.indexOf(index), 1);
  }

  initMaterials(){
    this.nestingSource.forEach((n: any) => {
      if (this.materials.find(x => x.name == n.MATERIAL && x.parent == n.PARENTNESTID) == null){
        this.materials.push({
          name: this.getNestingMaterial(n),
          selected: false,
          parent: n.PARENTNESTID,
          nestid: n.NESTID,
          count: this.nestingSource.filter((x: any) => x.MATERIAL == n.MATERIAL && x.PARENTNESTID == n.PARENTNESTID).length
        });
      }
    });
    this.materialsRoot = this.materials.filter(x => x.parent == '');
    this.materialsRest = this.materials.filter(x => x.parent != '');
    this.materialsRoot = [];
    this.materialsRest = [];
  }
  selectBlock(block: any = null) {
    if (block != null){
      block.selected = !block.selected;
    }
    this.selectedAllBlocks = this.blocks.find(x => !x.selected) == null;

    let allSelected = this.blocks.find(x => x.selected) == null;
    allSelected = false;
    let selectedNesting = this.nestingSource.filter((x: any) => allSelected || this.blocks.filter(x => x.selected).map(x => x.name).includes(x.BLOCKS));

    let selectedMaterialsRoot = [...this.materialsRoot];
    let selectedMaterialsRest = [...this.materialsRest];



    this.materials.splice(0, this.materials.length);
    selectedNesting.forEach((n: any) => {
      if (this.materials.find(x => x.name == n.MATERIAL && x.parent == n.PARENTNESTID) == null){
        this.materials.push({
          name: this.getNestingMaterial(n),
          selected: false,
          parent: n.PARENTNESTID,
          block: n.BLOCKS,
          nestid: n.NESTID,
          count: selectedNesting.filter((x: any) => x.MATERIAL == n.MATERIAL && x.PARENTNESTID == n.PARENTNESTID).length
        });
      }
    });


    this.materialsRoot = this.materials.filter(x => x.parent == '');
    this.materialsRest = this.materials.filter(x => x.parent != '');


    this.materialsRoot.forEach(x => {
      let root = selectedMaterialsRoot.find(y => y.name == x.name);
      if (root != null){
        x.selected = root.selected;
      }
    });

    this.materialsRest.forEach(x => {
      let rest = selectedMaterialsRest.find(y => y.name == x.name);
      if (rest != null){
        x.selected = rest.selected;
      }
    });

    // if (allSelected){
    //   this.materials.forEach((x: any) => x.selected = false);
    // }

    this.fetchNesting();
    this.fillNestingProfiles();
    //this.nesting.splice(0, this.nesting.length);
  }

  fetchMaterials(selected = false) {
    this.loadingMaterials = true;
    this.materials.splice(0, this.materials.length);
    this.s.getHullNestingMaterials(this.project, JSON.stringify(this.blocks.filter(x => x.selected).map(x => x.name))).then(res => {
      console.log(res);
      this.loadingMaterials = false;
      res.forEach((material: any) => {
        this.materials.push({
          name: material.MATERIAL + 'x' + material.THICKNESS + 'x' + material.NEST_LENGTH + 'x' + material.NEST_WIDTH,
          selected: selected,
          value: material,
          parent: material.PARENTID
        });
      });
      //this.selectedAllMaterialsRest = false;
      //this.selectedAllMaterialsRoot = false;
      this.materialsRoot = this.materials.filter(x => x.parent == '');
      this.materialsRest = this.materials.filter(x => x.parent != '');
    });
  }

  fetchNesting() {
    this.nestingPlates = this.nestingSource.filter((x: any) => !this.isDisabledNestTemplate(x) && !this.isDisabledCuttingMap(x) && this.isContainsBlocks(x.BLOCKS) && this.isSelectedMaterial(x));
    for (let x = 0; x < 10; x++){
      this.nestingPlates.push(null);
    }
    this.nestingPlates = [...this.nestingPlates];
    console.log(this.nestingPlates)
  }
  isSelectedMaterial(n: any){
    if (this.materialsRoot.find(x => x.selected) == null && this.materialsRest.find(x => x.selected) == null){
      return true;
    }
    else{
      let materials: any[] = [];
      this.materialsRoot.filter(x => x.selected).forEach(x => materials.push(x));
      this.materialsRest.filter(x => x.selected).forEach(x => materials.push(x));
      return materials.find(x => x.name == n.MATERIAL && x.parent == n.PARENTNESTID) != null;
    }
  }

  openTile() {

  }

  isContainsBlocks(blocks: string){
    let result = false;
    if (this.blocks.filter(x => x.selected).map(x => x.name).includes(blocks)){
      result = true;
    }
    return result;
  }
  isContainsBlocksAux(blocks: string){
    let result = false;
    if (this.blocks.find(x => x.selected) == null){
      result = true;
    }
    else{
      if (this.blocks.filter(x => x.selected).map(x => x.name).includes(blocks)){
        result = true;
      }
    }
    return result;
  }
  selectMaterial(material: any) {
    material.selected = !material.selected;

    this.selectedAllMaterialsRoot = this.materialsRoot.find(x => !x.selected) == null;
    this.selectedAllMaterialsRest = this.materialsRest.find(x => !x.selected) == null;

    this.fetchNesting();
  }

  showCuttingFile(nest: any, index: string) {
    if (this.previewClick == index){
      this.dxfEnabled = false;
      this.cutEnabled = false;
      this.previewClick = '';
      return;
    }
    this.previewClick = index;
    let searchCMAP = this.nestingFiles.find(x => x.name.includes(nest.CMAP));
    if (searchCMAP == null){
      searchCMAP = this.docs.find(x => x.name.includes(nest.CMAP));
    }
    console.log(searchCMAP);
    if (searchCMAP != null){
      this.dxfEnabled = false;
      this.cutEnabled = false;
      this.router.navigate([], {queryParams: {cmap: null, cmapuser: null, cmapdate: null}, queryParamsHandling: 'merge'}).then(() => {
        setTimeout(() => {
          this.cutEnabled = true;
          // @ts-ignore
          this.router.navigate([], {queryParams: {cmap: searchCMAP.url, cmapuser: this.auth.getUserName(searchCMAP.author), cmapdate: searchCMAP.upload_date}, queryParamsHandling: 'merge'});
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
  }

  downloadOpenedCMAP() {
    if (this.cmap != ''){
      fetch(this.cmap).then(res => {
        res.text().then(text => {
          this.s.createCNC(text.split('\n'), this.cmapuser + ' at ' + new Date(this.cmapdate).toDateString()).then(res => {

            var element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(res.join('\n')));
            // @ts-ignore
            element.setAttribute('download', this.cmap.split('/').pop().replace('.txt', '.MPG'));

            element.style.display = 'none';
            document.body.appendChild(element);

            element.click();

            document.body.removeChild(element);
          });
        });
      });
    }
  }

  downloadCuttingFile(nest: any, cmapFormat = 'cnc') {
    let searchCMAP = this.nestingFiles.find(x => x.name.includes(nest.CMAP));
    if (searchCMAP == null){
      searchCMAP = this.docs.find(x => x.name.includes(nest.CMAP));
    }
    if (searchCMAP != null){
      this.cmap = searchCMAP.url;
      this.cmapuser = searchCMAP.author;
      this.cmapdate = searchCMAP.upload_date;
      fetch(this.cmap).then(res => {
        res.text().then(text => {
          if (this.cmap != ''){
            fetch(this.cmap).then(res => {
              res.text().then(text => {
                if (cmapFormat == 'tap'){
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
                else if (cmapFormat == 'essi'){
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
                else{
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
              });
            });
          }
          // this.s.createCNC(text.split('\n'), this.cmapuser + ' at ' + new Date(this.cmapdate).toDateString()).then(res => {
          //
          //   var element = document.createElement('a');
          //   element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(res.join('\n')));
          //   // @ts-ignore
          //   element.setAttribute('download', this.cmap.split('/').pop().replace('.txt', '.MPG'));
          //
          //   element.style.display = 'none';
          //   document.body.appendChild(element);
          //
          //   element.click();
          //
          //   document.body.removeChild(element);
          // });
        });
      });
    }
  }

  downloadOpenedDxf() {
    window.open(this.dxfDoc);
  }

  openCMAP() {
    if (this.cmapView != null && !this.cmapView.closed){
      this.cmapView.close();
    }
    let path = '';
    let rPath = new RegExp('(?<=path=).+');
    if (rPath.test(this.cmap)){
      // @ts-ignore
      path = rPath.exec(this.cmap)[0];
      // @ts-ignore
      this.cmap = new RegExp('.+(?=\\?)').exec(this.cmap)[0];
    }
    let url = '/gcode?navi=0&window=1&cmap=' + this.cmap + '&path=' + path + '&cmapuser=' + this.cmapuser + '&cmapdate=' + this.cmapdate;
    this.dxfEnabledForNesting = false;
    this.dxfEnabled = false;
    console.log(url);
    this.dxfView = window.open(url, '_blank', 'height=720,width=1280');
  }
  isDesktop() {
    return this.device.isDesktop() && window.innerWidth > 1296;
  }

  getWidth(number: number) {
    return {
      width: number + '%'
    };
  }

  insertLock(nest: any) {
    this.s.insertNestLock(this.project, nest.NESTID, this.auth.getUser().login).then(() => {
      nest.isLock = !nest.isLock;
      nest.lockInfo.user = this.auth.getUser().login;
      nest.lockInfo.date = new Date().getTime();
    });
  }

  selectAllBlocks() {
    this.blocks.forEach(block => {
      block.selected = !this.selectedAllBlocks;
    });
    this.selectedAllMaterialsRest = false;
    this.selectedAllMaterialsRoot = false;
    this.selectBlock();
  }

  selectAllMaterialsRest() {
    this.materialsRest.forEach(material => {
      material.selected = !this.selectedAllMaterialsRest;
    });
    this.fetchNesting();
  }

  selectAllMaterialsRoot() {
    this.materialsRoot.forEach(material => {
      material.selected = !this.selectedAllMaterialsRoot;
    });
    this.fetchNesting();
  }

  getMaterialsCount(count: any) {
    if (count == 0){
      return '';
    }
    else{
      return '(' + count.toString() + ')';
    }
  }

  getWastageCount() {
    return this.nestingSource.filter((x: any) => x.CHILDKPL != 0 && x.CHILDNESTID == '').length;
  }

  selectWastage(nestid: string) {
    let find = this.materialsRest.find(x => x.parent == nestid);
    if (find != null){
      this.selectMaterial(find);
    }
  }

  showVacantWastages() {
    this.dialogService.open(VacantWastageComponent, {
      showHeader: false,
      modal: true,
      data: this.nestingSource.filter((x: any) => x.CHILDKPL != 0 && x.CHILDNESTID == ''),
    }).onClose.subscribe(res => {

    });
  }

  selectTitle(title: string) {
    this.selectedTitle = title;
    if (this.selectedTitle == 'Profiles'){
      this.fillNestingProfiles();
      console.log(this.nestingProfiles);
    }
  }
  fillNestingProfiles(){
    let blocks: string[] = [];
    let profiles: any[] = [];
    this.nestingProfiles.splice(0, this.nestingProfiles.length);
    this.blocks.filter(x => x.selected).forEach(block => {
      block.name.split(';').forEach((x: any) => blocks.push(x));
    });
    this.nestingProfilesSrc.forEach(profile => {
      if (blocks.includes(profile.BLOCK)){
        profiles.push(profile);
      }
    });
    profiles.forEach(profile => profile.name = this.profileName(profile));
    _.forEach(_.groupBy(profiles, x => x.name), profile => {
      let summ = 0;
      profile.forEach((x: any) => summ += x.NGB);
      this.nestingProfiles.push(profile[0].name + ' (' + summ + ')');
    });
  }
  profileName(profile: any){
    return this.profDecode(profile.TP) + ' ' + profile.KQ + ' ' + [profile.WH, profile.WT, profile.FH, profile.FT].filter(x => x != 0).join('x') + ' ' + 'L' + (+profile.TOGROLEN / 1000) + 'm';
  }
  profDecode(code: string): string{
    switch (code) {
      case 'AS': return 'LP';
      case 'FS': return 'FB';
      case 'PS': return 'PIPE';
      case 'RS': return 'RB';
      case 'MC': return 'HRB';
      case 'SR': return 'SQB';
      case 'HR': return 'SQP';
      case 'BS': return 'HP';
      default: return code;
    }
  }
}
