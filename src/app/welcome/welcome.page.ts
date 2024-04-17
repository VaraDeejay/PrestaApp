import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LoginPage } from '../login/login.page';
import { RegisterPage } from '../register/register.page';


@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
})
export class WelcomePage  {

  constructor(public modalCtrl:ModalController) { }

 
  async login(){

    const modal = await this.modalCtrl.create({

      component: LoginPage,
      animated: true,
      mode: 'ios',
      backdropDismiss: false,
      
    })

    return await modal.present();

  }

  async register(){

    const modal = await this.modalCtrl.create({

      component: RegisterPage,
      animated: true,
      mode: 'ios',
      backdropDismiss: false,
      
    })

    return await modal.present();

  }

}
