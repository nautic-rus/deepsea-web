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
  selectedNode: TreeNode | null = null;
  cols = [
    { field: 'name', header: 'Name' },
    { field: 'date', header: 'Date' },
    { field: 'created_by', header: 'Author' },
    { field: 'size', header: 'Size' },
  ];

  constructor(private messageService: MessageService) { }

  ngOnInit(): void {
    this.files =
      [
        {
          "data": {
            "name": "Ship General",
          },
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
