import { Injectable } from '@angular/core';
import { Histogram2Type as HistogramType } from './histogram.types';
import { Histogram2UIService as HistogramUIService } from './histogram.ui.service';

@Injectable({
  providedIn: 'root',
})
export class Histogram2Service {
  rangeXLin: number = 0;
  rangeYLin: number = 0;
  rangeYLog = {
    min: 0,
    max: 0,
    realMin: 0,
    realMax: 0,
  };
  rangeXLog: any = {};
  barWs: any[] = [];

  constructor(private histogramUIService: HistogramUIService) {}

  getRangeX(datas: any) {
    // if (part === 'pN') {
    //   var filtered = datas;
    //   var filtered = datas.filter(function (d: any) {
    //     return d.partition[0] < 1;
    //   });

    // this.rangeXLog.pP.min = Math.abs(datas[0].partition[0]);
    // this.rangeXLog.pP.max = Math.abs(datas[datas.length - 1].partition[1]);
    this.rangeXLog.min = datas[0].partition[0];
    this.rangeXLog.firstmin =
      datas.find(function (d: any) {
        return d.partition[0] > 0 && d.partition[1] > 0;
      })?.partition[0] || 0;
    this.rangeXLog.firstminNeg =
      datas.find(function (d: any) {
        return d.partition[0] < 0 && d.partition[1] < 0;
      })?.partition[1] || 0;
    this.rangeXLog.max = datas[datas.length - 1].partition[1];
    if (this.rangeXLog.min >= 0) {
      this.rangeXLog.diff = this.rangeXLog.max - this.rangeXLog.firstmin;
    } else {
      this.rangeXLog.diff = this.rangeXLog.max - this.rangeXLog.min;
    }
    this.rangeXLog.negInf =
      datas.findLast(function (d: any) {
        return d.partition[1] < 0 && d.partition[1] > -1;
      })?.partition[1] || 0;
    this.rangeXLog.posInf =
      datas.find(function (d: any) {
        return d.partition[0] > 0 && d.partition[0] < 1;
      })?.partition[0] || 0;
    this.rangeXLin = 0;

    console.log(
      'file: histogram.service.ts:84 ~ Histogram2Service ~ getRangeX ~ this.rangeXLin, this.rangeXLog:',
      this.rangeXLin,
      this.rangeXLog
    );
    return [this.rangeXLin, this.rangeXLog];
  }

  getLinRangeY(datas: any) {
    const dataValues = datas.map((e: any) => e.value);
    this.rangeYLin = Math.max(...dataValues);
    return this.rangeYLin;
  }

  getLogRangeY(datas: any) {
    const dataValues = datas
      .filter((e: any) => {
        return e.logValue !== 0;
      })
      .map((e: any) => {
        return e.logValue;
      });

    this.rangeYLog.max = Math.ceil(Math.max(...dataValues));
    this.rangeYLog.min = Math.floor(Math.min(...dataValues));
    this.rangeYLog.realMax = Math.max(...dataValues);
    this.rangeYLog.realMin = Math.min(...dataValues);
    console.log(
      'file: histogram.service.ts:75 ~ getLogRangeY ~ this.rangeYLog:',
      this.rangeYLog
    );

    return this.rangeYLog;
  }

  getLinRatioX(w: number) {
    let ratioX = w / this.rangeXLin;
    return ratioX;
  }

  getLinRatioY(h: number, padding: number) {
    let ratioY = (h - padding / 2) / this.rangeYLin;
    return ratioY;
  }

  getLogRatioY(h: number, padding: number) {
    let ratioY;
    let shift = Math.abs(this.rangeYLog.min) - Math.abs(this.rangeYLog.max);
    ratioY = (h - padding / 2) / shift;
    return ratioY;
  }

  getLogBarXDimensions(
    i: number,
    d: any,
    w: any
    // padding = 0,
    // middleW = 0,
    // ratioX = 0,
    // logView: any
  ) {
    // console.log('d:', d);
    let barW = 0;
    let x = 0;
    let color = this.histogramUIService.getColor(2);

    if (i === 0) {
      this.barWs = [];
    }
    // if (d.partition[0] >= 1 ) {
    // barMin = Math.min(d.partition[1], d.partition[0]);
    // barMin = barMin - this.rangeXLog.pP.min;
    x = 0;

    if (d.partition[0] === 0 || d.partition[1] === 0) {
      barW = Math.log10(this.rangeXLog.max) / 20; // 20 = 1/10 /2
// barW = Math.log10(2)
// barW = 0.5
      // barW = 1 / Math.pow(w / 20, 10)
      color = this.histogramUIService.getColor(1);
    } else {
      barW =
        Math.log10(Math.abs(d.partition[0])) -
        Math.log10(Math.abs(d.partition[1]));

      if (d.partition[0] < 0 && d.partition[1] > 0) {
        barW =  Math.log10(this.rangeXLog.max) / 20;
         color = this.histogramUIService.getColor(0);
      }
    }

    // barW =
    //   Math.log10(Math.abs(d.partition[1])) -
    //   Math.log10(Math.abs(d.partition[0]));
    // barW =
    //   Math.log10((d.partition[1])) -
    //   Math.log10((d.partition[0]));

    barW = Math.abs(barW);
    // console.log('file: histogram.service.ts:135 ~ barW:', barW);

    const sum = this.barWs.reduce(
      (partialSum: any, a: any) => Math.abs(partialSum) + Math.abs(a),
      0
    );
    this.barWs.push(barW);
    x = sum || 0;

    return [x, barW, color];
  }
}
