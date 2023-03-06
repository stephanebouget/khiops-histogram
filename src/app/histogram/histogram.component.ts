import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { max } from 'd3';

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
  datasSetPosPos: any[] = [];
  datasSetPosNeg: any[] = [];
  datasSetNegPos: any[] = [];
  datasSetNegNeg: any[] = [];
  datasSetZero: any[] = [];

  @Input() h: number = 250;
  @Input() w: number = 1000;
  chartPaddingRight: number = 0;
  chartPaddingLeft: number = 0;
  config: any = {
    xTicksCount: 10,
    yTicksCount: 5,
  };

  chartW = 0;
  middleW = 0;
  rangeX = 0;
  padding = 0;
  rangeY = 0;
  tickCount = 5;

  constructor() {}

  ngAfterViewInit(): void {
    this.chartW = this.w / 5;
    this.middleW = this.w / 10;
    this.padding = this.w / 20;

    this.svg = d3
      .select(this.chart.nativeElement)
      .append('svg')
      .attr('width', this.chartW * 5)
      .attr('height', this.h + this.padding);

    this.analyseDatas(this.datas);
    if (this.type === 'log') {
      this.drawXAxis([this.rangeX, 1], this.padding);
      this.drawXAxis(
        [1, this.rangeX],
        this.chartW + this.padding,
        this.chartW,
        true
      );
      this.drawXAxis(
        [-1, 0, 1],
        this.chartW * 2 + this.padding,
        this.chartW / 4,
        false
      );
    }
    this.drawXAxis(
      [this.rangeX, 1],
      this.chartW * 2 + this.padding + this.middleW,
      this.chartW,
      true
    );
    this.drawXAxis(
      [1, this.rangeX],
      this.chartW * 3 + this.padding + this.middleW
    );

    this.drawYAxis();

    this.drawHistogram(
      this.datasSetPosPos,
      this.chartW * 3 + this.padding + this.middleW
    );
    this.drawHistogram(
      this.datasSetPosNeg,
      this.chartW * 2 + this.padding + this.middleW,
      true
    );
  }

  analyseDatas(datas: any) {
    const dataValues = datas.map((e: any) => e.value);
    this.rangeY = Math.max(...dataValues);

    var maxX = this.datas[this.datas.length - 1].partition[1];
    var minX = this.datas[0].partition[0];
    this.rangeX = Math.max(Math.abs(maxX), Math.abs(minX));

    datas.forEach((d: any) => {
      if (d.partition[0] >= 1) {
        this.datasSetPosPos.push(d);
      } else if (d.partition[1] <= 1 && d.partition[0] > 0) {
        this.datasSetPosNeg.push(d);
      } else if (d.partition[1] <= -1) {
        this.datasSetNegNeg.push(d);
      } else if (d.partition[0] <= -1 && d.partition[1] >= -1) {
        this.datasSetNegPos.push(d);
      } else {
        this.datasSetZero.push(d);
      }
    });
    console.log(' this.datasSetPosPos:', this.datasSetPosPos);
    console.log(' this.datasSetPosNeg:', this.datasSetPosNeg);
    console.log(' this.datasSetZero:', this.datasSetZero);
    console.log(' this.datasSetPosNeg:', this.datasSetNegPos);
    console.log(' this.datasSetNegNeg:', this.datasSetNegNeg);
  }

  getRatioX() {
    let ratioX = this.chartW / this.rangeX;
    if (this.type === 'log') {
      let maxVal = Math.log10(Math.abs(this.rangeX));
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

  getBar(d: any, reverse = false) {
    let barMax = Math.max(Math.abs(d.partition[1]), Math.abs(d.partition[0]));

    let barMin = Math.min(Math.abs(d.partition[1]), Math.abs(d.partition[0]));

    let barW = barMax - barMin;
    let barX = barMin;

    if (this.type === 'log') {
      // barW = Math.log10(d.partition[1]) - Math.log10(d.partition[0]);
      // barX = Math.log10(d.partition[0]);
      barW = Math.log10(barMax) - Math.log10(barMin);
      barX = Math.log10(barMin);
      if (reverse) {
        // barX =  Math.abs(Math.log10(barX))
        // barW =  Math.abs(Math.log10(barW))
      }
    }
    return {
      value: d.value,
      barW: barW,
      barX: barX,
    };
  }

  drawHistogram(datasSet: any, shift: any, reverse = false) {
    datasSet.forEach((d: any, i: number) => {
      console.log(d);

      const bar = this.getBar(d, reverse);

      this.svg
        .append('rect')
        .attr('id', 'rect-' + i)
        // .attr('x', barX * ratio)
        .attr('x', shift + this.getRatioX() * bar.barX)
        .attr('y', this.h - d.value * this.getRatioY())
        .attr('stroke', 'black')
        .attr('stroke-width', '0')

        .on('click', function (e: any) {
          //@ts-ignore
          d3.select(this.parentNode)
            .selectAll('rect')
            .style('stroke-width', '0');

          //@ts-ignore
          d3.select(this).style('stroke-width', '2px');
        })
        .attr('width', bar.barW * this.getRatioX())
        .attr('height', bar.value * this.getRatioY())
        .attr(
          'transform',
          //   // this.isPos ? '' : 'translate(' + this.w + ', 0) scale(-1,1)'
          reverse ? 'translate(' + this.chartW + ', 0)' : ''
          // 'translate(' + -50 + ', 0)'
        )
        .attr('fill', d.color);
    });
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
      .ticks(this.tickCount)
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
          if (i % 2) {
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
    let tickSize = -(4 * this.chartW + this.middleW);

    // Draw the axis
    const axis = d3
      .axisLeft(y)
      .tickSize(tickSize)
      .ticks(this.config.yTicksCount);
    this.svg
      .append('g')
      .attr('class', 'y axis-grid')
      .attr('transform', 'translate(' + shift + ',' + this.padding / 2 + ')') // This controls the vertical position of the Axis
      .call(axis);
  }
}
