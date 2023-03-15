import { Component, ElementRef, ViewChild } from '@angular/core';
import { ResizedEvent } from 'angular-resize-event';
import { UtilsService } from './utils.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  @ViewChild('codemirror', { static: false })
  codemirror!: ElementRef;

  datas: any;
  partition: any;
  datasSet!: any;
  range!: number;
  rangeY!: number;
  w = 0;
  badJson: string = '';
  ls_key = 'Khiops-histogram-dataset';
  variables: any[] = [];
  selectedVariable: any;

  constructor() {
    const previousDataSet = window.localStorage.getItem(this.ls_key);
    if (previousDataSet) {
      this.datasSet = previousDataSet;
      this.update();
    }
    const previousVar = window.localStorage.getItem(this.ls_key + '_var');
    if (previousVar) {
      this.selectedVariable = previousVar;
      this.update();
    }
  }

  loadMock() {
    let mock;
    // mock = 'datas';
    //  mock = 'datas2';
    //  mock = 'datas3';
    mock = 'mock1';
    fetch('./assets/' + mock + '.json')
      .then((response) => {
        return response.json();
      })
      .then((datas) => {
        this.datas = datas;
        this.datasSet = JSON.stringify(datas, undefined, 4);
        this.selectedVariable = undefined;
        this.update();
      })
      .catch(function (err) {
        console.warn(err);
      });
  }

  update() {
    if (this.datasSet) {
      try {
        this.variables = UtilsService.getVariables(JSON.parse(this.datasSet));
        if (!this.selectedVariable) {
          this.selectedVariable = this.variables[0];
        }
        this.badJson = '';
        this.datas = UtilsService.getDistributionGraphDatas(
          JSON.parse(this.datasSet),
          this.selectedVariable
        );
        window.localStorage.setItem(this.ls_key, this.datasSet);
      } catch (e: any) {
        console.log(
          'file: app.component.ts:43 ~ AppComponent ~ update ~ e:',
          e
        );
        this.datas = undefined;
        this.badJson = e.toString();
        // this.loadMock();
      }
    }
  }

  onResized(event: ResizedEvent) {
    this.w = event.newRect.width - 0; // add some padding
  }
  onVariableChange(event: any) {
    setTimeout(() => {
      this.selectedVariable = JSON.parse(JSON.stringify(event));
      window.localStorage.setItem(this.ls_key + '_var', this.selectedVariable);
      this.update();
    });
  }
  onDropFile(event: any) {
    // clear previous datas
    this.selectedVariable = undefined;
    this.datasSet = '';
    this.update();
  }
}
