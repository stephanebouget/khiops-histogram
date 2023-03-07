import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistogramComponent } from './histogram.component';

describe('Range', () => {
  let component: HistogramComponent;
  let fixture: ComponentFixture<HistogramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HistogramComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HistogramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('[-200, -200]', () => {
    const datas = [
      {
        partition: [-200, -100],
        value: 10,
      },
    ];
    let rangeXLin, rangeXLog;
    component.initSpecs(datas);
    [rangeXLin, rangeXLog] = component.getRange();
    const res = rangeXLin === 200 && rangeXLog === 200;
    expect(res).toBeTruthy();
  });

  it('[-200, 0]', () => {
    const datas = [
      {
        partition: [-200, 0],
        value: 10,
      },
    ];
    let rangeXLin, rangeXLog;
    component.initSpecs(datas);
    [rangeXLin, rangeXLog] = component.getRange();
    const res = rangeXLin === 200 && rangeXLog === 200;
    expect(res).toBeTruthy();
  });
  it('[-200, 0.0001]', () => {
    const datas = [
      {
        partition: [-200, 0.0001],
        value: 10,
      },
    ];
    let rangeXLin, rangeXLog;
    component.initSpecs(datas);
    [rangeXLin, rangeXLog] = component.getRange();
    const res = rangeXLin === 200 && rangeXLog === 10000;
    expect(res).toBeTruthy();
  });
  it('[0, 0.001]', () => {
    const datas = [
      {
        partition: [0, 0.001],
        value: 10,
      },
    ];
    let rangeXLin, rangeXLog;
    component.initSpecs(datas);
    [rangeXLin, rangeXLog] = component.getRange();
    const res = rangeXLin === 0.001 && rangeXLog === 1000;
    expect(res).toBeTruthy();
  });
  it('[0.1, 500]', () => {
    const datas = [
      {
        partition: [0.1, 500],
        value: 10,
      },
    ];
    let rangeXLin, rangeXLog;
    component.initSpecs(datas);
    [rangeXLin, rangeXLog] = component.getRange();
    const res = rangeXLin === 500 && rangeXLog === 500;
    expect(res).toBeTruthy();
  });
});
