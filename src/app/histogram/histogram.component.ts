import { Component, ElementRef, Input, ViewChild } from '@angular/core';
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

  range = 1000;
  tickCount = 3;

  constructor() {}

  ngAfterViewInit(): void {
    this.svg = d3
      .select(this.chart.nativeElement)
      .append('svg')
      .attr('width', this.w * 5)
      .attr('height', this.h + this.padding);

    this.analyseDatas(this.datas);
    this.drawXAxis([this.range, 1], 0);
    this.drawXAxis([1, 1 / this.range], this.w);
    this.drawXAxis([-1, 0, 1], this.w * 2, this.middleW);
    this.drawXAxis([1, this.range], this.w * 3 + this.middleW);
    this.drawXAxis([1 / this.range, 1], this.w * 2 + this.middleW);
  }

  analyseDatas(datas: any) {
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
}
