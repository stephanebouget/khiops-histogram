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

  // getLogBarXDimensions(i: number, d: any, w: any) {
  //   let barW = 0;
  //   let x = 0;
  //   let color = this.histogramUIService.getColor(2);

  //   if (i === 0) {
  //     this.barWs = [];
  //   }

  //   x = 0;

  //   if (d.partition[0] === 0 || d.partition[1] === 0) {
  //     // barW = Math.log10(this.rangeXLog.max) / 20; // 20 = 1/10 /2
  //     barW = Math.log10(this.rangeXLog.middlewidth);
  //     // barW = Math.log10(2)
  //     // barW = 0.5
  //     // barW = 1 / Math.pow(w / 20, 10)
  //     color = this.histogramUIService.getColor(1);
  //   } else {
  //     barW =
  //       Math.log10(Math.abs(d.partition[0])) -
  //       Math.log10(Math.abs(d.partition[1]));

  //     if (d.partition[0] < 0 && d.partition[1] > 0) {
  //       // barW = Math.log10(this.rangeXLog.max) / 20;
  //       barW = Math.log10(this.rangeXLog.middlewidth);
  //       // barW = 0
  //       color = this.histogramUIService.getColor(0);
  //     }
  //   }

  //   // barW =
  //   // Math.log10(Math.abs(d.partition[0])) -
  //   // Math.log10(Math.abs(d.partition[1]))

  //   barW = Math.abs(barW);
  //   console.log('file: histogram.service.ts:135 ~ barW:', barW);

  //   const sum = this.barWs.reduce(
  //     (partialSum: any, a: any) => Math.abs(partialSum) + Math.abs(a),
  //     0
  //   );
  //   this.barWs.push(barW);
  //   x = sum || 0;
  //   console.log(
  //     'file: histogram.service.ts:200 ~ Histogram2Service ~ getLogBarXDimensions ~ sum:',
  //     sum
  //   );

  //   return [x, barW, color, sum];
  // }
  computeLogBarXDimensions(datas: any) {
    let barWs: any = [];
    let barXs: any = [];

    datas.forEach((d: any, i: number) => {
      let barW = 0;
      let x = 0;
      // let color = this.histogramUIService.getColor(2);
      let sum;

      if (d.partition[0] === 0 || d.partition[1] === 0) {
        barW = Math.log10(this.rangeXLog.middlewidth);
        // color = this.histogramUIService.getColor(1);
      } else {
        barW =
          Math.log10(Math.abs(d.partition[0])) -
          Math.log10(Math.abs(d.partition[1]));

        if (d.partition[0] < 0 && d.partition[1] > 0) {
          barW = Math.log10(this.rangeXLog.middlewidth) * 2;
          // color = this.histogramUIService.getColor(0);
        }
      }

      barW = Math.abs(barW);

      sum = barWs.reduce(
        (partialSum: any, a: any) => Math.abs(partialSum) + Math.abs(a),
        0
      );
      barWs.push(barW);
      x = sum || 0;
      barXs.push(x);
    });

    console.log(
      'file: histogram.service.ts:242 ~ Histogram2Service ~ computeLogBarXDimensions ~ barW:',
      barWs,
      barXs
    );
    return [barWs, barXs];
  }
}
