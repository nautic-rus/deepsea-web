import { Component, OnInit } from '@angular/core';
import {MaterialManagerService} from "../../domain/material-manager.service";
import {MessageService, TreeNode} from "primeng/api";
import {DialogService} from "primeng/dynamicdialog";
import {LanguageService} from "../../domain/language.service";
import {Issue} from "../../domain/classes/issue";
import {object} from "underscore";
import {CreateTaskComponent} from "../create-task/create-task.component";
import {AddMaterialComponent} from "./add-material/add-material.component";
import {AuthManagerService} from "../../domain/auth-manager.service";
import {Material} from "../../domain/classes/material";
import {MaterialNode} from "../../domain/classes/material-node";
import {NodeLib} from "three/examples/jsm/nodes/core/NodeLib";
import nodes = NodeLib.nodes;
import {$e} from "@angular/compiler/src/chars";
import {ClearFilesComponent} from "../documents/hull-esp/clear-files/clear-files.component";
import {RemoveConfirmationComponent} from "./remove-confirmation/remove-confirmation.component";
import {ContextMenu} from "primeng/contextmenu";

@Component({
  selector: 'app-materials',
  templateUrl: './materials.component.html',
  styleUrls: ['./materials.component.css']
})
export class MaterialsComponent implements OnInit {
  search: string = '';
  // nodes =  [
  //   {
  //     "label": this.t.tr('КОРПУС'),
  //     "data": "HUL",
  //     "expandedIcon": "pi pi-folder-open",
  //     "collapsedIcon": "pi pi-folder",
  //     "children": [{
  //       "label": this.t.tr('Лист'),
  //       "data": "HUL",
  //       "expandedIcon": "pi pi-folder-open",
  //       "collapsedIcon": "pi pi-folder",
  //     },
  //       {
  //         "label": this.t.tr('Профиль'),
  //         "data": "HUL",
  //         "expandedIcon": "pi pi-folder-open",
  //         "collapsedIcon": "pi pi-folder",
  //       }]
  //   },
  //   {
  //     "label":  this.t.tr('МАТЕРИАЛЫ'),
  //     "data": "MTL",
  //     "expandedIcon": "pi pi-folder-open",
  //     "collapsedIcon": "pi pi-folder",
  //     "children": [{
  //       "label": this.t.tr('Трубы'),
  //       "data": "PIP MTL",
  //       "expandedIcon": "pi pi-folder-open",
  //       "collapsedIcon": "pi pi-folder",
  //       "children":
  //         [ {"label": this.t.tr('Сталь'), "icon": "pi pi-tag", "data": "STL PIP MTL"},
  //           {"label": this.t.tr('Алюминий'), "icon": "pi pi-tag", "data": "ALM PIP MTL"},
  //           {"label": this.t.tr('Бронза'), "icon": "pi pi-tag", "data": "BRZ PIP MTL"},
  //           {"label": this.t.tr('Нержавеющая сталь'), "icon": "pi pi-tag", "data": "SST PIP MTL"},
  //           {"label": this.t.tr('Пластик'), "icon": "pi pi-tag", "tag": "PLS PIP MTL"},
  //           {"label": this.t.tr('Комбинированный материал'), "icon": "pi pi-tag", "data": "CMD PIP MTL"},
  //           {"label": this.t.tr('Медно-никелевая (МНЖ)'), "icon": "pi pi-tag", "data": "CNK PIP MTL"},
  //           {"label": this.t.tr('Медь'), "icon": "pi pi-tag", "data": "CPR PIP MTL"},
  //           {"label": this.t.tr('Латунь'), "icon": "pi pi-tag", "data": "BRS PIP MTL"},
  //           {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR PIP MTL"}]
  //     },
  //       {
  //         "label": this.t.tr('Крепеж'),
  //         "data": "FSN MTL",
  //         "expandedIcon": "pi pi-folder-open",
  //         "collapsedIcon": "pi pi-folder",
  //         "children":
  //           [ {"label": this.t.tr('Сталь'), "icon": "pi pi-tag", "data": "STL FSN MTL"},
  //             {"label": this.t.tr('Алюминий'), "icon": "pi pi-tag", "data": "ALM FSN MTL"},
  //             {"label": this.t.tr('Бронза'), "icon": "pi pi-tag", "data": "BRZ FSN MTL"},
  //             {"label": this.t.tr('Нержавеющая сталь'), "icon": "pi pi-tag", "data": "SST FSN MTL"},
  //             {"label": this.t.tr('Пластик'), "icon": "pi pi-tag", "data": "PLS FSN MTL"},
  //             {"label": this.t.tr('Комбинированный материал'), "icon": "pi pi-tag", "data": "CMD FSN MTL"},
  //             {"label": this.t.tr('Медно-никелевая (МНЖ)'), "icon": "pi pi-tag", "data": "CNK FSN MTL"},
  //             {"label": this.t.tr('Медь'), "icon": "pi pi-tag", "data": "CPR FSN MTL"},
  //             {"label": this.t.tr('Латунь'), "icon": "pi pi-tag", "data": "BRS FSN MTL"},
  //             {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR FSN MTL"}]
  //       },
  //       {
  //         "label": this.t.tr('Сварочные материалы'),
  //         "data": "WLD MTL",
  //         "expandedIcon": "pi pi-folder-open",
  //         "collapsedIcon": "pi pi-folder",
  //         "children":
  //           [ {"label": this.t.tr('Сталь'), "icon": "pi pi-tag", "data": "STL WLD MTL"},
  //             {"label": this.t.tr('Алюминий'), "icon": "pi pi-tag", "data": "ALM WLD MTL"},
  //             {"label": this.t.tr('Бронза'), "icon": "pi pi-tag", "data": "BRZ WLD MTL"},
  //             {"label": this.t.tr('Нержавеющая сталь'), "icon": "pi pi-tag", "data": "SST WLD MTL"},
  //             {"label": this.t.tr('Пластик'), "icon": "pi pi-tag", "data": "PLS WLD MTL"},
  //             {"label": this.t.tr('Комбинированный материал'), "icon": "pi pi-tag", "data": "CMD WLD MTL"},
  //             {"label": this.t.tr('Медно-никелевая (МНЖ)'), "icon": "pi pi-tag", "data": "CNK WLD MTL"},
  //             {"label": this.t.tr('Медь'), "icon": "pi pi-tag", "data": "CPR WLD MTL"},
  //             {"label": this.t.tr('Латунь'), "icon": "pi pi-tag", "data": "BRS WLD MTL"},
  //             {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR WLD MTL"}]
  //       },
  //       {
  //         "label": this.t.tr('Пиломатериал'),
  //         "data": "LMB MTL",
  //         "expandedIcon": "pi pi-folder-open",
  //         "collapsedIcon": "pi pi-folder",
  //         "children":
  //           [ {"label": this.t.tr('Сталь'), "icon": "pi pi-tag", "data": "STL LMB MTL"},
  //             {"label": this.t.tr('Алюминий'), "icon": "pi pi-tag", "data": "ALM LMB MTL"},
  //             {"label": this.t.tr('Бронза'), "icon": "pi pi-tag", "data": "BRZ LMB MTL"},
  //             {"label": this.t.tr('Нержавеющая сталь'), "icon": "pi pi-tag", "data": "SST LMB MTL"},
  //             {"label": this.t.tr('Пластик'), "icon": "pi pi-tag", "data": "PLS LMB MTL"},
  //             {"label": this.t.tr('Комбинированный материал'), "icon": "pi pi-tag", "data": "CMD LMB MTL"},
  //             {"label": this.t.tr('Медно-никелевая (МНЖ)'), "icon": "pi pi-tag", "data": "CNK LMB MTL"},
  //             {"label": this.t.tr('Медь'), "icon": "pi pi-tag", "data": "CPR LMB MTL"},
  //             {"label": this.t.tr('Латунь'), "icon": "pi pi-tag", "data": "BRS LMB MTL"},
  //             {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR LMB MTL"}]
  //       },
  //       {
  //         "label": this.t.tr('Технологический'),
  //         "data": "THL MTL",
  //         "expandedIcon": "pi pi-folder-open",
  //         "collapsedIcon": "pi pi-folder",
  //         "children":
  //           [ {"label": this.t.tr('Сталь'), "icon": "pi pi-tag", "data": "STL THL MTL"},
  //             {"label": this.t.tr('Алюминий'), "icon": "pi pi-tag", "data": "ALM THL MTL"},
  //             {"label": this.t.tr('Бронза'), "icon": "pi pi-tag", "data": "BRZ THL MTL"},
  //             {"label": this.t.tr('Нержавеющая сталь'), "icon": "pi pi-tag", "data": "SST THL MTL"},
  //             {"label": this.t.tr('Пластик'), "icon": "pi pi-tag", "data": "PLS THL MTL"},
  //             {"label": this.t.tr('Комбинированный материал'), "icon": "pi pi-tag", "data": "CMD THL MTL"},
  //             {"label": this.t.tr('Медно-никелевая (МНЖ)'), "icon": "pi pi-tag", "data": "CNK THL MTL"},
  //             {"label": this.t.tr('Медь'), "icon": "pi pi-tag", "data": "CPR THL MTL"},
  //             {"label": this.t.tr('Латунь'), "icon": "pi pi-tag", "data": "BRS THL MTL"},
  //             {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR THL MTL"}]
  //       },
  //       {
  //         "label": this.t.tr('Прочее'),
  //         "data": "OTR MTL",
  //         "expandedIcon": "pi pi-folder-open",
  //         "collapsedIcon": "pi pi-folder",
  //         "children":
  //           [ {"label": this.t.tr('Сталь'), "icon": "pi pi-tag", "data": "STL OTR MTL"},
  //             {"label": this.t.tr('Алюминий'), "icon": "pi pi-tag", "data": "ALM OTR MTL"},
  //             {"label": this.t.tr('Бронза'), "icon": "pi pi-tag", "data": "BRZ OTR MTL"},
  //             {"label": this.t.tr('Нержавеющая сталь'), "icon": "pi pi-tag", "data": "SST OTR MTL"},
  //             {"label": this.t.tr('Пластик'), "icon": "pi pi-tag", "data": "PLS OTR MTL"},
  //             {"label": this.t.tr('Комбинированный материал'), "icon": "pi pi-tag", "data": "CMD OTR MTL"},
  //             {"label": this.t.tr('Медно-никелевая (МНЖ)'), "icon": "pi pi-tag", "data": "CNK OTR MTL"},
  //             {"label": this.t.tr('Медь'), "icon": "pi pi-tag", "data": "CPR OTR MTL"},
  //             {"label": this.t.tr('Латунь'), "icon": "pi pi-tag", "data": "BRS OTR MTL"},
  //             {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR OTR MTL"}]
  //       }]
  //   },
  //   {
  //     "label": this.t.tr('СУДОВЫЕ УСТРОЙСТВА'),
  //     "data": "SEQ",
  //     "expandedIcon": "pi pi-folder-open",
  //     "collapsedIcon": "pi pi-folder",
  //     "children": [{
  //       "label": this.t.tr('Якорное'),
  //       "data": "ANR",
  //       "expandedIcon": "pi pi-folder-open",
  //       "collapsedIcon": "pi pi-folder",
  //       "children":
  //         [ {"label": this.t.tr('Оборудование'), "icon": "pi pi-tag", "data": "EQM"},
  //           {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}]
  //     },
  //       {
  //         "label": this.t.tr('Швартовное'),
  //         "data": "MRG",
  //         "expandedIcon": "pi pi-folder-open",
  //         "collapsedIcon": "pi pi-folder",
  //         "children":
  //           [ {"label": this.t.tr('Оборудование'), "icon": "pi pi-tag", "data": "EQM"},
  //             {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}]
  //       },
  //       {
  //         "label": this.t.tr('Буксирное'),
  //         "data": "TWG",
  //         "expandedIcon": "pi pi-folder-open",
  //         "collapsedIcon": "pi pi-folder",
  //         "children":
  //           [ {"label": this.t.tr('Оборудование'), "icon": "pi pi-tag", "data": "EQM"},
  //             {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}]
  //       },
  //       {
  //         "label": this.t.tr('Якорно-швартовное'),
  //         "data": "AMG",
  //         "expandedIcon": "pi pi-folder-open",
  //         "collapsedIcon": "pi pi-folder",
  //         "children":
  //           [ {"label": this.t.tr('Оборудование'), "icon": "pi pi-tag", "data": "EQM"},
  //             {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}]
  //       },
  //       {
  //         "label": this.t.tr('Грузовое'),
  //         "data": "CRG",
  //         "expandedIcon": "pi pi-folder-open",
  //         "collapsedIcon": "pi pi-folder",
  //         "children":
  //           [ {"label": this.t.tr('Оборудование'), "icon": "pi pi-tag", "data": "EQM"},
  //             {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}]
  //       },
  //       {
  //         "label": this.t.tr('Спасательное'),
  //         "data": "RSC",
  //         "expandedIcon": "pi pi-folder-open",
  //         "collapsedIcon": "pi pi-folder",
  //         "children":
  //           [ {"label": this.t.tr('Оборудование'), "icon": "pi pi-tag", "data": "EQM"},
  //             {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}]
  //       },
  //       {
  //         "label": this.t.tr('Шлюпочное'),
  //         "data": "BOT",
  //         "expandedIcon": "pi pi-folder-open",
  //         "collapsedIcon": "pi pi-folder",
  //         "children":
  //           [ {"label": this.t.tr('Оборудование'), "icon": "pi pi-tag", "data": "EQM"},
  //             {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}]
  //       },
  //       {
  //         "label": this.t.tr('Рулевое'),
  //         "data": "STG",
  //         "expandedIcon": "pi pi-folder-open",
  //         "collapsedIcon": "pi pi-folder",
  //         "children":
  //           [ {"label": this.t.tr('Оборудование'), "icon": "pi pi-tag", "data": "EQM"},
  //             {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}]
  //       },
  //       {
  //         "label": this.t.tr('Люковое'),
  //         "data": "HAH",
  //         "expandedIcon": "pi pi-folder-open",
  //         "collapsedIcon": "pi pi-folder",
  //         "children":
  //           [ {"label": this.t.tr('Оборудование'), "icon": "pi pi-tag", "data": "EQM"},
  //             {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}]
  //       },
  //       {
  //         "label": this.t.tr('Мачтовое'),
  //         "data": "MST",
  //         "expandedIcon": "pi pi-folder-open",
  //         "collapsedIcon": "pi pi-folder",
  //         "children":
  //           [ {"label": this.t.tr('Оборудование'), "icon": "pi pi-tag", "data": "EQM"},
  //             {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}]
  //       },
  //       {
  //         "label": this.t.tr('Промысловое'),
  //         "data": "FSG",
  //         "expandedIcon": "pi pi-folder-open",
  //         "collapsedIcon": "pi pi-folder",
  //         "children":
  //           [ {"label": this.t.tr('Оборудование'), "icon": "pi pi-tag", "data": "EQM"},
  //             {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}]
  //       },
  //       {
  //         "label": this.t.tr('Прочее'),
  //         "data": "OTR",
  //         "expandedIcon": "pi pi-folder-open",
  //         "collapsedIcon": "pi pi-folder",
  //         "children":
  //           [ {"label": this.t.tr('Оборудование'), "icon": "pi pi-tag", "data": "EQM"},
  //             {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}]
  //       }]
  //   },
  //   {
  //     "label": this.t.tr('ОБОРУДОВАНИЕ ПОМЕЩЕНИЙ'),
  //     "data": "REQ",
  //     "expandedIcon": "pi pi-folder-open",
  //     "collapsedIcon": "pi pi-folder",
  //     "children": [{
  //       "label": this.t.tr('Изоляция'),
  //       "data": "IST",
  //       "expandedIcon": "pi pi-folder-open",
  //       "collapsedIcon": "pi pi-folder",
  //       "children":
  //         [ {"label": this.t.tr('Съемное'), "icon": "pi pi-tag", "data": "RMV"},
  //           {"label": this.t.tr('Приварное'), "icon": "pi pi-tag", "data": "WLD"},
  //           {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}]
  //     },
  //       {
  //         "label": this.t.tr('Зашивка'),
  //         "data": "LIN",
  //         "expandedIcon": "pi pi-folder-open",
  //         "collapsedIcon": "pi pi-folder",
  //         "children":
  //           [ {"label": this.t.tr('Съемное'), "icon": "pi pi-tag", "data": "RMV"},
  //             {"label": this.t.tr('Приварное'), "icon": "pi pi-tag", "data": "WLD"},
  //             {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}]
  //       },
  //       {
  //         "label": this.t.tr('Пол'),
  //         "data": "FLR",
  //         "expandedIcon": "pi pi-folder-open",
  //         "collapsedIcon": "pi pi-folder",
  //         "children":
  //           [ {"label": this.t.tr('Съемное'), "icon": "pi pi-tag", "data": "RMV"},
  //             {"label": this.t.tr('Приварное'), "icon": "pi pi-tag", "data": "WLD"},
  //             {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}]
  //       },
  //       {
  //         "label": this.t.tr('Дельные вещи'),
  //         "data": "PRT",
  //         "expandedIcon": "pi pi-folder-open",
  //         "collapsedIcon": "pi pi-folder",
  //         "children":
  //           [ {"label": this.t.tr('Съемное'), "icon": "pi pi-tag", "data": "RMV"},
  //             {"label": this.t.tr('Приварное'), "icon": "pi pi-tag", "data": "WLD"},
  //             {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}]
  //       },
  //       {
  //         "label": this.t.tr('Мебель'),
  //         "data": "FRT",
  //         "expandedIcon": "pi pi-folder-open",
  //         "collapsedIcon": "pi pi-folder",
  //         "children":
  //           [ {"label": this.t.tr('Съемное'), "icon": "pi pi-tag", "data": "RMV"},
  //             {"label": this.t.tr('Приварное'), "icon": "pi pi-tag", "data": "WLD"},
  //             {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}]
  //       },
  //       {
  //         "label": this.t.tr('Оборудование, техника'),
  //         "data": "THN",
  //         "expandedIcon": "pi pi-folder-open",
  //         "collapsedIcon": "pi pi-folder",
  //         "children":
  //           [ {"label": this.t.tr('Съемное'), "icon": "pi pi-tag", "data": "RMV"},
  //             {"label": this.t.tr('Приварное'), "icon": "pi pi-tag", "data": "WLD"},
  //             {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}]
  //       },
  //       {
  //         "label": this.t.tr('Инвентарное имущество'),
  //         "data": "INV",
  //         "expandedIcon": "pi pi-folder-open",
  //         "collapsedIcon": "pi pi-folder",
  //         "children":
  //           [ {"label": this.t.tr('Съемное'), "icon": "pi pi-tag", "data": "RMV"},
  //             {"label": this.t.tr('Приварное'), "icon": "pi pi-tag", "data": "WLD"},
  //             {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}]
  //       },
  //       {
  //         "label": this.t.tr('Аварийно спасательное и противопожарное имущество'),
  //         "data": "RFE",
  //         "expandedIcon": "pi pi-folder-open",
  //         "collapsedIcon": "pi pi-folder",
  //         "children":
  //           [ {"label": this.t.tr('Съемное'), "icon": "pi pi-tag", "data": "RMV"},
  //             {"label": this.t.tr('Приварное'), "icon": "pi pi-tag", "data": "WLD"},
  //             {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}]
  //       },
  //       {
  //         "label": this.t.tr('Прочее'),
  //         "data": "OTR",
  //         "expandedIcon": "pi pi-folder-open",
  //         "collapsedIcon": "pi pi-folder",
  //         "children":
  //           [ {"label": this.t.tr('Съемное'), "icon": "pi pi-tag", "data": "RMV"},
  //             {"label": this.t.tr('Приварное'), "icon": "pi pi-tag", "data": "WLD"},
  //             {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}]
  //       },
  //     ]
  //   },
  //   {
  //     "label": this.t.tr('СУДОВЫЕ СИСТЕМЫ'),
  //     "data": "SYS",
  //     "expandedIcon": "pi pi-folder-open",
  //     "collapsedIcon": "pi pi-folder",
  //     "children": [
  //       {
  //         "label": this.t.tr('Арматура'),
  //         "data": "FIT",
  //         "expandedIcon": "pi pi-folder-open",
  //         "collapsedIcon": "pi pi-folder",
  //         "children":
  //           [{
  //             "label": this.t.tr('Ручная'),
  //             "data": "H",
  //             "expandedIcon": "pi pi-folder-open",
  //             "collapsedIcon": "pi pi-folder",
  //             "children": [
  //               {"label": this.t.tr('Сталь'), "icon": "pi pi-tag", "data": "STL"},
  //               {"label": this.t.tr('Бронза'), "icon": "pi pi-tag", "data": "BRZ"},
  //               {"label": this.t.tr('Нержавеющая сталь'), "icon": "pi pi-tag", "data": "SST"},
  //               {"label": this.t.tr('Пластик'), "icon": "pi pi-tag", "data": "PLS"},
  //               {"label": this.t.tr('Комбинированный материал'), "icon": "pi pi-tag", "data": "CMD"},
  //               {"label": this.t.tr('Медно-никелевая (МНЖ)'), "icon": "pi pi-tag", "data": "CNK"},
  //               {"label": this.t.tr('Медь'), "icon": "pi pi-tag", "data": "CPR"},
  //               {"label": this.t.tr('Латунь'), "icon": "pi pi-tag", "data": "BRS"},
  //               {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}
  //             ]
  //           },
  //             {
  //               "label": this.t.tr('Дистанционная'),
  //               "data": "R",
  //               "expandedIcon": "pi pi-folder-open",
  //               "collapsedIcon": "pi pi-folder",
  //               "children": [
  //                 {"label": this.t.tr('Сталь'), "icon": "pi pi-tag", "data": "STL"},
  //                 {"label": this.t.tr('Бронза'), "icon": "pi pi-tag", "data": "BRZ"},
  //                 {"label": this.t.tr('Нержавеющая сталь'), "icon": "pi pi-tag", "data": "SST"},
  //                 {"label": this.t.tr('Пластик'), "icon": "pi pi-tag", "data": "PLS"},
  //                 {"label": this.t.tr('Комбинированный материал'), "icon": "pi pi-tag", "data": "CMD"},
  //                 {"label": this.t.tr('Медно-никелевая (МНЖ)'), "icon": "pi pi-tag", "data": "CNK"},
  //                 {"label": this.t.tr('Медь'), "icon": "pi pi-tag", "data": "CPR"},
  //                 {"label": this.t.tr('Латунь'), "icon": "pi pi-tag", "data": "BRS"},
  //                 {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}
  //               ]
  //             },
  //             {
  //               "label": this.t.tr('Автоматическая'),
  //               "data": "A",
  //               "expandedIcon": "pi pi-folder-open",
  //               "collapsedIcon": "pi pi-folder",
  //               "children": [
  //                 {"label": this.t.tr('Сталь'), "icon": "pi pi-tag", "data": "STL"},
  //                 {"label": this.t.tr('Бронза'), "icon": "pi pi-tag", "data": "BRZ"},
  //                 {"label": this.t.tr('Нержавеющая сталь'), "icon": "pi pi-tag", "data": "SST"},
  //                 {"label": this.t.tr('Пластик'), "icon": "pi pi-tag", "data": "PLS"},
  //                 {"label": this.t.tr('Комбинированный материал'), "icon": "pi pi-tag", "data": "CMD"},
  //                 {"label": this.t.tr('Медно-никелевая (МНЖ)'), "icon": "pi pi-tag", "data": "CNK"},
  //                 {"label": this.t.tr('Медь'), "icon": "pi pi-tag", "data": "CPR"},
  //                 {"label": this.t.tr('Латунь'), "icon": "pi pi-tag", "data": "BRS"},
  //                 {"label": this.t.tr('Прочее'), "icon": "pi pi-tag", "data": "OTR"}
  //               ]
  //             },
  //           ]
  //       },
  //       {
  //         "label": this.t.tr('Фасонные части (часть трубы)'),
  //         "data": "PART",
  //         "expandedIcon": "pi pi-folder-open",
  //         "collapsedIcon": "pi pi-folder",
  //       },
  //       {
  //         "label": this.t.tr('Изоляция труб'),
  //         "data": "PIL",
  //         "expandedIcon": "pi pi-folder-open",
  //         "collapsedIcon": "pi pi-folder",
  //       },
  //       {
  //         "label": this.t.tr('Насос'),
  //         "data": "PUMP",
  //         "expandedIcon": "pi pi-folder-open",
  //         "collapsedIcon": "pi pi-folder",
  //       },
  //       {
  //         "label": this.t.tr('Вентиляция и кондиционирование'),
  //         "data": "VENT",
  //         "expandedIcon": "pi pi-folder-open",
  //         "collapsedIcon": "pi pi-folder",
  //       },
  //       {
  //         "label": this.t.tr('Механическое оборудование'),
  //         "data": "MEQP",
  //         "expandedIcon": "pi pi-folder-open",
  //         "collapsedIcon": "pi pi-folder",
  //       },
  //       {
  //         "label": this.t.tr('Контрольно-измерительные приборы'),
  //         "data": "CMIT",
  //         "expandedIcon": "pi pi-folder-open",
  //         "collapsedIcon": "pi pi-folder",
  //         "children":
  //           [{
  //             "label": this.t.tr('Давление'),
  //             "data": "PRS",
  //             "expandedIcon": "pi pi-folder-open",
  //             "collapsedIcon": "pi pi-folder",
  //           },
  //             {
  //               "label": this.t.tr('Температура'),
  //               "data": "TMP",
  //               "expandedIcon": "pi pi-folder-open",
  //               "collapsedIcon": "pi pi-folder",
  //             },
  //             {
  //               "label": this.t.tr('Уровень'),
  //               "data": "LYR",
  //               "expandedIcon": "pi pi-folder-open",
  //               "collapsedIcon": "pi pi-folder",
  //             },
  //             {
  //               "label": this.t.tr('Прочее'),
  //               "data": "OTR",
  //               "expandedIcon": "pi pi-folder-open",
  //               "collapsedIcon": "pi pi-folder",
  //             },
  //           ]
  //       },
  //
  //     ]
  //   },
  //   {
  //     "label": this.t.tr('ЭНЕРГЕТИЧЕСКАЯ УСТАНОВКА'),
  //     "data": "PWP",
  //     "expandedIcon": "pi pi-folder-open",
  //     "collapsedIcon": "pi pi-folder",
  //     "children": [
  //       {
  //         "label": this.t.tr('Оборудование'),
  //         "data": "EQM",
  //         "expandedIcon": "pi pi-folder-open",
  //         "collapsedIcon": "pi pi-folder",
  //       },
  //
  //     ]
  //   },
  //   {
  //     "label": this.t.tr('ЭЛЕКТРИЧЕСКОЕ ОБОРУДОВАНИЕ'),
  //     "data": "EEQ",
  //     "expandedIcon": "pi pi-folder-open",
  //     "collapsedIcon": "pi pi-folder",
  //     "children": [
  //       {
  //         "label": this.t.tr('Источники электрической энергии'),
  //         "data": "SRC",
  //         "expandedIcon": "pi pi-folder-open",
  //         "collapsedIcon": "pi pi-folder",
  //         "children": [
  //           {"label": this.t.tr('Генератор'), "icon": "pi pi-tag", "data": "SRC"},
  //           {"label": this.t.tr('Трансформатор'), "icon": "pi pi-tag", "data": "SRC"},
  //           {"label": this.t.tr('Преобразователь напряжения'), "icon": "pi pi-tag", "data": "SRC"},
  //           {"label": this.t.tr('Аккумуляторная батарея'), "icon": "pi pi-tag", "data": "SRC"},
  //           {"label": this.t.tr('Щит питания и управления'), "icon": "pi pi-tag", "data": "SRC"},
  //         ]
  //       },
  //       {
  //         "label": this.t.tr('Коробки соединительные, розетки, выключатели, штепсели'),
  //         "data": "MGA",
  //         "expandedIcon": "pi pi-folder-open",
  //         "collapsedIcon": "pi pi-folder",
  //       },
  //       {
  //         "label": this.t.tr('Навигационное оборудование'),
  //         "data": "NAV",
  //         "expandedIcon": "pi pi-folder-open",
  //         "collapsedIcon": "pi pi-folder",
  //       },
  //       {
  //         "label": this.t.tr('Оборудование радиосвязи'),
  //         "data": "RAD",
  //         "expandedIcon": "pi pi-folder-open",
  //         "collapsedIcon": "pi pi-folder",
  //       },
  //       {
  //         "label": this.t.tr('Освещение'),
  //         "data": "LGT",
  //         "expandedIcon": "pi pi-folder-open",
  //         "collapsedIcon": "pi pi-folder",
  //       },
  //       {
  //         "label": this.t.tr('Автоматизация'),
  //         "data": "AUT",
  //         "expandedIcon": "pi pi-folder-open",
  //         "collapsedIcon": "pi pi-folder",
  //       },
  //       {
  //         "label": this.t.tr('Сигнализация'),
  //         "data": "SGN",
  //         "expandedIcon": "pi pi-folder-open",
  //         "collapsedIcon": "pi pi-folder",
  //       },
  //       {
  //         "label": this.t.tr('Электрообогрев'),
  //         "data": "HTN",
  //         "expandedIcon": "pi pi-folder-open",
  //         "collapsedIcon": "pi pi-folder",
  //       },
  //       {
  //         "label": this.t.tr('Сигнальные средства'),
  //         "data": "SLМ",
  //         "expandedIcon": "pi pi-folder-open",
  //         "collapsedIcon": "pi pi-folder",
  //       },
  //       {
  //         "label": this.t.tr('Защита от коррозии'),
  //         "data": "CRS",
  //         "expandedIcon": "pi pi-folder-open",
  //         "collapsedIcon": "pi pi-folder",
  //       },
  //       {
  //         "label": this.t.tr('Специальное оборудование (рыбопоисковое и т.п.)'),
  //         "data": "SPC",
  //         "expandedIcon": "pi pi-folder-open",
  //         "collapsedIcon": "pi pi-folder",
  //       },
  //       {
  //         "label": this.t.tr('Прочее'),
  //         "data": "OTR",
  //         "expandedIcon": "pi pi-folder-open",
  //         "collapsedIcon": "pi pi-folder",
  //       },
  //       {
  //         "label": this.t.tr('Кабели'),
  //         "data": "CAB",
  //         "expandedIcon": "pi pi-folder-open",
  //         "collapsedIcon": "pi pi-folder",
  //         "children": [
  //           {"label": this.t.tr('Кабель в поставке'), "icon": "pi pi-tag", "data": "SUP"},
  //           {"label": this.t.tr('Кабель завод-строитель'), "icon": "pi pi-tag", "data": "YRD"},
  //         ]
  //       },
  //     ]
  //   },
  //   {
  //     "label": this.t.tr('МСЧ'),
  //     "data": "ENP",
  //     "expandedIcon": "pi pi-folder-open",
  //     "collapsedIcon": "pi pi-folder",
  //   },
  // ];
  nodes: any = [];
  layers: any = [];
  materials: any [] = [];
  materialsSrc: any [] = [];
  selectedNode: any;
  selectedNodePath = '';
  selectedNodeCode = '';
  tooltips: string[] = [];
  projects: string[] = ['200101', '210101'];
  project = '';
  selectedMaterial: Material = new Material();
  items = [
    {
      label: 'New Folder',
      icon: 'pi pi-fw pi-plus',
      command: (event: any) => this.createNode(event.item)
    },
  ];
  addNew = false;
  newNode: any = {};


  constructor(public t: LanguageService, private materialManager: MaterialManagerService, private messageService: MessageService, private dialogService: DialogService, public auth: AuthManagerService) { }

  ngOnInit(): void {
    //this.projects = this.projects.filter(x => this.auth.getUser().visible_projects.includes(x));
    this.project = this.projects[0];
    this.materialManager.getMaterials(this.project).then(res => {
      this.materials = res;
      this.materialsSrc = res;
      this.materialManager.getMaterialNodes().then(res => {
        this.nodes = this.getNodes(res, this.materialsSrc, '');
        this.setParents(this.nodes, '');
      });
    });
  }
  createNode(node: any){
    this.addNew = true;
    this.newNode = {};
    this.newNode.data = node.data + '###';
    this.newNode.label = node.label;
    this.newNode.check = node.data;
    this.newNode.checkChildren = node.children.map((x: any) => x.data);

    console.log(this.newNode);
  }
  getNodes(rootNodes: MaterialNode[], materials: Material[], parent: string = ''){
    let res: any[] = [];
    rootNodes.filter(x => x.data.length == parent.length + 3 && x.data.startsWith(parent)).forEach(n => {
      res.push({
        data: n.data,
        children: this.getNodes(rootNodes, materials, n.data),
        label: n.label,
        count: materials.filter(x => x.code.startsWith(n.data)).length
      });
    });
    return res;
  }
  setParents(nodes: any[], parent: any){
    nodes.forEach(node => {
      node.parent = parent;
      node.expandedIcon = 'pi pi-folder-open';
      node.collapsedIcon = 'pi pi-folder';
      node.icon = (node.children.length == 0) ? 'pi pi-tag' : '';
      this.setParents(node.children, node);
    });
  }
  getNodePath(node: any){
    let parent = node.parent;
    let res = node.label;
    while (parent != null){
      res = parent.label + "/" + res;
      parent = parent.parent;
    }
    return res;
  }
  getNodeCode(node: any){
    let parent = node.parent;
    let res = node.data;
    while (parent != null){
      res = parent.data + res;
      parent = parent.parent;
    }
    return res;
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
  addCountToNode(node: any){
    let parent = node.parent;
    node.count++;
    while (parent != null){
      parent.count++;
      parent = parent.parent;
    }
  }
  addMaterial(action: string = 'add', material: Material = new Material()) {
    if (action == 'add'){
      material.projects = [this.project];
    }
    this.dialogService.open(AddMaterialComponent, {
      showHeader: true,
      header: action.replace('add', 'Добавление материала').replace('edit', 'Редактирование матерала').replace('clone', 'Клонирование материала'),
      modal: true,
      closable: true,
      data: [this.projects, material, action, this.materialsSrc, this.selectedNodeCode]
    }).onClose.subscribe(res => {
      if (res != null && res.code != ''){
        let findMaterial = this.materials.find(x => x.id == res.id);
        if (findMaterial != null){
          this.materialsSrc[this.materialsSrc.indexOf(findMaterial)] = res;
          this.materials = [...this.materialsSrc];
        }
        else{
          this.materialsSrc.push(res);
          this.materials = [...this.materialsSrc];
          this.addCountToNode(this.selectedNode);
        }
      }
      this.selectNode();
    });
  }

  selectNode() {
    if (this.selectedNode != null){
      this.selectedNodePath = this.getNodePath(this.selectedNode);
      //this.selectedNodeCode = this.getNodeCode(this.selectedNode);
      this.selectedNodeCode = this.selectedNode.data;
      this.materials = this.materialsSrc.filter(x => x.code.startsWith(this.selectedNodeCode));
    }
  }

  test(material: any) {
    console.log(material);
  }

  selectMaterial(material: any) {
    this.selectedMaterial = material;
  }

  deleteMaterial(selectedMaterial: Material) {
    let selected = this.selectedNode.data;
    this.dialogService.open(RemoveConfirmationComponent, {
      showHeader: false,
      modal: true,
    }).onClose.subscribe(res => {
      if (res == 'success'){
        this.materialManager.updateMaterial(selectedMaterial, this.auth.getUser().login, 1).then(res => {
          let findMaterial = this.materialsSrc.find(x => x == selectedMaterial);
          if (findMaterial != null){
            this.materialsSrc.splice(this.materialsSrc.indexOf(findMaterial), 1);
          }
          this.materials = [...this.materialsSrc];
          this.refreshNodes(this.nodes, this.materials, '');
          this.selectNode();
          // this.materialManager.getMaterialNodes().then(res => {
          //   this.nodes = this.getNodes(res, this.materialsSrc);
          //   this.setParents(this.nodes, '');
          //   this.selectPathNode(selected, this.nodes);
          // });
        });
      }
    });
  }
  refreshNodes(rootNodes: any[], materials: Material[], parent: string = ''){
    rootNodes.filter(x => x.data.length == parent.length + 3 && x.data.startsWith(parent)).forEach(n => {
      n.count = materials.filter(x => x.code.startsWith(n.data)).length;
      this.refreshNodes(n.children, materials, n.data);
    });
  }
  cloneMaterial(material: Material) {
    let newMaterial = JSON.parse(JSON.stringify(material));
    newMaterial.id = Material.generateId();
    this.addMaterial('clone', newMaterial);
  }

  contextMenu(event: any, contextMenu: ContextMenu) {
    if (event.node.data.length >= 12){
      this.items = [
        this.materials.filter(x => x.code.startsWith(event.node.data)).length > 0 ? {
          label: 'Remove',
          icon: 'pi pi-fw pi-trash',
          command: () => this.alertNodeContains()
        } : {
          label: 'Remove',
          icon: 'pi pi-fw pi-trash',
          command: () => this.removeNode(event.node)
        }
      ];
    }
    this.items = [
      {
        label: 'New Folder',
        icon: 'pi pi-fw pi-plus',
        command: () => this.createNode(event.node)
      },
      this.materials.filter(x => x.code.startsWith(event.node.data)).length > 0 ? {
        label: 'Remove',
        icon: 'pi pi-fw pi-trash',
        command: (event: any) => this.alertNodeContains()
      } : {
        label: 'Remove',
        icon: 'pi pi-fw pi-trash',
        command: () => this.removeNode(event.node)
      }
    ];
  }

  hide() {
    this.newNode = {};
    this.addNew = false;
  }

  isSaveDisabled() {
    return (this.newNode.data.length != (this.newNode.check.length + 3)) || this.newNode.checkChildren.includes(this.newNode.data) || this.newNode.label == '' || !(new RegExp('^[A-Z]+$').test(this.newNode.data)) || this.newNode.data.includes('#');
  }

  save() {
    this.materialManager.updateMaterialNode(this.newNode.data, this.newNode.label, this.auth.getUser().login, 0).then(resStatus => {
      this.materialManager.getMaterialNodes().then(res => {
        this.nodes = this.getNodes(res, this.materialsSrc, '');
        this.setParents(this.nodes, '');
        this.hide();
      });
    });
  }

  removeNode(node: any) {
    this.materialManager.updateMaterialNode(node.data, node.label, this.auth.getUser().login, 1).then(resStatus => {
      this.materialManager.getMaterialNodes().then(res => {
        this.nodes = this.getNodes(res, this.materialsSrc, '');
        this.setParents(this.nodes, '');
      });
    });
  }

  alertNodeContains(){
    this.messageService.add({key:'task', severity:'error', summary:'Folder is not empty', detail:'Cant delete non empty folder'});
  }
}
