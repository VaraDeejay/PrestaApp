import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VistaAlcanciaPageRoutingModule } from './vista-alcancia-routing.module';

import { VistaAlcanciaPage } from './vista-alcancia.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VistaAlcanciaPageRoutingModule
  ],
  declarations: [VistaAlcanciaPage]
})
export class VistaAlcanciaPageModule {}
