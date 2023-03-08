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
  datasSet!: any;
  range!: number;
  rangeY!: number;
  w = 0;
  badJson: string = '';
  ls_key = 'Khiops-histogram-dataset';

  constructor() {
    const previousDataSet = window.localStorage.getItem(this.ls_key);

    if (previousDataSet) {
      this.datas = JSON.parse(previousDataSet);
      this.datasSet = JSON.stringify(this.datas, undefined, 4);
    } else {
      this.loadMock();
    }
  }
  loadMock() {
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
        this.datasSet = JSON.stringify(datas, undefined, 4);
        this.update(this.datasSet);
      })
      .catch(function (err) {
        console.warn(err);
      });
  }

  update(datas: any) {
    try {
      this.badJson = '';
      this.datas = JSON.parse(datas);
      window.localStorage.setItem(this.ls_key, datas);
    } catch (e: any) {
      console.log('file: app.component.ts:43 ~ AppComponent ~ update ~ e:', e);
      this.badJson = e.toString();
    }
  }

  onResized(event: ResizedEvent) {
    this.w = event.newRect.width - 40; // add some padding
  }
}
