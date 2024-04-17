import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Usuario } from '../models/models';
import { AuthService } from '../Services/auth.service';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';


@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage  {

  constructor(public loadingCtrl: LoadingController, public alertCtrl: AlertController, public modalCtrl: ModalController, private authService: AuthService, private router: Router) { }

  loading: any;


  usuario : Usuario ={ 
    email: '',
   password: '', 
   nombres: '', 
   apellidos: '', 
   cedula: '', 
   foto: '',
    dinero: 0, 
    uid:'' };



  async registrarUsuario() {
    try {
      this.loading = await this.showLoading(); 
      const user = await this.authService.register(this.usuario);
      console.log('Usuario registrado:', user);
      this.modalCtrl.dismiss()
      this.router.navigate(['/login']);
      this.loading.dismiss();
      
      // Realiza acciones adicionales después del registro, como navegar a otra página.
    } catch (error) {
      // Maneja el error de registro aquí.
      console.error('Error al registrar el usuario:', error);
      this.loading.dismiss();
      this.alertaInicio('Modifique los datos');
      this.usuario.email = '';
      this.usuario.password = '';
    }
  }

 

  async dismiss() {
    
    await this.modalCtrl.dismiss();
    
  }

  async showLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Registrando usuario...',
      
    });

    await loading.present();

    return loading;
  }

  async alertaInicio(message:string){

    const alert = await this.alertCtrl.create({
      header:'Credenciales ya existentes..',
      message: message,
      buttons:['Ok']
    });

    await alert.present();
  }
}