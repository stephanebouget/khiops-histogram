import {
  Component,
  ElementRef,
  Input,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import * as d3 from 'd3';
import { Histogram2Service as HistogramService } from './histogram.service';
import { format } from 'mathjs';
import { Histogram2UIService as HistogramUIService } from './histogram.ui.service';
import { Histogram2Type as HistogramType } from './histogram.types';

@Component({
  selector: 'app-histogram-2',
  templateUrl: './histogram.component.html',
  styleUrls: ['./histogram.component.scss'],
})
export class Histogram2Component {
  @ViewChild('chart', { static: false })
  chart!: ElementRef;
  @ViewChild('chartTooltip', { static: false })
  chartTooltip!: ElementRef;

  svg: any;
  tooltip!: any;
  errorMessage = false;

  // Dynamic values
  @Input() datas: any;
  @Input() xType: HistogramType | string = HistogramType.LIN;
  @Input() yType: HistogramType | string = HistogramType.LIN;
  @Input() h: number = 220;
  @Input() w: number = 1000;
  padding = 0;
  defaultChartW = 0;
  middleW = 0;

  // Static config values
  xTickCount = 26;
  yTicksCount = 15;
  tickSize = 0;
  minBarHeight = 4;
  minBarWidth = 1;

  // Local variables
  rangeXLog: any;
  rangeXLin: any;
  rangeYLin = 0;
  rangeYLog = {
    min: 0,
    max: 0,
    realMin: 0,
    realMax: 0,
  };

  ratioX = 0;
  ratioY = 0;
  linPart1 = true;
  linPart2 = true;
  logPart1 = true;
  logPart2 = true;
  // zoom!: any;

  logView: any = {
    p1N: 0,
    p0N: 0,
    p0: 0,
    p0P: 0,
    p1P: 0,
  };
  chartW: any = {
    p1N: 0,
    p0N: 0,
    p0: 0,
    p0P: 0,
    p1P: 0,
  };
  isP0Visible = 0;
  yPadding = 100;
  formatOpts = { lowerExp: -2, upperExp: 2 };
  visibleChartsCount = 0;
  ratio: number = 0;

  constructor(
    private histogramService: HistogramService,
    private histogramUIService: HistogramUIService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.['datas']) {
      if (!changes?.['datas']?.currentValue) {
        this.errorMessage = true;
      } else {
        this.errorMessage = false;
      }
    }
    if (
      changes?.['w']?.currentValue ||
      changes?.['datas'] ||
      changes?.['xType'] ||
      changes?.['yType']
    ) {
      this.init();
    }
  }

  ngAfterViewInit(): void {}

  initSpecs(datas: any) {
    this.datas = datas;
  }

  init() {
    if (this.chart) {
      this.chart.nativeElement.innerHTML = '';
      if (this.datas) {
        if (this.yType === HistogramType.LOG) {
          this.rangeYLog = this.histogramService.getLogRangeY(this.datas);
          this.ratioY = this.histogramService.getLogRatioY(
            this.h,
            this.yPadding
          );
        } else {
          this.rangeYLin = this.histogramService.getLinRangeY(this.datas);
          this.ratioY = this.histogramService.getLinRatioY(
            this.h,
            this.yPadding
          );
        }

        if (this.xType === HistogramType.LOG) {
          this.drawLogX();
        } else {
          this.drawLinX();
        }
        this.drawChart(this.w);
        this.drawYAxis();
        this.addTooltip();

        [this.rangeXLin, this.rangeXLog] = this.histogramService.getRangeX(
          'p1P',
          this.datas
        );
        const logW =
          Math.log10(this.rangeXLog.p1P.max) - Math.log10(this.rangeXLog.p1P.min);
        this.ratio = this.w / logW;
        this.drawXAxis(
          'p1P',
          [this.rangeXLog.p1P.min, this.rangeXLog.p1P.max],
          this.padding,
          this.w
        );
        this.drawHistogram(this.datas);
      }
    }
  }

  drawLogX() {
    // [this.rangeXLin, this.rangeXLog, this.rangeXLogMin] =
    //   this.histogramService.getRangeX(this.datas);
    // this.logView = this.histogramService.getLogChartVisibility(this.datas);
    // this.visibleChartsCount = this.histogramService.getVisibleChartsCount(
    //   this.logView
    // );
    // this.defaultChartW = this.w / 5;
    // this.drawChart(this.defaultChartW * 4 + this.padding * 2);
    // this.middleW = (this.w / 10) * this.logView.p0;
    // this.tickSize = -(4 * this.defaultChartW);
    // let lastPadding = 0;
    // if (this.visibleChartsCount === 1 && !this.logView.p0) {
    //   lastPadding = this.padding;
    // }
    // this.isP0Visible =
    //   this.logView.p0N || this.logView.p0 || this.logView.p1N ? 1 : 0;
    // this.chartW.p1N =
    //   ((4 * this.defaultChartW - this.middleW - lastPadding) /
    //     this.visibleChartsCount) *
    //   this.logView.p1N;
    // this.drawXAxis('p1N', [this.rangeXLog, 1], this.padding, this.chartW.p1N);
    // this.chartW.p0N =
    //   ((4 * this.defaultChartW - this.middleW - lastPadding) /
    //     this.visibleChartsCount) *
    //   this.logView.p0N;
    // this.drawXAxis(
    //   'p0N',
    //   [1, this.rangeXLog],
    //   this.padding + this.chartW.p1N,
    //   this.chartW.p0N,
    //   true
    // );
    // this.chartW.p0 = this.middleW * this.logView.p0;
    // this.drawXAxis(
    //   'p0',
    //   [-1, 0, 1],
    //   this.padding + this.chartW.p0N + this.chartW.p1N - lastPadding,
    //   this.chartW.p0
    // );
    // this.chartW.p0P =
    //   ((4 * this.defaultChartW - this.middleW) / this.visibleChartsCount) *
    //   this.logView.p0P;
    // this.drawXAxis(
    //   'p0P',
    //   [this.rangeXLog, 1],
    //   this.chartW.p1N +
    //     this.chartW.p0 +
    //     this.chartW.p0N +
    //     this.padding -
    //     lastPadding,
    //   this.chartW.p0P,
    //   true
    // );
    // this.chartW.p1P =
    //   ((4 * this.defaultChartW - this.middleW) / this.visibleChartsCount) *
    //   this.logView.p1P;
    // this.drawXAxis(
    //   'p1P',
    //   [this.rangeXLogMin, this.rangeXLog],
    //   this.chartW.p1N +
    //     this.chartW.p0N +
    //     this.chartW.p0 +
    //     this.chartW.p0P +
    //     this.padding,
    //   this.chartW.p1P
    // );
    // this.ratioX = this.histogramService.getLogRatioX(
    //   this.chartW.p1N + this.chartW.p0N + this.chartW.p0P + this.chartW.p1P
    // );
  }

  drawLinX() {
    [this.rangeXLin, this.rangeXLog] = this.histogramService.getRangeX(
      '',
      this.datas
    );
    this.defaultChartW = this.w / 2 - this.w / 10; // w/10 = middlewidth
    this.tickSize = -(2 * this.defaultChartW);
    this.ratioX = this.histogramService.getLinRatioX(this.defaultChartW);
    this.drawChart(this.defaultChartW * 2 + this.padding * 2);

    this.linPart1 = this.histogramService.getLinChartVisibility(
      this.datas,
      HistogramType.LIN,
      1
    );
    this.linPart2 = this.histogramService.getLinChartVisibility(
      this.datas,
      HistogramType.LIN,
      2
    );

    this.linPart1 &&
      this.drawXAxis(
        'linPart1',
        [this.rangeXLin, 0],
        this.padding,
        this.linPart2 ? this.defaultChartW : this.defaultChartW * 2,
        true
      );
    this.linPart2 &&
      this.drawXAxis(
        'linPart2',
        [0, this.rangeXLin],
        this.linPart1 ? this.defaultChartW + this.padding : this.padding,
        this.linPart1 ? this.defaultChartW : this.defaultChartW * 2
      );
  }

  drawChart(chartW: number) {
    // this.zoom = d3
    //   .zoom()
    //   .scaleExtent([1, 10]) // This control how much you can unzoom (x0.5) and zoom (x20)
    //   .on('zoom', (e: any) => {
    //     this.w = this.w * e.transform.k;
    //     this.init();
    //   });

    this.svg = d3
      .select(this.chart.nativeElement)
      .append('svg')
      .attr('width', chartW)
      .attr('height', this.h + this.yPadding);
    // .call(this.zoom);
  }

  addTooltip() {
    this.chartTooltip!.nativeElement.innerHTML = '';
    this.tooltip = d3
      .select(this.chartTooltip!.nativeElement)
      .append('div')
      .attr('class', 'tooltip');
  }

  drawRect(d: any, i: number) {
    var self = this;
    let x: any, barH, barW: any, color;

    if (this.xType === HistogramType.LIN) {
      [x, barW, color] = this.histogramService.getLinBarXDimensions(
        d,
        this.defaultChartW,
        this.padding,
        this.ratioX,
        this.linPart1,
        this.linPart2
      );
    } else {
      [x, barW, color] = this.histogramService.getLogBarXDimensions(
        i,
        d,
        this.w
        // this.padding,
        // this.middleW * this.logView.p0,
        // this.ratioX,
        // this.logView
      );
      // console.log(
      //   'file: histogram.component.ts:311 ~ Histogram2Component ~ drawRect ~ x, barW, color:',
      //   x,
      //   barW,
      //   color
      // );
      x = this.ratio * x;
      barW = this.ratio * barW;
    }

    const onclickRect = function (e: any) {
      //@ts-ignore
      d3.select(this.parentNode).selectAll('rect').style('stroke-width', '0');
      //@ts-ignore
      d3.select(this).style('stroke-width', '2px');
      self.bringSvgToTop(document.getElementById('rect-' + i));
    };
    const mouseover = function (e: any) {
      //@ts-ignore
      self.tooltip.style('display', 'block').style('width', '140px');
    };
    const mousemove = function (e: any) {
      const tooltipText = self.histogramUIService.generateTooltip(d);
      //@ts-ignore
      self.tooltip.html(tooltipText);
      //@ts-ignore
      self.tooltip.style('margin-left', e.clientX - 70 + 'px');
      //@ts-ignore
      self.tooltip.style('margin-top', e.layerY - self.h / 2 + 'px');
    };
    const mouseleave = function (e: any) {
      //@ts-ignore
      self.tooltip
        .style('display', 'none')
        .style('margin-left', '0px')
        .style('margin-top', '0px');
    };

    if (this.yType === HistogramType.LIN) {
      barH = d.value * this.ratioY;
    } else {
      if (d.logValue !== 0) {
        let shift = Math.abs(this.rangeYLog.max);
        barH = Math.abs(d.logValue) * this.ratioY - shift * this.ratioY;
        barH = this.h - this.yPadding / 2 - barH;
      } else {
        barH = 0;
      }
    }
    if (barH !== 0 && barH < this.minBarHeight) {
      barH = this.minBarHeight;
    }
    // barW = barW * this.ratioX;
    // if (barW !== 0 && barW < this.minBarWidth) {
    //   barW = this.minBarWidth;
    // }
    console.log(
      'file: histogram.component.ts:392 ~ Histogram2Component ~ drawRect ~ barW:',
      barW
    );

    this.svg
      .append('rect')
      .attr('id', 'rect-' + i)
      .attr('x', x)
      .attr('y', this.h - barH)
      .attr('stroke', 'black')
      .attr('stroke-width', '0')
      .on('click', onclickRect)
      .on('mouseover', mouseover)
      .on('mousemove', mousemove)
      .on('mouseleave', mouseleave)
      .attr('width', barW)
      .attr('height', barH)
      .attr('fill', color);
  }

  drawHistogram(datasSet: any) {
    datasSet.forEach((d: any, i: number) => {
      this.drawRect(d, i);
    });
  }

  bringSvgToTop(targetElement: any) {
    // put the element at the bottom of its parent
    let parent = targetElement.parentNode;
    parent.appendChild(targetElement);
  }

  drawXAxis(
    part: string,
    domain: any,
    shift: number,
    width: number,
    reverse = false
  ) {
    // console.log(
    //   'file: histogram.component.ts:394 ~ HistogramComponent ~ domain:',
    //   domain
    // );
    if (width !== 0) {
      let x;
      let tickCount = this.xTickCount;

      if (this.xType === HistogramType.LIN) {
        x = d3.scaleLinear().domain(domain).range([0, width]); // This is where the axis is placed: from 100px to 800px
      } else {
        x = d3.scaleLog().base(10).domain(domain).range([0, width]);
      }
      if (part === 'p0') {
        x = d3.scaleLinear().domain(domain).range([0, width]);
        tickCount = 3;
      }

      const axis = d3
        .axisBottom(x)
        .ticks(tickCount)
        .tickSize(-this.h + this.yPadding / 2)
        //@ts-ignore
        .tickFormat((d, i) => {
          //@ts-ignore
          let val: any = d;
          if (this.xType === HistogramType.LIN) {
            if (reverse) {
              if (d !== 0) {
                return '-' + format(val);
              }
            } else {
              return '' + format(val);
            }
          } else {
            return this.formatTickDEBUG(val, reverse);
            if (part === 'p0') {
              if (i === 1) {
                return '-Infinity';
              }
            } else {
              let xTicksValuesCount = Math.ceil((1 / this.w) * 1000 * 3);

              // Adjust according to charts number
              xTicksValuesCount = Math.ceil(
                (xTicksValuesCount / 4) * this.visibleChartsCount
              );

              if (i === 0) {
                if (part === 'p0N' || part === 'p1P') {
                  return;
                }
                if (domain[0] < domain[1]) {
                  return this.formatTickDEBUG(0, false);
                }
              } else if (val === 1) {
                // always show 1
                return this.formatTickDEBUG(val, reverse);
              } else if (i % xTicksValuesCount === 0) {
                // return this.formatTick(val, reverse);
                return this.formatTickDEBUG(val, reverse);
              }
            }
          }
        });
      this.svg
        .append('g')
        .attr('class', 'x axis-grid')
        .attr('transform', 'translate(' + shift + ',' + this.h + ') ') // This controls the vertical position of the Axis
        .call(axis)
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-65)');
    }
  }

  formatTickDEBUG(val: number, reverse: boolean) {
    const tick = Math.round(Math.log10(val) * 100) / 100;
    if (reverse) {
      return tick !== 0
        ? '-' + format(val, this.formatOpts) + ' (-' + tick + ')'
        : '' + format(val, this.formatOpts) + ' (' + tick + ')';
    } else {
      return '' + format(val, this.formatOpts) + ' (' + tick + ')';
    }
  }

  formatTick(val: number, reverse: boolean) {
    const tick = Math.round(Math.log10(val) * 100) / 100;
    if (reverse) {
      return tick !== 0 ? -val : val;
    } else {
      return val;
    }
  }

  drawYAxis() {
    let y;
    // Create the scale
    if (this.yType === HistogramType.LIN) {
      y = d3
        .scaleLinear()
        .domain([0, this.rangeYLin]) // This is what is written on the Axis: from 0 to 100
        .range([this.h - this.yPadding / 2, 0]); // Note it is reversed
    } else {
      y = d3
        .scaleLinear()
        // .base(10)
        // .domain([this.rangeYLog.min, -1]) // This is what is written on the Axis: from 0 to 100
        // .domain([this.rangeYLog.min, this.rangeYLog.max]) // This is what is written on the Axis: from 0 to 100
        .domain([this.rangeYLog.max, this.rangeYLog.min]) // This is what is written on the Axis: from 0 to 100
        // .domain([0, this.rangeYLog.min]) // This is what is written on the Axis: from 0 to 100
        .range([0, this.h - this.yPadding / 2]); // Note it is reversed
    }

    let shift = this.padding;

    // Draw the axis
    const axis = d3.axisLeft(y).tickSize(this.tickSize).ticks(this.yTicksCount);
    this.svg
      .append('g')
      .attr('class', 'y axis-grid')
      .attr('transform', 'translate(' + shift + ',' + this.yPadding / 2 + ')') // This controls the vertical position of the Axis
      .call(axis);
  }
}
