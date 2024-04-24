import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RetiroPage } from './retiro.page';

describe('RetiroPage', () => {
  let component: RetiroPage;
  let fixture: ComponentFixture<RetiroPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RetiroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
