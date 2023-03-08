import { TestBed } from '@angular/core/testing';

import { HistogramService } from '../histogram.service';

describe('HistogramService', () => {
  let service: HistogramService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HistogramService);
  });

  it('check rangeX with [-200, -200]', () => {
    const datas = [
      {
        partition: [-200, -100],
        value: 10,
      },
    ];
    let rangeXLin, rangeXLog;
    [rangeXLin, rangeXLog] = service.getRangeX(datas);
    const res = rangeXLin === 200 && rangeXLog === 200;
    expect(res).toBeTruthy();
  });

  it('check rangeX with [-200, 0]', () => {
    const datas = [
      {
        partition: [-200, 0],
        value: 10,
      },
    ];
    let rangeXLin, rangeXLog;
    [rangeXLin, rangeXLog] = service.getRangeX(datas);
    const res = rangeXLin === 200 && rangeXLog === 200;
    expect(res).toBeTruthy();
  });
  it('check rangeX with [-200, 0.0001]', () => {
    const datas = [
      {
        partition: [-200, 0.0001],
        value: 10,
      },
    ];
    let rangeXLin, rangeXLog;
    [rangeXLin, rangeXLog] = service.getRangeX(datas);
    const res = rangeXLin === 200 && rangeXLog === 10000;
    expect(res).toBeTruthy();
  });
  it('check rangeX with [0, 0.001]', () => {
    const datas = [
      {
        partition: [0, 0.001],
        value: 10,
      },
    ];
    let rangeXLin, rangeXLog;
    [rangeXLin, rangeXLog] = service.getRangeX(datas);
    const res = rangeXLin === 0.001 && rangeXLog === 1000;
    expect(res).toBeTruthy();
  });
  it('check rangeX with [0.1, 500]', () => {
    const datas = [
      {
        partition: [0.1, 500],
        value: 10,
      },
    ];
    let rangeXLin, rangeXLog;
    [rangeXLin, rangeXLog] = service.getRangeX(datas);
    const res = rangeXLin === 500 && rangeXLog === 500;
    expect(res).toBeTruthy();
  });
  it('check rangeY', () => {
    const datas = [
      {
        value: 10,
      },
      {
        value: 100,
      },
    ];
    let rangeY = service.getRangeY(datas);
    const res = rangeY === 100;
    expect(res).toBeTruthy();
  });
});
