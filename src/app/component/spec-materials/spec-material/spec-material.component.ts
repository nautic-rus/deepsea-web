import { Component, OnInit } from '@angular/core';
import {LV} from "../../../domain/classes/lv";
import {Material} from "../../../domain/classes/material";
import {MaterialTranslation} from "../../../domain/interfaces/material-translation";
import {LanguageService} from "../../../domain/language.service";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {MaterialManagerService} from "../../../domain/material-manager.service";
import {AuthManagerService} from "../../../domain/auth-manager.service";
import {MessageService} from "primeng/api";
import {SpecMaterial} from "../../../domain/classes/spec-material";
import {EquipmentsService} from "../../../domain/equipments.service";

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
  action = '';
  materialPrefix = '';
  materials: Material[] = [];
  codeSelectors: any[] = [];
  noneCode = {
    data: 'NON',
    label: 'No specified type',
  };
  materialTranslationRu: MaterialTranslation = {lang: 'ru', name: '', description: ''};
  label = '';
  suppliers: any[] = [];

  constructor(public t: LanguageService, public eqManager: EquipmentsService, public dialog: DynamicDialogConfig, public materialManager: MaterialManagerService, public auth: AuthManagerService, public ref: DynamicDialogRef, public messageService: MessageService) {
    this.project = dialog.data[0];
    this.material = JSON.parse(JSON.stringify(dialog.data[1]));
    this.action = dialog.data[2];
    this.materials = dialog.data[3];
    this.materialPrefix = dialog.data[4];

    if (this.action == 'clone' || this.action == 'edit'){
      this.materialPrefix = this.material.code.substring(0, 12);
    }

    if ((this.action == 'add' || this.action == 'clone') && this.materialPrefix != ''){
      this.material.code = 'NRxxxxxxxxxxxxxx'
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
    let m = new SpecMaterial();
    m.fromMaterial(this.material, 0, 0, this.auth.getUser().id, '');
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
