import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VistaAlcanciaPage } from './vista-alcancia.page';

describe('VistaAlcanciaPage', () => {
  let component: VistaAlcanciaPage;
  let fixture: ComponentFixture<VistaAlcanciaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VistaAlcanciaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
