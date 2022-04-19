import { Component, OnInit } from '@angular/core';
import {MenuItem, MessageService, TreeNode} from "primeng/api";

@Component({
  selector: 'app-file-explorer',
  templateUrl: './file-explorer.component.html',
  styleUrls: ['./file-explorer.component.css']
})
export class FileExplorerComponent implements OnInit {

  files: TreeNode[] = [];
  selectedFile: TreeNode | null = null;
  items: MenuItem[] = [];

  constructor(private messageService: MessageService) { }

  ngOnInit(): void {
    this.files =
        [
          {
            "label": "Documents",
            "data": "Documents Folder",
            "expandedIcon": "pi pi-folder-open",
            "collapsedIcon": "pi pi-folder",
            "children": [{
              "label": "Work",
              "data": "Work Folder",
              "expandedIcon": "pi pi-folder-open",
              "collapsedIcon": "pi pi-folder",
              "children": [{"label": "Expenses.doc", "icon": "pi pi-file", "data": "Expenses Document"}, {"label": "Resume.doc", "icon": "pi pi-file", "data": "Resume Document"}]
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
            "label": "Pictures",
            "data": "Pictures Folder",
            "expandedIcon": "pi pi-folder-open",
            "collapsedIcon": "pi pi-folder",
            "children": [
              {"label": "barcelona.jpg", "icon": "pi pi-image", "data": "Barcelona Photo"},
              {"label": "logo.jpg", "icon": "pi pi-image", "data": "PrimeFaces Logo"},
              {"label": "primeui.png", "icon": "pi pi-image", "data": "PrimeUI Logo"}]
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

    this.items = [
      {label: 'Add Folder', icon: 'pi pi-plus', command: (event) => this.viewFile(this.selectedFile)},
      {label: 'Add Files', icon: 'pi pi-plus', command: (event) => this.unselectFile()}
    ];
  }
  viewFile(file: any) {
    this.messageService.add({severity: 'info', summary: 'Node Details', detail: file.label});
  }

  unselectFile() {
    this.selectedFile = null;
  }

}
