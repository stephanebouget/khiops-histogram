import { Injectable } from '@angular/core';
import { Histogram2Type as HistogramType } from './histogram.types';
import { Histogram2UIService as HistogramUIService } from './histogram.ui.service';

@Injectable({
  providedIn: 'root',
})
export class Histogram2Service {
  // rangeXLog: number = 0;
  // rangeXLogMin: number = 0;
  rangeXLin: number = 0;
  rangeYLin: number = 0;
  rangeYLog = {
    min: 0,
    max: 0,
    realMin: 0,
    realMax: 0,
  };
  rangeXLog = {
    p0P: {
      min: 0,
      max: 0,
    },
    p0N: {
      min: 0,
      max: 0,
    },
    p0: {
      min: 0,
      max: 0,
    },
    p1N: {
      min: 0,
      max: 0,
    },
    p1P: {
      min: 0,
      max: 0,
    },
  };
  barWs: any[] = [];

  constructor(private histogramUIService: HistogramUIService) {}

  getRangeX(part: string, datas: any) {
    if (part === 'p1P') {
      var filtered = datas;
      // var filtered = datas.filter(function (d: any) {
      //   return d.partition[0] >= 1;
      // });
      console.log(
        'file: histogram.service.ts:50 ~ Histogram2Service ~ filtered ~ filtered:',
        filtered
      );
      this.rangeXLog.p1P.min = Math.abs(filtered[0].partition[0]);
      this.rangeXLog.p1P.max = Math.abs(
        filtered[filtered.length - 1].partition[1]
      );
    }

    // this.rangeXLog.p1P.min = Math.abs(datas[0].partition[0]);

    this.rangeXLin = 0;
    // datas.forEach((d: any, i: number) => {
    //   if (d.partition[0] !== 0) {
    //     if (Math.abs(d.partition[0]) > this.rangeXLog.p1P.max) {
    //       this.rangeXLog.p1P.max = Math.abs(d.partition[0]);
    //     }

    //     // if (Math.abs(1 / d.partition[0]) > this.rangeXLog) {
    //     //   this.rangeXLog = Math.abs(1 / d.partition[0]);
    //     // }
    //     if (Math.abs(d.partition[0]) > this.rangeXLin) {
    //       this.rangeXLin = Math.abs(d.partition[0]);
    //     }
    //   }
    //   if (d.partition[1] !== 0) {
    //     if (Math.abs(d.partition[1]) > this.rangeXLog.p1P.max) {
    //       this.rangeXLog.p1P.max = Math.abs(d.partition[1]);
    //     }
    //     // if (Math.abs(1 / d.partition[1]) > this.rangeXLog) {
    //     //   this.rangeXLog = Math.abs(1 / d.partition[1]);
    //     // }
    //     if (Math.abs(d.partition[1]) > this.rangeXLin) {
    //       this.rangeXLin = Math.abs(d.partition[1]);
    //     }
    //   }
    // });
    // console.log(
    //   'file: histogram.service.ts:23 ~ HistogramService ~ getRangeX ~ this.rangeXLog:',
    //   this.rangeXLogMin,
    //   this.rangeXLog
    // );
    // this.rangeXLogMin = 10
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
    // this.rangeYLog.max = (Math.max(...dataValues));
    // this.rangeYLog.min = (Math.min(...dataValues));

    // if (this.rangeYLog.max === -Infinity) {
    //   this.rangeYLog.max = -1;
    // }
    // if (this.rangeYLog.realMax === -Infinity) {
    //   this.rangeYLog.realMax = -1;
    // }
    // if (this.rangeYLog.min === -Infinity) {
    //   this.rangeYLog.min = -1;
    // }
    // if (this.rangeYLog.realMin === -Infinity) {
    //   this.rangeYLog.realMin = -12;
    // }

    return this.rangeYLog;
  }

  getLogMinY(datas: any) {
    const dataValues = datas.map((e: any) => e.logValue);
    return Math.min(...dataValues);
  }

  getLinRatioX(w: number) {
    let ratioX = w / this.rangeXLin;
    return ratioX;
  }

  // getLogRatioX(w: number) {
  //   let maxVal = Math.log10(Math.abs(this.rangeXLog));
  //   let minVal = Math.log10(Math.abs(this.rangeXLogMin));
  //   if (maxVal === -Infinity) {
  //     maxVal = 1;
  //   }
  //   let ratioX = w / (maxVal + minVal);
  //   return ratioX;
  // }

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

  getVisibleChartsCount(logView: any) {
    let visibleChartsCount = 0;
    Object.keys(logView).forEach((key: any) => {
      if (logView[key] && key !== 'p0') {
        visibleChartsCount++;
      }
    });
    return visibleChartsCount;
  }

  getLogChartVisibility(datas: any) {
    let logView = {
      p1N: 1,
      p0N: 1,
      p0: 1,
      p0P: 1,
      p1P: 1,
    };
    logView.p1N =
      datas.find((e: any) => {
        return e.partition[0] <= -1 || e.partition[1] <= -1;
      }) !== undefined
        ? 1
        : 0;
    logView.p0N =
      datas.find((e: any) => {
        return (
          (e.partition[0] < 0 && e.partition[0] > -1) ||
          (e.partition[1] < 0 && e.partition[1] > -1)
        );
      }) !== undefined
        ? 1
        : 0;
    // logView.p0 =
    //   datas.find((e: any) => {
    //     return e.partition[0] == 0 || e.partition[1] === 0;
    //   }) !== undefined
    //     ? 1
    //     : 0;
    logView.p0P =
      datas.find((e: any) => {
        return (
          (e.partition[0] > 0 && e.partition[0] < 1) ||
          (e.partition[1] > 0 && e.partition[1] < 1)
        );
      }) !== undefined
        ? 1
        : 0;
    logView.p1P =
      datas.find((e: any) => {
        return e.partition[0] >= 1 || e.partition[1] >= 1;
      }) !== undefined
        ? 1
        : 0;

    logView.p0 = logView.p0P || logView.p0N ? 1 : 0;

    return logView;
  }

  getLinChartVisibility(datas: any, type = HistogramType.LIN, part: any) {
    if (part === 1) {
      return datas[0].partition[0] < 0;
    } else {
      return datas[datas.length - 1].partition[1] > 0;
    }
  }

  getLogBarXDimensions(
    i: number,
    d: any,
    chartW: any
    // padding = 0,
    // middleW = 0,
    // ratioX = 0,
    // logView: any
  ) {
    let shift = 0;
    let barW = 0;
    let barX = 0;
    let x = 0;
    let barMin = 0;
    let color = this.histogramUIService.getColor(2);

    if (i === 0) {
      this.barWs = [];
    }
    // if (d.partition[0] >= 1 ) {
      barMin = Math.min(d.partition[1], d.partition[0]);
      barMin = barMin - this.rangeXLog.p1P.min;
      x = 0;
      barW =
        Math.log10(Math.abs(d.partition[1])) -
        Math.log10(Math.abs(d.partition[0]));

      const sum = this.barWs.reduce(
        (partialSum: any, a: any) => Math.abs(partialSum) + Math.abs(a),
        0
      );
      this.barWs.push(barW);
      x = sum || 0;
    // } else {
    //   x = 0;
    //   barW = 0;
    // }

    // widthLg =

    // let factor = 570
    // factor=chartW-100
    // console.log('file: histogram.service.ts:242 ~ Histogram2Service ~ chartW:', chartW);

    // chartW=chartW*factor
    // barW=barW*factor
    // x=x*factor

    // let visibleChartsCount = this.getVisibleChartsCount(logView);

    // if (d.partition[0] >= 1 || d.partition[0] > 0) {
    //   shift =
    //     padding +
    //     logView.p1N * chartW.p1N +
    //     logView.p0N * chartW.p0N +
    //     logView.p0 * chartW.p0 +
    //     logView.p0P * chartW.p0P;
    //   barW =
    //     Math.log10(Math.abs(d.partition[1])) -
    //     Math.log10(Math.abs(d.partition[0]));
    //   barW = barW / visibleChartsCount;
    //   x = shift + (ratioX / visibleChartsCount) * barX;
    // } else if (d.partition[1] <= -1 || d.partition[1] < 0) {
    //   color = this.histogramUIService.getColor(0);
    //   shift = padding + logView.p1P * chartW.p1P;
    //   barW =
    //     Math.log10(Math.abs(d.partition[0])) -
    //     Math.log10(Math.abs(d.partition[1]));
    //   barW = barW / visibleChartsCount;
    //   x = shift - (ratioX / visibleChartsCount) * barX;
    // } else {
    //   let isZeroP0 = d.partition[0] === 0;
    //   let isZeroP1 = d.partition[1] === 0;
    //   if (isZeroP0) {
    //     shift =
    //       padding +
    //       logView.p1N * chartW.p1N +
    //       logView.p0N * chartW.p0N +
    //       logView.p0 * chartW.p0;
    //     x = shift - middleW / 2;
    //     barW = middleW / 2 / ratioX;
    //     barW =
    //       barW +
    //       (logView.p0P * chartW.p0P) / ratioX +
    //       Math.log10(Math.abs(d.partition[1])) / visibleChartsCount;
    //   } else if (isZeroP1) {
    //     color = this.histogramUIService.getColor(0);

    //     shift =
    //       padding +
    //       logView.p1N * chartW.p1N +
    //       logView.p0N * chartW.p0N +
    //       middleW / 2;
    //     barW = middleW / 2 / ratioX;
    //     barW =
    //       barW +
    //       (logView.p1P * chartW.p1P) / ratioX +
    //       Math.log10(Math.abs(d.partition[0])) / visibleChartsCount;
    //     x = shift - barW * ratioX;
    //   } else {
    //     color = this.histogramUIService.getColor(1);

    //     // partition is neg and pos
    //     barW = middleW / ratioX;
    //     barW =
    //       barW +
    //       Math.log10(Math.abs(d.partition[0])) / visibleChartsCount +
    //       Math.log10(Math.abs(d.partition[1])) / visibleChartsCount;

    //     shift = padding;

    //     if (d.partition[0] < -1) {
    //       barW =
    //         barW +
    //         (logView.p0N * chartW.p0N + logView.p0P * chartW.p0P) / ratioX;
    //       shift =
    //         padding +
    //         logView.p1N * chartW.p1N -
    //         (ratioX / visibleChartsCount) * barX;
    //     } else if (d.partition[0] < 0) {
    //       barW =
    //         barW +
    //         (logView.p0N * chartW.p0N + logView.p0P * chartW.p0P) / ratioX;

    //       shift =
    //         padding +
    //         logView.p1N * chartW.p1N -
    //         (Math.log10(Math.abs(d.partition[0])) / visibleChartsCount) *
    //           ratioX;
    //     }

    //     x = shift;
    //   }
    // }

    return [x, barW, color];
  }
  getLinBarXDimensions(
    d: any,
    chartW = 0,
    padding = 0,
    ratioX = 0,
    linPart1 = true,
    linPart2 = true
  ) {
    let shift = 0;
    let barW = 0;
    let barX = 0;
    let x = 0;
    let barMin = 0;

    barMin = Math.min(d.partition[1], d.partition[0]);

    let n = 0;
    if (linPart1 && linPart2) {
      barX = barMin;
    } else if (linPart1) {
      n = 1;
      barX = barMin * 2;
    } else {
      n = -1;
      barX = barMin * 2;
    }

    shift = chartW * (1 + n) + padding;
    x = shift + ratioX * barX;
    let barMax = Math.max(d.partition[1], d.partition[0]);

    barW = barMax - barMin;
    if (!(linPart1 && linPart2)) {
      barW = 2 * barW;
    }

    let color = this.histogramUIService.getColor(2);
    if (d.partition[0] < 0 && d.partition[1] < 0) {
      color = this.histogramUIService.getColor(0);
    } else if (d.partition[0] < 0 && d.partition[1] > 0) {
      color = this.histogramUIService.getColor(1);
    }

    return [x, barW, color];
  }
}
