import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  constructor() {}
  static getVariables(datas: any) {
    return datas.preparationReport.variablesStatistics.map((e: any) => e.rank);
  }
  static getDistributionGraphDatas(datas: any, variable: string) {
    console.log(
      'file: utils.service.ts:10 ~ UtilsService ~ getDistributionGraphDatas ~ datas:',
      datas
    );
    const varDatas =
      datas.preparationReport.variablesDetailedStatistics[variable]?.dataGrid;
    let dataSet: any = [];
    if (varDatas) {
      if (!varDatas.frequencies) {
        throw 'incompatible variable ' + variable;
      }
      if (varDatas.dimensions[0].partition[0].length === 1) {
        throw 'incompatible variable ' + variable;
      }

      const totalFreq = varDatas.frequencies.reduce(
        (partialSum: any, a: any) => partialSum + a,
        0
      );

      varDatas.dimensions[0].partition.forEach((partition: any, i: number) => {
        if (partition.length !== 0) {
          // const delta = partition[1] - partition[0];
          // let value = varDatas.frequencies[i] / totalFreq / delta;
          let value = varDatas.frequencies[i] / totalFreq;
          // let logValue = Math.log10(value / totalFreq);
          let logValue = Math.log10(value);
          if (logValue === -Infinity) {
            logValue = 0;
          }
          dataSet.push({
            partition: partition,
            value: value,
            logValue: logValue,
          });
        }
      });
    } else {
      throw 'variable ' + variable + ' unfound';
    }

    return dataSet;
  }
}
