import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  datas: any;
  partition: any;
  datasSet4!: any[];
  datasSet3!: any[];
  datasSet2!: any[];
  datasSet1!: any[];
  range!: number;
  rangeY!: number;

  constructor() {
    fetch('./assets/datas.json')
      .then((response) => {
        return response.json();
      })
      .then((datas) => {
        this.datas = datas;
        this.partition = this.datas?.map((e: any) => e.partition);
        console.log('🚀 ~ file: app.js ~ line 32 ~ data', datas);
        // showCharts(datas);

        this.analyseDatas(this.datas);
        this.getRange();
        this.getRangeY();
      })
      .catch(function (err) {
        console.warn(err);
      });
  }

  getRangeY(): void {
    this.rangeY = Math.max(...this.datas?.map((e: any) => e.value));
    // this.rangeY = Math.round(this.rangeY * 100) / 100;
  }

  getRange(): void {
    var maxRange1 = Math.max(
      Math.abs(this.datasSet1[0].partition[0]),
      Math.abs(this.datasSet1[this.datasSet1.length - 1].partition[1])
    );
    var maxRange2 = Math.max(
      Math.abs(this.datasSet2[0].partition[0]),
      Math.abs(this.datasSet2[this.datasSet2.length - 1].partition[1])
    );
    this.range = Math.max(maxRange1, maxRange2);
  }

  analyseDatas(datas: any) {
    this.datasSet1 = [];
    this.datasSet2 = [];
    this.datasSet3 = [];
    this.datasSet4 = [];
    datas.forEach((d: any) => {
      if (d.partition[0] >= 1 && d.partition[1] >= 1) {
        this.datasSet2.push(d);
      } else if (d.partition[0] <= -1 && d.partition[1] <= -1) {
        this.datasSet1.push(d);
      } else if (d.partition[0] >= -1 && d.partition[1] <= 0) {
        this.datasSet3.push(d);
      } else if (d.partition[0] >= 0 && d.partition[1] <= 1) {
        this.datasSet4.push(d);
      } else {
      }
    });
  }
}
