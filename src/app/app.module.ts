import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PdfComponent } from './pdf/pdf.component';
import { CanvasPlaygroundComponent } from './canvas-playground/canvas-playground.component';
import { PdfPageComponent } from './pdf-page/pdf-page.component';
import { FormsModule } from '@angular/forms';
import { GooglePlaygroundComponent } from './google-playground/google-playground.component';

@NgModule({
  declarations: [
    AppComponent,
    PdfComponent,
    CanvasPlaygroundComponent,
    PdfPageComponent,
    GooglePlaygroundComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
