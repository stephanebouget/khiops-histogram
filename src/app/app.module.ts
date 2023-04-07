import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HistogramComponent } from './histogram/histogram.component';
import { AngularResizeEventModule } from 'angular-resize-event';
import { FormsModule } from '@angular/forms';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { Histogram2Component } from './histogram2/histogram.component';

@NgModule({
  declarations: [AppComponent, HistogramComponent, Histogram2Component],
  imports: [
    FormsModule,
    CodemirrorModule,
    BrowserModule,
    AngularResizeEventModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
