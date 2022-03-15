import { Component, OnInit } from '@angular/core';
import {MaterialManagerService} from "../../domain/material-manager.service";
import {MessageService} from "primeng/api";
import {DialogService} from "primeng/dynamicdialog";
import {LanguageService} from "../../domain/language.service";

@Component({
  selector: 'app-materials',
  templateUrl: './materials.component.html',
  styleUrls: ['./materials.component.css']
})
export class MaterialsComponent implements OnInit {
  search: string = '';

  nodes =  [
    {
      "label": "HULL",
      "data": "HUL",
      "expandedIcon": "pi pi-folder-open",
      "collapsedIcon": "pi pi-folder",
      "children": [{
        "label": "Plate",
        "data": "HUL",
        "expandedIcon": "pi pi-folder-open",
        "collapsedIcon": "pi pi-folder",
      },
        {
          "label": "Profile",
          "data": "HUL",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        }]
    },
    {
      "label": "MATERIAL",
      "data": "MTL",
      "expandedIcon": "pi pi-folder-open",
      "collapsedIcon": "pi pi-folder",
      "children": [{
        "label": "Pipes",
        "data": "PIP MTL",
        "expandedIcon": "pi pi-folder-open",
        "collapsedIcon": "pi pi-folder",
        "children":
          [ {"label": "Steel", "icon": "pi pi-tag", "data": "STL PIP MTL"},
            {"label": "Aluminium", "icon": "pi pi-tag", "data": "ALM PIP MTL"},
            {"label": "Bronze", "icon": "pi pi-tag", "data": "BRZ PIP MTL"},
            {"label": "Stainless steel", "icon": "pi pi-tag", "data": "SST PIP MTL"},
            {"label": "Plastic", "icon": "pi pi-tag", "tag": "PLS PIP MTL"},
            {"label": "Combined material", "icon": "pi pi-tag", "data": "CMD PIP MTL"},
            {"label": "Cupro-nickel steel", "icon": "pi pi-tag", "data": "CNK PIP MTL"},
            {"label": "Cuprum", "icon": "pi pi-tag", "data": "CPR PIP MTL"},
            {"label": "Brass", "icon": "pi pi-tag", "data": "BRS PIP MTL"},
            {"label": "Other", "icon": "pi pi-tag", "data": "OTR PIP MTL"}]
      },
        {
          "label": "Fasteners",
          "data": "FSN MTL",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": "Steel", "icon": "pi pi-tag", "data": "STL FSN MTL"},
              {"label": "Aluminium", "icon": "pi pi-tag", "data": "ALM FSN MTL"},
              {"label": "Bronze", "icon": "pi pi-tag", "data": "BRZ FSN MTL"},
              {"label": "Stainless steel", "icon": "pi pi-tag", "data": "SST FSN MTL"},
              {"label": "Plastic", "icon": "pi pi-tag", "data": "PLS FSN MTL"},
              {"label": "Combined material", "icon": "pi pi-tag", "data": "CMD FSN MTL"},
              {"label": "Cupro-nickel steel", "icon": "pi pi-tag", "data": "CNK FSN MTL"},
              {"label": "Cuprum", "icon": "pi pi-tag", "data": "CPR FSN MTL"},
              {"label": "Brass", "icon": "pi pi-tag", "data": "BRS FSN MTL"},
              {"label": "Other", "icon": "pi pi-tag", "data": "OTR FSN MTL"}]
        },
        {
          "label": "Welding consumables",
          "data": "WLD MTL",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": "Steel", "icon": "pi pi-tag", "data": "STL WLD MTL"},
              {"label": "Aluminium", "icon": "pi pi-tag", "data": "ALM WLD MTL"},
              {"label": "Bronze", "icon": "pi pi-tag", "data": "BRZ WLD MTL"},
              {"label": "Stainless steel", "icon": "pi pi-tag", "data": "SST WLD MTL"},
              {"label": "Plastic", "icon": "pi pi-tag", "data": "PLS WLD MTL"},
              {"label": "Combined material", "icon": "pi pi-tag", "data": "CMD WLD MTL"},
              {"label": "Cupro-nickel steel", "icon": "pi pi-tag", "data": "CNK WLD MTL"},
              {"label": "Cuprum", "icon": "pi pi-tag", "data": "CPR WLD MTL"},
              {"label": "Brass", "icon": "pi pi-tag", "data": "BRS WLD MTL"},
              {"label": "Other", "icon": "pi pi-tag", "data": "OTR WLD MTL"}]
        },
        {
          "label": "Lumber",
          "data": "LMB MTL",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": "Steel", "icon": "pi pi-tag", "data": "STL LMB MTL"},
              {"label": "Aluminium", "icon": "pi pi-tag", "data": "ALM LMB MTL"},
              {"label": "Bronze", "icon": "pi pi-tag", "data": "BRZ LMB MTL"},
              {"label": "Stainless steel", "icon": "pi pi-tag", "data": "SST LMB MTL"},
              {"label": "Plastic", "icon": "pi pi-tag", "data": "PLS LMB MTL"},
              {"label": "Combined material", "icon": "pi pi-tag", "data": "CMD LMB MTL"},
              {"label": "Cupro-nickel steel", "icon": "pi pi-tag", "data": "CNK LMB MTL"},
              {"label": "Cuprum", "icon": "pi pi-tag", "data": "CPR LMB MTL"},
              {"label": "Brass", "icon": "pi pi-tag", "data": "BRS LMB MTL"},
              {"label": "Other", "icon": "pi pi-tag", "data": "OTR LMB MTL"}]
        },
        {
          "label": "Technological",
          "data": "THL MTL",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": "Steel", "icon": "pi pi-tag", "data": "STL THL MTL"},
              {"label": "Aluminium", "icon": "pi pi-tag", "data": "ALM THL MTL"},
              {"label": "Bronze", "icon": "pi pi-tag", "data": "BRZ THL MTL"},
              {"label": "Stainless steel", "icon": "pi pi-tag", "data": "SST THL MTL"},
              {"label": "Plastic", "icon": "pi pi-tag", "data": "PLS THL MTL"},
              {"label": "Combined material", "icon": "pi pi-tag", "data": "CMD THL MTL"},
              {"label": "Cupro-nickel steel", "icon": "pi pi-tag", "data": "CNK THL MTL"},
              {"label": "Cuprum", "icon": "pi pi-tag", "data": "CPR THL MTL"},
              {"label": "Brass", "icon": "pi pi-tag", "data": "BRS THL MTL"},
              {"label": "Other", "icon": "pi pi-tag", "data": "OTR THL MTL"}]
        },
        {
          "label": "Other",
          "data": "OTR MTL",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": "Steel", "icon": "pi pi-tag", "data": "STL OTR MTL"},
              {"label": "Aluminium", "icon": "pi pi-tag", "data": "ALM OTR MTL"},
              {"label": "Bronze", "icon": "pi pi-tag", "data": "BRZ OTR MTL"},
              {"label": "Stainless steel", "icon": "pi pi-tag", "data": "SST OTR MTL"},
              {"label": "Plastic", "icon": "pi pi-tag", "data": "PLS OTR MTL"},
              {"label": "Combined material", "icon": "pi pi-tag", "data": "CMD OTR MTL"},
              {"label": "Cupro-nickel steel", "icon": "pi pi-tag", "data": "CNK OTR MTL"},
              {"label": "Cuprum", "icon": "pi pi-tag", "data": "CPR OTR MTL"},
              {"label": "Brass", "icon": "pi pi-tag", "data": "BRS OTR MTL"},
              {"label": "Other", "icon": "pi pi-tag", "data": "OTR OTR MTL"}]
        }]
    },
    {
      "label": "SHIP EQUIPMENT",
      "data": "MRG",
      "expandedIcon": "pi pi-folder-open",
      "collapsedIcon": "pi pi-folder",
      "children": [{
        "label": "Anchor",
        "data": "ANR SEQ",
        "expandedIcon": "pi pi-folder-open",
        "collapsedIcon": "pi pi-folder",
        "children":
          [ {"label": "Equipment", "icon": "pi pi-tag", "data": "EQM ANR SEQ"},
            {"label": "Other", "icon": "pi pi-tag", "data": "OTR ANR SEQ"}]
      },
        {
          "label": "Mooring",
          "data": "MRG SEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": "Equipment", "icon": "pi pi-tag", "data": "EQM MRG SEQ"},
              {"label": "Other", "icon": "pi pi-tag", "data": "OTR MRG SEQ"}]
        },
        {
          "label": "Towing",
          "data": "TWG SEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": "Equipment", "icon": "pi pi-tag", "data": "EQM TWG SEQ"},
              {"label": "Other", "icon": "pi pi-tag", "data": "OTR TWG SEQ"}]
        },
        {
          "label": "Anchor-mooring",
          "data": "AMG SEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": "Equipment", "icon": "pi pi-tag", "data": "EQM AMG SEQ"},
              {"label": "Other", "icon": "pi pi-tag", "data": "OTR AMG SEQ"}]
        },
        {
          "label": "Cargo",
          "data": "CRG SEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": "Equipment", "icon": "pi pi-tag", "data": "EQM CRG SEQ"},
              {"label": "Other", "icon": "pi pi-tag", "data": "OTR CRG SEQ"}]
        },
        {
          "label": "Rescue",
          "data": "RSC SEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": "Equipment", "icon": "pi pi-tag", "data": "EQM RSC SEQ"},
              {"label": "Other", "icon": "pi pi-tag", "data": "OTR RSC SEQ"}]
        },
        {
          "label": "Boat",
          "data": "BOT SEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": "Equipment", "icon": "pi pi-tag", "data": "EQM BOT SEQ"},
              {"label": "Other", "icon": "pi pi-tag", "data": "OTR BOT SEQ"}]
        },
        {
          "label": "Steering",
          "data": "STG SEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": "Equipment", "icon": "pi pi-tag", "data": "EQM STG SEQ"},
              {"label": "Other", "icon": "pi pi-tag", "data": "OTR STG SEQ"}]
        },
        {
          "label": "Hatch",
          "data": "HAH SEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": "Equipment", "icon": "pi pi-tag", "data": "EQM HAH SEQ"},
              {"label": "Other", "icon": "pi pi-tag", "data": "OTR HAH SEQ"}]
        },
        {
          "label": "Mast",
          "data": "MST SEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": "Equipment", "icon": "pi pi-tag", "data": "EQM MST SEQ"},
              {"label": "Other", "icon": "pi pi-tag", "data": "OTR MST SEQ"}]
        },
        {
          "label": "Fishing",
          "data": "FSG SEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": "Equipment", "icon": "pi pi-tag", "data": "EQM FSG SEQ"},
              {"label": "Other", "icon": "pi pi-tag", "data": "OTR FSG SEQ"}]
        },
        {
          "label": "Other",
          "data": "OTR SEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": "Equipment", "icon": "pi pi-tag", "data": "EQM OTR SEQ"},
              {"label": "Other", "icon": "pi pi-tag", "data": "OTR OTR SEQ"}]
        }]
    },
    {
      "label": "ROOM EQUIPMENT",
      "data": "REQ",
      "expandedIcon": "pi pi-folder-open",
      "collapsedIcon": "pi pi-folder",
      "children": [{
        "label": "Insulation",
        "data": "IST REQ",
        "expandedIcon": "pi pi-folder-open",
        "collapsedIcon": "pi pi-folder",
        "children":
          [ {"label": "Equipment", "icon": "pi pi-tag", "data": "EQM IST REQ"},
            {"label": "Component", "icon": "pi pi-tag", "data": "CMP IST REQ"},
            {"label": "Hardware", "icon": "pi pi-tag", "data": "HWR IST REQ"},
            {"label": "Other", "icon": "pi pi-tag", "data": "OTR IST REQ"}]
      },
        {
          "label": "Pipe insulation",
          "data": "PIL REQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": "Equipment", "icon": "pi pi-tag", "data": "EQM PIL REQ"},
              {"label": "Component", "icon": "pi pi-tag", "data": "CMP PIL REQ"},
              {"label": "Hardware", "icon": "pi pi-tag", "data": "HWR PIL REQ"},
              {"label": "Other", "icon": "pi pi-tag", "data": "OTR PIL REQ"}]
        },
        {
          "label": "Lining",
          "data": "LIN REQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": "Equipment", "icon": "pi pi-tag", "data": "EQM LIN REQ"},
              {"label": "Component", "icon": "pi pi-tag", "data": "CMP LIN REQ"},
              {"label": "Hardware", "icon": "pi pi-tag", "data": "HWR LIN REQ"},
              {"label": "Other", "icon": "pi pi-tag", "data": "OTR LIN REQ"}]
        },
        {
          "label": "Practical things",
          "data": "PRT REQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": "Equipment", "icon": "pi pi-tag", "data": "EQM PRT REQ"},
              {"label": "Component", "icon": "pi pi-tag", "data": "CMP PRT REQ"},
              {"label": "Hardware", "icon": "pi pi-tag", "data": "HWR PRT REQ"},
              {"label": "Other", "icon": "pi pi-tag", "data": "OTR PRT REQ"}]
        },
        {
          "label": "Furniture",
          "data": "FRT REQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": "Equipment", "icon": "pi pi-tag", "data": "EQM FRT REQ"},
              {"label": "Component", "icon": "pi pi-tag", "data": "CMP FRT REQ"},
              {"label": "Hardware", "icon": "pi pi-tag", "data": "HWR FRT REQ"},
              {"label": "Other", "icon": "pi pi-tag", "data": "OTR FRT REQ"}]
        },
        {
          "label": "Technique",
          "data": "THN REQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": "Equipment", "icon": "pi pi-tag", "data": "EQM THN REQ"},
              {"label": "Component", "icon": "pi pi-tag", "data": "CMP THN REQ"},
              {"label": "Hardware", "icon": "pi pi-tag", "data": "HWR THN REQ"},
              {"label": "Other", "icon": "pi pi-tag", "data": "OTR THN REQ"}]
        },
        {
          "label": "Inventory property",
          "data": "INV REQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": "Equipment", "icon": "pi pi-tag", "data": "EQM INV REQ"},
              {"label": "Component", "icon": "pi pi-tag", "data": "CMP INV REQ"},
              {"label": "Hardware", "icon": "pi pi-tag", "data": "HWR INV REQ"},
              {"label": "Other", "icon": "pi pi-tag", "data": "OTR INV REQ"}]
        },
        {
          "label": "Rescue and fire fighting equipment",
          "data": "RFE REQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": "Equipment", "icon": "pi pi-tag", "data": "EQM RFE REQ"},
              {"label": "Component", "icon": "pi pi-tag", "data": "CMP RFE REQ"},
              {"label": "Hardware", "icon": "pi pi-tag", "data": "HWR RFE REQ"},
              {"label": "Other", "icon": "pi pi-tag", "data": "OTR RFE REQ"}]
        },
        {
          "label": "Other",
          "data": "OTR REQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": "Equipment", "icon": "pi pi-tag", "data": "EQM OTR REQ"},
              {"label": "Component", "icon": "pi pi-tag", "data": "CMP OTR REQ"},
              {"label": "Hardware", "icon": "pi pi-tag", "data": "HWR OTR REQ"},
              {"label": "Other", "icon": "pi pi-tag", "data": "OTR OTR REQ"}]
        },



      ]
    },
    {
      "label": "SHIP SYSTEMS",
      "data": "SYS",
      "expandedIcon": "pi pi-folder-open",
      "collapsedIcon": "pi pi-folder",
      "children": [
        {
        "label": "Fittings",
        "data": "FIT SYS",
        "expandedIcon": "pi pi-folder-open",
        "collapsedIcon": "pi pi-folder",
        "children":
          [{
            "label": "Hand",
            "data": "H FIT SYS",
            "expandedIcon": "pi pi-folder-open",
            "collapsedIcon": "pi pi-folder",
            "children": [
              {"label": "Steel", "icon": "pi pi-tag", "data": "STL H FIT SYS"},
              {"label": "Bronze", "icon": "pi pi-tag", "data": "BRZ H FIT SYS"},
              {"label": "Stainless steel", "icon": "pi pi-tag", "data": "SST H FIT SYS"},
              {"label": "Plastic", "icon": "pi pi-tag", "data": "PLS H FIT SYS"},
              {"label": "Combined material", "icon": "pi pi-tag", "data": "CMD H FIT SYS"},
              {"label": "Cupro-nickel steel", "icon": "pi pi-tag", "data": "CNK H FIT SYS"},
              {"label": "Cuprum", "icon": "pi pi-tag", "data": "CPR H FIT SYS"},
              {"label": "Brass", "icon": "pi pi-tag", "data": "BRS H FIT SYS"},
              {"label": "Other", "icon": "pi pi-tag", "data": "OTR H FIT SYS"}
            ]
          },
            {
              "label": "Remote",
              "data": "R FIT SYS",
              "expandedIcon": "pi pi-folder-open",
              "collapsedIcon": "pi pi-folder",
              "children": [
                {"label": "Steel", "icon": "pi pi-tag", "data": "STL R FIT SYS"},
                {"label": "Bronze", "icon": "pi pi-tag", "data": "BRZ R FIT SYS"},
                {"label": "Stainless steel", "icon": "pi pi-tag", "data": "SST R FIT SYS"},
                {"label": "Plastic", "icon": "pi pi-tag", "data": "PLS R FIT SYS"},
                {"label": "Combined material", "icon": "pi pi-tag", "data": "CMD R FIT SYS"},
                {"label": "Cupro-nickel steel", "icon": "pi pi-tag", "data": "CNK R FIT SYS"},
                {"label": "Cuprum", "icon": "pi pi-tag", "data": "CPR R FIT SYS"},
                {"label": "Brass", "icon": "pi pi-tag", "data": "BRS R FIT SYS"},
                {"label": "Other", "icon": "pi pi-tag", "data": "OTR R FIT SYS"}
              ]
            },
            {
              "label": "Automatic",
              "data": "A FIT SYS",
              "expandedIcon": "pi pi-folder-open",
              "collapsedIcon": "pi pi-folder",
              "children": [
                {"label": "Steel", "icon": "pi pi-tag", "data": "STL A FIT SYS"},
                {"label": "Bronze", "icon": "pi pi-tag", "data": "BRZ A FIT SYS"},
                {"label": "Stainless steel", "icon": "pi pi-tag", "data": "SST A FIT SYS"},
                {"label": "Plastic", "icon": "pi pi-tag", "data": "PLS A FIT SYS"},
                {"label": "Combined material", "icon": "pi pi-tag", "data": "CMD A FIT SYS"},
                {"label": "Cupro-nickel steel", "icon": "pi pi-tag", "data": "CNK A FIT SYS"},
                {"label": "Cuprum", "icon": "pi pi-tag", "data": "CPR A FIT SYS"},
                {"label": "Brass", "icon": "pi pi-tag", "data": "BRS A FIT SYS"},
                {"label": "Other", "icon": "pi pi-tag", "data": "OTR A FIT SYS"}
              ]
            },
          ]
      },
        {
          "label": "Fittings (pipe part)",
          "data": "PART SYS",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": "Pump",
          "data": "PUMP SYS",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": "Ventilation and air conditioning",
          "data": "VENT SYS",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": "Mechanical equipment",
          "data": "MEQP SYS",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": "Control and measuring instruments",
          "data": "CMIT SYS",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [{
              "label": "Pressure",
              "data": "PRS CMIT SYS",
              "expandedIcon": "pi pi-folder-open",
              "collapsedIcon": "pi pi-folder",
            },
              {
                "label": "Temperature",
                "data": "TMP CMIT SYS",
                "expandedIcon": "pi pi-folder-open",
                "collapsedIcon": "pi pi-folder",
              },
              {
                "label": "Layer",
                "data": "LYR CMIT SYS",
                "expandedIcon": "pi pi-folder-open",
                "collapsedIcon": "pi pi-folder",
              },
              {
                "label": "Other",
                "data": "OTR CMIT SYS",
                "expandedIcon": "pi pi-folder-open",
                "collapsedIcon": "pi pi-folder",
              },
            ]
        },

      ]
    },
    {
      "label": "POWER PLANT",
      "data": "PWP",
      "expandedIcon": "pi pi-folder-open",
      "collapsedIcon": "pi pi-folder",
      "children": [
        {
          "label": "Equipment",
          "data": "EQM PWP",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },

      ]
    },
    {
      "label": "ELECTRICAL EQUIPMENT",
      "data": "EEQ",
      "expandedIcon": "pi pi-folder-open",
      "collapsedIcon": "pi pi-folder",
      "children": [
        {
          "label": "Electrical energy sources",
          "data": "SRC EEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children": [
            {"label": "Generator", "icon": "pi pi-tag", "data": "SRC EEQ"},
            {"label": "Transformer", "icon": "pi pi-tag", "data": "SRC EEQ"},
            {"label": "Voltage transformer", "icon": "pi pi-tag", "data": "SRC EEQ"},
            {"label": "Accumulator battery", "icon": "pi pi-tag", "data": "SRC EEQ"},
            {"label": "Power and control board", "icon": "pi pi-tag", "data": "SRC EEQ"},
          ]
        },
        {
          "label": "MGA",
          "data": "MGA EEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": "Navigation equipment",
          "data": "NAV EEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": "Radio communication",
          "data": "RAD EEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": "Lighting",
          "data": "LGT EEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": "Automation",
          "data": "AUT EEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": "Signaling",
          "data": "SGN EEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": "Electrical heating",
          "data": "HTN EEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": "Signal means",
          "data": "SLМ EEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": "Corrosion protection",
          "data": "CRS EEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": "Special equipment",
          "data": "SPC EEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": "Other",
          "data": "OTR EEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
        },
        {
          "label": "Cable",
          "data": "CAB EEQ",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children": [
            {"label": "Cable supplier", "icon": "pi pi-tag", "data": "SUP CAB EEQ"},
            {"label": "Сable Yard", "icon": "pi pi-tag", "data": "YRD CAB EEQ"},
          ]
        },
      ]
    },
    {
      "label": "ENGINEERING PART",
      "data": "ENP",
      "expandedIcon": "pi pi-folder-open",
      "collapsedIcon": "pi pi-folder",
    },
  ];
  selectedNode: any;

  constructor(public t: LanguageService, private materialManager: MaterialManagerService, private messageService: MessageService, private dialogService: DialogService) { }

  ngOnInit(): void {

  }
}
