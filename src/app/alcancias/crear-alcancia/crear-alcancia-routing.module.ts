import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CrearAlcanciaPage } from './crear-alcancia.page';

const routes: Routes = [
  {
    path: '',
    component: CrearAlcanciaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CrearAlcanciaPageRoutingModule {}
