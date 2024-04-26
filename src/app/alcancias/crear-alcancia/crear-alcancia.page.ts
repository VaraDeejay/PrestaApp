import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertInput, IonModal, ModalController } from '@ionic/angular';
import { AlcanciasService } from 'src/app/Services/alcancias.service';
import { AlcanciaProducto, Alcancias, turno } from 'src/app/models/models';
import { Usuario } from 'src/app/models/models';
import { LoadingController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/Services/auth.service';

@Component({
  selector: 'app-crear-alcancia',
  templateUrl: './crear-alcancia.page.html',
  styleUrls: ['./crear-alcancia.page.scss'],
})
export class CrearAlcanciaPage  {
  alcanciaService: any;
  loading: any;
  numeroTurno!: string;
  turno: turno = {
    id: '',
  }
turnoId!: string;
selectedTurno: string = '';
  alcanciaRef: any;
  configuraProducto: boolean = false;
  constructor(private afAuth: AuthService, public loadingCtrl: LoadingController, public alertCtrl: AlertController, private alcanciasService: AlcanciasService, private router: Router,  private modalController: ModalController) { }

  selectedSegment: string = 'Crear';
  configuraAlcancia: boolean = false;
  resumeAlcancia: boolean = false;
  integrantes!: number;
  modalidad!: string;
  montoCuotas!: number;
  montoRecibir!: number;
  prevMontoCuotas!: number;

  public alertButtons = ['OK'];
  public alertInputs = [
    {
      label: 'Red',
      type: 'radio',
      value: 'red',
    },
    {
      label: 'Blue',
      type: 'radio',
      value: 'blue',
    },
    {
      label: 'Green',
      type: 'radio',
      value: 'green',
    },
  ];

  turnos: any[] = [];

  usuario!: Usuario;
  idAlcancia!: string;

  nuevaAlcanciaProductos: AlcanciaProducto = {
    alcancia: {
      integrantes: 0,
      costoProducto: 0,
      cuotas: 0,
      modalidad: 0,
      montoCuotas: 0,
      fechadeinicio: new Date() ,
      url: '',
      nombreProducto: '',
    },
    creador: {
      nombres: '',
      
      uid: ''
    }
  };

  nuevaAlcancia: Alcancias = {
    alcancia: {
      integrantes: 0,
      montoARecibir: 0,
      cuotas: 0,
      modalidad: 0,
      montoCuotas: 0,
      fechadeinicio: new Date() ,
    },
    integrantes: {
      nombres: '',
      apellidos: '',
      cedula: '',
      turno: 0,
    },
    creador: {
      nombres: '',
      apellidos: '',
      cedula: 0,
      uid: ''
    }
  };


  openConfiguracion(){
    this.configuraAlcancia = true;
  } 

  openConfiguraProducto(){
    this.configuraProducto = true;
  }

  openResume(){
    this.calcularMontoSemanal();
    this.resumeAlcancia = true
    
  }

  volver(){
    this.router.navigateByUrl('/home');
  }

  @ViewChild('modal')
  modal!: IonModal;

  @ViewChild('modalTurno')
  modalTurno!: IonModal;

  @ViewChild('modalProductos')
  modalProductos!: IonModal;
  
  @ViewChild('modalUnirseIntercambio')
  modalUnirseIntercambio!: IonModal;

  @ViewChild('modalUnirseProductos')
  modalUnirseProductos!: IonModal;

  @ViewChild('modalTurnoProductos')
  modalTurnoProductos!: IonModal;

 openModalUnirseIntercambio(){
  this.modalUnirseIntercambio.present()
 }

 openModalUnirseProductos(){
  this.modalUnirseProductos.present()
 }
cerrarModalIntercambio(){
  this.modalUnirseIntercambio.dismiss()
}

cerrarModalProductos(){
  this.modalUnirseProductos.dismiss();
}

  openModal() {
    this.modal.present();
  }

  cancel() {
    this.modal.dismiss();
  }

  openModalTurno(turnos: any[]) {
    this.modalTurno.present();
  }
  openModalTurnoProductos(turnos: any[]) {
    this.modalTurnoProductos.present();
  }
  cancelModalTurnoProductos() {
    this.modalTurnoProductos.dismiss();
  }


  cancelModalTurno() {
    this.modalTurno.dismiss();
  }

  openModalProductos(){
    this.modalProductos.present();
  }

  cancelModalProductos(){
    this.modalProductos.dismiss();
  }


  calcularMontoSemanal() {
    // Calcular el monto de pago semanal dividiendo el monto total entre la cantidad de integrantes
    this.prevMontoCuotas = this.nuevaAlcancia.alcancia.montoARecibir / this.nuevaAlcancia.alcancia.integrantes;
  }


  async crearAlcancia() {
    try {
      this.loading = await this.showLoading();
      this.nuevaAlcancia.alcancia.montoCuotas = this.nuevaAlcancia.alcancia.montoARecibir / this.nuevaAlcancia.alcancia.integrantes;

       
      
      const alcanciaRef = await this.alcanciasService.crearAlcancia(this.nuevaAlcancia);
      this.alcanciaRef = alcanciaRef;
      console.log('Alcancía creada exitosamente', this.alcanciaRef);
      this.loading.dismiss();
      this.alertaCreacion('Continuar', this.alcanciaRef )
      this.router.navigateByUrl('/home')
      this.modal.dismiss()
    
    } catch (error) {
      console.error('Error al crear alcancía:', error);
      this.loading.dismiss();
      this.alertaFalla('Continuar')
      this.router.navigateByUrl('/home')
      this.modal.dismiss()
    
    }
  }

  async showLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Creando alcancia...',
      
    });

    await loading.present();

    return loading;
  }

  async alertaCreacion(message:string, alcanciaRef: string){

    const alert = await this.alertCtrl.create({
      header:'¡Alcancia creada exitosamente!',
      message: `${message}\nAlcancia Ref: ${alcanciaRef}`,
      buttons:['Ok']
    });

    await alert.present();
  }

  async alertaFalla(message:string){

    const alert = await this.alertCtrl.create({
      header:'Ha ocurrido un error, revise su conexión',
      message: message,
      buttons:['Ok']
    });

    await alert.present();
  }


  async unirseAlcancia() {
    try {
      // Cargar los turnos antes de unirse a la alcancía
      
      this.loading = await this.showLoading();
      // Lógica para agregar el usuario como integrante
      await this.alcanciasService.agregarIntegrante(this.idAlcancia);
  
      console.log('Te has unido a la alcancía exitosamente');
  
      // Descartar el loading
      this.loading.dismiss();
      
  
      // Mostrar la alerta de unión exitosa
      await this.alertaUnirse('Cumple tus compromisos de pago.');
  
      // Abrir el modal de selección de turno después de unirse exitosamente
      this.modalTurno.dismiss();
  
      // Navegar de regreso a la página de inicio
      this.router.navigateByUrl('/home');
      this.modal.dismiss();
    } catch (error) {
      console.error('Error al unirse a la alcancía:', error);
      // Manejar el error según sea necesario
      this.loading.dismiss();
      await this.alertaFallaUnirse('Continuar');
      this.router.navigateByUrl('/home');
      this.modal.dismiss();
    }
  }
  async alertaUnirse(message:string){

    const alert = await this.alertCtrl.create({
      header:'Te has unido exitosamente a la alcancia',
      message: message,
      buttons:['Ok']
    });

    await alert.present();
  }
  async alertaFallaUnirse(message:string){

    const alert = await this.alertCtrl.create({
      header:'Esta alcancia no existe o ya inició su ciclo',
      message: message,
      buttons:['Ok']
    });

    await alert.present();
    
  }
 

  async cargarTurnos() {
    this.loading = await this.showLoading();
    this.alcanciasService.obtenerTurnosPorIdAlcancia(this.idAlcancia).subscribe(
      turnos => {
        // Aquí puedes asignar los turnos a una variable de clase o realizar cualquier otra acción necesaria
        this.turnos = turnos;
        console.log('Turnos obtenidos en el componente:', turnos);
        // Llama a la función para abrir el modal una vez que se hayan cargado los turnos
        this.openModalTurno(turnos);
      },
      error => {
        console.error('Error al obtener los turnos:', error);
        // Manejar el error según sea necesario
      }
    );
    this.loading.dismiss();
    
 
}


async cargarTurnosProductos() {
  this.loading = await this.showLoading();
  this.alcanciasService.obtenerTurnosPorIdAlcanciaProductos(this.idAlcancia).subscribe(
    turnos => {
      // Aquí puedes asignar los turnos a una variable de clase o realizar cualquier otra acción necesaria
      this.turnos = turnos;
      console.log('Turnos obtenidos en el componente:', turnos);
      // Llama a la función para abrir el modal una vez que se hayan cargado los turnos
      this.openModalTurnoProductos(turnos);
    },
    error => {
      console.error('Error al obtener los turnos:', error);
      // Manejar el error según sea necesario
    }
  );
  this.loading.dismiss();
  

}

async seleccionarTurno(idAlcancia: string, turnoId:string) {
  try {

    this.loading = await this.showLoading();
    
    await this.alcanciasService.agregarUsuarioATurno(idAlcancia, turnoId);
    await this.alcanciasService.agregarIntegrante(this.idAlcancia);
    await this.alertaUnirse('Cumple tus compromisos de pago.');
    // Manejar la acción después de unirse al turno (por ejemplo, cerrar el modal)
    this.modalTurno.dismiss();
    this.router.navigateByUrl('/home');
    this.loading.dismiss();
    // Mostrar mensaje de éxito u otra acción necesaria
  } catch (error) {
    console.error('Error al unirse al turno:', error);
    // Manejar el error según sea necesario
  }
}

async seleccionarTurnoProductos(idAlcancia: string, turnoId:string) {
  try {

    this.loading = await this.showLoading();
    
    await this.alcanciasService.agregarUsuarioATurnoProductos(idAlcancia, turnoId);
    await this.alcanciasService.agregarIntegranteProductos(this.idAlcancia);
    await this.alertaUnirse('Cumple tus compromisos de pago.');
    // Manejar la acción después de unirse al turno (por ejemplo, cerrar el modal)
    this.modalTurnoProductos.dismiss();
    this.router.navigateByUrl('/home');
    this.loading.dismiss();
    // Mostrar mensaje de éxito u otra acción necesaria
  } catch (error) {
    console.error('Error al unirse al turno:', error);
    // Manejar el error según sea necesario
  }
}

async crearAlcanciaProductos() {
  try {
    this.loading = await this.showLoading();
    this.nuevaAlcanciaProductos.alcancia.montoCuotas = this.nuevaAlcanciaProductos.alcancia.costoProducto / this.nuevaAlcanciaProductos.alcancia.integrantes;

     
    
    const alcanciaRef = await this.alcanciasService.crearAlcanciaProductos(this.nuevaAlcanciaProductos);
    this.alcanciaRef = alcanciaRef;
    console.log('Alcancía creada exitosamente', this.alcanciaRef);
    this.loading.dismiss();
    this.alertaCreacion('Continuar', this.alcanciaRef )
    this.router.navigateByUrl('/home')
    this.modalProductos.dismiss()
  
  } catch (error) {
    console.error('Error al crear alcancía:', error);
    this.loading.dismiss();
    this.alertaFalla('Continuar')
    this.router.navigateByUrl('/home')
    this.modalProductos.dismiss()
  
  }
}
}
