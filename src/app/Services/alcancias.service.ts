import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable, combineLatest, forkJoin, from, merge, mergeMap, of, switchMap, tap } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Alcancias, Usuario } from '../models/models';
import firebase from 'firebase/compat/app';
import { map } from 'rxjs';


interface AlcanciasData {
  integrantes: any[];
}

interface Alcancia {
  // Definir la estructura de un documento de alcancia
  // Por ejemplo:
  id: string;
  creador:string;
  // Otros campos de la alcancia
}

@Injectable({
  providedIn: 'root'
})
export class AlcanciasService {

  

  alcanciasCollection: AngularFirestoreCollection<any>;

  constructor(private firestore: AngularFirestore, private  afAuth: AngularFireAuth) {
    this.alcanciasCollection = this.firestore.collection<any>('Alcancias');
    this.alcanciasCollection = this.firestore.collection('alcancias');
  }

  async crearAlcancia(datosAlcancia: Alcancias): Promise<void> {
    const user = await this.afAuth.currentUser;
    if (user) {
      const alcanciaData = {
        creador: {
          id: user.email || '',
          apellidos: '',
          cedula: 0,
          uid: user.uid
        },
        alcancia: datosAlcancia.alcancia,
   
      };
      const alcanciaRef = await this.alcanciasCollection.add(alcanciaData);
      console.log('ID de la alcancía creada:', alcanciaRef.id);



      const turnosCollection = this.firestore.collection(`alcancias/${alcanciaRef.id}/turnos`);

       // Calcular la fecha de inicio
       const fechaInicio = new Date(datosAlcancia.alcancia.fechadeinicio);

       for (let i = 1; i <= datosAlcancia.alcancia.integrantes; i++) {
        const fechaTurno = new Date(fechaInicio);
        fechaTurno.setDate(fechaTurno.getDate() + (datosAlcancia.alcancia.modalidad * (i - 1))); // Agregar días según la modalidad

        const turnoData = {
          fechaDeturno: firebase.firestore.Timestamp.fromDate(fechaTurno),
          // Otros datos que quieras agregar al turno
        };

        await turnosCollection.doc(i.toString()).set(turnoData);
      }




    } else {
      throw new Error('Usuario no autenticado');
    }
  }
  obtenerTurnosPorIdAlcancia(id: string): Observable<string[]> {
    return this.firestore.collection(`alcancias/${id}/turnos`).snapshotChanges().pipe(
      map(actions => {
        const turnos = actions
          .map(a => {
            const data = a.payload.doc.data() as any; // Suponiendo que los nombres están en un campo "nombre" dentro de los documentos de turno
            return { id: a.payload.doc.id, ...data };
          })
          .filter(turno => !turno.nombre); // Filtrar los turnos que no tienen un nombre definido
  
        console.log('Turnos obtenidos:', turnos);
        return turnos.map(turno => turno.id); // Devolver solo los IDs de los turnos
      })
    );
  }

  obtenerAlcanciaPorId(id: string): Observable<any> {
    const alcancia$ = this.firestore.collection('alcancias').doc(id).valueChanges();

  // Obtener los nombres de los documentos (números de turno) de la colección "turnos"
 

  return combineLatest([alcancia$]).pipe(
    map(([alcancia]) => {
      console.log('Turnos:');
      return { alcancia };
    })
  );
 
  
  }
  async agregarIntegrante(idAlcancia: string): Promise<void> {
    try {
      const user = await this.afAuth.currentUser;
      if (user) {
        const integrantesCollection = this.firestore.collection(`alcancias/${idAlcancia}/integrantes`);
        const integranteData = {
          nombres: user.email,
          uid: user.uid,
        };
        await integrantesCollection.doc(user.uid).set(integranteData);
        console.log('Integrante agregado exitosamente a la alcancía:', idAlcancia);
      } else {
        throw new Error('Usuario no autenticado');
      }
    } catch (error) {
      console.error('Error al agregar integrante a la alcancía:', error);
      throw error;
    }
  }

  async agregarUsuarioATurno(idAlcancia: string, turnoId: string) {
    try {
        // Verificar si el usuario está autenticado
        const user = await this.afAuth.currentUser;
        if (user) {
            // Crear la referencia al documento del turno
            const turnoRef = this.firestore.collection(`alcancias/${idAlcancia}/turnos`).doc(turnoId);
            // Actualizar el documento del turno con la información del usuario
            await turnoRef.set({ usuarioId: user.uid, nombre: user.email }, { merge: true });
            console.log('Usuario agregado exitosamente al turno:', turnoId);
        } else {
            throw new Error('Usuario no autenticado');
        }
    } catch (error) {
        console.error('Error al agregar usuario al turno:', error);
        throw error;
    }
}




async obtenerAlcanciasUsuarioActual(): Promise<Alcancia[]> {
  try {
    const user = await this.afAuth.currentUser;
    if (user) {
      const integranteUid = user.uid;
      const alcanciasQuerySnapshot = await this.firestore.collection<any>('alcancias').get().toPromise();

      if (alcanciasQuerySnapshot) {
        const alcanciasData: Alcancia[] = [];

        alcanciasQuerySnapshot.forEach(async alcanciaDoc => {
          const alcanciaRef = alcanciaDoc.ref;
          console.log(alcanciaRef)
          const integrantesCollection = alcanciaRef.collection('integrantes');
          const integranteDoc = await integrantesCollection.doc(integranteUid).get();
          
          if (integranteDoc.exists) {
            alcanciasData.push({
              id: alcanciaDoc.id,
              ...alcanciaDoc.data()
            });
          }
        });

        console.log('Alcancías del usuario actual:', alcanciasQuerySnapshot);
        console.log('alcanciadata:',alcanciasData)
        return alcanciasData;
      } else {
        throw new Error('No se pudo obtener el snapshot de alcancías');
      }
    } else {
      throw new Error('Usuario no autenticado');
    }
  } catch (error) {
    console.error('Error al obtener alcancías del usuario:', error);
    throw error;
  }
}
}