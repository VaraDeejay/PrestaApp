import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { DatosService } from '../Services/datos.service';
import { Usuario } from '../models/models';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { LoadingController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage  {

  loading: any;
  
  cedulaDestinatario!: string;
  monto!: number;
  usuario: Usuario = { email: '', password: '', nombres: '', apellidos: '', cedula: '', foto: '', dinero: 0, uid:'' };
  


  constructor( public alertCtrl: AlertController, public loadingCtrl: LoadingController, public modalCtrl: ModalController, private router: Router, private datosService: DatosService, private afAuth: AngularFireAuth) { }
  
  async login() {
    try {
      this.loading = await this.showLoading(); 
      const userCredential = await this.afAuth.signInWithEmailAndPassword(this.usuario.email, this.usuario.password);
      console.log('Usuario autenticado correctamente:', userCredential.user);
      // Redirige al usuario a la página de inicio
      this.router.navigate(['/home']);
      this.loading.dismiss();
      this.modalCtrl.dismiss();
    } catch (error) {
      console.error('Error al autenticar usuario:', error);
      this.loading.dismiss();
      this.alertaInicio('Intente nuevamente')
      this.usuario.email = '';
    this.usuario.password = '';
    }
  }

  async dismiss() {
    
    await this.modalCtrl.dismiss();
    
  }

  async showLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Iniciando sesión...',
      
    });

    await loading.present();

    return loading;
  }

  async alertaInicio(message:string){

    const alert = await this.alertCtrl.create({
      header:'Usuario y/o contraseña incorrectas',
      message: message,
      buttons:['Ok']
    });

    await alert.present();
  }
}