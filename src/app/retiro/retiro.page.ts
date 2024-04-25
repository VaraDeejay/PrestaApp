import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RecargasService } from '../Services/recargas.service';
import { Confirmaciones, Retiro } from '../models/models';
import { IonModal } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-retiro',
  templateUrl: './retiro.page.html',
  styleUrls: ['./retiro.page.scss'],
})
export class RetiroPage {
  claveUsuario: string = '';
  loading: any;

  constructor(private alertCtrl: AlertController, public router: Router, private recargasService: RecargasService) { }


  nuevoRetiro: Retiro = {
    monto: 0,
    banco: 0,
    telefono: 0,
    cedula: 0
  }

  cerrarRetiro(){
    this.router.navigateByUrl('/home')
  }

  async confirmarRetiro(){ const alert = await this.alertCtrl.create({
    header: 'Confirmar Retiro',
    message: 'Ingrese su clave:',
    inputs: [
      {
        name: 'clave',
        type: 'password',
        placeholder: 'Clave'
      }
    ],
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel'
      },
      {
        text: 'Confirmar',
        handler: (data: any) => {
          this.claveUsuario = data.clave; // Almacena la clave ingresada por el usuario
          this.validarClave();
        }
      }
    ]
  });

  await alert.present();
}
    
  

async validarClave() {
  // Llama al servicio para validar la clave del usuario
  this.recargasService.validarClave(this.claveUsuario)
    .then(valida => {
      if (valida) {
        // Si la clave es válida, confirma el retiro
        this.recargasService.nuevoRetiro(this.nuevoRetiro)
          .then(() => {
            this.mostrarMensaje('Retiro confirmado correctamente');
            this.router.navigateByUrl('/home');
          })
          .catch(() => {
            this.mostrarMensaje('Error al confirmar el retiro. Por favor, inténtalo nuevamente.');
          });
      } else {
        // Si la clave no es válida, muestra un mensaje de error
        this.mostrarMensaje('Clave incorrecta. Por favor, inténtalo nuevamente.');
      }
    })
    .catch(() => {
      this.mostrarMensaje('Error al validar la clave. Por favor, inténtalo nuevamente.');
    });
}

async mostrarMensaje(mensaje: string) {
  const alert = await this.alertCtrl.create({
    header: 'Resultado:',
    message: mensaje,
    buttons: ['OK']
  });
  await alert.present();
}
}
