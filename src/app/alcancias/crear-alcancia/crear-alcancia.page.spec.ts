import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearAlcanciaPage } from './crear-alcancia.page';

describe('CrearAlcanciaPage', () => {
  let component: CrearAlcanciaPage;
  let fixture: ComponentFixture<CrearAlcanciaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearAlcanciaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
