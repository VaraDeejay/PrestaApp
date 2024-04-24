import { AfterContentChecked, Component, OnInit, ViewChild } from '@angular/core';
import SwiperCore, { SwiperOptions, Pagination } from 'swiper';
import { IonModal } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';
import { ModalController } from '@ionic/angular';
import { DatosService } from '../Services/datos.service';
import { Usuario } from '../models/models';
import { AuthService } from '../Services/auth.service';
import { UsuarioEnvioDinero } from '../models/models';
import { EnvioDineroService } from '../Services/envio-dinero.service';
import { LoadingController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { TransaccionData } from '../models/models';
import { Router } from '@angular/router';
// install Swiper modules
SwiperCore.use([Pagination]);

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, AfterContentChecked {
////////////////////////////////////////////////////////////////////Declaraciones////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                               loading: any;
                                                                               destinatario: UsuarioEnvioDinero ={ cedulaDestinatario:'', monto:0}
                                                                               cedulaDestinatario!: string;
                                                                               remitente!:string;
                                                                               user: Usuario |null = null;
                                                                               accounts: any[] = [];
                                                                               bannerConfig: SwiperOptions = {};
                                                                               featureConfig: SwiperOptions = {};
                                                                               features: any[] = [];
                                                                               transactions: any[] = [];
                                                                               monto!: number;
                                                                               cedula!: string;
                                                                               transacciones1: TransaccionData[] = [];
                                                                               transacciones2: TransaccionData[] = [];
                                                                               datosCargados: boolean = false;
                                                                               cards: any[] = [];
  

  constructor(public modalCtrl:ModalController, public alertCtrl: AlertController, public loadingCtrl: LoadingController, private envioDineroService: EnvioDineroService,private modalController: ModalController, private datosService: DatosService, private authService: AuthService, private router:Router) { }

  ///////////////////////////////////////////////////////////////Inicio/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ngOnInit(): void  {

    if (this.user) {
      this.remitente = this.user.nombres;
    }

    

    this.authService.getUsuario().then((user) => {
      if (user) {
       this.user = {
          nombres: user.nombres ?? '',
          apellidos: user.apellidos ?? '',
          cedula: user.cedula ?? '',
          password:user.password ?? '',
          foto: user.foto ?? '',
          dinero: user.dinero ?? '',
          email: user.email ?? '', 
          username: user.username ?? '',
          uid: user.uid,}

        
          console.log(user);
          this.obtenerTransaccionesUsuario().then(()=>{this.datosCargados = true;});
      } 

      
    });

    
    this.accounts = [
      { id: 1, acc_no: 'Alcancía', balance: '200000' },
      { id: 2, acc_no: 'Disponible para prestamos', balance: '50000' },
    
    ];
    this.features = [
      { id: 1, color: 'white', icon: 'paper-plane', name: 'Enviar' },
      
      { id: 3, color: 'white', icon: 'add-circle', name: 'Nueva Alcancia' },
      { id: 4, color: 'white', icon: 'newspaper', name: 'Alcancias' },
      { id: 5, color: 'white', icon: 'card', name: 'Recargar Billetera' },
    ];
    this.transactions = [
      { id: 1, to: 'Daniela Pérez', date: '2022-05-22', amount: 5000 },
    ]
  }

 

  ngAfterContentChecked() {
    this.bannerConfig = {
      slidesPerView: 1,
      pagination: { clickable: true }
    };
    this.featureConfig = {
      slidesPerView: 4,
    };
  }

  

  

  message = 'This modal example uses triggers to automatically open a modal when the button is clicked.';
  name!: string;

 

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      this.message = `Hello, ${ev.detail.data}!`;
    }
  }

 

  async enviarDinero() {
    try {
      if (this.user) { if (this.user.dinero < this.monto) {
        this.alertaFondo('Continuar');
        this.modal.dismiss();
        this.secondModal.dismiss();
        
        throw new Error('Fondo insuficiente. El usuario no tiene suficiente saldo para realizar esta transacción.')
      
      }
        this.loading = await this.showLoading(); 
        await this.envioDineroService.enviarDinero(this.cedulaDestinatario, this.monto, this.user, 'Pago directo', 'No aplica', 'No aplica');
        console.log('Dinero enviado exitosamente');
        this.loading.dismiss();
        this.alertaInicio('Continuar');
        this.modal.dismiss();
        this.secondModal.dismiss();
       
        
      
      } else {
        
        console.error('Usuario no autenticado');
        this.loading.dismiss();
        this.alertaFalla('Continuar');
        this.modal.dismiss();
        this.secondModal.dismiss();
       
        
      }
    } catch (error) {
      console.error('Error al enviar dinero:', error);
        this.loading.dismiss();
        this.alertaFalla('Continuar');
        this.modal.dismiss();
        this.secondModal.dismiss();
       
      
      
    }
  }

  
  




  async showLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Enviando Dinero...',
      
    });

    await loading.present();

    return loading;
  }

  async alertaInicio(message:string){

    const alert = await this.alertCtrl.create({
      header:'¡Dinero enviado exitosamente!',
      message: message,
      buttons:['Ok']
    });

    await alert.present();
  }

  async alertaFalla(message:string){

    const alert = await this.alertCtrl.create({
      header:'Ha ocurrido un error, verique los datos',
      message: message,
      buttons:['Ok']
    });

    await alert.present();
  }
  async alertaFondo(message:string){

    const alert = await this.alertCtrl.create({
      header:'Usted no posee fondos suficientes para esta operación',
      message: message,
      buttons:['Ok']
    });

    await alert.present();
  }

  
 
  async obtenerTransaccionesUsuario() {
    try {
      const cedulaUsuario = this.user?.cedula;

      // Llama al servicio para obtener las transacciones del usuario
      if (cedulaUsuario) {
        this.transacciones1 = await this.envioDineroService.obtenerTransaccionesPorUsuario(cedulaUsuario);
        this.transacciones2 = await this.envioDineroService.obtenerTransaccionesPorUsuario2(cedulaUsuario);

        this.transactions = [...this.transacciones1, ...this.transacciones2];

        this.transactions.sort((a, b) => {
          const dateA = new Date(a.fecha).getTime();
          const dateB = new Date(b.fecha).getTime();
          return dateB - dateA;
          
        });
        console.log(this.user)
      }
    } catch (error) {
      console.error('Error al obtener transacciones:', error);
    }
  }

  handleRefresh(event: CustomEvent) {
    setTimeout(() => {
      // Any calls to load data go here
      window.location.reload();
      event.detail.complete(); // Marcar el evento como completo
    }, 2000);
  }


  ///////////////////////////////////////////////////////Modal////////////////////////////////////////////////////////////////////

  @ViewChild('modal')
  modal!: IonModal;

  @ViewChild('secondModal') 
  secondModal!: IonModal;

  @ViewChild('thirdModal') 
  thirdModal!: IonModal;
   
  @ViewChild('RecargarModal') 
  RecargarModal!: IonModal;

  @ViewChild('confirmarRecarga') 
  confirmarRecargar!: IonModal;
 
  openModalOnEnviarClick(feature: any) {
    if (feature.name === 'Enviar') {
      this.openModal();
    }
    if (feature.name === 'Recargar Billetera') {
      this.router.navigateByUrl('/recarga');
    }

    if (feature.name === 'Nueva Alcancia') {
      this.openCrearAlcancia();
    }

    if (feature.name === 'Alcancias') {
      this.openVistaAlcancia();
    }
    
  }

 openCrearAlcancia()
{
 this.router.navigateByUrl('/crear-alcancia');

}

openVistaAlcancia()
{
 this.router.navigateByUrl('/vista-alcancia');

}


  openModal() {
    this.modal.present();
  }

  openSecondModal() {
    this.secondModal.present();
  }
  
  openThirdModal() {
    this.thirdModal.present();
  }

  openRecargarModal(){

    this.RecargarModal.present();

  };

  openConfirmarRecarga(){
    this.router.navigateByUrl('/recarga');
    this.RecargarModal.dismiss();
  }
 
 
 
  cancel() {
    this.modal.dismiss();
  }

  cancelSecondModal() {
    this.secondModal.dismiss();
  }

  cancelThirdModal() {
    this.thirdModal.dismiss();
  }

  cancelRecargarModal() {
    this.RecargarModal.dismiss();
  }

 cancelConfirmarRecarga(){
  this.confirmarRecargar.dismiss();
 }


async dismiss() {
    
    await this.modalCtrl.dismiss();
    
  }

  async dismissSecondModal() {
    
      await this.secondModal.dismiss();
  
  }

  async confirmarRecarga(){
      this.cancelConfirmarRecarga();
  }
 
}