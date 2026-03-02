import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstellationPage } from './constellation.page';

describe('ConstellationPage', () => {
  let component: ConstellationPage;
  let fixture: ComponentFixture<ConstellationPage>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(ConstellationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
