import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VistaAlcanciaPage } from './vista-alcancia.page';

const routes: Routes = [
  {
    path: '',
    component: VistaAlcanciaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VistaAlcanciaPageRoutingModule {}
