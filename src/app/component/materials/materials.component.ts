import { Component, OnInit } from '@angular/core';
import {MaterialManagerService} from "../../domain/material-manager.service";
import {MessageService} from "primeng/api";
import {DialogService} from "primeng/dynamicdialog";
import {LanguageService} from "../../domain/language.service";
import {Issue} from "../../domain/classes/issue";
import {object} from "underscore";
import {CreateTaskComponent} from "../create-task/create-task.component";
import {AddMaterialComponent} from "./add-material/add-material.component";

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
      "data": "SEQ",
      "expandedIcon": "pi pi-folder-open",
      "collapsedIcon": "pi pi-folder",
      "children": [{
        "label": this.t.tr('Якорное'),
        "data": "ANR",
        "expandedIcon": "pi pi-folder-open",
        "collapsedIcon": "pi pi-folder",
        "children":
          [ {"label": this.t.tr('Оборудование'), "icon": "pi pi-tag", "data": "EQM"},
            {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}]
      },
        {
          "label": this.t.tr('Швартовное'),
          "data": "MRG",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": this.t.tr('Оборудование'), "icon": "pi pi-tag", "data": "EQM"},
              {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}]
        },
        {
          "label": this.t.tr('Буксирное'),
          "data": "TWG",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": this.t.tr('Оборудование'), "icon": "pi pi-tag", "data": "EQM"},
              {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}]
        },
        {
          "label": this.t.tr('Якорно-швартовное'),
          "data": "AMG",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": this.t.tr('Оборудование'), "icon": "pi pi-tag", "data": "EQM"},
              {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}]
        },
        {
          "label": this.t.tr('Грузовое'),
          "data": "CRG",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": this.t.tr('Оборудование'), "icon": "pi pi-tag", "data": "EQM"},
              {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}]
        },
        {
          "label": this.t.tr('Спасательное'),
          "data": "RSC",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": this.t.tr('Оборудование'), "icon": "pi pi-tag", "data": "EQM"},
              {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}]
        },
        {
          "label": this.t.tr('Шлюпочное'),
          "data": "BOT",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": this.t.tr('Оборудование'), "icon": "pi pi-tag", "data": "EQM"},
              {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}]
        },
        {
          "label": this.t.tr('Рулевое'),
          "data": "STG",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": this.t.tr('Оборудование'), "icon": "pi pi-tag", "data": "EQM"},
              {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}]
        },
        {
          "label": this.t.tr('Люковое'),
          "data": "HAH",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": this.t.tr('Оборудование'), "icon": "pi pi-tag", "data": "EQM"},
              {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}]
        },
        {
          "label": this.t.tr('Мачтовое'),
          "data": "MST",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": this.t.tr('Оборудование'), "icon": "pi pi-tag", "data": "EQM"},
              {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}]
        },
        {
          "label": this.t.tr('Промысловое'),
          "data": "FSG",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": this.t.tr('Оборудование'), "icon": "pi pi-tag", "data": "EQM"},
              {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}]
        },
        {
          "label": this.t.tr('Прочее'),
          "data": "OTR",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": this.t.tr('Оборудование'), "icon": "pi pi-tag", "data": "EQM"},
              {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}]
        }]
    },
    {
      "label": this.t.tr('ОБОРУДОВАНИЕ ПОМЕЩЕНИЙ'),
      "data": "REQ",
      "expandedIcon": "pi pi-folder-open",
      "collapsedIcon": "pi pi-folder",
      "children": [{
        "label": this.t.tr('Изоляция'),
        "data": "IST",
        "expandedIcon": "pi pi-folder-open",
        "collapsedIcon": "pi pi-folder",
        "children":
          [ {"label": this.t.tr('Съемное'), "icon": "pi pi-tag", "data": "RMV"},
            {"label": this.t.tr('Приварное'), "icon": "pi pi-tag", "data": "WLD"},
            {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}]
      },
        {
          "label": this.t.tr('Зашивка'),
          "data": "LIN",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": this.t.tr('Съемное'), "icon": "pi pi-tag", "data": "RMV"},
              {"label": this.t.tr('Приварное'), "icon": "pi pi-tag", "data": "WLD"},
              {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}]
        },
        {
          "label": this.t.tr('Пол'),
          "data": "FLR",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": this.t.tr('Съемное'), "icon": "pi pi-tag", "data": "RMV"},
              {"label": this.t.tr('Приварное'), "icon": "pi pi-tag", "data": "WLD"},
              {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}]
        },
        {
          "label": this.t.tr('Дельные вещи'),
          "data": "PRT",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": this.t.tr('Съемное'), "icon": "pi pi-tag", "data": "RMV"},
              {"label": this.t.tr('Приварное'), "icon": "pi pi-tag", "data": "WLD"},
              {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}]
        },
        {
          "label": this.t.tr('Мебель'),
          "data": "FRT",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": this.t.tr('Съемное'), "icon": "pi pi-tag", "data": "RMV"},
              {"label": this.t.tr('Приварное'), "icon": "pi pi-tag", "data": "WLD"},
              {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}]
        },
        {
          "label": this.t.tr('Оборудование, техника'),
          "data": "THN",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": this.t.tr('Съемное'), "icon": "pi pi-tag", "data": "RMV"},
              {"label": this.t.tr('Приварное'), "icon": "pi pi-tag", "data": "WLD"},
              {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}]
        },
        {
          "label": this.t.tr('Инвентарное имущество'),
          "data": "INV",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": this.t.tr('Съемное'), "icon": "pi pi-tag", "data": "RMV"},
              {"label": this.t.tr('Приварное'), "icon": "pi pi-tag", "data": "WLD"},
              {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}]
        },
        {
          "label": this.t.tr('Аварийно спасательное и противопожарное имущество'),
          "data": "RFE",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": this.t.tr('Съемное'), "icon": "pi pi-tag", "data": "RMV"},
              {"label": this.t.tr('Приварное'), "icon": "pi pi-tag", "data": "WLD"},
              {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}]
        },
        {
          "label": this.t.tr('Прочее'),
          "data": "OTR",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": this.t.tr('Съемное'), "icon": "pi pi-tag", "data": "RMV"},
              {"label": this.t.tr('Приварное'), "icon": "pi pi-tag", "data": "WLD"},
              {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}]
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
        "data": "FIT",
        "expandedIcon": "pi pi-folder-open",
        "collapsedIcon": "pi pi-folder",
        "children":
          [{
            "label": this.t.tr('Ручная'),
            "data": "H",
            "expandedIcon": "pi pi-folder-open",
            "collapsedIcon": "pi pi-folder",
            "children": [
              {"label": this.t.tr('Сталь'), "icon": "pi pi-tag", "data": "STL"},
              {"label": this.t.tr('Бронза'), "icon": "pi pi-tag", "data": "BRZ"},
              {"label": this.t.tr('Нержавеющая сталь'), "icon": "pi pi-tag", "data": "SST"},
              {"label": this.t.tr('Пластик'), "icon": "pi pi-tag", "data": "PLS"},
              {"label": this.t.tr('Комбинированный материал'), "icon": "pi pi-tag", "data": "CMD"},
              {"label": this.t.tr('Медно-никелевая (МНЖ)'), "icon": "pi pi-tag", "data": "CNK"},
              {"label": this.t.tr('Медь'), "icon": "pi pi-tag", "data": "CPR"},
              {"label": this.t.tr('Латунь'), "icon": "pi pi-tag", "data": "BRS"},
              {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}
            ]
          },
            {
              "label": this.t.tr('Дистанционная'),
              "data": "R",
              "expandedIcon": "pi pi-folder-open",
              "collapsedIcon": "pi pi-folder",
              "children": [
                {"label": this.t.tr('Сталь'), "icon": "pi pi-tag", "data": "STL"},
                {"label": this.t.tr('Бронза'), "icon": "pi pi-tag", "data": "BRZ"},
                {"label": this.t.tr('Нержавеющая сталь'), "icon": "pi pi-tag", "data": "SST"},
                {"label": this.t.tr('Пластик'), "icon": "pi pi-tag", "data": "PLS"},
                {"label": this.t.tr('Комбинированный материал'), "icon": "pi pi-tag", "data": "CMD"},
                {"label": this.t.tr('Медно-никелевая (МНЖ)'), "icon": "pi pi-tag", "data": "CNK"},
                {"label": this.t.tr('Медь'), "icon": "pi pi-tag", "data": "CPR"},
                {"label": this.t.tr('Латунь'), "icon": "pi pi-tag", "data": "BRS"},
                {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}
              ]
            },
            {
              "label": this.t.tr('Автоматическая'),
              "data": "A",
              "expandedIcon": "pi pi-folder-open",
              "collapsedIcon": "pi pi-folder",
              "children": [
                {"label": this.t.tr('Сталь'), "icon": "pi pi-tag", "data": "STL"},
                {"label": this.t.tr('Бронза'), "icon": "pi pi-tag", "data": "BRZ"},
                {"label": this.t.tr('Нержавеющая сталь'), "icon": "pi pi-tag", "data": "SST"},
                {"label": this.t.tr('Пластик'), "icon": "pi pi-tag", "data": "PLS"},
                {"label": this.t.tr('Комбинированный материал'), "icon": "pi pi-tag", "data": "CMD"},
                {"label": this.t.tr('Медно-никелевая (МНЖ)'), "icon": "pi pi-tag", "data": "CNK"},
                {"label": this.t.tr('Медь'), "icon": "pi pi-tag", "data": "CPR"},
                {"label": this.t.tr('Латунь'), "icon": "pi pi-tag", "data": "BRS"},
                {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}
              ]
            },
          ]
      },
        {
          "label": this.t.tr('Фасонные части (часть трубы)'),
          "data": "PART",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": this.t.tr('Изоляция труб'),
          "data": "PIL",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": this.t.tr('Насос'),
          "data": "PUMP",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": this.t.tr('Вентиляция и кондиционирование'),
          "data": "VENT",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": this.t.tr('Механическое оборудование'),
          "data": "MEQP",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": this.t.tr('Контрольно-измерительные приборы'),
          "data": "CMIT",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [{
              "label": this.t.tr('Давление'),
              "data": "PRS",
              "expandedIcon": "pi pi-folder-open",
              "collapsedIcon": "pi pi-folder",
            },
              {
                "label": this.t.tr('Температура'),
                "data": "TMP",
                "expandedIcon": "pi pi-folder-open",
                "collapsedIcon": "pi pi-folder",
              },
              {
                "label": this.t.tr('Уровень'),
                "data": "LYR",
                "expandedIcon": "pi pi-folder-open",
                "collapsedIcon": "pi pi-folder",
              },
              {
                "label": this.t.tr('Прочее'),
                "data": "OTR",
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
          "data": "EQM",
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
          "data": "SRC",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children": [
            {"label": this.t.tr('Генератор'), "icon": "pi pi-tag", "data": "SRC"},
            {"label": this.t.tr('Трансформатор'), "icon": "pi pi-tag", "data": "SRC"},
            {"label": this.t.tr('Преобразователь напряжения'), "icon": "pi pi-tag", "data": "SRC"},
            {"label": this.t.tr('Аккумуляторная батарея'), "icon": "pi pi-tag", "data": "SRC"},
            {"label": this.t.tr('Щит питания и управления'), "icon": "pi pi-tag", "data": "SRC"},
          ]
        },
        {
          "label": this.t.tr('Коробки соединительные, розетки, выключатели, штепсели'),
          "data": "MGA",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": this.t.tr('Навигационное оборудование'),
          "data": "NAV",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": this.t.tr('Оборудование радиосвязи'),
          "data": "RAD",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": this.t.tr('Освещение'),
          "data": "LGT",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": this.t.tr('Автоматизация'),
          "data": "AUT",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": this.t.tr('Сигнализация'),
          "data": "SGN",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": this.t.tr('Электрообогрев'),
          "data": "HTN",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": this.t.tr('Сигнальные средства'),
          "data": "SLМ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": this.t.tr('Защита от коррозии'),
          "data": "CRS",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": this.t.tr('Специальное оборудование (рыбопоисковое и т.п.)'),
          "data": "SPC",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": this.t.tr('Прочее'),
          "data": "OTR",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": this.t.tr('Кабели'),
          "data": "CAB",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children": [
            {"label": this.t.tr('Кабель в поставке'), "icon": "pi pi-tag", "data": "SUP"},
            {"label": this.t.tr('Кабель завод-строитель'), "icon": "pi pi-tag", "data": "YRD"},
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

  addMaterial(material: any) {
    this.dialogService.open(AddMaterialComponent, {
      showHeader: true,
      header: 'Добавление материала',
      modal: true,
      closable: true,
      data: material
    }).onClose.subscribe(res => {

    });
  }
}
