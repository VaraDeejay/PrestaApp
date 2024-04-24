import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable, combineLatest, forkJoin, from, merge, mergeMap, of, switchMap, tap } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Alcancias, Usuario, Confirmaciones } from '../models/models';
import firebase from 'firebase/compat/app';
import { map } from 'rxjs';
import {Firestore} from 'firebase/firestore'
import { QuerySnapshot } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class RecargasService {

  
  confirmacionesCollection: AngularFirestoreCollection<any>;

  constructor(private firestore: AngularFirestore, private  afAuth: AngularFireAuth) { 
    this.confirmacionesCollection = this.firestore.collection('Confirmaciones');


  }


  async nuevaRecarga(datosRecarga: Confirmaciones): Promise<void> {
    const user = await this.afAuth.currentUser;
    if (user) {
      const recargaData = {
          
          usuario: user.email || '',
          transaccion: 'Recarga',
          fecha: datosRecarga.fecha,
          monto: datosRecarga.monto,
          referenciaBanco: datosRecarga.referenciaBanco,
          uid: user.uid,
          verificado: false,
        
        
   
      };
      const operacionRef = await this.confirmacionesCollection.add(recargaData);
      
      console.log('Operacion registrada con el id:', operacionRef.id);
}
  }
}