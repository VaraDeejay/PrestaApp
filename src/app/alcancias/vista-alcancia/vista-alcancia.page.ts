import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonModal, ModalController } from '@ionic/angular';
import { Observable, switchMap } from 'rxjs';
import { AlcanciasService } from 'src/app/Services/alcancias.service';
import { Alcancias, alcanciasUsuario } from 'src/app/models/models';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-vista-alcancia',
  templateUrl: './vista-alcancia.page.html',
  styleUrls: ['./vista-alcancia.page.scss'],
})
export class VistaAlcanciaPage implements OnInit {
  turnoSeleccionado: any;
  diferenciaEnDias: any;

  constructor(private datePipe: DatePipe, private firestore: AngularFirestore, public modalCtrl: ModalController, public router: Router, private alcanciasService: AlcanciasService) { }
  alcanciaSeleccionada: any;
  alcancias: any[] = [];
  alcanciasUsuario: alcanciasUsuario = {
    id: '',
  }
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
      this.alcancias = await this.alcanciasService.obtenerDatosAlcanciasConSubcolecciones();
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

  async detallesAlcancia(alcancia:any){
    this.alcanciaSeleccionada = alcancia;

    

    try {
      await this.modal.present();
  
      // Llamar a encontrarPrimerTurnoPosterior para obtener el primer turno posterior
      const turnosQuerySnapshot = await this.firestore.collection('alcancias').doc(alcancia.id).collection('turnos').get().toPromise();
      
  
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
        }
        
        this.turnoSeleccionado = primerTurnoPosterior
        // Puedes mostrar el turno encontrado en el modal o realizar cualquier otra acción aquí
      } else {
        console.log('No se encontró ningún turno posterior.');
        // Puedes mostrar un mensaje al usuario u otra acción en caso de que no se encuentre ningún turno posterior
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