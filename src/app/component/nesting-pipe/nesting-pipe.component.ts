import { Component, OnInit } from '@angular/core';
import {LanguageService} from "../../domain/language.service";

@Component({
  selector: 'app-nesting-pipe',
  templateUrl: './nesting-pipe.component.html',
  styleUrls: ['./nesting-pipe.component.css']
})
export class NestingPipeComponent implements OnInit {
  project = '';
  projects: string[] = ['N002', 'N004'];
  search: string = '';

  constructor(public l: LanguageService) { }

  ngOnInit(): void {
  }



}
