import { Component, OnInit } from '@angular/core';
import {LanguageService} from "../../domain/language.service";
import {DeviceDetectorService} from "ngx-device-detector";

@Component({
  selector: 'app-elec',
  templateUrl: './elec.component.html',
  styleUrls: ['./elec.component.css']
})
export class ElecComponent implements OnInit {

  constructor(public device: DeviceDetectorService, public l: LanguageService) { }

  ngOnInit(): void {
  }

  isDesktop() {
    return this.device.isDesktop() && window.innerWidth > 1296;
  }

}
