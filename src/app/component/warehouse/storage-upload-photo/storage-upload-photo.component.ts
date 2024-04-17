import { Component, OnInit } from '@angular/core';
import {StorageManagerService} from "../../../domain/storage-manager.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-storage-upload-photo',
  templateUrl: './storage-upload-photo.component.html',
  styleUrls: ['./storage-upload-photo.component.css']
})
export class StorageUploadPhotoComponent implements OnInit {

  awaitForLoad: any[] = [];
  imgs: any[] = [];
  storageId = 0;
  storageFiles: any[] = [];

  constructor(public s: StorageManagerService, public a: ActivatedRoute) { }

  ngOnInit(): void {
    this.a.queryParams.subscribe(params => {
      if (params['storageId'] != null){
        this.storageId = +params['storageId'];
        this.s.getStorageFiles().subscribe(res => {
          console.log(res);
          this.storageFiles = res.filter((x: any) => x.removed == 0 && x.kind == 'photo');
          this.imgs = this.storageFiles.filter((x: any) => x.unit_id == this.storageId).map((x: any) => x.url);
        });
      }
    });
  }
  handleFileInput(files: FileList | null) {
    if (files != null){
      for (let x = 0; x < files.length; x++){
        let file = files.item(x);
        if (file != null){
          let id = this.generateId(8);
          let fileName = 'photo' + id  + '.' + file.name.split('.').pop();
          this.awaitForLoad.push(fileName);
          this.s.uploadFile(file, fileName).subscribe(res => {
            this.awaitForLoad.splice(this.awaitForLoad.indexOf(fileName), 1);
            this.imgs.push(res);
            let sFile = Object({
              id: 0,
              name: fileName,
              url: res,
              kind: 'photo',
              unit_id: this.storageId,
              removed: 0
            });
            this.s.updateStorageFile(sFile).subscribe(() => {});
          });
        }
      }
    }
  }
  generateId(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() *
        charactersLength));
    }
    return result;
  }
  deleteImage(img: string) {
    this.imgs.splice(this.imgs.indexOf(img), 1);
    let find = this.storageFiles.find((x: any) => x.unit_id == this.storageId && x.url == img);
    if (find != null){
      find.removed = 1;
      this.s.updateStorageFile(find).subscribe(() => {});
    }
  }
}
