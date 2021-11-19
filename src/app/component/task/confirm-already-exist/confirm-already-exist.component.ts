import { Component, OnInit } from '@angular/core';
import {LanguageService} from "../../../domain/language.service";

@Component({
  selector: 'app-confirm-already-exist',
  templateUrl: './confirm-already-exist.component.html',
  styleUrls: ['./confirm-already-exist.component.css']
})
export class ConfirmAlreadyExistComponent implements OnInit {

  constructor(public t: LanguageService,) { }

  ngOnInit(): void {
  }
}
