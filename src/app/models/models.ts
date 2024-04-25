import { NumberSymbol } from "@angular/common";

export interface Usuario {
    username: any;
    email: string;
    nombres: string;
    apellidos: string;
    cedula: string;
    foto: string;
    dinero: number;
    password: string;
    uid: string;
    


    
}

export interface UsuarioEnvioDinero{

    monto: number,
    cedulaDestinatario: string,
}

export interface TransaccionData{

    remitente: {
        nombres: string;
        apellidos: string;
        // Otras propiedades del remitente, como cedula, monto, etc.
      };
      
    nombres: string;
    apellidos: string;
    fecha: Date;
    monto: number;
}

export interface Alcancias{
   

    creador: {

        nombres: string;
        apellidos: string;
        cedula: number;
        uid: string;

    }

    alcancia: {
        integrantes: number;
        montoARecibir: number;
        cuotas: number;
        modalidad: number;
        montoCuotas: number;
        fechadeinicio: Date;
        
    }

    integrantes: {
        nombres: string;
        apellidos:string;
        cedula: string;
        turno: number;
        
    }
}

export interface turno{
    id: string;
    
}

export interface alcanciasUsuario{
    id:string;
}

export interface ReferenciaPago{
    tipoDePago: string;
    alcanciaRef: string;
    turnoRef: string;
    
}

export interface Confirmaciones{
    datos: any;

    fecha: Date;
    monto: number;
    referenciaBanco: number;
    transaccion: string;
    usuario: string;
    verificado: boolean;
    tasa: number;
}

export interface Retiro{
    monto: number;
    banco: number;
    telefono: number;
    cedula:number;
    
}