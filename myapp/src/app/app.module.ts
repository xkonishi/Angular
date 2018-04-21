import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';

// Import PrimeNG modules
import {ButtonModule} from 'primeng/primeng';
import {DialogModule} from 'primeng/primeng';
import { MydialogComponent } from './mydialog/mydialog.component';


@NgModule({
  declarations: [
    AppComponent,
    MydialogComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ButtonModule,
    DialogModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
