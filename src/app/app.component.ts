import { Component } from '@angular/core';
import { ResizedEvent } from 'angular-resize-event';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  datas: any;
  partition: any;
  datasSet3!: any[];
  datasSet2!: any[];
  datasSet1!: any[];
  range!: number;
  rangeY!: number;

  w = 1000;

  constructor() {
    let mock;
    // mock = 'datas';
    //  mock = 'datas2';
    //  mock = 'datas3';
     mock = 'datas4';
    fetch('./assets/' + mock + '.json')
      .then((response) => {
        return response.json();
      })
      .then((datas) => {
        this.datas = datas;
        this.partition = this.datas?.map((e: any) => e.partition);
        this.getRangeY();
      })
      .catch(function (err) {
        console.warn(err);
      });
  }

  getRangeY(): void {
    this.rangeY = Math.max(...this.datas?.map((e: any) => e.value));
  }

  onResized(event: ResizedEvent) {
    this.w = event.newRect.width;
  }
}
