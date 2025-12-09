

import React from 'react';

export const DOCUMENT_TYPES = ["Cédula de Ciudadanía", "Tarjeta de Identidad", "Cédula de Extranjería", "Pasaporte", "Registro Civil"];

export const CLINICAS_ORIGEN = [
  "Vs UAB Soacha", "Vs UAB Américas", "Laboratorio clínico", "Vs UAB Calle 98",
  "Hospital Cancerologico", "Clínica Avidanti", "Clínica centenario", "Clínica La Colina",
  "Clínica Colsubsidio Roma", "Clinica Del Country", "Hospital de la Misericordia",
  "Clínica Juan N Corpas", "Cïnica de Marly", "Clínica Medical", "Clínica Los Nogales",
  "Clínica de Occidente", "Clinica Shaio", "Clínica Suba", "Consulta externa",
  "Centro Policlinico del Olaya", "Atención domiciliaria programa crónico",
  "Demanda inducida", "Fundación Cardioinfantil", "Fundación Hospital Sal Carlos",
  "Hospital Simon Bolivar", "Hospuiatl Universitario San Rafael", "Hospital Universitario santa Fe de Bogotá",
  "Clínica Los Cobos", "Atención domiciliaria programa paliativo", "Hospital san Carlos",
  "Hospital de San Ignacio", "Hospital san Jose Centro", "Hospital san Jose Infantil",
  "Hospital de san rafael", "Hospital de Kennedy", "Hospital de la Samaritana",
  "Hospital de Bosa", "Hospital Engativa", "Clínica Mederic"
];

export const PROGRAMAS = [
  "Virrey solis en Casa Hospitalario",
  "Virrey solis en Casa Crónico",
  "Virrey solis en Casa Crónico Paliativo"
];

export const TERAPIAS_HOSPITALARIO = {
  "atencion (visita) domiciliaria, por medicina general": false,
  "curación mayor en casa por enfermería": false,
  "participacion en junta médica o equipo interdisciplinario junta integral domiciliaria": false,
  "atencion (visita) domiciliaria, por terapia respiratoria": false,
  "Oxígeno": false,
  "Aplicación de terapia antibiótica": false,
  "Manejo de Sondas": false,
  "Toma de glucometrías": false,
  "Otras terapias": false
};

export const TERAPIAS_CRONICO = {
  "atencion (visita) domiciliaria, por medicina general": false,
  "curación mayor en casa por enfermería": false,
  "participacion en junta médica o equipo interdisciplinario junta integral domiciliaria": false,
  "Oxígeno": false,
  "atencion (visita) domiciliaria, por trabajo social": false,
  "cambio catéter urinario en domicilio": false,
  "atencion (visita) domiciliaria, por nutricion y dietetica": false,
  "registro de oximetria cutanea domiciliaria": false,
  "atencion (visita) domiciliaria, por foniatria y fonoaudiologia": false,
  "atencion (visita) domiciliaria, por fisioterapia": false,
  "atencion (visita) domiciliaria, por terapia ocupacional": false,
  "atencion (visita) domiciliaria, por terapia respiratoria": false,
  "Manejo de Sondas": false,
  "Toma de glucometrías": false,
  "Otras terapias": false
};

export const TERAPIAS_PALIATIVO = {
  "consulta de ingreso al programa domiciliario": false,
  "participacion en junta médica o equipo interdisciplinario junta integral domiciliaria": false,
  "atencion (visita) domiciliaria, por terapia respiratoria": false,
  "Oxígeno": false,
  "Manejo de Sondas": false,
  "Toma de glucometrías": false,
  "Otras terapias": false
};


export const ANTIBIOTICOS = [
  "Piperacilina Tazobactam", "Amikacina", "Ampicilina Sulbactam", "Ampicilina", "Cefalotina",
  "Cefazolina", "Cefepima", "Ceftazidima Avibactam", "Ceftriaxona", "Cefuroxima",
  "Ciprofloxacina", "Claritromicina", "Clindamicina", "Clínica de anticoagulación",
  "Dextrosa en agua destilada 5%", "Dextrosa en agua destilada al 10%", "Daptomicina",
  "Ertapenem", "Gentamicina", "Hidromorfona", "Linezolid", "Meropenem", "Metronidazol",
  "Oxacilina", "Penicilina Cristalina", "Vancomicina"
];

export const OXIGENO_DISPOSITIVOS = ["Cánula nasal", "Ventury", "Máscara con reservorio", "Cpap", "Bipap"];
export const SONDA_TIPOS = ["Sonda Vesical", "Sonda Nasogástrica", "Gastrostomía"];
export const GLUCOMETRIA_FRECUENCIAS = ["Cada 6 horas", "Cada 8 horas", "Cada 12 horas", "Una vez al día", "Según esquema de insulina"];

export const ROLES_ASISTENCIALES = [
  "JEFE MEDICO", // Added explicitly
  "APRENDIZ EN ETAPA PRACTICA",
  "AUXILIAR DE SERVICIO AL CLIENTE PAD",
  "AUXILIAR ADMINISTRATIVO PAD",
  "AUXILIAR DE ENFERMERIA PAD",
  "AUXILIAR DE ENFERMERIA PAD (N)",
  "COORDINADOR (A) OPERATIVO(A) PAD",
  "ENFERMERO(A) JEFE PAD",
  "ENFERMERO(A) JEFE PAD ADMINISTRATIVO",
  "FISIOTERAPEUTA PAD",
  "FONOAUDIOLOGO (A) PAD",
  "MEDICO DOMICILIARIO",
  "NUTRICIONISTA",
  "PSICOLOGO (A) CLINICO",
  "TERAPEUTA OCUPACIONAL PAD",
  "TRABAJADOR (A) SOCIAL DOMICILIARIO"
];

export const ESPECIALIDADES_NOVEDADES = [
  "Médico", "Jefe de Enfermería", "Auxiliar de enfermeria", "Fisioterapeuta",
  "Fonoaudióloga", "Terapeuta ocupacional", "Trabajador social", "Psicología", "Personal administrativo"
];

export const GUIA_INFUSION_ANTIBIOTICOS = [
  { antibiotico: "Piperacilina/Tazobactam", vehiculo: "Cloruro de Sodio 0.9% (SF) o Dextrosa 5% (SG5%)", volumen: "100 ml (Para dosis usuales)", tiempo: "30 minutos (Infusión Intermitente) o 4 horas (Infusión Prolongada/Extendida)" },
  { antibiotico: "Amikacina", vehiculo: "Cloruro de Sodio 0.9% (SF) o Dextrosa 5% (SG5%)", volumen: "100 ml", tiempo: "30 a 60 minutos" },
  { antibiotico: "Ampicilina/Sulbactam", vehiculo: "Cloruro de Sodio 0.9% (SF) o Dextrosa 5% (SG5%)", volumen: "100 ml (Dosis hasta 1.5 g)", tiempo: "15 a 30 minutos (Infusión Intermitente) o 4 horas (Infusión Extendida para dosis mayores)" },
  { antibiotico: "Ampicilina", vehiculo: "Cloruro de Sodio 0.9% (SF) o Dextrosa 5% (SG5%)", volumen: "100 ml (Para dosis de 1-2 g)", tiempo: "30 a 60 minutos" },
  { antibiotico: "Cefalotina", vehiculo: "Cloruro de Sodio 0.9% (SF) o Dextrosa 5% (SG5%)", volumen: "100 ml", tiempo: "30 a 60 minutos" },
  { antibiotico: "Cefazolina", vehiculo: "Cloruro de Sodio 0.9% (SF) o Dextrosa 5% (SG5%)", volumen: "100 ml (Para dosis usuales)", tiempo: "30 a 60 minutos" },
  { antibiotico: "Cefepima", vehiculo: "Cloruro de Sodio 0.9% (SF) o Dextrosa 5% (SG5%)", volumen: "100 ml (Para dosis usuales)", tiempo: "30 a 60 minutos (Infusión Intermitente) o 4 horas (Infusión Extendida)" },
  { antibiotico: "Ceftazidima/Avibactam", vehiculo: "Cloruro de Sodio 0.9% (SF) o Dextrosa 5% (SG5%)", volumen: "100 ml", tiempo: "30 a 60 minutos" },
  { antibiotico: "Ceftriaxona", vehiculo: "Cloruro de Sodio 0.9% (SF) o Dextrosa 5% (SG5%)", volumen: "100 ml (Dosis ≤ 1 g, en 10 ml para bolo)", tiempo: "30 a 60 minutos (Infusión intermitente) o 3 a 5 minutos (Bolo, con concentraciones más bajas)" },
  { antibiotico: "Cefuroxima", vehiculo: "Cloruro de Sodio 0.9% (SF) o Dextrosa 5% (SG5%)", volumen: "100 ml", tiempo: "30 a 60 minutos" },
  { antibiotico: "Ciprofloxacina", vehiculo: "Cloruro de Sodio 0.9% (SF) o Dextrosa 5% (SG5%)", volumen: "100 ml", tiempo: "60 minutos" },
  { antibiotico: "Claritromicina", vehiculo: "Cloruro de Sodio 0.9% (SF) o Dextrosa 5% (SG5%)", volumen: "100 ml (Normalmente se presenta lista)", tiempo: "60 minutos" },
  { antibiotico: "Clindamicina", vehiculo: "Cloruro de Sodio 0.9% (SF) o Dextrosa 5% (SG5%)", volumen: "250 ml (Volumen solicitado)", tiempo: "30 a 60 minutos (Máximo 30 mg/min)" },
  { antibiotico: "Daptomicina", vehiculo: "Cloruro de Sodio 0.9% (SF)", volumen: "100 ml", tiempo: "30 minutos" },
  { antibiotico: "Ertapenem", vehiculo: "Cloruro de Sodio 0.9% (SF)", volumen: "100 ml (Para dosis usuales)", tiempo: "30 minutos" },
  { antibiotico: "Gentamicina", vehiculo: "Cloruro de Sodio 0.9% (SF) o Dextrosa 5% (SG5%)", volumen: "100 ml", tiempo: "30 a 60 minutos" },
  { antibiotico: "Linezolid", vehiculo: "No requiere dilución adicional (Suministro en bolsa)", volumen: "100 ml (Se suministra en 100 ml o 200 ml)", tiempo: "30 a 120 minutos" },
  { antibiotico: "Meropenem", vehiculo: "Cloruro de Sodio 0.9% (SF)", volumen: "100 ml (Para dosis ≤ 2 g)", tiempo: "30 minutos (Infusión Intermitente) o 3 horas (Infusión Prolongada)" },
  { antibiotico: "Metronidazol", vehiculo: "No requiere dilución adicional (Suministro en bolsa)", volumen: "100 ml", tiempo: "30 a 60 minutos" },
  { antibiotico: "Oxacilina", vehiculo: "Cloruro de Sodio 0.9% (SF) o Dextrosa 5% (SG5%)", volumen: "100 ml", tiempo: "30 a 60 minutos" },
  { antibiotico: "Penicilina Cristalina", vehiculo: "Cloruro de Sodio 0.9% (SF) o Dextrosa 5% (SG5%)", volumen: "100 ml", tiempo: "30 a 60 minutos" },
  { antibiotico: "Vancomicina", vehiculo: "Cloruro de Sodio 0.9% (SF) o Dextrosa 5% (SG5%)", volumen: "250 ml (Volumen solicitado)", tiempo: "No menos de 60 minutos (Para dosis ≤ 1 g)" },
];

export const EXCLUDED_FROM_ROUTES = [
    "PALMA MERIÑO SANDRA MILENA",
    "CHONG OTERO LINS LORING",
    "TUTALCHA TRUJILLO ANGIE LORENA",
    "CERINZA GOMEZ ANNY LUCERO",
    "PERDOMO BOHORQUEZ PAULA ANDREA",
    "GOMEZ OCHOA LEIDY JOHANNA"
];

// Mapping of services to specific roles for "Constants based PDF" requirement
export const SERVICE_ROLE_MAPPING: Record<string, string[]> = {
    "ATENCION (VISITA) DOMICILIARIA, POR TRABAJO SOCIAL": ["TRABAJADOR (A) SOCIAL DOMICILIARIO"],
    "ATENCION (VISITA) DOMICILIARIA, POR MEDICINA GENERAL": ["MEDICO DOMICILIARIO"],
    "CAMBIO CATETER URINARIO EN DOMICILIO": ["AUXILIAR DE ENFERMERIA PAD", "AUXILIAR DE ENFERMERIA PAD (N)"],
    "ATENCION (VISITA) DOMICILIARIA, POR NUTRICION Y DIETETICA": ["NUTRICIONISTA"],
    "CURACION MAYOR EN CASA POR ENFERMERIA": ["AUXILIAR DE ENFERMERIA PAD", "AUXILIAR DE ENFERMERIA PAD (N)"],
    "ATENCION (VISITA) DOMICILIARIA, POR FONIATRIA Y FONOAUDIOLOGIA": ["FONOAUDIOLOGO (A) PAD"],
    "ATENCION (VISITA) DOMICILIARIA, POR FISIOTERAPIA": ["FISIOTERAPEUTA PAD"],
    "ATENCION (VISITA) DOMICILIARIA, POR TERAPIA OCUPACIONAL": ["TERAPEUTA OCUPACIONAL PAD"],
    "ATENCION (VISITA) DOMICILIARIA, POR TERAPIA RESPIRATORIA": ["FISIOTERAPEUTA PAD"],
    "ATENCION MEDICA DOMICILIARIA CONDUCTA INTERNA": ["MEDICO DOMICILIARIO"],
    "TOMA DE MUESTRA EN DOMICILIO": ["AUXILIAR DE ENFERMERIA PAD", "AUXILIAR DE ENFERMERIA PAD (N)"],
    "APLICACION MEDICAMENTO (1 DOSIS DIA)": ["AUXILIAR DE ENFERMERIA PAD", "AUXILIAR DE ENFERMERIA PAD (N)"],
    "APLICACION MEDICAMENTO DOS DOSIS DIA DOMICILIARIO": ["AUXILIAR DE ENFERMERIA PAD", "AUXILIAR DE ENFERMERIA PAD (N)"],
    "APLICACION MEDICAMENTO TRES DOSIS DIA DOMICILIARIO": ["AUXILIAR DE ENFERMERIA PAD", "AUXILIAR DE ENFERMERIA PAD (N)"],
    "CONSULTA DE INGRESO AL PROGRAMA DOMICILIARIO": ["MEDICO DOMICILIARIO"],
    "ATENCION MEDICA DOMICILIARIA CUIDADOS PALIATIVOS": ["MEDICO DOMICILIARIO"],
    "ATENCION VISITA DOMICILIARIA CUIDADOS PALIATIVOS POR TRABAJO SOCIAL": ["TRABAJADOR (A) SOCIAL DOMICILIARIO"],
    "ATENCION VISITA DOMICILIARIA CUIDADOS PALIATIVOS POR PSICOLOGIA": ["PSICOLOGO (A) CLINICO"],
    "ATENCION MEDICA DOMICILIARIA CUIDADOS PALIATIVOS INGRESO": ["MEDICO DOMICILIARIO"],
    "ATENCION (VISITA) DOMICILIARIA, POR ENFERMERIA": ["ENFERMERO(A) JEFE PAD ADMINISTRATIVO"],
    "INYECCION O INFUSION DE OTRA SUSTANCIA TERAPEUTICA O PROFILACTICA (4 DOSIS DIA)": ["AUXILIAR DE ENFERMERIA PAD", "AUXILIAR DE ENFERMERIA PAD (N)"]
};

export const AUDIFARMA_EMAILS = [
    "santaemilianabog@audifarma.com.co",
    "plazaurgbog@audifarma.com.co",
    "dtcentralmezclasbog@audifarma.com.co",
    "dtcentralmezclasbog@gmail.com"
];

export const Icons = {
    User: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>,
    Users: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    Lock: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>,
    Logout: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
    Plus: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>,
    Home: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    Calendar: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    Clipboard: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
    Profile: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    Map: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>,
    Route: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>,
    ClipboardCheck: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
}

/**
 * Calculates the age based on a date of birth string.
 * Handles invalid date formats gracefully.
 * @param dobString - The date of birth string (e.g., "YYYY-MM-DD").
 * @returns The calculated age as a number. Returns 0 if the date is invalid.
 */
export const calculateAge = (dobString: string): number => {
    if (!dobString) {
        return 0;
    }

    // Using UTC date to avoid timezone issues where the date might be off by one day.
    const birthDate = new Date(dobString + 'T00:00:00');
    if (isNaN(birthDate.getTime())) {
        console.warn(`Invalid date of birth provided for age calculation: "${dobString}"`);
        return 0;
    }

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return Math.max(0, age);
};