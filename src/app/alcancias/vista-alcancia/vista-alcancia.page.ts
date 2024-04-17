import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonModal, ModalController } from '@ionic/angular';
import { Observable, switchMap } from 'rxjs';
import { AlcanciasService } from 'src/app/Services/alcancias.service';
import { Alcancias, alcanciasUsuario } from 'src/app/models/models';

@Component({
  selector: 'app-vista-alcancia',
  templateUrl: './vista-alcancia.page.html',
  styleUrls: ['./vista-alcancia.page.scss'],
})
export class VistaAlcanciaPage implements OnInit {

  constructor(public modalCtrl: ModalController, public router: Router, private alcanciasService: AlcanciasService) { }
  alcanciaSeleccionada: any;
  alcancias: any[] = [];
  alcanciasUsuario: alcanciasUsuario = {
    id: '',
  }
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
    }
  }

  footerHeight: number = 300; // Altura inicial del footer
  startY: number = 0; // Posición inicial del gesto

  

  @ViewChild('modal')
  modal!: IonModal;
  isExpanded: boolean = false;

  async detallesAlcancia(alcancia:any){
    this.alcanciaSeleccionada = alcancia;

    

   await this.modal.present();
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