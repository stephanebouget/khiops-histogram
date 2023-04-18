import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AngularResizeEventModule } from 'angular-resize-event';
import { FormsModule } from '@angular/forms';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { HistogramComponent } from './histogram/histogram.component';

@NgModule({
  declarations: [AppComponent, HistogramComponent],
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
