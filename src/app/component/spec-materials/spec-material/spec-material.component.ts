import { Component, OnInit } from '@angular/core';
import {LV} from "../../../domain/classes/lv";
import {Material} from "../../../domain/classes/material";
import {MaterialTranslation} from "../../../domain/interfaces/material-translation";
import {LanguageService} from "../../../domain/language.service";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {MaterialManagerService} from "../../../domain/material-manager.service";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {MessageService} from "primeng/api";

@Component({
  selector: 'app-spec-material',
  templateUrl: './spec-material.component.html',
  styleUrls: ['./spec-material.component.css']
})
export class SpecMaterialComponent implements OnInit {

  projects: string[] = [];
  project = '';
  categories = ['00002', '13112', '14109', '14122', '13124', '19127', '09003', '09004', '30000', '30005', '15107', '17108', '16101', '18123', '12116' ];
  units = [
    new LV('796 - штуки', '796'),
    new LV('006 - метры', '006'),
    new LV('055 - кв.м.', '055'),
    new LV('166 - кг', '166'),
    new LV('112 - литр', '122'),
    new LV('113 - куб.м.', '113'),
  ];
  category = this.categories[0];
  material: Material = new Material();
  approved = false;
  itt = false;
  tp620 = false;
  certRS = false;
  action = '';
  materialPrefix = '';
  materials: Material[] = [];
  layer1: any[] = [];
  layer2: any[] = [];
  layer3: any[] = [];
  layer4: any[] = [];
  selectedCode1: any;
  selectedCode2: any;
  selectedCode3: any;
  selectedCode4: any;
  codeSelectors: any[] = [];
  noneCode = {
    data: 'NON',
    label: 'No specified type',
  };
  materialTranslationRu: MaterialTranslation = {lang: 'ru', name: '', description: ''};

  constructor(public t: LanguageService, public dialog: DynamicDialogConfig, public materialManager: MaterialManagerService, public auth: AuthManagerService, public ref: DynamicDialogRef, public messageService: MessageService) {
    this.project = dialog.data[0];
    this.material = JSON.parse(JSON.stringify(dialog.data[1]));
    this.action = dialog.data[2];
    this.materials = dialog.data[3];
    this.materialPrefix = dialog.data[4];

    if (this.action == 'clone' || this.action == 'edit'){
      this.materialPrefix = this.material.code.substring(0, 12);
    }

    if ((this.action == 'add' || this.action == 'clone') && this.materialPrefix != ''){
      this.material.code = Material.generateCode(this.materialPrefix, this.materials);
    }

    let ru = this.material.translations.find(x => x.lang == 'ru');
    if (ru != null){
      this.materialTranslationRu = ru;
    }
    else{
      this.material.translations.push(this.materialTranslationRu);
    }
  }

  ngOnInit(): void {

  }

  createMaterial() {
    this.material.approved = this.approved ? 1 : 0;
    this.material.itt = this.itt ? 1 : 0;
    this.material.tp620 = this.tp620 ? 1 : 0;
    this.material.certRS = this.certRS ? 1 : 0;
    if (this.material.code.substring(0, 12) != Material.generateCode(this.materialPrefix, this.materials).substring(0, 12)){
      this.messageService.add({severity:'error', summary:'Code Error', detail:'You cannot modify base first 12 length symbols of code. Please create another block with code you wish.', life: 8000});
      return;
    }
    if (this.material.code.length != 16){
      this.messageService.add({severity:'error', summary:'Code Error', detail:'You cannot set length of code different from 16.', life: 8000});
      return;
    }
    let r = new RegExp('^[A-Z]{12}\\d{4}');
    if (!r.test(this.material.code)){
      this.messageService.add({severity:'error', summary:'Code Error', detail:'You can only use latin uppercase symbols and numbers in code. Code pattern: 12 uppercase latin symbols and 4 digits.', life: 8000});
      return;
    }
    if (this.action != 'edit' && this.materials.find(x => x.code == this.material.code)){
      this.messageService.add({severity:'error', summary:'Code Error', detail:'Material with the same code already exists.', life: 8000});
      return;
    }
    if (this.material.name == 'New Material' || this.material.name.trim() == ''){
      this.messageService.add({severity:'error', summary:'Code Error', detail:'You need to specify material name.', life: 8000});
      return;
    }
    if (this.material.singleWeight == 0 || this.material.singleWeight == null){
      this.messageService.add({severity:'error', summary:'Code Error', detail:'You need to specify material weight.', life: 8000});
      return;
    }
    this.material.project = this.project;
    this.materialManager.updateMaterial(this.material, this.auth.getUser().login, 0).then(res => {
      this.ref.close(this.material);
    });
  }

  selectorChanged() {
    let prefix = '';
    for (let x = 0; x < 4; x ++){
      if (this.codeSelectors[x].code == null){
        prefix += 'NON';
      }
      else{
        prefix += this.codeSelectors[x].code.data;
      }
    }
    this.material.code = Material.generateCode(prefix, this.materials);
  }

  getLabel(action: string) {
    return action.replace('add', 'Create').replace('edit', 'Update').replace('clone', 'Clone');
  }

  unitsChanged() {
    if (this.material.units == '166'){
      this.material.singleWeight = 1;
    }
  }

  getUnitsText() {
    switch (this.material.units) {
      case '796': return 'Вес кг. 1 штуки:';
      case '006': return 'Вес кг. 1 метра:';
      case '055': return 'Вес кг. 1 кв. м.:';
      case '166': return '';
      case '112': return 'Вес кг. 1 литра:';
      case '113': return 'Вес кг. 1 куб. м.:';
      default: return this.material.units;
    }
  }
}
