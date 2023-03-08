import { TestBed } from '@angular/core/testing';

import { HistogramService } from '../histogram.service';
import { HistogramType } from '../histogram.types';

describe('HistogramService', () => {
  let service: HistogramService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HistogramService);
  });

  it('check bar dimensions : LOG [-200, -100]', () => {
    const datas = [
      {
        partition: [-200, -100],
        value: 200,
      },
    ];
    service.getRangeX(datas);
    service.getRangeY(datas);
    let chartW = 200;
    let ratioX = service.getRatioX(HistogramType.LOG, chartW);
    let x, barW;
    [x, barW] = service.getBarDimensions(
      datas[0],
      HistogramType.LOG,
      chartW,
      20, // padding
      20, // middle width
      ratioX
    );
    const res = x === 20 && barW === 0.30102999566398125;
    expect(res).toBeTruthy();
  });

  it('check bar dimensions : LOG [-200, -1]', () => {
    const datas = [
      {
        partition: [-200, -1],
        value: 200,
      },
    ];
    service.getRangeX(datas);
    service.getRangeY(datas);
    let chartW = 200;
    let ratioX = service.getRatioX(HistogramType.LOG, chartW);
    let x, barW;
    [x, barW] = service.getBarDimensions(
      datas[0],
      HistogramType.LOG,
      chartW,
      20, // padding
      20, // middle width
      ratioX
    );
    const res = x === 20 && barW === 2.3010299956639813;
    expect(res).toBeTruthy();
  });
  it('check bar dimensions : LOG [-200, -0.1]', () => {
    const datas = [
      {
        partition: [-200, -0.1],
        value: 200,
      },
    ];
    service.getRangeX(datas);
    service.getRangeY(datas);
    let chartW = 200;
    let ratioX = service.getRatioX(HistogramType.LOG, chartW);
    let x, barW;
    [x, barW] = service.getBarDimensions(
      datas[0],
      HistogramType.LOG,
      chartW,
      20, // padding
      20, // middle width
      ratioX
    );
    console.log('file: bar.service.spec.ts:58 ~ it ~ x, barW:', x, barW);
    const res = x === 20 && barW === 3.3010299956639813;
    expect(res).toBeTruthy();
  });
  it('check bar dimensions : LOG [-200, 0]', () => {
    const datas = [
      {
        partition: [-200, 0],
        value: 200,
      },
    ];
    service.getRangeX(datas);
    service.getRangeY(datas);
    let chartW = 200;
    let ratioX = service.getRatioX(HistogramType.LOG, chartW);
    let x, barW;
    [x, barW] = service.getBarDimensions(
      datas[0],
      HistogramType.LOG,
      chartW,
      20, // padding
      20, // middle width
      ratioX
    );
    console.log('file: bar.service.spec.ts:58 ~ it ~ x, barW:', x, barW);
    const res = x === 20 && barW === 3.3010299956639813;
    expect(res).toBeTruthy();
  });
});
