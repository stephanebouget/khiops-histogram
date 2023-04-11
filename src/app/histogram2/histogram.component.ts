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

        // if (this.xType === HistogramType.LOG) {
        //   this.drawLogX();
        // } else {
        //   this.drawLinX();
        // }
        this.drawChart(this.w);
        this.drawYAxis();
        this.addTooltip();
        let logW;

        [this.rangeXLin, this.rangeXLog] = this.histogramService.getRangeX(
          this.datas
        );

        let log = Math.log10(Math.abs(this.rangeXLog.max));

        if (this.rangeXLog.min > 1) {
          log = log - Math.log10(Math.abs(this.rangeXLog.min));
        } else {
          log = log + Math.log10(Math.abs(this.rangeXLog.min));
        }
        if (this.rangeXLog.negInf) {
          log = log - Math.log10(Math.abs(this.rangeXLog.negInf));
        }
        if (this.rangeXLog.posInf) {
          log = log - Math.log10(Math.abs(this.rangeXLog.posInf));
        }

        this.ratio = this.w / log;
        this.drawXAxis(
          'pP',
          [this.rangeXLog.min, this.rangeXLog.max],
          this.padding,
          this.w
        );
        this.drawHistogram(this.datas);
      }
    }
  }

  drawChart(chartW: number) {
    this.svg = d3
      .select(this.chart.nativeElement)
      .append('svg')
      .attr('width', chartW)
      .attr('height', this.h + this.yPadding);
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
    } else {
      [x, barW, color] = this.histogramService.getLogBarXDimensions(
        i,
        d,
        this.w
      );

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
    console.log(
      'file: histogram.component.ts:394 ~ HistogramComponent ~ domain:',
      domain,
      width
    );
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
