import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from 'rxjs';
import { Usuario } from '../models/models';


interface UsuarioData {
  dinero: number;
  nombre: string; // Se espera que 'dinero' sea un número
  // Otros campos que pueda tener un usuario
}

interface Transaccion {
  id: string;
  remitente: string;
  destinatario: string;
  monto: number;
  nombre: string;
  // Otros campos si los hay
}




@Injectable({
  providedIn: 'root'
})
export class EnvioDineroService {

  transaccion : Transaccion | undefined

  constructor(private firestore: AngularFirestore) { }

  async enviarDinero(cedulaDestinatario: string, monto: number, remitente:Usuario, alcanciaRef: string, turnoRef : string, tipoDePago : string): Promise<void> {
    try {
      // Buscar al usuario destinatario por su número de cédula
      const destinatarioQuerySnapshot = await this.firestore.collection('usuarios', ref => ref.where('email', '==', cedulaDestinatario)).get().toPromise();
      
      if (!destinatarioQuerySnapshot || destinatarioQuerySnapshot.size === 0) {
        throw new Error('No se encontró ningún usuario con la cédula especificada');
      }
  
    // Obtener el ID y el nombre del usuario destinatario
    let destinatarioId: string | undefined;
    let destinatarioNombre: string | undefined;
    
    destinatarioQuerySnapshot.forEach(doc => {
      destinatarioId = doc.id;
      const data = doc.data() as { nombres: string }; // Type assertion
      if (data && data.nombres) {
        destinatarioNombre = data.nombres;
      } else {
        // Manejar el caso en el que el campo 'nombres' no está presente o es null
        destinatarioNombre = "Nombre no disponible";
      }
    });
    

    if (!destinatarioId || !destinatarioNombre ) {
      throw new Error('No se pudo obtener el ID o el nombre del usuario destinatario');
    }
      // Realizar una transacción para actualizar el saldo del usuario destinatario
      await this.firestore.firestore.runTransaction(async transaction => {
        const destinatarioRef = this.firestore.collection('usuarios').doc(destinatarioId).ref;
        const destinatarioDoc = await transaction.get(destinatarioRef);
        const destinatarioData = destinatarioDoc.data() as UsuarioData; 
        // Convertir a UsuarioData
        if (!destinatarioData || typeof destinatarioData.dinero !== 'number') {
          throw new Error('El saldo del usuario destinatario no es válido');
        }
        const saldoActual = destinatarioData.dinero;
        transaction.update(destinatarioRef, { dinero: saldoActual + monto }); 
      });
  
      
      
      
      const transaccion = {
        remitente: {
          nombres: remitente.nombres,
          apellidos: remitente.apellidos,
          cedula: remitente.cedula,
          monto:monto,
          fecha: new Date().toISOString(),
          uid: remitente.uid,
        },
        destinatario: {
          cedula: cedulaDestinatario,
          nombres: destinatarioNombre,
          
          
          
        },
        monto: monto,
        fecha: new Date().toISOString(),
        tipoDePago: tipoDePago,
        alcanciaRef: alcanciaRef,
        turnoRef: turnoRef,
      };
  
      
      if (!remitente.uid) {
        throw new Error('El UID del usuario remitente es nulo o está vacío');
      }
      
      // Deducir el monto del saldo del usuario remitente
      
      
      
      
      const remitenteRef = this.firestore.collection('usuarios').doc(remitente.uid).ref;
await this.firestore.firestore.runTransaction(async transaction => {
  const remitenteDoc = await transaction.get(remitenteRef);
  const remitenteData = remitenteDoc.data() as UsuarioData; // Convertir a UsuarioData
  if (!remitenteData || typeof remitenteData.dinero !== 'number') {
    throw new Error('El saldo del usuario remitente no es válido');
  }
  const saldoActual = remitenteData.dinero;
  if (saldoActual < monto) {
    throw new Error('El usuario remitente no tiene suficiente saldo');
  }
  transaction.update(remitenteRef, { dinero: saldoActual - monto }); 
});
  
      // Crear el objeto de transacción después de que la transacción se haya completado exitosamente
    
      // Llamar al método para guardar la transacción
      await this.guardarTransaccion(transaccion);
  
      console.log('Dinero enviado exitosamente');
    } catch (error) {
      console.error('Error al enviar dinero:', error);
      throw error;
    }
  }
  
  private async guardarTransaccion(transaccion: any): Promise<void> {
    // Guardar la transacción en Firestore
    await this.firestore.collection('transacciones').add(transaccion);
    console.log('Transacción guardada exitosamente');
  }

  async obtenerTransaccionesPorUsuario(cedulaUsuario: string): Promise<any[]> {
    try {
      const transaccionesSnapshot = await this.firestore.collection('transacciones', ref =>
        ref.where('remitente.cedula', '==', cedulaUsuario)
            // Filtrar por la cédula del remitente
      ).get().toPromise();

      
  
      if (transaccionesSnapshot) {
        const transacciones: any[] = []; // Aquí proporcionamos un tipo explícito para la variable transacciones
        transaccionesSnapshot.forEach(doc => {
          const transaccion = doc.data() as Transaccion;
          transaccion.monto = -transaccion.monto;
          transacciones.push(transaccion);
        });
        console.log(transacciones);
        return transacciones;
      } else {
        console.error('La instantánea de transacciones es undefined');
        return [];
      }
    } catch (error) {
      console.error('Error al obtener transacciones:', error);
      throw error;
    }
  }

  async obtenerTransaccionesPorUsuario2(cedulaUsuario: string): Promise<any[]> {
    try {
      const transaccionesSnapshot = await this.firestore.collection('transacciones', ref =>
        ref.where('destinatario.cedula', '==', cedulaUsuario)
            // Filtrar por la cédula del remitente
      ).get().toPromise();

      
  
      if (transaccionesSnapshot) {
        const transacciones: any[] = []; // Aquí proporcionamos un tipo explícito para la variable transacciones
        transaccionesSnapshot.forEach(doc => {
          const transaccion = doc.data() as Transaccion;
         
          
          transacciones.push(transaccion);
        });
        console.log(transacciones);
        
        return transacciones;
      } else {
        console.error('La instantánea de transacciones es undefined');
        return [];
      }
    } catch (error) {
      console.error('Error al obtener transacciones:', error);
      throw error;
    }
  }

}