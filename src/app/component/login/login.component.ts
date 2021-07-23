import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  saveMeChecked = true;
  login = '';
  password = '';
  constructor() { }

  ngOnInit(): void {
  }

  saveMeCheckedToggle() {
    this.saveMeChecked = !this.saveMeChecked;
  }

  isFilled() {
    return this.login.trim() != '' && this.password.trim() != '';
  }
}
