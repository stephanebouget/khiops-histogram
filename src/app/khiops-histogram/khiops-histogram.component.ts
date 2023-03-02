import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-khiops-histogram',
  templateUrl: './khiops-histogram.component.html',
  styleUrls: ['./khiops-histogram.component.scss'],
})
export class KhiopsHistogramComponent {
  @Input() datas: any;
  @Input() range: number = 0;
  @Input() h: number = 150;
  @Input() w: number = 500;
  @Input() padding: number = 40;
  @Input() type: string = 'lin';
  @Input() axisPadding: number = 5;
  svg: any;

  @ViewChild('chart', { static: false })
  chart!: ElementRef;

  constructor() {}

  ngAfterViewInit(): void {
    console.log(
      'file: khiops-histogram.component.ts:10 ~ KhiopsHistogramComponent ~ datas:',
      this.datas
    );

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
      ratio = (this.w - 2 * this.padding) / this.range;
    }

    let ratioY = this.h / 100;

    this.drawHistogram(isPos, ratio, ratioY);
    this.drawXAxis(isPos, maxVal);
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
        .range([0 + this.padding, this.w - this.padding]); // This is where the axis is placed: from 100px to 800px
    } else if (this.type === 'log') {
      let domain = [1, maxVal];
      if (!isPos) {
        domain = [-maxVal, -1];
      }
      x = d3
        .scaleLog()
        .domain(domain)
        .range([0 + this.padding, this.w - this.padding]); // This is where the axis is placed: from 100px to 800px
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
      if (this.type === 'log') {
        barW = Math.log10(d.partition[1]) - Math.log10(d.partition[0]);
        barX = Math.log10(d.partition[0]);
      }

      this.svg
        .append('rect')
        .attr('id', 'rect-' + i)
        .attr('x', barX * ratio + this.padding)
        .attr('y', this.h - d.value * ratioY)
        .attr('stroke', 'black')
        .attr('stroke-width', '0')
        .on('click', function (e: any) {
          console.log(
            'file: khiops-histogram.component.ts:126 ~ KhiopsHistogramComponent ~ e:',
            d
          );
          // onBarClicked(e, d, i);
          //@ts-ignore
          d3.select(this.parentNode)
            .selectAll('rect')
            .style('stroke-width', '0');

          //@ts-ignore
          d3.select(this).style('stroke-width', '2px');
          // d3.select(this).style('outline', 'thin solid black');
          // d3.select(this).style('fill', 'red');
          //@ts-ignore
          // d3.select(this.parentNode).
          // d3.select(this.parentNode).
          // this.svg.selectAll('rect');
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

  onBarClicked(elt: any, e: any, item: any, i: number): any {
    console.log(
      'file: khiops-histogram.component.ts:137 ~ KhiopsHistogramComponent ~ onBarClicked ~ elt:',
      elt
    );
    console.log(
      'file: khiops-histogram.component.ts:136 ~ KhiopsHistogramComponent ~ onBarClicked ~ d:',
      e,
      item
    );

    // e.target.attr('style', ' stroke:rgb(0,0,0)');
    // d3.select("rect").style("fill", "green").transition().style("fill", "red");
    // console.log('file: khiops-histogram.component.ts:144 ~ KhiopsHistogramComponent ~ onBarClicked ~ d3.select("rect"):', d3.select("rect"));
    // d3.selectAll("rect")
    // .each(function (d, index) {
    //   if (i === index) {
    //     console.log('file: khiops-histogram.component.ts:148 ~ KhiopsHistogramComponent ~ index:', index);
    //     // put all your operations on the second element, e.g.
    //     d3.select(this).style("fill", 'red')
    //   }
    // });
    d3.select(elt)
      // .transition()
      // .duration(2000)
      // e.target
      .style('fill', 'red');
  }
}
