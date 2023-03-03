import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { KhiopsHistogramComponent } from './khiops-histogram/khiops-histogram.component';
import { HistogramComponent } from './histogram/histogram.component';

@NgModule({
  declarations: [
    AppComponent,
    KhiopsHistogramComponent,
    HistogramComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
