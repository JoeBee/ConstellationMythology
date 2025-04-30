import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MythPage } from './myth.page';

describe('MythPage', () => {
  let component: MythPage;
  let fixture: ComponentFixture<MythPage>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(MythPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
