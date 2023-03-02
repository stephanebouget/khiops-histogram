import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { KhiopsHistogramComponent } from './khiops-histogram/khiops-histogram.component';

@NgModule({
  declarations: [
    AppComponent,
    KhiopsHistogramComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
