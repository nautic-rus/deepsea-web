import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {HomeComponent} from "./component/home/home.component";
import {LoginComponent} from "./component/login/login.component";
import {AuthGuard} from "./domain/classes/auth.guard";
import {BpmnComponent} from "./component/bpmn/bpmn.component";
import {CreateTaskComponent} from "./component/create-task/create-task.component";
import {TaskComponent} from "./component/task/task.component";
import {MaterialsComponent} from "./component/materials/materials.component";
import {GanttComponent} from "./component/gantt/gantt.component";
import {SectionsComponent} from "./component/sections/sections.component";
import {DocumentsComponent} from "./component/documents/documents.component";

const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthGuard], data: {animation: 'HomeComponent'} },
  { path: 'bpmn', component: BpmnComponent, canActivate: [AuthGuard], data: {animation: 'BpmnComponent'} },
  { path: 'login', component: LoginComponent, data: {animation: 'LoginComponent'} },
  { path: 'create-task', component: CreateTaskComponent, canActivate: [AuthGuard], data: {animation: 'CreateTaskComponent'} },
  { path: 'task', component: TaskComponent, canActivate: [AuthGuard], data: {animation: 'TaskComponent'} },
  { path: 'materials', component: MaterialsComponent, canActivate: [AuthGuard], data: {animation: 'MaterialsComponent'} },
  { path: 'gantt', component: GanttComponent, canActivate: [AuthGuard], data: {animation: 'GanttComponent'} },
  { path: 'sections', component: SectionsComponent, canActivate: [AuthGuard], data: {animation: 'SectionsComponent'} },
  { path: 'documents', component: DocumentsComponent, canActivate: [AuthGuard], data: {animation: 'DocumentsComponent'} },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
