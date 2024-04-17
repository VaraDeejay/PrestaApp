import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CrearAlcanciaPageRoutingModule } from './crear-alcancia-routing.module';

import { CrearAlcanciaPage } from './crear-alcancia.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CrearAlcanciaPageRoutingModule
  ],
  declarations: [CrearAlcanciaPage]
})
export class CrearAlcanciaPageModule {}
