import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable, combineLatest, forkJoin, from, merge, mergeMap, of, switchMap, tap } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Alcancias, Usuario, AlcanciaProducto } from '../models/models';
import firebase from 'firebase/compat/app';
import { map } from 'rxjs';
import {Firestore} from 'firebase/firestore'
import { QuerySnapshot } from 'firebase/firestore';


interface AlcanciasData {
  integrantes: any[];
  creador: any;
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
  alcanciasProductosCollection: AngularFirestoreCollection<any>

  constructor(private firestore: AngularFirestore, private  afAuth: AngularFireAuth) {
    this.alcanciasProductosCollection = this.firestore.collection<any>('Alcancias de Productos');
    this.alcanciasCollection = this.firestore.collection('alcancias');
  }

  async crearAlcancia(datosAlcancia: Alcancias): Promise<firebase.firestore.DocumentReference> {
    const user = await this.afAuth.currentUser;
    if (user) {
      const alcanciaData = {
        creador: {
          id: user.email || '',
        
          uid: user.uid
        },
        alcancia: datosAlcancia.alcancia,
   
      };
      const alcanciaRef = await this.alcanciasCollection.add(alcanciaData);
      
      console.log('ID de la alcancía creada:', alcanciaRef.id);
      

     const turnosCollection = this.firestore.collection(`alcancias/${alcanciaRef.id}/turnos`);
     const fechaInicio = new Date(datosAlcancia.alcancia.fechadeinicio);

       for (let i = 1; i <= datosAlcancia.alcancia.integrantes; i++) {
        const fechaTurno = new Date(fechaInicio);
        fechaTurno.setDate(fechaTurno.getDate() + (datosAlcancia.alcancia.modalidad * (i - 1))); // Agregar días según la modalidad

        const turnoData = {
          fechaDeturno: firebase.firestore.Timestamp.fromDate(fechaTurno),

          
          // Otros datos que quieras agregar al turno
        };

        await turnosCollection.doc(i.toString().padStart(2, '0')).set(turnoData);
        
      }

   
      return alcanciaRef;
     
    } else {
      throw new Error('Usuario no autenticado');
    }
  }

  async crearAlcanciaProductos(datosAlcancia: AlcanciaProducto): Promise<firebase.firestore.DocumentReference> {
    const user = await this.afAuth.currentUser;
    if (user) {
      const alcanciaData = {
        creador: {
          id: user.email || '',
          uid: user.uid
        },
        alcancia: datosAlcancia.alcancia,
      };
      const alcanciaRef = await this.alcanciasProductosCollection.add(alcanciaData);
      
      console.log('ID de la alcancía creada:', alcanciaRef.id);
  
      const turnosCollection = this.firestore.collection(`Alcancias de Productos/${alcanciaRef.id}/turnos`);
      const fechaInicio = new Date(datosAlcancia.alcancia.fechadeinicio);
  
      for (let i = 1; i <= datosAlcancia.alcancia.integrantes; i++) {
        const fechaTurno = new Date(fechaInicio);
        fechaTurno.setDate(fechaTurno.getDate() + (datosAlcancia.alcancia.modalidad * (i - 1))); // Agregar días según la modalidad
  
        const turnoData = {
          fechaDeturno: firebase.firestore.Timestamp.fromDate(fechaTurno),
          // Otros datos que quieras agregar al turno
        };
  
        // Establecer el identificador del documento como el número del turno
        await turnosCollection.doc(i.toString().padStart(2, '0')).set(turnoData);
      }
  
      return alcanciaRef;
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

  obtenerTurnosPorIdAlcanciaProductos(id: string): Observable<string[]> {
    return this.firestore.collection(`Alcancias de Productos/${id}/turnos`).snapshotChanges().pipe(
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


async agregarIntegranteProductos(idAlcancia: string): Promise<void> {
  try {
    const user = await this.afAuth.currentUser;
    if (user) {
      const integrantesCollection = this.firestore.collection(`Alcancias de Productos/${idAlcancia}/integrantes`);
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

async agregarUsuarioATurnoProductos(idAlcancia: string, turnoId: string) {
  try {
      // Verificar si el usuario está autenticado
      const user = await this.afAuth.currentUser;
      if (user) {
          // Crear la referencia al documento del turno
          const turnoRef = this.firestore.collection(`Alcancias de Productos/${idAlcancia}/turnos`).doc(turnoId);
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
      const userEmail = user.email;
      const alcanciasQuerySnapshot = await this.firestore.collection<any>('alcancias').get().toPromise();

      if (alcanciasQuerySnapshot) {
        const alcanciasData: Alcancia[] = [];

        alcanciasQuerySnapshot.forEach(async alcanciaDoc => {
          const alcanciaRef = alcanciaDoc.ref;
          const integrantesCollection = alcanciaRef.collection('integrantes');
          const integranteDoc = await integrantesCollection.doc(integranteUid).get();

          if (integranteDoc.exists) {
            alcanciasData.push({
              id: alcanciaDoc.id,
              ...alcanciaDoc.data()
            });
          } else {
            // Verificar si el creador de la alcancía es el usuario actual
            const alcanciaData = alcanciaDoc.data();
            if (alcanciaData && alcanciaData.creador && alcanciaData.creador.uid === integranteUid) {
              alcanciasData.push({
                id: alcanciaDoc.id,
                ...alcanciaData
              });
            }
          }
        });

        console.log('Alcancías del usuario actual:', alcanciasData);
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

async obtenerAlcanciasProductosUsuarioActual(): Promise<Alcancia[]> {
  try {
    const user = await this.afAuth.currentUser;
    if (user) {
      const integranteUid = user.uid;
      const userEmail = user.email;
      const alcanciasQuerySnapshot = await this.firestore.collection<any>('Alcancias de Productos').get().toPromise();

      if (alcanciasQuerySnapshot) {
        const alcanciasData: Alcancia[] = [];

        alcanciasQuerySnapshot.forEach(async alcanciaDoc => {
          const alcanciaRef = alcanciaDoc.ref;
          console.log(alcanciaRef)
          // Verificar si el creador de la alcancía es el usuario actual
          const alcanciaData = alcanciaDoc.data();
          if (alcanciaData && alcanciaData.creador && alcanciaData.creador.uid === integranteUid) {
            alcanciasData.push({
              id: alcanciaDoc.id,
              ...alcanciaData
            });
          } else {
            // Si el usuario no es el creador, comprobar si es un integrante
            const integrantesCollection = alcanciaRef.collection('integrantes');
            const integranteDoc = await integrantesCollection.doc(integranteUid).get();

            if (integranteDoc.exists) {
              alcanciasData.push({
                id: alcanciaDoc.id,
                ...alcanciaDoc.data()
              });
            }
          }
        });

        console.log('Alcancías del usuario actual:', alcanciasData);
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

async obtenerDatosAlcanciasConSubcolecciones(): Promise<any[]> {
  try {
    const user = await this.afAuth.currentUser;
    if (user) {
      const integranteUid = user.uid;
      const alcanciasQuerySnapshot = await this.firestore.collection<any>('alcancias').get().toPromise();

      if (alcanciasQuerySnapshot) {
        const alcanciasData: any[] = [];

        for (const alcanciaDoc of alcanciasQuerySnapshot.docs) {
          const alcanciaRef = alcanciaDoc.ref;
          const alcanciaData = alcanciaDoc.data();

          // Obtener datos de la alcancía
          const alcanciaCompleta = { id: alcanciaDoc.id, ...alcanciaData };

          // Obtener datos de la subcolección 'integrantes'
          const integrantesQuerySnapshot = await alcanciaRef.collection('integrantes').get();

          if (!integrantesQuerySnapshot.empty) {
            const integrantesData = integrantesQuerySnapshot.docs.map(doc => doc.data());
            alcanciaCompleta.integrantes = integrantesData;
          }

          // Obtener datos de la subcolección 'turnos'
          const turnosQuerySnapshot = await alcanciaRef.collection('turnos').get();

          if (!turnosQuerySnapshot.empty) {
            const turnosData = turnosQuerySnapshot.docs.map(doc => doc.data());
            alcanciaCompleta.turnos = turnosData;



            const primerTurnoPosterior = await this.encontrarPrimerTurnoPosterior(turnosQuerySnapshot);
            alcanciaCompleta.primerTurnoPosterior = primerTurnoPosterior;
          }

          

          // Agregar la alcancía completa al array
          alcanciasData.push(alcanciaCompleta);
        }

        console.log('Datos de alcancías con subcolecciones:', alcanciasData);
        return alcanciasData;
      } else {
        throw new Error('No se pudo obtener el snapshot de alcancías');
      }
    } else {
      throw new Error('Usuario no autenticado');
    }
  } catch (error) {
    console.error('Error al obtener datos de alcancías con subcolecciones:', error);
    throw error;
  }
}

async encontrarPrimerTurnoPosterior(turnosQuerySnapshot: firebase.firestore.QuerySnapshot): Promise<any | null> {
  try {
    // Obtener la fecha actual
    const fechaActual = new Date();

    // Iterar sobre los documentos de la subcolección de turnos
    for (const doc of turnosQuerySnapshot.docs) {
      const data = doc.data();
      let fechaTurno: Date;

      // Verificar si fechaDeturno es un Timestamp y convertirlo a Date si es necesario
      if (data['fechaDeturno'] instanceof firebase.firestore.Timestamp) {
        fechaTurno = data['fechaDeturno'].toDate();
      } else {
        fechaTurno = data['fechaDeturno'];
      }

      // Verificar si la fecha del turno es posterior a la fecha actual
      if (fechaTurno > fechaActual) { 
        console.log('Primer turno posterior encontrado:', doc.id, data);
        return { id: doc.id, data: data };
      }
    }

    // Si no se encuentra ningún turno posterior
    console.log('No se encontró ningún turno posterior.');
    return null;
  } catch (error) {
    console.error('Error al encontrar el primer turno posterior:', error);
    throw error;
  }
}
}