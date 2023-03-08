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
  svg: any;
  tooltip!: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>;

  // Dynamic values
  @Input() datas: any;
  @Input() type: HistogramType | string = HistogramType.LIN;
  @Input() h: number = 220;
  @Input() w: number = 1000;
  padding = 0;
  chartW = 0;
  middleW = 0;

  // Static config values
  xTickCount = 10;
  yTicksCount = 5;
  tickSize = 0;
  cssPadding = 40;

  // Local variables
  rangeXLog = 0;
  rangeXLin = 0;
  rangeY = 0;
  ratioX = 0;
  ratioY = 0;

  constructor(private histogramService: HistogramService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.['w']?.currentValue) {
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

      this.w = this.w - this.cssPadding; // add padding
      this.padding = this.w / 20;
      [this.rangeXLin, this.rangeXLog] = this.histogramService.getRangeX(
        this.datas
      );
      this.rangeY = this.histogramService.getRangeY(this.datas);

      if (this.type === HistogramType.LOG) {
        this.chartW = this.w / 5;
        this.middleW = this.w / 10;
        this.tickSize = -(4 * this.chartW + this.middleW);
        this.ratioX = this.histogramService.getRatioX(this.type, this.chartW);
        this.ratioY = this.histogramService.getRatioY(this.h, this.padding);
        this.drawChart(this.chartW * 4 + this.padding * 2 + this.middleW);

        this.drawXAxis([this.rangeXLog, 1], this.padding);
        this.drawXAxis(
          [1, this.rangeXLog],
          this.chartW + this.padding,
          this.chartW,
          true
        );
        this.drawXAxis(
          [-1, 0, 1],
          this.chartW * 2 + this.padding,
          this.chartW / 4
        );
        this.drawXAxis(
          [this.rangeXLog, 1],
          this.chartW * 2 + this.padding + this.middleW,
          this.chartW,
          true
        );
        this.drawXAxis(
          [1, this.rangeXLog],
          this.chartW * 3 + this.padding + this.middleW
        );
      } else {
        this.chartW = this.w / 2 - this.padding;
        this.tickSize = -(2 * this.chartW);
        this.ratioX = this.histogramService.getRatioX(this.type, this.chartW);
        this.ratioY = this.histogramService.getRatioY(this.h, this.padding);
        this.drawChart(this.chartW * 2 + this.padding * 2);

        this.drawXAxis([this.rangeXLin, 0], this.padding, this.chartW, true);
        this.drawXAxis([0, this.rangeXLin], this.chartW + this.padding);
      }
      this.drawYAxis();
      this.addTooltip();
      this.drawHistogram(this.datas);
    }
  }

  drawChart(chartW: number) {
    this.svg = d3
      .select(this.chart.nativeElement)
      .append('svg')
      .attr('width', chartW)
      .attr('height', this.h + this.padding);
  }

  addTooltip() {
    this.tooltip = d3
      .select('#tooltip')
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
    [x, barW] = this.histogramService.getBarDimensions(
      d,
      this.type,
      this.chartW,
      this.padding,
      this.middleW,
      this.ratioX
    );

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
      .attr('fill', d.color);
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
    domain: any,
    shift: number,
    width: number = this.chartW,
    reverse = false
  ) {
    let x;

    if (this.type === HistogramType.LIN) {
      x = d3.scaleLinear().domain(domain).range([0, width]); // This is where the axis is placed: from 100px to 800px
    } else {
      x = d3.scaleLog().base(10).domain(domain).range([0, width]);
    }

    const axis = d3
      .axisBottom(x)
      .ticks(this.xTickCount)
      .tickSize(-this.h + this.padding / 2)
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

  drawYAxis() {
    // Create the scale
    var y = d3
      .scaleLinear()
      .domain([0, this.rangeY]) // This is what is written on the Axis: from 0 to 100
      .range([this.h - this.padding / 2, 0]); // Note it is reversed

    let shift = this.padding;

    // Draw the axis
    const axis = d3.axisLeft(y).tickSize(this.tickSize).ticks(this.yTicksCount);
    this.svg
      .append('g')
      .attr('class', 'y axis-grid')
      .attr('transform', 'translate(' + shift + ',' + this.padding / 2 + ')') // This controls the vertical position of the Axis
      .call(axis);
  }
}
