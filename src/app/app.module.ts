import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './component/login/login.component';
import { HomeComponent } from './component/home/home.component';
import { NaviComponent } from './component/navi/navi.component';
import {FormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import { BpmnComponent } from './component/bpmn/bpmn.component';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {AccordionModule} from 'primeng/accordion';     //accordion and accordion tab
import {ConfirmationService, MenuItem, MessageService} from 'primeng/api';
import {TableModule} from "primeng/table";
import {MultiSelectModule} from "primeng/multiselect";
import {InputTextModule} from "primeng/inputtext";
import {ProgressBarModule} from "primeng/progressbar";
import {ButtonModule} from "primeng/button";
import {SliderModule} from "primeng/slider";
import {DropdownModule} from "primeng/dropdown";
import {TooltipModule} from "primeng/tooltip";
import {ToastModule} from "primeng/toast";
import { CreateTaskComponent } from './component/create-task/create-task.component';
import { TaskComponent } from './component/task/task.component';                  //api
import {EditorModule} from "primeng/editor";
import {DialogModule} from "primeng/dialog";
import {CascadeSelectModule} from "primeng/cascadeselect";
import {CalendarModule} from "primeng/calendar";
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {MessagesModule} from "primeng/messages";
import { SafeHtmlPipe } from './domain/safe-html.pipe';                  //api
import {GalleriaModule} from "primeng/galleria";
import {QuillModule} from "ngx-quill";
import Quill from "quill";                  //api
// @ts-ignore
import ImageResize from 'quill-image-resize-module';
import {ConfirmDialogModule} from "primeng/confirmdialog";
import { NgInitDirective } from './domain/ng-init.directive';
Quill.register('modules/imageResize', ImageResize);



@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    NaviComponent,
    BpmnComponent,
    CreateTaskComponent,
    TaskComponent,
    SafeHtmlPipe,
    NgInitDirective,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    AccordionModule,
    TableModule,
    MultiSelectModule,
    InputTextModule,
    ProgressBarModule,
    ButtonModule,
    SliderModule,
    DropdownModule,
    TooltipModule,
    ToastModule,
    EditorModule,
    DialogModule,
    CascadeSelectModule,
    CalendarModule,
    ProgressSpinnerModule,
    MessagesModule,
    GalleriaModule,
    QuillModule.forRoot(),
    QuillModule.forRoot({
      modules: {
        imageResize: {}
      }
    }),
    ConfirmDialogModule
  ],
  providers: [MessageService, DialogService, DynamicDialogRef, ConfirmationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
