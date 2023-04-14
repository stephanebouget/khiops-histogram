import { Injectable } from '@angular/core';
import { HistogramBarVO } from './histogram.bar-vo';

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

  constructor() {}

  getRangeX(datas: any) {
    this.rangeXLog.min =
      datas.find(function (d: any) {
        return d.partition[0] < 0;
      })?.partition[0] || 0;
    this.rangeXLog.posStart =
      datas.find(function (d: any) {
        return d.partition[0] >= 0 && d.partition[1] > 0;
      })?.partition[1] || 0;

    this.rangeXLog.negStart =
      datas.findLast(function (d: any) {
        return d.partition[0] < 0 && d.partition[1] <= 0;
      })?.partition[0] || 0;
    this.rangeXLog.max =
      datas.findLast(function (d: any) {
        return d.partition[1] > 0;
      })?.partition[1] || 0;

    this.rangeXLog.inf = datas.find(function (d: any) {
      return d.partition[0] === 0 || d.partition[1] === 0;
    });
    this.rangeXLog.middlewidth = 1.2;
    // this.rangeXLog.middlewidth = Math.log10(Math.abs(this.rangeXLog.max))/3
    // let size = 0;
    // if (this.rangeXLog.max !== 0) {
    //   size = Math.log10(Math.abs(this.rangeXLog.max));
    // }
    // if (this.rangeXLog.min !== 0) {
    //   size += Math.log10(Math.abs(this.rangeXLog.min));
    // }
    // if (this.rangeXLog.negStart !== 0) {
    //   size -= Math.log10(Math.abs(this.rangeXLog.negStart));
    // }
    // if (this.rangeXLog.posStart !== 0) {
    //   size -= Math.log10(Math.abs(this.rangeXLog.posStart));
    // }
    // console.log(
    //   'file: histo+++++++++++++++++++++++++++angeX ~ size:',
    //   size
    // );
    // this.rangeXLog.middlewidth = size;
    // if (this.rangeXLog.min >= 0) {
    //   this.rangeXLog.diff = this.rangeXLog.max - this.rangeXLog.posStart;
    // } else {
    //   this.rangeXLog.diff = this.rangeXLog.max - this.rangeXLog.min;
    // }
    // this.rangeXLog.negInf =
    //   datas.findLast(function (d: any) {
    //     return d.partition[1] < 0 && d.partition[1] > -1;
    //   })?.partition[1] || 0;
    // this.rangeXLog.posInf =
    //   datas.find(function (d: any) {
    //     return d.partition[0] > 0 && d.partition[0] < 1;
    //   })?.partition[0] || 0;
    this.rangeXLin = 0;
    // this.rangeXLog.negPart =
    //   datas.filter(function (d: any) {
    //     return d.partition[0] < 0;
    //   })?.length > 1 || false;

    // this.rangeXLog.posPart =
    //   datas.filter(function (d: any) {
    //     return d.partition[1] > 0;
    //   })?.length > 1 || false;

    // this.rangeXLog.totwidth =
    //   Math.abs(this.rangeXLog.max) -
    //   Math.abs(this.rangeXLog.posStart) +
    //   Math.abs(this.rangeXLog.min) -
    //   Math.abs(this.rangeXLog.negStart);

    // this.rangeXLog.logtotwidth = Math.log10(
    //   Math.abs(this.rangeXLog.max) + Math.abs(this.rangeXLog.posStart)
    // );
    // this.rangeXLog.totwidth =
    //   Math.log10(Math.abs(this.rangeXLog.max)) -
    //   Math.log10(Math.abs(this.rangeXLog.posStart)) +
    //   Math.log10(Math.abs(this.rangeXLog.min)) -
    //   Math.log10(Math.abs(this.rangeXLog.negStart));

    // this.rangeXLog.middlewidth = this.rangeXLog.logtotwidth
    // this.rangeXLog.middlewidth = Math.log10(Math.pow(10,   this.rangeXLog.logtotwidth))
    // if (this.rangeXLog.min && this.rangeXLog.negStart) {
    //   this.rangeXLog.logtotwidth =
    //     this.rangeXLog.logtotwidth +
    //     Math.log10(Math.abs(this.rangeXLog.min)) -
    //     Math.log10(Math.abs(this.rangeXLog.negStart));
    //   // this.rangeXLog.logtotwidth =
    //   //   this.rangeXLog.logtotwidth + Math.log10(this.rangeXLog.middlewidth);
    // }
    // if (this.rangeXLog.negStart === 0 || this.rangeXLog.posStart === 0) {
    //   // this.rangeXLog.logtotwidth =
    //   //   this.rangeXLog.logtotwidth + Math.log10(this.rangeXLog.middlewidth);
    // }
    // console.log(
    //   'file: histogram.service.ts:76 ~ Histogram2Service ~ getRangeX ~ this.rangeXLog.logtotwidth:',
    //   this.rangeXLog.logtotwidth
    // );

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

  computeLogBarXDimensions(datas: any) {
    let bars: HistogramBarVO[] = [];

    datas.forEach((d: any, i: number) => {
      let histogramBar = new HistogramBarVO(d, this.rangeXLog.middlewidth);
      histogramBar.computeX(bars);
      bars.push(histogramBar);
    });

    return bars;
  }
}
