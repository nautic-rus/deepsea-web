import { Component } from '@angular/core';
import {AuthManagerService} from "./domain/auth-manager.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'deepsea';
  constructor(public auth: AuthManagerService) {
  }
}
