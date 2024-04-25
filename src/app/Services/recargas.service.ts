import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable, combineLatest, forkJoin, from, merge, mergeMap, of, switchMap, tap } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Alcancias, Usuario, Confirmaciones, Retiro } from '../models/models';
import firebase from 'firebase/compat/app';
import { map } from 'rxjs';
import {Firestore} from 'firebase/firestore'
import { QuerySnapshot } from 'firebase/firestore';
import { UserCredential } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class RecargasService {

  
  confirmacionesCollection: AngularFirestoreCollection<any>;
  retirosCollection: AngularFirestoreCollection<any>;

  constructor(private firestore: AngularFirestore, private  afAuth: AngularFireAuth) { 
    this.confirmacionesCollection = this.firestore.collection('Confirmaciones');
    this.retirosCollection = this.firestore.collection('Retiros')


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

  async nuevoRetiro(datosRetiro: Retiro): Promise<void> {
    const user = await this.afAuth.currentUser;
    if (user) {
      const retiroData = {
          
          usuario: user.email || '',
          transaccion: 'Retiro',
          fecha: new Date(),
          monto: datosRetiro.monto,
          banco: datosRetiro.banco,
          uid: user.uid,
          verificado: false,
          cedula: datosRetiro.cedula,
          telefono: datosRetiro.telefono,
        
        
   
      };
      const operacionRef = await this.retirosCollection.add(retiroData);
      
      console.log('Operacion registrada con el id:', operacionRef.id);
}
  }

  async validarClave(clave: string): Promise<boolean> {
    try {
      const user = await this.afAuth.currentUser;
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Verificamos si el usuario tiene un correo electrónico
      if (!user.email) {
        throw new Error('Correo electrónico del usuario no encontrado');
      }

      // Intentamos iniciar sesión con el correo electrónico y la clave proporcionados
      await this.afAuth.signInWithEmailAndPassword(user.email, clave);

      // Si no se produjo ningún error, el inicio de sesión fue exitoso
      return true;
    } catch (error) {
      console.error('Error al validar la clave:', error);
      // Si se produce un error, el inicio de sesión no fue exitoso
      return false;
    }
  }

}