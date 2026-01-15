

export interface User {
  documento: string;
  nombre: string;
  cargo: string;
  correo: string;
  password?: string;
  institucion?: string;
  // New fields for scheduling
  turnoInicio?: string; // Format "HH:mm"
  turnoFin?: string;    // Format "HH:mm"
  maxPacientes?: number;
  // Patient portal fields
  tipoUsuario?: 'PROFESIONAL' | 'PACIENTE'; // Type of user
  patientId?: string; // If tipoUsuario is PACIENTE, links to Patient.id
}

export interface Patient {
  id: string; // numero de documento
  tipoDocumento: string;
  nombreCompleto: string;
  fechaNacimiento: string;
  direccion: string;
  coordinates?: { // New field for geolocation
    lat: number;
    lng: number;
  };
  telefonoFijo?: string;
  telefonoMovil: string;
  cuidadorPrincipal: string;
  telefonoCuidador: string;
  alergicoMedicamentos: boolean;
  alergiasInfo?: string;
  clinicaEgreso: string;
  diagnosticoEgreso: string;
  programa: string;
  terapias: { [key: string]: boolean };
  oxigeno?: {
    dispositivo: string;
    litraje: number;
  };
  antibiotico?: AntibioticTreatment;
  sondaInfo?: {
    tipo: string;
  };
  heridaInfo?: {
    tipo: string;
    localizacion: string;
  };
  glucometriaInfo?: {
    frecuencia: string;
  };
  otrasTerapiasInfo?: string;
  estado: 'Pendiente' | 'Aceptado' | 'Rechazado';
  ingresadoPor: string; // email of user who created it
  fechaIngreso: string;
}

export interface AntibioticTreatment {
  medicamento: string;
  fechaInicio: string;
  fechaTerminacion: string;
  diasTotales: number;
  diaActual: number;
  miligramos: number;
  frecuenciaHoras: number;
}

export interface HandoverNote {
  id: string;
  patientId: string;
  authorId: string; // documento
  authorName: string;
  authorRole: string;
  timestamp: string;
  note: string;
  // Role-specific fields (Medico)
  antibioticStatus?: string; // Legacy field for backwards compatibility or simple notes
  antibioticData?: {        // New structured field
    action: string;       // Iniciar, Continuar, Cambiar, Finalizar, No Aplica
    medicamento?: string;
    dosisMg?: number;
    frecuenciaHoras?: number;
    diasTratamiento?: number;
  };
  oxygenInfo?: string;
  labRequests?: string;
  referralInfo?: string;
  dischargeOrders?: string;
  // Role-specific fields (Jefe Enfermeria)
  ivAccessInfo?: string;
  phlebitisScale?: number;
  pressureUlcersInfo?: string;
  // Role-specific fields (Auxiliar Enfermeria)
  signosVitales?: {
    tensionArterial: string;
    frecuenciaCardiaca: string;
    frecuenciaRespiratoria: string;
    temperatura: string;
    saturacionO2: string;
  };
  administracionMedicamentos?: string;
  curaciones?: string;
  manejoSondas?: string;
  tomaGlucometrias?: string;
  soporteNutricional?: string;
  estadoPiel?: string;

  // Role-specific fields (Fisioterapia - Secciones 17-19)
  fisioterapia?: {
    modalidad: string; // Respiratoria / Física / Integral
    auscultacion: string;
    patronRespiratorio: string;
    secreciones: string;
    fuerzaMovilidad: string;
    // New fields requested
    numeroSesiones?: number;
    duracionMeses?: number;
    tieneEgresoRehabilitacion?: boolean;
    planCasero?: boolean;
    justificacionContinuidad?: string;
  };

  // Role-specific fields (Terapia Ocupacional - Secciones 17-19)
  terapiaOcupacional?: {
    desempenoAVD: string; // Actividades Vida Diaria
    componenteCognitivo: string;
    componenteMotor: string;
    adaptaciones: string;
    // New fields
    numeroSesiones?: number;
    duracionMeses?: number;
    tieneEgresoRehabilitacion?: boolean;
    planCasero?: boolean;
    justificacionContinuidad?: string;
  };

  // Role-specific fields (Fonoaudiología - Secciones 17-19)
  fonoaudiologia?: {
    viaAlimentacion: string;
    consistenciaDieta: string;
    estadoDeglucion: string;
    estadoComunicativo: string;
    // New fields
    numeroSesiones?: number;
    duracionMeses?: number;
    tieneEgresoRehabilitacion?: boolean;
    planCasero?: boolean;
    justificacionContinuidad?: string;
  };
}