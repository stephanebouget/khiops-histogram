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

      varDatas.dimensions[0].partition.forEach((partition: [], i: number) => {
        if (partition.length !== 0) {
          dataSet.push({
            partition: partition,
            value: varDatas.frequencies[i],
          });
        }
      });
    } else {
      throw 'variable ' + variable + ' unfound';
    }

    return dataSet;
  }
}
