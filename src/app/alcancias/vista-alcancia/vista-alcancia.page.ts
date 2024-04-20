import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonModal, ModalController } from '@ionic/angular';
import { Observable, switchMap } from 'rxjs';
import { AlcanciasService } from 'src/app/Services/alcancias.service';
import { Alcancias, alcanciasUsuario } from 'src/app/models/models';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { DatePipe } from '@angular/common';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {User} from 'firebase/auth'
import { AuthService } from 'src/app/Services/auth.service';
import { EnvioDineroService } from 'src/app/Services/envio-dinero.service';
import { Usuario } from 'src/app/models/models';


@Component({
  selector: 'app-vista-alcancia',
  templateUrl: './vista-alcancia.page.html',
  styleUrls: ['./vista-alcancia.page.scss'],
})
export class VistaAlcanciaPage implements OnInit {


  transaccionesTurnos: any;



  turnoSeleccionado: any;
  diferenciaEnDias: any;
  diferenciaEnDiasDetalles: number | undefined;
  turno: any;
  monto!: number;
  email: any;
  user : Usuario = {
    nombres: '',
    email: '',
    apellidos: '',
    cedula: '',
    foto: '',
    dinero: 0,
    password: '',
    uid: '',
    username: undefined
  }
transacciones: any;
datosAlcancia: any;
  currentUser!: Usuario | null;
  abonado!: number;

  constructor(private envioDineroService: EnvioDineroService, private authService: AuthService, private afAuth: AngularFireAuth, private datePipe: DatePipe, private firestore: AngularFirestore, public modalCtrl: ModalController, public router: Router, private alcanciasService: AlcanciasService) { }
  
  docId: string | undefined;
  fechaDeturno: Date | undefined;
  turnos: any [] = [];
  fechaDeturnosDetalles: Date | undefined;
  remitente : any;
  
  
  alcanciaSeleccionada: any;
  alcancias: any[] = [];
  alcanciasUsuario: alcanciasUsuario = {
    id: '',
  };
  

  alcanciacompleta: any [] = [];
  alcancia: Alcancias = {
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


  async ngOnInit() {
    try {
      this.alcancias = await this.alcanciasService.obtenerAlcanciasUsuarioActual();
      console.log('Alcancías del usuario actual:', this.alcancias);
    } catch(error) {
      console.error('Error al obtener alcancías del usuario:', error);
    };

    if (this.user){
      this.remitente = this.user.nombres
    }

    this.authService.getUsuario().then((user) =>{
      if(user){
        this.user = {
          nombres: user.nombres ?? '',
          apellidos: user.apellidos ?? '',
          cedula: user.cedula ?? '',
          password:user.password ?? '',
          foto: user.foto ?? '',
          dinero: user.dinero ?? '',
          email: user.email ?? '', 
          username: user.username ?? '',
          uid: user.uid,
        }
        console.log(user);
      }
    })

 
    
  }

  footerHeight: number = 300; // Altura inicial del footer
  startY: number = 0; // Posición inicial del gesto

  

  @ViewChild('modal')
  modal!: IonModal;
  isExpanded: boolean = false;

  @ViewChild('modalTurnos')
  modalTurnos!: IonModal;

  @ViewChild('modalPagar')
  modalPagar!: IonModal;

  @ViewChild('modalPagosTurnos')
  modalPagosTurnos!: IonModal;
  
  

  async detallesAlcancia(alcancia:any){
    this.alcanciaSeleccionada = alcancia;


    try {
        await this.modal.present();

        await this.calcularAbonado();
    
        // Llamar a encontrarPrimerTurnoPosterior para obtener el primer turno posterior
        const turnosQuerySnapshot = await this.firestore.collection('alcancias').doc(alcancia.id).collection('turnos').get().toPromise();
        
        // Obtén el usuario actual
        const currentUser = await this.authService.getUsuario();

        if(currentUser) {
            const userUid = currentUser.uid;

            // Manejar el resultado del primer turno posterior encontrado
            if (turnosQuerySnapshot) {
                const primerTurnoPosterior = await this.alcanciasService.encontrarPrimerTurnoPosterior(turnosQuerySnapshot);
                console.log('Primer turno posterior encontrado:', primerTurnoPosterior);
                if (primerTurnoPosterior) {
                    // Convertir el Timestamp a Date
                    const fechaDeturno = primerTurnoPosterior.data.fechaDeturno.toDate();
                    primerTurnoPosterior.data.fechaDeturno = fechaDeturno;

                    this.diferenciaEnDias = this.obtenerDiferenciaEnDias(fechaDeturno);
                    this.turnoSeleccionado = primerTurnoPosterior;

                    // Iterar sobre los documentos para encontrar el que cumpla la condición
                    turnosQuerySnapshot.forEach((doc) => {
                        const data = doc.data();
                        if (data['usuarioId'] === userUid) {
                          this.docId = doc.id;
                          this.fechaDeturno = data['fechaDeturno'].toDate(); // Convertir a Date si es un objeto Timestamp
                          console.log('Documento donde usuarioId es igual al user.uid:', this.docId);
                          console.log('Fecha de turno:', this.fechaDeturno);
                            // Puedes mostrar el documento o realizar cualquier otra acción aquí
                        }
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                        this.turnos = [];
                        const promises: any[] = [];


                         turnosQuerySnapshot.forEach((doc) => {
                         const turno = doc.data();
                         const fechaDeturnosDetalles = turno['fechaDeturno'].toDate();




                         const promise = this.obtenerDiferenciaEnDias2(fechaDeturnosDetalles).then((diferenciaEnDiasDetalles) => {
                        
                          const turnoConId = {
                            id: doc.id,
                            ...turno,  
                            diferenciaEnDiasDetalles: diferenciaEnDiasDetalles
                         
                         
                        
                          
                         };
                      
                      return turnoConId;
                      
                          });
                          promises.push(promise)
                    });

                    Promise.all(promises).then((turnosConDiferenciaEnDias) => {
                      this.turnos = turnosConDiferenciaEnDias;

                  });
                })};
                
                this.turnoSeleccionado = primerTurnoPosterior
                // Puedes mostrar el turno encontrado en el modal o realizar cualquier otra acción aquí
            } else {
                console.log('No se encontró ningún turno posterior.');
                // Puedes mostrar un mensaje al usuario u otra acción en caso de que no se encuentre ningún turno posterior
            }
        } else {
            console.log('No hay usuario logueado.');
            // Si no hay usuario logueado, muestra un mensaje o realiza otra acción
        }
    } catch (error) {
        console.error('Error al mostrar detalles de la alcancía:', error);
    }
}


pagoTurnosDetalles(){
   


}


async calcularAbonado(): Promise<number> {
  try {
    // Obtener el usuario actual
    this.currentUser = await this.authService.getUsuario();
  
    // Verificar si el usuario está autenticado
    if (!this.currentUser) {
      // Manejar el caso cuando el usuario no está autenticado
      return 0; // O cualquier otro valor predeterminado
    }
    
    // Obtener las transacciones del servicio
    const transacciones = await this.envioDineroService.buscarTransaccionesPorAlcanciaId(this.alcanciaSeleccionada.id) || [];
    
    // Filtrar las transacciones del usuario con alcanciaRef igual al ID de alcanciaSeleccionada
    const transaccionesUsuario = transacciones.filter((transaccion: any) => {
      return transaccion.remitente.uid === this.currentUser!.uid && transaccion.alcanciaRef === this.alcanciaSeleccionada.id;
    });

    // Multiplicar la cantidad de transacciones por el monto de cuotas
    this.abonado = transaccionesUsuario.length * this.alcanciaSeleccionada.alcancia.montoCuotas;

    console.log(this.abonado)

    // Devolver el abonado
    return this.abonado;
  } catch (error) {
    console.error('Error al calcular el abonado:', error);
    // Manejar el error según sea necesario
    return 0; // O cualquier otro valor predeterminado
  }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  async obtenerDiferenciaEnDias(fechaTurno: Date): Promise<number> {
    const fechaActual = new Date();
    const diferenciaEnTiempo = fechaTurno.getTime() - fechaActual.getTime();
    const diferenciaEnDias = Math.ceil(diferenciaEnTiempo / (1000 * 3600 * 24));
    return diferenciaEnDias;
  }
  async obtenerDiferenciaEnDias2(fechaDeturnosDetalles: Date): Promise<number> {
    const fechaActual = new Date();
    const diferenciaEnTiempo = fechaDeturnosDetalles.getTime() - fechaActual.getTime();
    const diferenciaEnDiasDetalles = Math.ceil(diferenciaEnTiempo / (1000 * 3600 * 24));
    return diferenciaEnDiasDetalles;
  }
  

  openModalTurnos(){
    this.modalTurnos.present();
  }
  cerrarModalTurnos(){
    this.modalTurnos.dismiss();
  }

  openModalPagar(turno:any){
    this.turno = turno
    this.modalPagar.present();
  }

  async openModalPagosTurnos(alcanciaSeleccionada: any){
    console.log(alcanciaSeleccionada.id);
     

    try{
       
      this.datosAlcancia = await this.obtenerDatosAlcanciaConIntegrantes(alcanciaSeleccionada.id)


      this.transacciones = await this.envioDineroService.buscarTransaccionesPorAlcanciaId(alcanciaSeleccionada.id);
      console.log('Transacciones encontradas:', this.transacciones, this.datosAlcancia)



    } catch (error){

      console.error ('Error al buscar transacciones:', error)
    }


   
    


    this.modalPagosTurnos.present()
  }

 
  










  cerrarModalPagosTurnos(){
    this.modalPagosTurnos.dismiss()
  }









  cerrarModalPagar(){
    this.modalPagar.dismiss();
  }

  cerrarDetalles(){
    this.modal.dismiss();
  }

  atrasHome(){
    this.router.navigateByUrl('/home')
  }

  toggleFooter() {
    this.isExpanded = !this.isExpanded;
  }

  onPan(event: any) {
    if (event.additionalEvent === 'panup' || event.additionalEvent === 'pandown') {
      const deltaY = event.deltaY;
      if (event.additionalEvent === 'panup' && this.footerHeight >= 100) {
        this.footerHeight -= deltaY;
        if (this.footerHeight < window.innerHeight / 2) {
          this.footerHeight = window.innerHeight / 2;
        }
      } else if (event.additionalEvent === 'pandown' && this.footerHeight <= window.innerHeight) {
        this.footerHeight -= deltaY;
        if (this.footerHeight > window.innerHeight) {
          this.footerHeight = window.innerHeight;
        }
      }
    }
  }

   async pagarCuota(email: string, monto: number, alcanciaRef: string, turnoRef: string ){

    console.log(email, monto, this.user.dinero, this.user)
    try{
      if(this.user){ 
        
        if(this.user.dinero < this.monto)
        { 
          console.log(this.user.dinero, this.monto) 
          throw new Error ('Fondo Insuficiente')
          
        }
        await this.envioDineroService.enviarDinero(email, monto, this.user, alcanciaRef, turnoRef, 'Pago de cuota alcancia');
        console.log('Dinero enviado exitosamente')
      } else {
        console.error('Usuario no autenticado');
      }
    } catch(error){
      console.error('Error al enviar dinero:', error)
    }
   }

   filtrarTransaccionesPorTurno(turnoId: string): any[] {
    return this.transacciones.filter((transaccion: any) => transaccion.turnoRef === turnoId);
  }



  async obtenerDatosAlcanciaConIntegrantes(alcanciaId: string): Promise<any> {
    try {
      // Obtener datos de la alcancía
      const alcanciaSnapshot = await this.firestore.collection('alcancias').doc(alcanciaId).get().toPromise();
  
      if (alcanciaSnapshot && !alcanciaSnapshot.exists) {
        console.error('El documento de la alcancía no existe.');
        return null;
      }
  
      if (!alcanciaSnapshot) {
        console.error('No se pudo obtener el documento de la alcancía.');
        return null;
      }
  
      const alcanciaData = alcanciaSnapshot.data();
  
      // Obtener datos de la subcolección 'integrantes'
      const integrantesSnapshot = await this.firestore.collection('alcancias').doc(alcanciaId).collection('integrantes').get().toPromise();
  
      if (!integrantesSnapshot) {
        console.error('No se pudo obtener la colección de integrantes.');
        return null;
      }
  
      const integrantesData: any = [];
      integrantesSnapshot.forEach((doc) => {
        integrantesData.push({ id: doc.id, ...doc.data() });
      });
  
      return { alcancia: alcanciaData, integrantes: integrantesData };
    } catch (error) {
      console.error('Error al obtener datos de la alcancía con integrantes:', error);
      return null;
    }
  }
}