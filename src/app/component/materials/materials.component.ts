import { Component, OnInit } from '@angular/core';
import {MaterialManagerService} from "../../domain/material-manager.service";
import {MessageService} from "primeng/api";
import {DialogService} from "primeng/dynamicdialog";
import {LanguageService} from "../../domain/language.service";
import {Issue} from "../../domain/classes/issue";
import {object} from "underscore";

@Component({
  selector: 'app-materials',
  templateUrl: './materials.component.html',
  styleUrls: ['./materials.component.css']
})
export class MaterialsComponent implements OnInit {
  search: string = '';

  nodes =  [
    {
      "label": this.t.tr('КОРПУС'),
      "data": "HUL",
      "expandedIcon": "pi pi-folder-open",
      "collapsedIcon": "pi pi-folder",
      "children": [{
        "label": this.t.tr('Лист'),
        "data": "HUL",
        "expandedIcon": "pi pi-folder-open",
        "collapsedIcon": "pi pi-folder",
      },
        {
          "label": this.t.tr('Профиль'),
          "data": "HUL",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        }]
    },
    {
      "label":  this.t.tr('МАТЕРИАЛЫ'),
      "data": "MTL",
      "expandedIcon": "pi pi-folder-open",
      "collapsedIcon": "pi pi-folder",
      "children": [{
        "label": this.t.tr('Трубы'),
        "data": "PIP MTL",
        "expandedIcon": "pi pi-folder-open",
        "collapsedIcon": "pi pi-folder",
        "children":
          [ {"label": this.t.tr('Сталь'), "icon": "pi pi-tag", "data": "STL PIP MTL"},
            {"label": this.t.tr('Алюминий'), "icon": "pi pi-tag", "data": "ALM PIP MTL"},
            {"label": this.t.tr('Бронза'), "icon": "pi pi-tag", "data": "BRZ PIP MTL"},
            {"label": this.t.tr('Нержавеющая сталь'), "icon": "pi pi-tag", "data": "SST PIP MTL"},
            {"label": this.t.tr('Пластик'), "icon": "pi pi-tag", "tag": "PLS PIP MTL"},
            {"label": this.t.tr('Комбинированный материал'), "icon": "pi pi-tag", "data": "CMD PIP MTL"},
            {"label": this.t.tr('Медно-никелевая (МНЖ)'), "icon": "pi pi-tag", "data": "CNK PIP MTL"},
            {"label": this.t.tr('Медь'), "icon": "pi pi-tag", "data": "CPR PIP MTL"},
            {"label": this.t.tr('Латунь'), "icon": "pi pi-tag", "data": "BRS PIP MTL"},
            {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR PIP MTL"}]
      },
        {
          "label": this.t.tr('Крепеж'),
          "data": "FSN MTL",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": this.t.tr('Сталь'), "icon": "pi pi-tag", "data": "STL FSN MTL"},
              {"label": this.t.tr('Алюминий'), "icon": "pi pi-tag", "data": "ALM FSN MTL"},
              {"label": this.t.tr('Бронза'), "icon": "pi pi-tag", "data": "BRZ FSN MTL"},
              {"label": this.t.tr('Нержавеющая сталь'), "icon": "pi pi-tag", "data": "SST FSN MTL"},
              {"label": this.t.tr('Пластик'), "icon": "pi pi-tag", "data": "PLS FSN MTL"},
              {"label": this.t.tr('Комбинированный материал'), "icon": "pi pi-tag", "data": "CMD FSN MTL"},
              {"label": this.t.tr('Медно-никелевая (МНЖ)'), "icon": "pi pi-tag", "data": "CNK FSN MTL"},
              {"label": this.t.tr('Медь'), "icon": "pi pi-tag", "data": "CPR FSN MTL"},
              {"label": this.t.tr('Латунь'), "icon": "pi pi-tag", "data": "BRS FSN MTL"},
              {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR FSN MTL"}]
        },
        {
          "label": this.t.tr('Сварочные материалы'),
          "data": "WLD MTL",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": this.t.tr('Сталь'), "icon": "pi pi-tag", "data": "STL WLD MTL"},
              {"label": this.t.tr('Алюминий'), "icon": "pi pi-tag", "data": "ALM WLD MTL"},
              {"label": this.t.tr('Бронза'), "icon": "pi pi-tag", "data": "BRZ WLD MTL"},
              {"label": this.t.tr('Нержавеющая сталь'), "icon": "pi pi-tag", "data": "SST WLD MTL"},
              {"label": this.t.tr('Пластик'), "icon": "pi pi-tag", "data": "PLS WLD MTL"},
              {"label": this.t.tr('Комбинированный материал'), "icon": "pi pi-tag", "data": "CMD WLD MTL"},
              {"label": this.t.tr('Медно-никелевая (МНЖ)'), "icon": "pi pi-tag", "data": "CNK WLD MTL"},
              {"label": this.t.tr('Медь'), "icon": "pi pi-tag", "data": "CPR WLD MTL"},
              {"label": this.t.tr('Латунь'), "icon": "pi pi-tag", "data": "BRS WLD MTL"},
              {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR WLD MTL"}]
        },
        {
          "label": this.t.tr('Пиломатериал'),
          "data": "LMB MTL",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": this.t.tr('Сталь'), "icon": "pi pi-tag", "data": "STL LMB MTL"},
              {"label": this.t.tr('Алюминий'), "icon": "pi pi-tag", "data": "ALM LMB MTL"},
              {"label": this.t.tr('Бронза'), "icon": "pi pi-tag", "data": "BRZ LMB MTL"},
              {"label": this.t.tr('Нержавеющая сталь'), "icon": "pi pi-tag", "data": "SST LMB MTL"},
              {"label": this.t.tr('Пластик'), "icon": "pi pi-tag", "data": "PLS LMB MTL"},
              {"label": this.t.tr('Комбинированный материал'), "icon": "pi pi-tag", "data": "CMD LMB MTL"},
              {"label": this.t.tr('Медно-никелевая (МНЖ)'), "icon": "pi pi-tag", "data": "CNK LMB MTL"},
              {"label": this.t.tr('Медь'), "icon": "pi pi-tag", "data": "CPR LMB MTL"},
              {"label": this.t.tr('Латунь'), "icon": "pi pi-tag", "data": "BRS LMB MTL"},
              {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR LMB MTL"}]
        },
        {
          "label": this.t.tr('Технологический'),
          "data": "THL MTL",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": this.t.tr('Сталь'), "icon": "pi pi-tag", "data": "STL THL MTL"},
              {"label": this.t.tr('Алюминий'), "icon": "pi pi-tag", "data": "ALM THL MTL"},
              {"label": this.t.tr('Бронза'), "icon": "pi pi-tag", "data": "BRZ THL MTL"},
              {"label": this.t.tr('Нержавеющая сталь'), "icon": "pi pi-tag", "data": "SST THL MTL"},
              {"label": this.t.tr('Пластик'), "icon": "pi pi-tag", "data": "PLS THL MTL"},
              {"label": this.t.tr('Комбинированный материал'), "icon": "pi pi-tag", "data": "CMD THL MTL"},
              {"label": this.t.tr('Медно-никелевая (МНЖ)'), "icon": "pi pi-tag", "data": "CNK THL MTL"},
              {"label": this.t.tr('Медь'), "icon": "pi pi-tag", "data": "CPR THL MTL"},
              {"label": this.t.tr('Латунь'), "icon": "pi pi-tag", "data": "BRS THL MTL"},
              {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR THL MTL"}]
        },
        {
          "label": this.t.tr('Прочее'),
          "data": "OTR MTL",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": this.t.tr('Сталь'), "icon": "pi pi-tag", "data": "STL OTR MTL"},
              {"label": this.t.tr('Алюминий'), "icon": "pi pi-tag", "data": "ALM OTR MTL"},
              {"label": this.t.tr('Бронза'), "icon": "pi pi-tag", "data": "BRZ OTR MTL"},
              {"label": this.t.tr('Нержавеющая сталь'), "icon": "pi pi-tag", "data": "SST OTR MTL"},
              {"label": this.t.tr('Пластик'), "icon": "pi pi-tag", "data": "PLS OTR MTL"},
              {"label": this.t.tr('Комбинированный материал'), "icon": "pi pi-tag", "data": "CMD OTR MTL"},
              {"label": this.t.tr('Медно-никелевая (МНЖ)'), "icon": "pi pi-tag", "data": "CNK OTR MTL"},
              {"label": this.t.tr('Медь'), "icon": "pi pi-tag", "data": "CPR OTR MTL"},
              {"label": this.t.tr('Латунь'), "icon": "pi pi-tag", "data": "BRS OTR MTL"},
              {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR OTR MTL"}]
        }]
    },
    {
      "label": this.t.tr('СУДОВЫЕ УСТРОЙСТВА'),
      "data": "MRG",
      "expandedIcon": "pi pi-folder-open",
      "collapsedIcon": "pi pi-folder",
      "children": [{
        "label": this.t.tr('Якорное'),
        "data": "ANR SEQ",
        "expandedIcon": "pi pi-folder-open",
        "collapsedIcon": "pi pi-folder",
        "children":
          [ {"label": this.t.tr('Оборудование'), "icon": "pi pi-tag", "data": "EQM ANR SEQ"},
            {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR ANR SEQ"}]
      },
        {
          "label": this.t.tr('Швартовное'),
          "data": "MRG SEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": this.t.tr('Оборудование'), "icon": "pi pi-tag", "data": "EQM MRG SEQ"},
              {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR MRG SEQ"}]
        },
        {
          "label": this.t.tr('Буксирное'),
          "data": "TWG SEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": this.t.tr('Оборудование'), "icon": "pi pi-tag", "data": "EQM TWG SEQ"},
              {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR TWG SEQ"}]
        },
        {
          "label": this.t.tr('Якорно-швартовное'),
          "data": "AMG SEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": this.t.tr('Оборудование'), "icon": "pi pi-tag", "data": "EQM AMG SEQ"},
              {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR AMG SEQ"}]
        },
        {
          "label": this.t.tr('Грузовое'),
          "data": "CRG SEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": this.t.tr('Оборудование'), "icon": "pi pi-tag", "data": "EQM CRG SEQ"},
              {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR CRG SEQ"}]
        },
        {
          "label": this.t.tr('Спасательное'),
          "data": "RSC SEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": this.t.tr('Оборудование'), "icon": "pi pi-tag", "data": "EQM RSC SEQ"},
              {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR RSC SEQ"}]
        },
        {
          "label": this.t.tr('Шлюпочное'),
          "data": "BOT SEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": this.t.tr('Оборудование'), "icon": "pi pi-tag", "data": "EQM BOT SEQ"},
              {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR BOT SEQ"}]
        },
        {
          "label": this.t.tr('Рулевое'),
          "data": "STG SEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": this.t.tr('Оборудование'), "icon": "pi pi-tag", "data": "EQM STG SEQ"},
              {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR STG SEQ"}]
        },
        {
          "label": this.t.tr('Люковое'),
          "data": "HAH SEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": this.t.tr('Оборудование'), "icon": "pi pi-tag", "data": "EQM HAH SEQ"},
              {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR HAH SEQ"}]
        },
        {
          "label": this.t.tr('Мачтовое'),
          "data": "MST SEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": this.t.tr('Оборудование'), "icon": "pi pi-tag", "data": "EQM MST SEQ"},
              {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR MST SEQ"}]
        },
        {
          "label": this.t.tr('Промысловое'),
          "data": "FSG SEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": this.t.tr('Оборудование'), "icon": "pi pi-tag", "data": "EQM FSG SEQ"},
              {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR FSG SEQ"}]
        },
        {
          "label": this.t.tr('Прочее'),
          "data": "OTR SEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": this.t.tr('Оборудование'), "icon": "pi pi-tag", "data": "EQM OTR SEQ"},
              {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR OTR SEQ"}]
        }]
    },
    {
      "label": this.t.tr('ОБОРУДОВАНИЕ ПОМЕЩЕНИЙ'),
      "data": "REQ",
      "expandedIcon": "pi pi-folder-open",
      "collapsedIcon": "pi pi-folder",
      "children": [{
        "label": this.t.tr('Изоляция'),
        "data": "IST REQ",
        "expandedIcon": "pi pi-folder-open",
        "collapsedIcon": "pi pi-folder",
        "children":
          [ {"label": this.t.tr('Съемное'), "icon": "pi pi-tag", "data": "RMV IST REQ"},
            {"label": this.t.tr('Приварное'), "icon": "pi pi-tag", "data": "WLD IST REQ"},
            {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR IST REQ"}]
      },
        {
          "label": this.t.tr('Зашивка'),
          "data": "LIN REQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": this.t.tr('Съемное'), "icon": "pi pi-tag", "data": "RMV LIN REQ"},
              {"label": this.t.tr('Приварное'), "icon": "pi pi-tag", "data": "WLD LIN REQ"},
              {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR LIN REQ"}]
        },
        {
          "label": this.t.tr('Пол'),
          "data": "FLR REQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": this.t.tr('Съемное'), "icon": "pi pi-tag", "data": "RMV FLR REQ"},
              {"label": this.t.tr('Приварное'), "icon": "pi pi-tag", "data": "WLD FLR REQ"},
              {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR FLR REQ"}]
        },
        {
          "label": this.t.tr('Дельные вещи'),
          "data": "PRT REQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": this.t.tr('Съемное'), "icon": "pi pi-tag", "data": "RMV PRT REQ"},
              {"label": this.t.tr('Приварное'), "icon": "pi pi-tag", "data": "WLD PRT REQ"},
              {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR PRT REQ"}]
        },
        {
          "label": this.t.tr('Мебель'),
          "data": "FRT REQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": this.t.tr('Съемное'), "icon": "pi pi-tag", "data": "RMV FRT REQ"},
              {"label": this.t.tr('Приварное'), "icon": "pi pi-tag", "data": "WLD FRT REQ"},
              {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR FRT REQ"}]
        },
        {
          "label": this.t.tr('Оборудование, техника'),
          "data": "THN REQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": this.t.tr('Съемное'), "icon": "pi pi-tag", "data": "RMV THN REQ"},
              {"label": this.t.tr('Приварное'), "icon": "pi pi-tag", "data": "WLD THN REQ"},
              {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR THN REQ"}]
        },
        {
          "label": this.t.tr('Инвентарное имущество'),
          "data": "INV REQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": this.t.tr('Съемное'), "icon": "pi pi-tag", "data": "RMV INV REQ"},
              {"label": this.t.tr('Приварное'), "icon": "pi pi-tag", "data": "WLD INV REQ"},
              {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR INV REQ"}]
        },
        {
          "label": this.t.tr('Аварийно спасательное и противопожарное имущество'),
          "data": "RFE REQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": this.t.tr('Съемное'), "icon": "pi pi-tag", "data": "RMV RFE REQ"},
              {"label": this.t.tr('Приварное'), "icon": "pi pi-tag", "data": "WLD RFE REQ"},
              {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR RFE REQ"}]
        },
        {
          "label": this.t.tr('Прочее'),
          "data": "OTR REQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": this.t.tr('Съемное'), "icon": "pi pi-tag", "data": "RMV OTR REQ"},
              {"label": this.t.tr('Приварное'), "icon": "pi pi-tag", "data": "WLD OTR REQ"},
              {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR OTR REQ"}]
        },
      ]
    },
    {
      "label": this.t.tr('СУДОВЫЕ СИСТЕМЫ'),
      "data": "SYS",
      "expandedIcon": "pi pi-folder-open",
      "collapsedIcon": "pi pi-folder",
      "children": [
        {
        "label": this.t.tr('Арматура'),
        "data": "FIT SYS",
        "expandedIcon": "pi pi-folder-open",
        "collapsedIcon": "pi pi-folder",
        "children":
          [{
            "label": this.t.tr('Ручная'),
            "data": "H FIT SYS",
            "expandedIcon": "pi pi-folder-open",
            "collapsedIcon": "pi pi-folder",
            "children": [
              {"label": this.t.tr('Сталь'), "icon": "pi pi-tag", "data": "STL H FIT SYS"},
              {"label": this.t.tr('Бронза'), "icon": "pi pi-tag", "data": "BRZ H FIT SYS"},
              {"label": this.t.tr('Нержавеющая сталь'), "icon": "pi pi-tag", "data": "SST H FIT SYS"},
              {"label": this.t.tr('Пластик'), "icon": "pi pi-tag", "data": "PLS H FIT SYS"},
              {"label": this.t.tr('Комбинированный материал'), "icon": "pi pi-tag", "data": "CMD H FIT SYS"},
              {"label": this.t.tr('Медно-никелевая (МНЖ)'), "icon": "pi pi-tag", "data": "CNK H FIT SYS"},
              {"label": this.t.tr('Медь'), "icon": "pi pi-tag", "data": "CPR H FIT SYS"},
              {"label": this.t.tr('Латунь'), "icon": "pi pi-tag", "data": "BRS H FIT SYS"},
              {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR H FIT SYS"}
            ]
          },
            {
              "label": this.t.tr('Дистанционная'),
              "data": "R FIT SYS",
              "expandedIcon": "pi pi-folder-open",
              "collapsedIcon": "pi pi-folder",
              "children": [
                {"label": this.t.tr('Сталь'), "icon": "pi pi-tag", "data": "STL R FIT SYS"},
                {"label": this.t.tr('Бронза'), "icon": "pi pi-tag", "data": "BRZ R FIT SYS"},
                {"label": this.t.tr('Нержавеющая сталь'), "icon": "pi pi-tag", "data": "SST R FIT SYS"},
                {"label": this.t.tr('Пластик'), "icon": "pi pi-tag", "data": "PLS R FIT SYS"},
                {"label": this.t.tr('Комбинированный материал'), "icon": "pi pi-tag", "data": "CMD R FIT SYS"},
                {"label": this.t.tr('Медно-никелевая (МНЖ)'), "icon": "pi pi-tag", "data": "CNK R FIT SYS"},
                {"label": this.t.tr('Медь'), "icon": "pi pi-tag", "data": "CPR R FIT SYS"},
                {"label": this.t.tr('Латунь'), "icon": "pi pi-tag", "data": "BRS R FIT SYS"},
                {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR R FIT SYS"}
              ]
            },
            {
              "label": this.t.tr('Автоматическая'),
              "data": "A FIT SYS",
              "expandedIcon": "pi pi-folder-open",
              "collapsedIcon": "pi pi-folder",
              "children": [
                {"label": this.t.tr('Сталь'), "icon": "pi pi-tag", "data": "STL A FIT SYS"},
                {"label": this.t.tr('Бронза'), "icon": "pi pi-tag", "data": "BRZ A FIT SYS"},
                {"label": this.t.tr('Нержавеющая сталь'), "icon": "pi pi-tag", "data": "SST A FIT SYS"},
                {"label": this.t.tr('Пластик'), "icon": "pi pi-tag", "data": "PLS A FIT SYS"},
                {"label": this.t.tr('Комбинированный материал'), "icon": "pi pi-tag", "data": "CMD A FIT SYS"},
                {"label": this.t.tr('Медно-никелевая (МНЖ)'), "icon": "pi pi-tag", "data": "CNK A FIT SYS"},
                {"label": this.t.tr('Медь'), "icon": "pi pi-tag", "data": "CPR A FIT SYS"},
                {"label": this.t.tr('Латунь'), "icon": "pi pi-tag", "data": "BRS A FIT SYS"},
                {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR A FIT SYS"}
              ]
            },
          ]
      },
        {
          "label": this.t.tr('Фасонные части (часть трубы)'),
          "data": "PART SYS",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": this.t.tr('Изоляция труб'),
          "data": "PIL SYS",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": this.t.tr('Насос'),
          "data": "PUMP SYS",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": this.t.tr('Вентиляция и кондиционирование'),
          "data": "VENT SYS",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": this.t.tr('Механическое оборудование'),
          "data": "MEQP SYS",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": this.t.tr('Контрольно-измерительные приборы'),
          "data": "CMIT SYS",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [{
              "label": this.t.tr('Давление'),
              "data": "PRS CMIT SYS",
              "expandedIcon": "pi pi-folder-open",
              "collapsedIcon": "pi pi-folder",
            },
              {
                "label": this.t.tr('Температура'),
                "data": "TMP CMIT SYS",
                "expandedIcon": "pi pi-folder-open",
                "collapsedIcon": "pi pi-folder",
              },
              {
                "label": this.t.tr('Уровень'),
                "data": "LYR CMIT SYS",
                "expandedIcon": "pi pi-folder-open",
                "collapsedIcon": "pi pi-folder",
              },
              {
                "label": this.t.tr('Прочее'),
                "data": "OTR CMIT SYS",
                "expandedIcon": "pi pi-folder-open",
                "collapsedIcon": "pi pi-folder",
              },
            ]
        },

      ]
    },
    {
      "label": this.t.tr('ЭНЕРГЕТИЧЕСКАЯ УСТАНОВКА'),
      "data": "PWP",
      "expandedIcon": "pi pi-folder-open",
      "collapsedIcon": "pi pi-folder",
      "children": [
        {
          "label": this.t.tr('Оборудование'),
          "data": "EQM PWP",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },

      ]
    },
    {
      "label": this.t.tr('ЭЛЕКТРИЧЕСКОЕ ОБОРУДОВАНИЕ'),
      "data": "EEQ",
      "expandedIcon": "pi pi-folder-open",
      "collapsedIcon": "pi pi-folder",
      "children": [
        {
          "label": this.t.tr('Источники электрической энергии'),
          "data": "SRC EEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children": [
            {"label": this.t.tr('Генератор'), "icon": "pi pi-tag", "data": "SRC EEQ"},
            {"label": this.t.tr('Трансформатор'), "icon": "pi pi-tag", "data": "SRC EEQ"},
            {"label": this.t.tr('Преобразователь напряжения'), "icon": "pi pi-tag", "data": "SRC EEQ"},
            {"label": this.t.tr('Аккумуляторная батарея'), "icon": "pi pi-tag", "data": "SRC EEQ"},
            {"label": this.t.tr('Щит питания и управления'), "icon": "pi pi-tag", "data": "SRC EEQ"},
          ]
        },
        {
          "label": this.t.tr('Коробки соединительные, розетки, выключатели, штепсели'),
          "data": "MGA EEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": this.t.tr('Навигационное оборудование'),
          "data": "NAV EEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": this.t.tr('Оборудование радиосвязи'),
          "data": "RAD EEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": this.t.tr('Освещение'),
          "data": "LGT EEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": this.t.tr('Автоматизация'),
          "data": "AUT EEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": this.t.tr('Сигнализация'),
          "data": "SGN EEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": this.t.tr('Электрообогрев'),
          "data": "HTN EEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": this.t.tr('Сигнальные средства'),
          "data": "SLМ EEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": this.t.tr('Защита от коррозии'),
          "data": "CRS EEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": this.t.tr('Специальное оборудование (рыбопоисковое и т.п.)'),
          "data": "SPC EEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": this.t.tr('Прочее'),
          "data": "OTR EEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": this.t.tr('Кабели'),
          "data": "CAB EEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children": [
            {"label": this.t.tr('Кабель в поставке'), "icon": "pi pi-tag", "data": "SUP CAB EEQ"},
            {"label": this.t.tr('Кабель завод-строитель'), "icon": "pi pi-tag", "data": "YRD CAB EEQ"},
          ]
        },
      ]
    },
    {
      "label": this.t.tr('МСЧ'),
      "data": "ENP",
      "expandedIcon": "pi pi-folder-open",
      "collapsedIcon": "pi pi-folder",
    },
  ];
  materials: any [] = [Object, Object, Object, Object, Object, Object, Object, Object];
  selectedNode: any;
  tooltips: string[] = [];
  projects: string[] = [];
  project = '';

  constructor(public t: LanguageService, private materialManager: MaterialManagerService, private messageService: MessageService, private dialogService: DialogService) { }

  ngOnInit(): void {

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
}
