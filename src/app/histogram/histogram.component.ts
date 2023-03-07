import {
  Component,
  ElementRef,
  Input,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-histogram',
  templateUrl: './histogram.component.html',
  styleUrls: ['./histogram.component.scss'],
})
export class HistogramComponent {
  @ViewChild('chart', { static: false })
  chart!: ElementRef;
  svg: any;

  @Input() datas: any;
  @Input() type: string = 'lin';
  @Input() h: number = 220;
  @Input() w: number = 1000;

  chartW = 0;
  middleW = 0;
  rangeXLog = 0;
  rangeXLin = 0;
  padding = 0;
  rangeY = 0;
  xTickCount = 10;
  yTicksCount = 5;
  tooltip!: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>;

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.['w']?.currentValue) {
      this.init();
    }
  }

  ngAfterViewInit(): void {}

  init() {
    if (this.chart) {
      this.chart.nativeElement.innerHTML = '';
      const containerElt = document.getElementById('app-container');
      this.w = containerElt?.clientWidth || 0;
      this.w = this.w - 40;

      this.padding = this.w / 20;

      if (this.type === 'log') {
        this.chartW = this.w / 5;
        this.middleW = this.w / 10;
        this.drawChart(this.chartW * 4 + this.padding * 2 + this.middleW);
        this.analyseDatas(this.datas);
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
        let tickSize = -(4 * this.chartW + this.middleW);
        this.drawYAxis(tickSize);
        this.addTooltip();
        this.drawHistogram(this.datas);
      } else {
        this.chartW = this.w / 2 - this.padding;
        this.drawChart(this.chartW * 2 + this.padding * 2);
        this.analyseDatas(this.datas);
        this.drawXAxis([this.rangeXLin, 1], this.padding, this.chartW, true);
        this.drawXAxis([1, this.rangeXLin], this.chartW + this.padding);
        let tickSize = -(2 * this.chartW);
        this.drawYAxis(tickSize);
        this.addTooltip();
        this.drawHistogram(this.datas);
      }
    }
  }

  drawChart(chartW: any) {
    this.svg = d3
      .select(this.chart.nativeElement)
      .append('svg')
      .attr('width', chartW)
      .attr('height', this.h + this.padding);
  }

  analyseDatas(datas: any) {
    const dataValues = datas.map((e: any) => e.value);
    this.rangeY = Math.max(...dataValues);

    var maxX = this.datas[this.datas.length - 1].partition[1];
    var minX = this.datas[0].partition[0];
    this.rangeXLin = Math.max(Math.abs(maxX), Math.abs(minX));
    this.rangeXLog = 0;
    // We also must check rangeXLog for very small values (0.0001) because they are big log10 values
    this.datas.forEach((d: any, i: number) => {
      if (d.partition[0] !== 0) {
        if (Math.abs(d.partition[0]) > this.rangeXLog) {
          this.rangeXLog = Math.abs(d.partition[0]);
        }
        if (Math.abs(1 / d.partition[0]) > this.rangeXLog) {
          this.rangeXLog = Math.abs(1 / d.partition[0]);
        }
      }
      if (d.partition[1] !== 0) {
        if (Math.abs(d.partition[1]) > this.rangeXLog) {
          this.rangeXLog = Math.abs(d.partition[1]);
        }
        if (Math.abs(1 / d.partition[1]) > this.rangeXLog) {
          this.rangeXLog = Math.abs(1 / d.partition[1]);
        }
      }
    });
  }

  getRatioX() {
    const currentRange = this.type === 'lin' ? this.rangeXLin : this.rangeXLog;
    let ratioX = this.chartW / currentRange;
    if (this.type === 'log') {
      let maxVal = Math.log10(Math.abs(currentRange));
      if (maxVal === -Infinity) {
        maxVal = 1;
      }
      ratioX = this.chartW / maxVal;
    }
    return ratioX;
  }

  getRatioY() {
    return (this.h - this.padding / 2) / this.rangeY;
  }

  getBar(d: any) {
    let barMax = Math.max(d.partition[1], d.partition[0]);
    let barMin = Math.min(d.partition[1], d.partition[0]);
    let barW = 0;
    barW = barMax - barMin;

    let barX = barMin;
    if (this.type === 'log') {
      barX = Math.log10(Math.abs(barMin));
    }

    return {
      value: d.value,
      barW: barW,
      barX: barX,
      partition: d.partition,
    };
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

  drawHistogram(datasSet: any) {
    datasSet.forEach((d: any, i: number) => {
      const bar = this.getBar(d);

      let reverse = false;
      let shift = 0;
      var self = this;
      let x = shift + this.getRatioX() * bar.barX;

      if (this.type === 'lin') {
        shift = this.chartW + this.padding;
        x = shift + this.getRatioX() * bar.barX;
      } else {
        if (d.partition[0] > 0) {
          shift = this.chartW * 3 + this.padding + this.middleW;
          x = shift + this.getRatioX() * bar.barX;
          bar.barW =
            Math.log10(Math.abs(d.partition[1])) -
            Math.log10(Math.abs(d.partition[0]));
        } else if (d.partition[1] <= -1) {
          shift = this.chartW + this.padding;
          x = shift - this.getRatioX() * bar.barX;
          bar.barW =
            Math.log10(Math.abs(d.partition[0])) -
            Math.log10(Math.abs(d.partition[1]));
        } else if (d.partition[1] < 0) {
          shift = this.chartW + this.padding;
          x = shift - this.getRatioX() * bar.barX;
          bar.barW =
            Math.log10(Math.abs(d.partition[0])) -
            Math.log10(Math.abs(d.partition[1]));
        } else {
          let isZeroP0 = d.partition[0] === 0;
          let isZeroP1 = d.partition[1] === 0;

          if (isZeroP0) {
            shift = this.chartW * 2 + this.middleW / 2 + this.padding;
            x = shift;
            bar.barW = this.middleW / 2 / this.getRatioX();
            let diff =
              Math.log10(this.rangeXLog) - Math.abs(Math.log10(d.partition[1]));
            bar.barW = bar.barW + diff;
          }
          if (isZeroP1) {
            shift = this.chartW * 2 + this.middleW / 2 + this.padding;
            x = shift;
            bar.barW = this.middleW / 2 / this.getRatioX();
            let diff =
              Math.log10(this.rangeXLog) -
              Math.abs(Math.log10(Math.abs(d.partition[0])));

            bar.barW = bar.barW + diff;
            x = x - bar.barW * this.getRatioX();
          }
        }
      }

      if (shift) {
        const onclickRect = function (e: any) {
          //@ts-ignore
          d3.select(this.parentNode)
            .selectAll('rect')
            .style('stroke-width', '0');
          //@ts-ignore
          d3.select(this).style('stroke-width', '2px');
          self.bringSvgToTop(document.getElementById('rect-' + i));
        };
        const mouseover = function (d: any) {
          //@ts-ignore
          self.tooltip.style('display', 'block').style('width', '140px');
        };
        const mousemove = function (d: any) {
          //@ts-ignore
          self.tooltip.html(
            'Value: ' +
              bar.value +
              '<br>' +
              'Range: ' +
              JSON.stringify(bar.partition)
          );
          //@ts-ignore
          self.tooltip.style('margin-left', d.clientX - 70 + 'px');
          //@ts-ignore
          self.tooltip.style('margin-top', d.layerY - self.h / 2 + 'px');
        };
        const mouseleave = function (d: any) {
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
          .attr('y', this.h - d.value * this.getRatioY())
          .attr('stroke', 'black')
          .attr('stroke-width', '0')
          .on('click', onclickRect)
          .on('mouseover', mouseover)
          .on('mousemove', mousemove)
          .on('mouseleave', mouseleave)
          .attr('width', bar.barW * this.getRatioX())
          .attr('height', bar.value * this.getRatioY())
          .attr('transform', reverse ? 'translate(' + this.chartW + ', 0)' : '')
          .attr('fill', d.color);
      }
    });
  }

  bringSvgToTop(targetElement: any) {
    // put the element at the bottom of its parent
    let parent = targetElement.parentNode;
    parent.appendChild(targetElement);
  }

  drawXAxis(domain: any, shift: any, width = this.chartW, reverse = false) {
    let x;

    if (this.type === 'lin') {
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
        if (this.type === 'lin') {
          if (reverse) {
            return '-' + val;
          } else {
            return val;
          }
        } else {
          if (i === 0) {
            return 0;
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

  drawYAxis(tickSize: any) {
    // Create the scale
    var y = d3
      .scaleLinear()
      .domain([0, this.rangeY]) // This is what is written on the Axis: from 0 to 100
      .range([this.h - this.padding / 2, 0]); // Note it is reversed

    let shift = this.padding;

    // Draw the axis
    const axis = d3.axisLeft(y).tickSize(tickSize).ticks(this.yTicksCount);
    this.svg
      .append('g')
      .attr('class', 'y axis-grid')
      .attr('transform', 'translate(' + shift + ',' + this.padding / 2 + ')') // This controls the vertical position of the Axis
      .call(axis);
  }
}
