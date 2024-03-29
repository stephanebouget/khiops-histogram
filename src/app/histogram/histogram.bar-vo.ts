import { HistogramType } from './histogram.types';
import { HistogramUIService } from '../histogram/histogram.ui.service';

export class HistogramBarVO {
  barWlog: number = 0;
  barXlog: number = 0;
  barWlin: number = 0;
  barXlin: number = 0;
  color: string = HistogramUIService.getColor(2);
  partition = [];

  constructor(d: any, middlewidth: number, xType: string) {
    this.partition = d.partition;

    if (xType === HistogramType.LIN) {
      let barWlin = 0;
      if (this.partition[0] < 0 && this.partition[1] > 0) {
        barWlin = Math.abs(this.partition[0]) + Math.abs(this.partition[1]);
      } else {
        barWlin = Math.abs(this.partition[0]) - Math.abs(this.partition[1]);
      }
      this.barWlin = Math.abs(barWlin);
    } else {
      let barWlog = 0;
      if (d.partition[0] === 0 || d.partition[1] === 0) {
        barWlog = Math.log10(middlewidth);
        this.color = HistogramUIService.getColor(1);
      } else {
        barWlog =
          Math.log10(Math.abs(this.partition[0])) -
          Math.log10(Math.abs(this.partition[1]));

        if (this.partition[0] < 0 && this.partition[1] > 0) {
          barWlog = Math.log10(middlewidth) * 2;
          this.color = HistogramUIService.getColor(0);
        }
      }
      this.barWlog = Math.abs(barWlog);
    }
  }

  computeX(bars: HistogramBarVO[]) {
    let sum = bars
      .map((e) => e.barWlog)
      .reduce(
        (partialSum: any, a: any) => Math.abs(partialSum) + Math.abs(a),
        0
      );
    this.barXlog = sum || 0;
    sum = bars
      .map((e) => e.barWlin)
      .reduce(
        (partialSum: any, a: any) => Math.abs(partialSum) + Math.abs(a),
        0
      );
    this.barXlin = sum || 0;
  }
}
