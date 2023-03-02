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
  @Input() axisPadding: number = 0;
  @Input() hideYAxis: boolean = false;
  @Input() isInfiniteValues: boolean = false;
  svg: any;

  @ViewChild('chart', { static: false })
  chart!: ElementRef;
  chartPaddingRight: number = 0;
  chartPaddingLeft: number = 0;
  isPos: boolean = true;

  config: any = {
    xTicksCount: 10,
    yTicksCount: 5,
  };

  constructor() {}

  ngAfterViewInit(): void {
    if (this.type === 'log') {
      // Reduce the width in log mode to insert 3rd chart for [-1, 1] values
      this.w = this.w - this.padding;
    }

    this.datas = JSON.parse(JSON.stringify(this.datas));

    if (this.isInfiniteValues) {
      this.w = this.padding;
    }

    this.svg = d3
      .select(this.chart.nativeElement)
      .append('svg')
      .attr('width', this.w)
      .attr('height', this.h + this.padding);
    this.render(this.type);
  }

  render(type: string) {
    var maxVal = this.datas[this.datas.length - 1].partition[1];
    var minVal = this.datas[0].partition[0];

    this.isPos = maxVal > 0;

    if (!this.isInfiniteValues) {
      if (this.isPos) {
        this.chartPaddingRight = this.padding;
        this.chartPaddingLeft = 0;
      } else {
        this.chartPaddingRight = 0;
        this.chartPaddingLeft = this.padding;
      }
    }

    if (!this.isPos) {
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
      if (maxVal === -Infinity) {
        maxVal = 1;
      }
      ratio = (this.w - 2 * this.padding) / maxVal;
    } else {
      ratio = (this.w - (2 * this.padding) / 2) / this.range;
    }
    let ratioY = (this.h - this.padding / 2) / this.rangeY;

    // if (this.isInfiniteValues) {
    // } else {
    this.drawHistogram(ratio, ratioY);
    this.drawXAxis(maxVal);
    // }

    // if (!this.isInfiniteValues) {
    this.drawYAxis(maxVal);
    // }
  }

  drawYAxis(maxVal: number) {
    // Create the scale
    var y = d3
      .scaleLinear()
      .domain([0, this.rangeY]) // This is what is written on the Axis: from 0 to 100
      .range([this.h - this.padding / 2, 0]); // Note it is reversed

    let shift = this.padding;
    if (this.isPos && !this.isInfiniteValues) {
      shift = -this.padding;
    }

    let tickSize = -this.w;
    if (this.isInfiniteValues) {
      tickSize = this.w;
    }

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

  drawXAxis(maxVal: number) {
    var x: any;
    if (this.type === 'lin') {
      let domain = [0, this.range];

      if (!this.isPos) {
        domain = [this.range, 0];
      } else {
      }

      x = d3
        .scaleLinear()
        .domain(domain) // This is what is written on the Axis: from 0 to 100
        .range([0 + this.chartPaddingLeft, this.w - this.chartPaddingRight]); // This is where the axis is placed: from 100px to 800px
    } else if (this.type === 'log') {
      let minXVal = 1;
      if (this.isInfiniteValues) {
        minXVal = 0;
      }

      let domain = [minXVal, maxVal];
      if (!this.isPos) {
        domain = [-maxVal, -minXVal];
      }
      if (this.isInfiniteValues) {
        if (this.isPos) {
        } else {
          domain = [-1, -0.0001]; // hack : 0.0001 to hide 0
        }
      }
      x = d3
        .scaleLog()
        .domain(domain)
        .range([0 + this.chartPaddingLeft, this.w - this.chartPaddingRight]); // This is where the axis is placed: from 100px to 800px
    }
    let tick = this.isInfiniteValues ? 1 : null;

    // Draw the axis
    const axis = d3
      .axisBottom(x)
      .ticks(tick)
      .ticks(this.isInfiniteValues ? 1 : this.config.xTicksCount)
      .tickSize(-this.h + this.padding / 2);
    this.svg
      .append('g')
      .attr('class', 'x axis-grid')
      .attr('transform', 'translate(0,' + (this.h + this.axisPadding) + ')') // This controls the vertical position of the Axis
      .call(axis);

    // this.svg
    //   .append('text')
    //   .attr('x', this.w / 2)
    //   .attr('y', this.h + this.padding)
    //   .attr('text-anchor', 'middle')
    //   .style('font-size', '12px')
    //   .text(this.type);
  }

  drawHistogram(ratio: number, ratioY: number) {
    this.datas.forEach((d: any, i: number) => {
      let barW = d.partition[1] - d.partition[0];
      let barX = d.partition[0];

      let rectPadding = this.isPos
        ? this.chartPaddingLeft
        : this.chartPaddingRight;

      if (this.type === 'log') {
        barW = Math.log10(d.partition[1]) - Math.log10(d.partition[0]);
        barX = Math.log10(d.partition[0]);
        // rectPadding = this.padding;
      }

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
          this.isPos ? '' : 'translate(' + this.w + ', 0) scale(-1,1)'
        )
        .attr('fill', d.color);
    });
  }
}
