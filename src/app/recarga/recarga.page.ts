import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { RecargasService } from '../Services/recargas.service';
import { Confirmaciones } from '../models/models';
import { IonModal } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-recarga',
  templateUrl: './recarga.page.html',
  styleUrls: ['./recarga.page.scss'],
})
export class RecargaPage implements OnInit{
  loading:any;

  ngOnInit(): void {
    
      this.montoenBs = this.nuevaRecarga.monto * this.nuevaRecarga.tasa
    
  }

  @ViewChild('modalConfirmar')
  modalConfirmar!: IonModal;

  openModalConfirmar(monto: number){
    this.modalConfirmar.present();
    this.monto = monto;
    this.montoenBs = this.monto * this.nuevaRecarga.tasa
    this.nuevaRecarga.monto = this.montoenBs
  }

  monto: any;
  tasa: any;
  montoenBs!: number;

  constructor(public loadingCtrl: LoadingController, public alertCtrl: AlertController, public modalCtrl: ModalController, public router: Router, private recargasService: RecargasService) { }

  nuevaRecarga: Confirmaciones ={
    datos: undefined,
    fecha: new Date(),
    monto: 0,
    referenciaBanco: 0,
    transaccion: '',
    usuario: '',
    verificado: false,
    tasa: 37,
  }



  cancelarRecarga(){

    this.router.navigateByUrl('/home');
    this.modalConfirmar.dismiss();
  }

  async confirmarRecarga(){
    this.loading = await this.showLoading();

    await this.recargasService.nuevaRecarga(this.nuevaRecarga);
    this.loading.dismiss();
    this.alertaRecarga('Continuar');
    this.cancelarRecarga();
    

  }

  montoEnBs(){
    this.montoenBs = this.monto * this.tasa
  }

  
  async showLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Procesando Recarga...',
      
    });

    await loading.present();

    return loading;
  }

  async alertaRecarga(message:string){

    const alert = await this.alertCtrl.create({
      header:'¡Recarga solicitada exitosamente!',
      message: 'Pronto se debitara en tu billetera',
      buttons:['Ok']
    });

    await alert.present();
  }

}
