import { Histogram2UIService } from '../histogram2/histogram.ui.service';

export class HistogramBarVO {
  barW: number = 0;
  barX: number = 0;
  color: string = Histogram2UIService.getColor(2);

  partition = [];

  constructor(d: any, middlewidth: number) {
    this.partition = d.partition;
    let barW = 0;
    if (d.partition[0] === 0 || d.partition[1] === 0) {
      barW = Math.log10(middlewidth);
      this.color = Histogram2UIService.getColor(1);
    } else {
      barW =
        Math.log10(Math.abs(this.partition[0])) -
        Math.log10(Math.abs(this.partition[1]));

      if (this.partition[0] < 0 && this.partition[1] > 0) {
        barW = Math.log10(middlewidth) * 2;
        this.color = Histogram2UIService.getColor(0);
      }
    }

    this.barW = Math.abs(barW);
  }

  computeX(bars: HistogramBarVO[]) {
    let sum = bars
      .map((e) => e.barW)
      .reduce(
        (partialSum: any, a: any) => Math.abs(partialSum) + Math.abs(a),
        0
      );
    this.barX = sum || 0;
  }
}
