import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HistogramUIService {
  chartColors = ['#ffb703', '#fb8500', '#023047'];

  constructor() {}

  getColor(i: number) {
    return this.chartColors[i];
  }

  generateTooltip(d: any) {
    let logRange =
      '[' +
      this.getSign(d.partition[0]) +
      Math.abs(Math.round(Math.log10(Math.abs(d.partition[0])) * 100) / 100) +
      ', ';
    logRange +=
      this.getSign(d.partition[1]) +
      Math.abs(Math.round(Math.log10(Math.abs(d.partition[1])) * 100) / 100) +
      ']';

    return (
      'Value: ' +
      d.value.toFixed(6) +
      '<br>' +
      'log value: ' +
      d.logValue.toFixed(6) +
      '<br>' +
      'Range: ' +
      JSON.stringify(d.partition) +
      '<br>' +
      'Log: ' +
      logRange
    );
  }

  getSign(input: number) {
    return input > 0 ? '' : '-';
  }
}
