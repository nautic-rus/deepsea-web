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
      "data": "Hull Folder",
      "expandedIcon": "pi pi-folder-open",
      "collapsedIcon": "pi pi-folder",
      "children": [{
        "label": "Work",
        "data": "Work Folder",
        "expandedIcon": "pi pi-folder-open",
        "collapsedIcon": "pi pi-folder",
        "children":
          [{"label": "Expenses.doc", "icon": "pi pi-file", "data": "Expenses Document"}, {"label": "Resume.doc", "icon": "pi pi-file", "data": "Resume Document"}]
      },
        {
          "label": "Home",
          "data": "Home Folder",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children": [{"label": "Invoices.txt", "icon": "pi pi-file", "data": "Invoices for this month"}]
        }]
    },
    {
      "label": "MATERIAL",
      "data": "Material Folder",
      "expandedIcon": "pi pi-folder-open",
      "collapsedIcon": "pi pi-folder",
      "children": [{
        "label": "Pipes",
        "data": "Pipes Folder",
        "expandedIcon": "pi pi-folder-open",
        "collapsedIcon": "pi pi-folder",
        "children":
          [ {"label": "Steel", "icon": "pi pi-file", "data": "Steel Material"},
            {"label": "Aluminium", "icon": "pi pi-file", "data": "Aluminium Material"},
            {"label": "Bronze", "icon": "pi pi-file", "data": "Bronze Material"},
            {"label": "Stainless steel", "icon": "pi pi-file", "data": "Stainless steel Material"},
            {"label": "Plastic", "icon": "pi pi-file", "data": "Plastic Material"},
            {"label": "Combined material", "icon": "pi pi-file", "data": "Combined material Material"},
            {"label": "Cupro-nickel steel", "icon": "pi pi-file", "data": "Cupro-nickel Material"},
            {"label": "Cuprum", "icon": "pi pi-file", "data": "Cuprum Material"},
            {"label": "Brass", "icon": "pi pi-file", "data": "Brass Material"},
            {"label": "Other", "icon": "pi pi-file", "data": "Other Material"}]
      },
        {
          "label": "Fasteners",
          "data": "Fasteners Folder",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": "Steel", "icon": "pi pi-file", "data": "Steel Material"},
              {"label": "Aluminium", "icon": "pi pi-file", "data": "Aluminium Material"},
              {"label": "Bronze", "icon": "pi pi-file", "data": "Bronze Material"},
              {"label": "Stainless steel", "icon": "pi pi-file", "data": "Stainless steel Material"},
              {"label": "Plastic", "icon": "pi pi-file", "data": "Plastic Material"},
              {"label": "Combined material", "icon": "pi pi-file", "data": "Combined material Material"},
              {"label": "Cupro-nickel steel", "icon": "pi pi-file", "data": "Cupro-nickel Material"},
              {"label": "Cuprum", "icon": "pi pi-file", "data": "Cuprum Material"},
              {"label": "Brass", "icon": "pi pi-file", "data": "Brass Material"},
              {"label": "Other", "icon": "pi pi-file", "data": "Other Material"}]
        },
        {
          "label": "Welding consumables",
          "data": "Welding consumables Folder",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": "Steel", "icon": "pi pi-file", "data": "Steel Material"},
              {"label": "Aluminium", "icon": "pi pi-file", "data": "Aluminium Material"},
              {"label": "Bronze", "icon": "pi pi-file", "data": "Bronze Material"},
              {"label": "Stainless steel", "icon": "pi pi-file", "data": "Stainless steel Material"},
              {"label": "Plastic", "icon": "pi pi-file", "data": "Plastic Material"},
              {"label": "Combined material", "icon": "pi pi-file", "data": "Combined material Material"},
              {"label": "Cupro-nickel steel", "icon": "pi pi-file", "data": "Cupro-nickel Material"},
              {"label": "Cuprum", "icon": "pi pi-file", "data": "Cuprum Material"},
              {"label": "Brass", "icon": "pi pi-file", "data": "Brass Material"},
              {"label": "Other", "icon": "pi pi-file", "data": "Other Material"}]
        },
        {
          "label": "Lumber",
          "data": "Lumber Folder",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": "Steel", "icon": "pi pi-file", "data": "Steel Material"},
              {"label": "Aluminium", "icon": "pi pi-file", "data": "Aluminium Material"},
              {"label": "Bronze", "icon": "pi pi-file", "data": "Bronze Material"},
              {"label": "Stainless steel", "icon": "pi pi-file", "data": "Stainless steel Material"},
              {"label": "Plastic", "icon": "pi pi-file", "data": "Plastic Material"},
              {"label": "Combined material", "icon": "pi pi-file", "data": "Combined material Material"},
              {"label": "Cupro-nickel steel", "icon": "pi pi-file", "data": "Cupro-nickel Material"},
              {"label": "Cuprum", "icon": "pi pi-file", "data": "Cuprum Material"},
              {"label": "Brass", "icon": "pi pi-file", "data": "Brass Material"},
              {"label": "Other", "icon": "pi pi-file", "data": "Other Material"}]
        },
        {
          "label": "Technological",
          "data": "Technological Folder",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": "Steel", "icon": "pi pi-file", "data": "Steel Material"},
              {"label": "Aluminium", "icon": "pi pi-file", "data": "Aluminium Material"},
              {"label": "Bronze", "icon": "pi pi-file", "data": "Bronze Material"},
              {"label": "Stainless steel", "icon": "pi pi-file", "data": "Stainless steel Material"},
              {"label": "Plastic", "icon": "pi pi-file", "data": "Plastic Material"},
              {"label": "Combined material", "icon": "pi pi-file", "data": "Combined material Material"},
              {"label": "Cupro-nickel steel", "icon": "pi pi-file", "data": "Cupro-nickel Material"},
              {"label": "Cuprum", "icon": "pi pi-file", "data": "Cuprum Material"},
              {"label": "Brass", "icon": "pi pi-file", "data": "Brass Material"},
              {"label": "Other", "icon": "pi pi-file", "data": "Other Material"}]
        },
        {
          "label": "Other",
          "data": "Other Folder",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children":
            [ {"label": "Steel", "icon": "pi pi-file", "data": "Steel Material"},
              {"label": "Aluminium", "icon": "pi pi-file", "data": "Aluminium Material"},
              {"label": "Bronze", "icon": "pi pi-file", "data": "Bronze Material"},
              {"label": "Stainless steel", "icon": "pi pi-file", "data": "Stainless steel Material"},
              {"label": "Plastic", "icon": "pi pi-file", "data": "Plastic Material"},
              {"label": "Combined material", "icon": "pi pi-file", "data": "Combined material Material"},
              {"label": "Cupro-nickel steel", "icon": "pi pi-file", "data": "Cupro-nickel Material"},
              {"label": "Cuprum", "icon": "pi pi-file", "data": "Cuprum Material"},
              {"label": "Brass", "icon": "pi pi-file", "data": "Brass Material"},
              {"label": "Other", "icon": "pi pi-file", "data": "Other Material"}]
        }]
    },
    {
      "label": "Movies",
      "data": "Movies Folder",
      "expandedIcon": "pi pi-folder-open",
      "collapsedIcon": "pi pi-folder",
      "children": [{
        "label": "Al Pacino",
        "data": "Pacino Movies",
        "children": [{"label": "Scarface", "icon": "pi pi-video", "data": "Scarface Movie"}, {"label": "Serpico", "icon": "pi pi-video", "data": "Serpico Movie"}]
      },
        {
          "label": "Robert De Niro",
          "data": "De Niro Movies",
          "children": [{"label": "Goodfellas", "icon": "pi pi-video", "data": "Goodfellas Movie"}, {"label": "Untouchables", "icon": "pi pi-video", "data": "Untouchables Movie"}]
        }]
    }
  ];
  selectedNode: any;

  constructor(public t: LanguageService, private materialManager: MaterialManagerService, private messageService: MessageService, private dialogService: DialogService) { }

  ngOnInit(): void {

  }
}
