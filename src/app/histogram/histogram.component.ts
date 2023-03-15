import {
  Component,
  ElementRef,
  Input,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import * as d3 from 'd3';
import { HistogramService } from './histogram.service';
import { HistogramType } from './histogram.types';

@Component({
  selector: 'app-histogram',
  templateUrl: './histogram.component.html',
  styleUrls: ['./histogram.component.scss'],
})
export class HistogramComponent {
  @ViewChild('chart', { static: false })
  chart!: ElementRef;
  @ViewChild('tooltipEl', { static: false })
  tooltipEl!: ElementRef;

  svg: any;
  tooltip!: any;
  errorMessage = false;

  // Dynamic values
  @Input() datas: any;
  @Input() type: HistogramType | string = HistogramType.LIN;
  @Input() h: number = 220;
  @Input() w: number = 1000;
  padding = 40;
  defaultChartW = 0;
  middleW = 0;

  // Static config values
  xTickCount = 10;
  yTicksCount = 5;
  tickSize = 0;
  minBarHeight = 2;

  // Local variables
  rangeXLog = 0;
  rangeXLin = 0;
  rangeY = 0;
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

  constructor(private histogramService: HistogramService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.['w']?.currentValue || changes?.['datas']) {
      this.init();
    }
    if (changes?.['datas'] && !changes?.['datas']?.currentValue) {
      this.errorMessage = true;
    } else {
      this.errorMessage = false;
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
        if (this.type === HistogramType.LOG) {
          this.drawLogX();
        } else {
          this.drawLinX();
        }
        this.drawYAxis();
        this.addTooltip();
        this.drawHistogram(this.datas);
      }
    }
  }

  drawLogX() {
    [this.rangeXLin, this.rangeXLog] = this.histogramService.getRangeX(
      this.datas
    );
    this.logView = this.histogramService.getLogChartVisibility(this.datas);
    let visibleChartsCount = this.histogramService.getVisibleChartsCount(
      this.logView
    );

    this.rangeY = this.histogramService.getRangeY(this.datas);
    this.defaultChartW = this.w / 5;
    this.drawChart(this.defaultChartW * 4 + this.padding * 2);
    this.tickSize = -(4 * this.defaultChartW + this.middleW);

    this.middleW = (this.w / 10) * this.logView.p0;
    this.ratioY = this.histogramService.getRatioY(this.h, this.yPadding);

    let lastPadding = 0;
    if (visibleChartsCount === 1) {
      lastPadding = this.padding;
    }

    this.isP0Visible =
      this.logView.p0N || this.logView.p0 || this.logView.p1N ? 1 : 0;

    this.chartW.p1N =
      ((4 * this.defaultChartW - this.middleW - lastPadding) /
        visibleChartsCount) *
      this.logView.p1N;
    this.drawXAxis('p1N', [this.rangeXLog, 1], this.padding, this.chartW.p1N);

    this.chartW.p0N =
      ((4 * this.defaultChartW - this.middleW - lastPadding) /
        visibleChartsCount) *
      this.logView.p0N;
    this.drawXAxis(
      'p0N',
      [1, this.rangeXLog],
      this.padding + this.chartW.p1N,
      this.chartW.p0N,
      true
    );

    this.chartW.p0 = this.middleW * this.logView.p0;

    this.drawXAxis(
      'p0',
      [-1, 0, 1],
      this.padding + this.chartW.p0N + this.chartW.p1N - lastPadding,
      this.chartW.p0
    );

    this.chartW.p0P =
      ((4 * this.defaultChartW - this.middleW) / visibleChartsCount) *
      this.logView.p0P;
    this.drawXAxis(
      'p0P',
      [this.rangeXLog, 1],
      this.chartW.p1N +
        this.chartW.p0 +
        this.chartW.p0N +
        this.padding -
        lastPadding,
      this.chartW.p0P,
      true
    );

    this.chartW.p1P =
      ((4 * this.defaultChartW - this.middleW) / visibleChartsCount) *
      this.logView.p1P;
    this.drawXAxis(
      'p1P',
      [1, this.rangeXLog],
      this.chartW.p1N +
        this.chartW.p0N +
        this.chartW.p0 +
        this.chartW.p0P +
        this.padding,
      this.chartW.p1P
    );

    this.ratioX = this.histogramService.getLogRatioX(
      this.chartW.p1N + this.chartW.p0N + this.chartW.p0P + this.chartW.p1P,
      this.middleW * this.logView.p0
    );
  }

  drawLinX() {
    [this.rangeXLin, this.rangeXLog] = this.histogramService.getRangeX(
      this.datas
    );
    this.rangeY = this.histogramService.getRangeY(this.datas);
    this.defaultChartW = this.w / 2 - this.w / 10; // w/10 = middlewidth
    this.tickSize = -(2 * this.defaultChartW);
    this.ratioX = this.histogramService.getLinRatioX(
      this.type,
      this.defaultChartW
    );
    this.ratioY = this.histogramService.getRatioY(this.h, this.yPadding);
    this.drawChart(this.defaultChartW * 2 + this.padding * 2);

    this.linPart1 = this.histogramService.isChartVisible(
      this.datas,
      HistogramType.LIN,
      1
    );
    this.linPart2 = this.histogramService.isChartVisible(
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
    this.tooltipEl!.nativeElement.innerHTML = '';

    this.tooltip = d3
      .select(this.tooltipEl!.nativeElement)
      .append('div')
      .style('display', 'none')
      .attr('class', 'tooltip')
      .style('background-color', 'white')
      .style('border', 'solid')
      .style('border-width', '2px')
      .style('padding', '5px');
  }

  drawRect(d: any, i: number) {
    var self = this;
    let x, barW: any, color;

    if (this.type === HistogramType.LIN) {
      [x, barW, color] = this.histogramService.getLinBarDimensions(
        d,
        this.defaultChartW,
        this.padding,
        this.ratioX,
        this.linPart1,
        this.linPart2
      );
    } else {
      [x, barW, color] = this.histogramService.getLogBarDimensions(
        d,
        this.chartW,
        this.padding,
        this.middleW * this.logView.p0,
        this.ratioX,
        this.logView
      );
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
      let logRange =
        '[' +
        self.histogramService.getSign(d.partition[0]) +
        Math.abs(Math.round(Math.log10(Math.abs(d.partition[0])) * 100) / 100) +
        ', ';
      logRange +=
        self.histogramService.getSign(d.partition[1]) +
        Math.abs(Math.round(Math.log10(Math.abs(d.partition[1])) * 100) / 100) +
        ']';

      //@ts-ignore
      self.tooltip.html(
        'Value: ' +
          d.value +
          '<br>' +
          'Range: ' +
          JSON.stringify(d.partition) +
          '<br>' +
          'Log: ' +
          logRange
      );
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

    let barHeight = d.value * this.ratioY;
    if (barHeight !== 0 && barHeight < this.minBarHeight) {
      barHeight = this.minBarHeight;
    }

    this.svg
      .append('rect')
      .attr('id', 'rect-' + i)
      .attr('x', x)
      .attr('y', this.h - barHeight)
      .attr('stroke', 'black')
      .attr('stroke-width', '0')
      .on('click', onclickRect)
      .on('mouseover', mouseover)
      .on('mousemove', mousemove)
      .on('mouseleave', mouseleave)
      .attr('width', barW * this.ratioX)
      .attr('height', barHeight)
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
    if (width !== 0) {
      let x;
      let tickCount = this.xTickCount;

      if (this.type === HistogramType.LIN) {
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
          if (this.type === HistogramType.LIN) {
            if (reverse) {
              if (d !== 0) {
                return '-' + val;
              }
            } else {
              return val;
            }
          } else {
            if (part === 'p0') {
              if (i === 1) {
                return 0;
              }
            } else {
              if (i === 0) {
                if (part === 'p0N' || part === 'p1P') {
                  return;
                }
                if (domain[0] < domain[1]) {
                  return 0;
                }
              } else if (i % 2) {
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
      return tick !== 0 ? -val + ' (-' + tick + ')' : val + ' (' + tick + ')';
    } else {
      return val + ' (' + tick + ')';
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
    // Create the scale
    var y = d3
      .scaleLinear()
      .domain([0, this.rangeY]) // This is what is written on the Axis: from 0 to 100
      .range([this.h - this.yPadding / 2, 0]); // Note it is reversed

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
