import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-khiops-histogram',
  templateUrl: './khiops-histogram.component.html',
  styleUrls: ['./khiops-histogram.component.scss'],
})
export class KhiopsHistogramComponent {
  @Input() datas: any;

  @Input() rangeY: number = 0;
  @Input() range: number = 0;
  @Input() h: number = 150;
  @Input() w: number = 500;
  @Input() padding: number = 40;
  @Input() type: string = 'lin';
  @Input() axisPadding: number = 5;
  @Input() hideYAxis: boolean = false;
  @Input() isInfiniteValues: boolean = false;
  svg: any;

  @ViewChild('chart', { static: false })
  chart!: ElementRef;
  chartPaddingRight: number = 0;
  chartPaddingLeft: number = 0;

  constructor() {}

  ngAfterViewInit(): void {
    console.log(
      'file: khiops-histogram.component.ts:10 ~ KhiopsHistogramComponent ~ datas:',
      this.datas
    );

    if (this.type === 'log') {
      // Reduce the width in log mode to insert 3rd chart for [-1, 1] values
      this.w = this.w - this.padding;
    }

    this.datas = JSON.parse(JSON.stringify(this.datas));
    this.svg = d3
      .select(this.chart.nativeElement)
      .append('svg')
      .attr('width', this.w)
      .attr('height', this.h + this.padding * 2);
    this.render(this.type);
  }

  render(type: string) {
    var maxVal = this.datas[this.datas.length - 1].partition[1];
    var minVal = this.datas[0].partition[0];

    var isPos = maxVal > 1;

    if (isPos) {
      this.chartPaddingRight = this.padding;
      this.chartPaddingLeft = 0;
    } else {
      this.chartPaddingRight = 0;
      this.chartPaddingLeft = this.padding;
    }

    if (!isPos) {
      // convert datas to reverse axis
      this.datas = this.datas.reverse();
      this.datas.forEach((d: any) => {
        d.partition = d.partition.reverse();
        d.partition[0] = Math.abs(d.partition[0]);
        d.partition[1] = Math.abs(d.partition[1]);
      });
      if (type === 'lin') {
        maxVal = -minVal;
      } else {
        maxVal = minVal;
      }
    }

    let ratio;
    if (type === 'log') {
      maxVal = Math.log10(Math.abs(this.range));
      ratio = (this.w - 2 * this.padding) / maxVal;
    } else {
      ratio = (this.w - 2 * this.padding / 2) / this.range;
    }

    let ratioY = this.h / 100;

    this.drawHistogram(isPos, ratio, ratioY);
    this.drawXAxis(isPos, maxVal);
    if (!this.hideYAxis) {
      this.drawYAxis(isPos, maxVal);
    }
  }

  drawYAxis(isPos: boolean, maxVal: number) {
    // Create the scale
    var y = d3
      .scaleLinear()
      .domain([0, this.rangeY]) // This is what is written on the Axis: from 0 to 100
      .range([this.h + this.axisPadding, 0]); // Note it is reversed

    // Draw the axis
    this.svg
      .append('g')
      .attr('transform', 'translate(' + (this.padding - 0) + ',' + 0 + ')') // This controls the vertical position of the Axis
      .call(d3.axisLeft(y));
  }

  drawXAxis(isPos: boolean, maxVal: number) {
    var x: any;
    if (this.type === 'lin') {
      let domain = [0, this.range];

      if (!isPos) {
        domain = [this.range, 0];
      } else {
      }

      x = d3
        .scaleLinear()
        .domain(domain) // This is what is written on the Axis: from 0 to 100
        .range([0 + this.chartPaddingLeft, this.w - this.chartPaddingRight]); // This is where the axis is placed: from 100px to 800px
    } else if (this.type === 'log') {
      let domain = [1, maxVal];
      if (!isPos) {
        domain = [-maxVal, -1];
      }
      x = d3
        .scaleLog()
        .domain(domain)
        .range([0 + this.chartPaddingLeft, this.w - this.chartPaddingRight]); // This is where the axis is placed: from 100px to 800px
    }
    // Draw the axis
    this.svg
      .append('g')
      .attr('transform', 'translate(0,' + (this.h + this.axisPadding) + ')') // This controls the vertical position of the Axis
      .call(d3.axisBottom(x));

    this.svg
      .append('text')
      .attr('x', this.w / 2)
      .attr('y', this.h + this.padding)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text(this.type);
  }

  drawHistogram(isPos: boolean, ratio: number, ratioY: number) {
    this.datas.forEach((d: any, i: number) => {
      let barW = d.partition[1] - d.partition[0];
      let barX = d.partition[0];

      let rectPadding = isPos ? this.chartPaddingLeft : this.chartPaddingRight;
      console.log('file: khiops-histogram.component.ts:155 ~ KhiopsHistogramComponent ~ this.datas.forEach ~ rectPadding:', rectPadding);
      if (this.type === 'log') {
        barW = Math.log10(d.partition[1]) - Math.log10(d.partition[0]);
        barX = Math.log10(d.partition[0]);
        // rectPadding = this.padding;
      }
      console.log('file: khiops-histogram.component.ts:158 ~ KhiopsHistogramComponent ~ this.datas.forEach ~ barW:', barW);

      this.svg
        .append('rect')
        .attr('id', 'rect-' + i)
        .attr('x', barX * ratio + rectPadding)
        .attr('y', this.h - d.value * ratioY)
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
        .attr('width', barW * ratio)
        .attr('height', d.value * ratioY)
        .attr(
          'transform',
          isPos ? '' : 'translate(' + this.w + ', 0) scale(-1,1)'
        )
        .attr('fill', d.color);
    });
  }
}
