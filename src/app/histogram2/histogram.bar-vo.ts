import { Histogram2UIService } from '../histogram2/histogram.ui.service';

export class HistogramBarVO {
  barWlog: number = 0;
  barXlog: number = 0;
  barWlin: number = 0;
  barXlin: number = 0;
  color: string = Histogram2UIService.getColor(2);
  partition = [];

  constructor(d: any, middlewidth: number) {
    this.partition = d.partition;
    let barWlog = 0;
    let barWlin = 0;
    if (d.partition[0] === 0 || d.partition[1] === 0) {
      barWlog = Math.log10(middlewidth);
      barWlin = middlewidth;
      this.color = Histogram2UIService.getColor(1);
    } else {
      barWlog =
        Math.log10(Math.abs(this.partition[0])) -
        Math.log10(Math.abs(this.partition[1]));
      barWlin = Math.abs(this.partition[0]) - Math.abs(this.partition[1]);

      if (this.partition[0] < 0 && this.partition[1] > 0) {
        barWlog = Math.log10(middlewidth) * 2;
        barWlin = middlewidth * 2;
        this.color = Histogram2UIService.getColor(0);
      }
    }

    this.barWlog = Math.abs(barWlog);
    this.barWlin = Math.abs(barWlin);
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
