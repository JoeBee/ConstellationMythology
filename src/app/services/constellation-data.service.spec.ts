import { TestBed } from '@angular/core/testing';

import { ConstellationDataService } from './constellation-data.service';

describe('ConstellationDataService', () => {
  let service: ConstellationDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConstellationDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
