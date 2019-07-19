import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireStorageModule } from '@angular/fire/storage';

import { AppComponent } from './app.component';
import { PdfComponent } from './pdf/pdf.component';
import { CanvasPlaygroundComponent } from './canvas-playground/canvas-playground.component';
import { PdfPageComponent } from './pdf-page/pdf-page.component';
import { GooglePlaygroundComponent } from './google-playground/google-playground.component';
import { LoginComponent } from './login/login.component';

import { environment } from 'src/environments/environment';

import { LoadPdfService } from './load-pdf.service';
import { LoadPdfOverlayService } from './load-pdf-overlay.service';

@NgModule({
  declarations: [
    AppComponent,
    PdfComponent,
    CanvasPlaygroundComponent,
    PdfPageComponent,
    GooglePlaygroundComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireStorageModule
  ],
  providers: [
    LoadPdfService, 
    LoadPdfOverlayService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
