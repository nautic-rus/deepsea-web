import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
// @ts-ignore
import * as convertExcelToJson from 'convert-excel-to-json';
import * as XLSX from 'xlsx';
import {MessageService} from "primeng/api";


interface Item {
  code: string;
  name: string;
  desc: string;
  units: string;
  unitsValue: string;
  qty: number;
  qtyOld? : number;
  weight: number;
  weightTotal: number;
  documents: any;
  material: string;
  path: string;
  pathValue: any;
  drawingsList: any;
}

interface UploadEvent {
  originalEvent: Event;
  files: File[];
}

@Component({
  selector: 'app-compare-excel-statements',
  templateUrl: './compare-excel-statements.component.html',
  styleUrls: ['./compare-excel-statements.component.css']
})
export class CompareExcelStatementsComponent implements OnInit {


  data1: any;
  data2: any;

  json1: any;
  json2: any;

  added:Item[];
  removed : Item[];
  changed : { oldItem: Item; newItem: Item }[];
  changedNewItems : Item[] = [];

  uploadedFiles: any[] = [];
  selectedFileName1: string = ''
  selectedFileName2: string = ''
  selectedHeadTab: string = 'Init';
  @ViewChild('fileInput1') fileInput1: ElementRef<HTMLInputElement>;
  @ViewChild('fileInput2') fileInput2: ElementRef<HTMLInputElement>;

  errorMessage : string;

  cols  = [
    { field: 'code', header: 'code', width: '150px' },
    { field: 'name', header: 'name', width: '150px' },
    { field: 'desc', header: 'desc', width: '150px' },
    { field: 'units', header: 'units', width: '95px' },
    { field: 'unitsValue', header: 'unitsValue', width: '100px' },
    { field: 'qty', header: 'qty', width: '100px' },
    { field: 'weight', header: 'weight', width: '100px' },
    { field: 'weightTotal', header: 'weightTotal', width: '100px' },
    { field: 'documents', header: 'documents', width: '150px' },
    { field: 'material', header: 'material', width: '150px' },
    { field: 'path', header: 'path', width: '150px' },
    { field: 'pathValue', header: 'pathValue', width: '150px' },
    { field: 'drawingsList', header: 'drawingsList', width: '150px' }
  ];

  colsChanged = [
    { field: 'code', header: 'code', width: '150px' },
    { field: 'name', header: 'name', width: '150px' },
    { field: 'desc', header: 'desc', width: '150px' },
    { field: 'units', header: 'units', width: '95px' },
    { field: 'unitsValue', header: 'unitsValue', width: '100px' },
    { field: 'qtyOld', header: 'qty (old)', width: '100px' },
    { field: 'qty', header: 'qty', width: '100px' },
    { field: 'weight', header: 'weight', width: '100px' },
    { field: 'weightTotal', header: 'weightTotal', width: '100px' },
    { field: 'documents', header: 'documents', width: '150px' },
    { field: 'material', header: 'material', width: '100px' },
    { field: 'path', header: 'path', width: '150px' },
    { field: 'pathValue', header: 'pathValue', width: '150px' },
    { field: 'drawingsList', header: 'drawingsList', width: '150px' }
  ];

  constructor(private messageService: MessageService) { }

  ngOnInit(): void {
  }



  // onUpload(event:UploadEvent, ) {
  //   for(let file of event.files) {
  //     this.uploadedFiles.push(file);
  //   }
  //
  //   this.messageService.add({severity: 'info', summary: 'File Uploaded', detail: ''});
  // }

  onFileChange(evt: any, fileNumber: number) {
    console.log("onFileChange");
    const target: DataTransfer = <DataTransfer>(evt.target);
    if (target.files.length !== 1) throw new Error('Cannot use multiple files');

    const file = target.files[0];

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }); // или header: 0 для объектов с ключами
      if (fileNumber === 1) {
        this.selectedFileName1 = file.name;
        this.data1 = data;
        console.log("this.data1")
        console.log(this.data1)
      } else {
        this.data2 = data;
        this.selectedFileName2 = file.name;
        console.log(this.data2)
      }
    };
    reader.readAsBinaryString(target.files[0]);
  }

  clearFile(fileNumber: number) {
    if (fileNumber === 1) {
      if (this.fileInput1 && this.fileInput1.nativeElement) {
        this.fileInput1.nativeElement.value = '';

      }
      this.selectedFileName1 = '';
      this.data1 = null;
      this.json1 = null;
      this.changedNewItems = [];
    } else if (fileNumber === 2) {
      if (this.fileInput2 && this.fileInput2.nativeElement) {
        this.fileInput2.nativeElement.value = '';
      }
      this.selectedFileName2 = '';
      this.data2 = null;
      this.json2 = null;
      this.changedNewItems = [];
    }
  }



  compareByCode(oldArray: Item[], newArray: Item[]) {
  const oldMap = new Map(oldArray.map(item => [item.code, item]));
  const newMap = new Map(newArray.map(item => [item.code, item]));

  const added: Item[] = [];
  const removed: Item[] = [];
  const changed: { oldItem: Item; newItem: Item }[] = [];
  const changedNewItems: Item[] = [];

  // Найти добавленные и изменённые элементы
  for (const [code, newItem] of newMap.entries()) {
    if (!oldMap.has(code)) {
      added.push(newItem);
    } else {
      const oldItem = oldMap.get(code)!;
      // Проверка изменений по всем ключам, кроме code
      const fieldsToCompare = ['name', 'desc', 'units', 'unitsValue', 'qty', 'weight', 'weightTotal', 'documents', 'material', 'path', 'pathValue', 'drawingsList'];
      const isChanged = fieldsToCompare.some(field => {
        // @ts-ignore
        if (typeof oldItem[field] === 'object' && oldItem[field] !== null && newItem[field] !== null) {
          // @ts-ignore
          return JSON.stringify(oldItem[field]) !== JSON.stringify(newItem[field]);
        }
        // @ts-ignore
        return oldItem[field] !== newItem[field];
      });

      if (isChanged) {
        changed.push({ oldItem, newItem });
        changedNewItems.push({
          ...newItem,
          qtyOld: oldItem.qty
        });
        // changedNewItems.push(newItem)
      }
    }
  }

  // Найти удалённые элементы
  for (const [code, oldItem] of oldMap.entries()) {
    if (!newMap.has(code)) {
      removed.push(oldItem);
    }
  }

  return { added, removed, changed, changedNewItems };
}

  areArraysEqual(firstArray : [], secondArray :[])
  {
    if ( firstArray.length === secondArray.length && firstArray.every((element, index) => element === secondArray[index]) ) {
      return true;
    }
    return false;
  };

  compare() {
      console.log("compare")
    if (!this.areArraysEqual(this.data1[0], this.data2[0])) {
      console.log(this.data1[0])
      console.log(this.data2[0])
      this.errorMessage = "Разные данные (различия в шапках)"
      console.log("разные шапки")
      return
    }
      this.json1 =  this.arrayToObjects(this.data1)
      this.json2 =  this.arrayToObjects(this.data2)
    const { added, removed, changed, changedNewItems } = this.compareByCode(this.json1, this.json2);
    this.added = added;
    this.removed = removed;
    this.changed = changed;
    this.changedNewItems = changedNewItems

    console.log(this.added)
    console.log(this.removed)
    console.log(this.changed)
    console.log(this.changedNewItems)
      // console.log(json1)
    }


  exportExcel() {
    const wsAll = XLSX.utils.json_to_sheet(this.json2 || []);
    const wsAdded = XLSX.utils.json_to_sheet(this.added || []);

    // Формируем данные с нужным порядком столбцов для changedNewItems
    const changedDataFormatted = (this.changedNewItems || []).map(item => {
      const formattedItem: { [key: string]: any } = {};
      this.colsChanged.forEach(col => {
        // @ts-ignore
        formattedItem[col.field] = item[col.field];
      });
      return formattedItem;
    });

    const wsChanged = XLSX.utils.json_to_sheet(changedDataFormatted);
    const wsRemoved = XLSX.utils.json_to_sheet(this.removed || []);

    const wb: XLSX.WorkBook = {
      Sheets: {
        'Исходные данные': wsAll,
        'Добавленные': wsAdded,
        'Изменённые': wsChanged,
        'Удалённые': wsRemoved
      },
      SheetNames: [
        'Исходные данные',
        'Добавленные',
        'Изменённые',
        'Удалённые'
      ]
    };

    XLSX.writeFile(wb, 'compare_result.xlsx');
  }


  arrayToObjects(data: any[][]) {
    const headers = data[0];
    const rows = data.slice(1);

    return rows.map(row => {
      const obj: {[key: string]: any} = {};
      headers.forEach((header, i) => {
        obj[header] = row[i];
      });
      return obj;
    });
  }

  isCellChanged(rowData: Item, field: string): boolean {
    if (!this.json1) return false;

    // @ts-ignore
    if (!this.cols.some(col => col.field === field)) {
      return false
    }
    const oldItem = this.json1.find((item: { code: string; }) => item.code === rowData.code);
    if (!oldItem) return false;
    // Для объектов и массивов сравниваем JSON.stringify
    // @ts-ignore
    if (typeof oldItem[field] === 'object' && oldItem[field] !== null && rowData[field] !== null) {
      // @ts-ignore
      return JSON.stringify(oldItem[field]) !== JSON.stringify(rowData[field]);
    }
    // @ts-ignore
    return oldItem[field] !== rowData[field];
  }





}
