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

  // Dynamic values
  @Input() datas: any;
  @Input() type: HistogramType | string = HistogramType.LIN;
  @Input() h: number = 220;
  @Input() w: number = 1000;
  padding = 0;
  defaultChartW = 0;
  // chartW = 0;
  middleW = 0;

  // Static config values
  xTickCount = 10;
  yTicksCount = 5;
  tickSize = 0;

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
    if (changes?.['w']?.currentValue || changes?.['datas']?.currentValue) {
      // setTimeout(() => {

      this.init();
      // }, 100);
    }
  }

  ngAfterViewInit(): void {}

  initSpecs(datas: any) {
    this.datas = datas;
  }

  init() {
    if (this.chart) {
      this.chart.nativeElement.innerHTML = '';
      if (this.type === HistogramType.LOG) {
        this.drawLogChart();
      } else {
        // this.drawLinChart();
      }
      this.drawYAxis();
      this.addTooltip();
      this.drawHistogram(this.datas);
    }
  }

  drawLogChart() {
    // this.padding = this.w / 20;
    [this.rangeXLin, this.rangeXLog] = this.histogramService.getRangeX(
      this.datas
    );
    this.logView = this.histogramService.getLogChartVisibility(this.datas);
    let visibleChartsCount = this.histogramService.getVisibleChartsCount(
      this.logView
    );
    console.log(
      'file: histogram.component.ts:106 ~ HistogramComponent ~ drawLogChart ~ visibleChartsCount:',
      visibleChartsCount
    );

    this.rangeY = this.histogramService.getRangeY(this.datas);
    this.defaultChartW = this.w / 5;
    this.drawChart(
      this.defaultChartW * 4 + this.padding * 2 + this.middleW * this.logView.p0
    );
    this.tickSize = -(4 * this.defaultChartW + this.middleW);

    // this.chartW = this.w / 5;
    this.middleW = (this.w / 10) * this.logView.p0;
    this.ratioY = this.histogramService.getRatioY(this.h, this.yPadding);

    let lastPadding = 0;
    if (visibleChartsCount === 1) {
      lastPadding = this.padding;
    }

    console.log(
      'file: histogram.component.ts:105 ~ HistogramComponent ~ drawLogChart ~ this.logView:',
      this.logView
    );
    this.isP0Visible =
      this.logView.p0N || this.logView.p0 || this.logView.p1N ? 1 : 0;
    console.log(
      'file: histogram.component.ts:104 ~ HistogramComponent ~ drawLogChart ~ this.isP0Visible:',
      this.isP0Visible
    );

    this.chartW.p1N =
      ((4 * this.defaultChartW - this.middleW - lastPadding) /
        visibleChartsCount) *
      this.logView.p1N;
    this.drawXAxis([this.rangeXLog, 1], this.padding, this.chartW.p1N);

    this.chartW.p0N =
      ((4 * this.defaultChartW - this.middleW - lastPadding) /
        visibleChartsCount) *
      this.logView.p0N;
    this.drawXAxis(
      [1, this.rangeXLog],
      this.padding + this.chartW.p1N,
      this.chartW.p0N,
      true
    );

    this.chartW.p0 = this.middleW * this.logView.p0;

    this.drawXAxis(
      [-1, 0, 1],
      this.padding + this.chartW.p0N + this.chartW.p1N - lastPadding,
      this.chartW.p0
    );

    this.chartW.p0P =
      ((4 * this.defaultChartW - this.middleW) / visibleChartsCount) *
      this.logView.p0P;
    this.drawXAxis(
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
      [1, this.rangeXLog],
      this.chartW.p1N +
        this.chartW.p0N +
        this.chartW.p0 +
        this.chartW.p0P +
        this.padding,
      this.chartW.p1P
    );

    this.ratioX = this.histogramService.getLogRatioX(
      this.type,
      // this.defaultChartW,
      this.chartW.p1N +
        this.chartW.p0N +
        this.chartW.p0 +
        this.chartW.p0P +
        this.chartW.p1P,
      visibleChartsCount
    );
    // this.chartW =
    //   (this.chartW.p1N +this. p0NChartW +this. p1NChartW + this.chartW.p1P) / visibleChartsCount;
    // console.log(
    //   'file: histogram.component.ts:161 ~ HistogramComponent ~ drawLogChart ~ this.chartW:',
    //   this.chartW
    // );
  }

  drawLinChart() {
    // this.padding = this.w / 20;
    [this.rangeXLin, this.rangeXLog] = this.histogramService.getRangeX(
      this.datas
    );
    this.rangeY = this.histogramService.getRangeY(this.datas);
    this.chartW = this.w / 2 - this.padding;
    this.tickSize = -(2 * this.chartW);
    this.ratioX = this.histogramService.getRatioX(this.type, this.chartW);
    this.ratioY = this.histogramService.getRatioY(this.h, this.padding);
    this.drawChart(this.chartW * 2 + this.padding * 2);

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
        [this.rangeXLin, 0],
        this.padding,
        this.linPart2 ? this.chartW : this.chartW * 2,
        true
      );
    this.linPart2 &&
      this.drawXAxis(
        [0, this.rangeXLin],
        this.linPart1 ? this.chartW + this.padding : this.padding,
        this.linPart1 ? this.chartW : this.chartW * 2
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
    let x, barW;

    if (this.type === HistogramType.LIN) {
      [x, barW] = this.histogramService.getLinBarDimensions(
        d,
        this.chartW,
        this.padding,
        this.ratioX,
        this.linPart1,
        this.linPart2
      );
    } else {
      [x, barW] = this.histogramService.getLogBarDimensions(
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

    this.svg
      .append('rect')
      .attr('id', 'rect-' + i)
      .attr('x', x)
      .attr('y', this.h - d.value * this.ratioY)
      .attr('stroke', 'black')
      .attr('stroke-width', '0')
      .on('click', onclickRect)
      .on('mouseover', mouseover)
      .on('mousemove', mousemove)
      .on('mouseleave', mouseleave)
      .attr('width', barW * this.ratioX)
      .attr('height', d.value * this.ratioY)
      .attr('fill', d.color ? d.color : '#123456');
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
  drawXAxis(domain: any, shift: number, width: number, reverse = false) {
    if (width !== 0) {
      let x;

      if (this.type === HistogramType.LIN) {
        x = d3.scaleLinear().domain(domain).range([0, width]); // This is where the axis is placed: from 100px to 800px
      } else {
        x = d3.scaleLog().base(10).domain(domain).range([0, width]);
      }

      const axis = d3
        .axisBottom(x)
        .ticks(this.xTickCount)
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
            if (i === 0) {
              if (domain[0] < domain[1]) {
                return 0;
              }
            } else if (i % 2) {
              const tick = Math.round(Math.log10(val) * 100) / 100;
              if (reverse) {
                return tick !== 0 ? '-' + tick : '' + tick;
              } else {
                return tick;
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
