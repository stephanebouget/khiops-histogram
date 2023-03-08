import { TestBed } from '@angular/core/testing';

import { HistogramService } from '../histogram.service';

describe('HistogramService', () => {
  let service: HistogramService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HistogramService);
    const datas = [
      {
        partition: [-200, -100],
        value: 200,
      },
    ];
    service.getRangeX(datas);
    service.getRangeY(datas);
  });

  it('check lin ratioX with chartW = 200', () => {
    let ratioX = service.getRatioX('lin', 200);
    const res = ratioX === 1;
    expect(res).toBeTruthy();
  });
  it('check log ratioX with chartW = 200', () => {
    let ratioX = service.getRatioX('log', 200);
    const res = ratioX === 86.91759793521872;
    expect(res).toBeTruthy();
  });
  it('check lin ratioY with h = 200 && padding = 20', () => {
    let ratioY = service.getRatioY(200, 20);
    const res = ratioY === 0.95;
    expect(res).toBeTruthy();
  });
});
