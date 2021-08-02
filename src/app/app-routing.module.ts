import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {HomeComponent} from "./component/home/home.component";
import {LoginComponent} from "./component/login/login.component";
import {AuthGuard} from "./domain/classes/auth.guard";
import {BpmnComponent} from "./component/bpmn/bpmn.component";
import {CreateTaskComponent} from "./component/create-task/create-task.component";

const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthGuard], data: {animation: 'HomeComponent'} },
  { path: 'bpmn', component: BpmnComponent, canActivate: [AuthGuard], data: {animation: 'BpmnComponent'} },
  { path: 'login', component: LoginComponent, data: {animation: 'LoginComponent'} },
  { path: 'create-task', component: CreateTaskComponent, canActivate: [AuthGuard], data: {animation: 'CreateTaskComponent'} },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
