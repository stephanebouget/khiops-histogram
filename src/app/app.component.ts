import { Component } from '@angular/core';

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

  constructor() {
    let mock;
    mock = 'datas';
    //  mock = 'datas2';
    //  mock = 'datas3';
    fetch('./assets/' + mock + '.json')
      .then((response) => {
        return response.json();
      })
      .then((datas) => {
        this.datas = datas;
        this.partition = this.datas?.map((e: any) => e.partition);
        console.log('🚀 ~ file: app.js ~ line 32 ~ data', datas);
        // showCharts(datas);

        this.analyseDatas(this.datas);
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

  analyseDatas(datas: any) {
    this.datasSet1 = [];
    this.datasSet2 = [];
    this.datasSet3 = [];
    datas.forEach((d: any) => {
      if (d.partition[0] > 0) {
        this.datasSet2.push(d);
      } else if (d.partition[0] < 0) {
        this.datasSet1.push(d);
      } else if (d.partition[0] === 0 || d.partition[1] === 0) {
        this.datasSet3.push(d);
      } else {
      }
    });
    console.log(' this.datasSet1:', this.datasSet1);
    console.log(' this.datasSet2:', this.datasSet2);
    console.log(' this.datasSet3:', this.datasSet3);
  }
}
