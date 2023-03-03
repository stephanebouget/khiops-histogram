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
  @Input() w: number = 200;
  @Input() middleW: number = 100;
  @Input() padding: number = 40;
  chartPaddingRight: number = 0;
  chartPaddingLeft: number = 0;
  config: any = {
    xTicksCount: 10,
    yTicksCount: 5,
  };

  rangeX = 0;
  rangeY = 0;
  tickCount = 3;

  constructor() {}

  ngAfterViewInit(): void {
    this.svg = d3
      .select(this.chart.nativeElement)
      .append('svg')
      .attr('width', this.w * 5)
      .attr('height', this.h + this.padding);

    this.analyseDatas(this.datas);
    this.drawXAxis([this.rangeX, 1], this.padding);
    this.drawXAxis([1, 1 / this.rangeX], this.w + this.padding);
    this.drawXAxis([-1, 0, 1], this.w * 2 + this.padding, this.middleW);
    this.drawXAxis([1, this.rangeX], this.w * 3 + this.padding + this.middleW);
    this.drawXAxis(
      [1 / this.rangeX, 1],
      this.w * 2 + this.padding + this.middleW
    );
    this.drawYAxis();
  }

  analyseDatas(datas: any) {
    const dataValues = datas.map((e: any) => e.value);
    this.rangeY = Math.max(...dataValues);

    var maxX = this.datas[this.datas.length - 1].partition[1];
    var minX = this.datas[0].partition[0];
    this.rangeX = Math.max(Math.abs(maxX), Math.abs(minX));
    // console.log(
    //   'file: histogram.component.ts:62 ~ HistogramComponent ~ analyseDatas ~ Math.max(...dataValues):',
    //   Math.max(...dataValues)
    // );
    console.log(
      'file: histogram.component.ts:61 ~ HistogramComponent ~ analyseDatas ~ this.rangeX:',
      this.rangeX
    );

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

  drawXAxis(domain: any, shift: any, width = this.w) {
    let x = d3.scaleLog().base(10).domain(domain).range([0, width]); // This is where the axis is placed: from 100px to 800px
    const axis = d3
      .axisBottom(x)
      .ticks(this.tickCount)
      .tickSize(-this.h + this.padding / 2)
      //@ts-ignore
      .tickFormat(function (d) {
        //@ts-ignore
        return Math.round(Math.log(d));
      });
    this.svg
      .append('g')
      .attr('class', 'x axis-grid')
      .attr('transform', 'translate(' + shift + ',' + this.h + ')') // This controls the vertical position of the Axis
      .call(axis);
  }

  drawYAxis() {
    // Create the scale
    var y = d3
      .scaleLinear()
      .domain([0, this.rangeY]) // This is what is written on the Axis: from 0 to 100
      .range([this.h - this.padding / 2, 0]); // Note it is reversed

    let shift = this.padding;
    let tickSize = -(4 * this.w + this.middleW);

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
