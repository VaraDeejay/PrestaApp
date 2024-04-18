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


@Component({
  selector: 'app-vista-alcancia',
  templateUrl: './vista-alcancia.page.html',
  styleUrls: ['./vista-alcancia.page.scss'],
})
export class VistaAlcanciaPage implements OnInit {
  turnoSeleccionado: any;
  diferenciaEnDias: any;
  diferenciaEnDiasDetalles: number | undefined;
  turno: any;

  constructor(private authService: AuthService, private afAuth: AngularFireAuth, private datePipe: DatePipe, private firestore: AngularFirestore, public modalCtrl: ModalController, public router: Router, private alcanciasService: AlcanciasService) { }
  
  docId: string | undefined;
  fechaDeturno: Date | undefined;
  turnos: any [] = [];
  fechaDeturnosDetalles: Date | undefined;
  
  
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
  

  async detallesAlcancia(alcancia:any){
    this.alcanciaSeleccionada = alcancia;

    try {
        await this.modal.present();
    
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

  
}