import { Injectable } from '@angular/core';
import { Usuario } from '../models/models';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';
import { map, throwError, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DatosService {

  private usuarioCollection!: AngularFirestoreCollection<Usuario>;
  usuario!: Observable<Usuario[]>;

  constructor(private firestore: AngularFirestore, private afAuth: AngularFireAuth) { 

    this.usuarioCollection = this.firestore.collection<Usuario>('usuario');
    this.usuario = this.usuarioCollection.valueChanges();
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
  


  registrarUsuario(usuario: Usuario): Observable<any> {
    return new Observable((observer) => {
      this.usuarioCollection.add(usuario)
        .then((docRef) => {
          console.log('Usuario registrado con ID: ', docRef.id);
          observer.next(docRef.id); // Notificar al componente con el ID del documento creado
          observer.complete();
        })
        .catch((error) => {
          console.error('Error al registrar usuario: ', error);
          observer.error(error); // Manejar el error y notificar al componente
        });
    }).pipe(
      catchError((error) => throwError(error)) // Manejar errores con operador catchError
    );
  }
}
