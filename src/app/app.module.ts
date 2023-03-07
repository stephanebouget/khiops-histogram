import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { KhiopsHistogramComponent } from './khiops-histogram/khiops-histogram.component';
import { HistogramComponent } from './histogram/histogram.component';
import { AngularResizeEventModule } from 'angular-resize-event';

@NgModule({
  declarations: [AppComponent, KhiopsHistogramComponent, HistogramComponent],
  imports: [BrowserModule, AngularResizeEventModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
