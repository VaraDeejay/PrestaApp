import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Usuario } from '../models/models';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from 'rxjs';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs';
import { startWith, catchError } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser: any;

  constructor(private afAuth: AngularFireAuth, private firestore: AngularFirestore) { }

  async register(user: Usuario) {
    try {
      const result = await this.afAuth.createUserWithEmailAndPassword(user.email, user.password);
      const uid = result.user?.uid ?? '';
      user.uid = uid;
      
      // Aquí puedes agregar lógica adicional, como guardar otros detalles del usuario en Firestore, si es necesario.
      await this.firestore.collection('usuarios').doc(uid).set({
        nombres: user.nombres,
        apellidos: user.apellidos,
        cedula: user.cedula,
        email: user.email,
        dinero: user.dinero,
        uid: uid,
        // Añade otros campos según sea necesario
      });

      return user;
    } catch (error) {
      console.error('Error al registrar el usuario:', error);
      throw error;
    }
  }

  getUsuario(): Promise<Usuario | null> {
    return new Promise((resolve, reject) => {
      this.afAuth.authState.subscribe((user) => {
        if (user) {
          this.firestore.collection('usuarios').doc(user.uid).get()
            .subscribe((doc) => {
              if (doc.exists) {
                const usuario = doc.data() as Usuario;
                resolve(usuario);
              } else {
                resolve(null);
              }
            });
        } else {
          resolve(null);
        }
      });
    });
  }
}