import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeavenlyGuidancePage } from './heavenly-guidance.page';

describe('HeavenlyGuidancePage', () => {
  let component: HeavenlyGuidancePage;
  let fixture: ComponentFixture<HeavenlyGuidancePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HeavenlyGuidancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
