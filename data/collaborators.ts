
import { User } from '../types.ts';

export const initialCollaborators: User[] = [
  // --- Jefes y Administrativos ---
  { documento: '79965441', nombre: 'ROA BOHORQUEZ JOHAN DARIO', cargo: 'JEFE MEDICO', correo: 'johanrb@virreysolisips.com.co', password: 'password123' },
  { documento: '1016091786', nombre: 'GARCIA ARDILA WENDY VANESSA', cargo: 'APRENDIZ EN ETAPA PRACTICA', correo: 'wendygar.1216@gmail.com', password: 'password123' },
  { documento: '1027523406', nombre: 'BARAHONA DIAZ YURLEY VALENTINA', cargo: 'APRENDIZ EN ETAPA PRACTICA', correo: 'daniimatii07@gmail.com', password: 'password123' },
  { documento: '1024566399', nombre: 'GUZMAN NARVAEZ LUISA FERNANDA', cargo: 'AUXILIAR DE SERVICIO AL CLIENTE PAD', correo: 'luisagn@virreysolisips.com.co', password: 'password123' },
  { documento: '1020822073', nombre: 'CASTIBLANCO BOTACHE ANDRES EDUARDO', cargo: 'AUXILIAR ADMINISTRATIVO PAD', correo: 'andresec@virreysolisips.com.co', password: 'password123' },
  { documento: '1022400494', nombre: 'QUICENO PULGARIN PAULA ANDREA', cargo: 'AUXILIAR ADMINISTRATIVO PAD', correo: 'paulaqp@virreysolisips.com.co', password: 'password123' },
  { documento: '52838889', nombre: 'GAVIRIA CASTRO ANA MILENA', cargo: 'AUXILIAR ADMINISTRATIVO PAD', correo: 'anagc@virreysolisips.com.co', password: 'password123' },
  { documento: '52368796', nombre: 'ZAMBRANO MORENO DIANA ELIAN', cargo: 'COORDINADOR (A) OPERATIVO(A) PAD', correo: 'dianazm@virreysolisips.com.co', password: 'password123' },
  
  // --- Auxiliares de Enfermería (Turno Diurno / Rotativo) ---
  { documento: '1011200232', nombre: 'TRIANA PORRAS LEIDY LORENA', cargo: 'AUXILIAR DE ENFERMERIA PAD', correo: 'LeidyTP@Virreysolisips.com.co', password: 'password123', turnoInicio: '12:00', turnoFin: '18:00' },
  { documento: '1013587282', nombre: 'USECHE FRANCO SANDRA PATRICIA', cargo: 'AUXILIAR DE ENFERMERIA PAD', correo: 'sandrauf@virreysolisips.com.co', password: 'password123', turnoInicio: '12:00', turnoFin: '18:00' },
  { documento: '1019021881', nombre: 'COCA CALDERON WILSON', cargo: 'AUXILIAR DE ENFERMERIA PAD', correo: 'wilsoncc@virreysolisips.com.co', password: 'password123', turnoInicio: '07:00', turnoFin: '17:00' },
  { documento: '1022352471', nombre: 'HERRERA CORTES LEONARDO', cargo: 'AUXILIAR DE ENFERMERIA PAD', correo: 'leonardohc@virreysolisips.com.co', password: 'password123', turnoInicio: '12:00', turnoFin: '17:00' },
  { documento: '1022429796', nombre: 'ZAMORA PACANCHIQUE KAREN JOHANNA', cargo: 'AUXILIAR DE ENFERMERIA PAD', correo: 'karenzp@virreysolisips.com.co', password: 'password123', turnoInicio: '06:00', turnoFin: '12:00' },
  { documento: '1023933999', nombre: 'MESA DORADO JHON SEBASTIAN', cargo: 'AUXILIAR DE ENFERMERIA PAD', correo: 'jhonmd@virreysolisips.com.co', password: 'password123', turnoInicio: '12:00', turnoFin: '18:00' },
  { documento: '1024511302', nombre: 'MOTTA BUSTOS JOHAN ALEXANDER', cargo: 'AUXILIAR DE ENFERMERIA PAD', correo: 'johanmb@virreysolisips.com.co', password: 'password123', turnoInicio: '06:00', turnoFin: '12:00' },
  { documento: '1056410419', nombre: 'RODRIGUEZ DELGADILLO BETY NOELIA', cargo: 'AUXILIAR DE ENFERMERIA PAD', correo: 'betyrd@virreysolisips.com.co', password: 'password123', turnoInicio: '12:00', turnoFin: '18:00' },
  { documento: '1096618422', nombre: 'CHAVARRO JOSE DAVID', cargo: 'AUXILIAR DE ENFERMERIA PAD', correo: 'josec@virreysolisips.com.co', password: 'password123', turnoInicio: '06:00', turnoFin: '12:00' },
  { documento: '1118071320', nombre: 'SUSUNAGA RAMON BEYANIRA', cargo: 'AUXILIAR DE ENFERMERIA PAD', correo: 'beyanirasr@virreysolisips.com.co', password: 'password123', turnoInicio: '07:00', turnoFin: '17:00' },
  { documento: '11229348', nombre: 'USECHE RUBIANO JHON CARLOS', cargo: 'AUXILIAR DE ENFERMERIA PAD', correo: 'jhonur@virreysolisips.com.co', password: 'password123', turnoInicio: '07:00', turnoFin: '17:00' },
  { documento: '1234645328', nombre: 'RODRIGUEZ RUBIANO RAPHAEL STIVEN', cargo: 'AUXILIAR DE ENFERMERIA PAD', correo: 'raphaelrr@virreysolisips.com.co', password: 'password123', turnoInicio: '06:00', turnoFin: '12:00' },
  { documento: '20750249', nombre: 'SANTANA ZAMUDIO GHIMEL ANDREA', cargo: 'AUXILIAR DE ENFERMERIA PAD', correo: 'ghimelsz@virreysolisips.com.co', password: 'password123', turnoInicio: '06:00', turnoFin: '12:00' },
  { documento: '28870024', nombre: 'MADRIGAL GUZMAN SANDRA PAOLA', cargo: 'AUXILIAR DE ENFERMERIA PAD', correo: 'GuzmanSP@VirreySolisIps.com.co', password: 'password123', turnoInicio: '06:00', turnoFin: '12:00' },
  { documento: '39576417', nombre: 'GIRALDO JIMENEZ SANDRA PATRICIA', cargo: 'AUXILIAR DE ENFERMERIA PAD', correo: 'sandragj@virreysolisips.com.co', password: 'password123', turnoInicio: '06:00', turnoFin: '12:00' },
  { documento: '52763297', nombre: 'TRUJILLO BEDOYA LUZ MARY', cargo: 'AUXILIAR DE ENFERMERIA PAD', correo: 'luztb@virreysolisips.com.co', password: 'password123', turnoInicio: '06:00', turnoFin: '12:00' },
  { documento: '80054435', nombre: 'NIÑO GALINDO CARLOS ANDRES', cargo: 'AUXILIAR DE ENFERMERIA PAD', correo: 'carlosng@virreysolisips.com.co', password: 'password123', turnoInicio: '12:00', turnoFin: '18:00' },
  { documento: '98597880', nombre: 'ARTEAGA VERTEL ROBERT FERNANDO', cargo: 'AUXILIAR DE ENFERMERIA PAD', correo: 'robertav@virreysolisips.com.co', password: 'password123', turnoInicio: '07:00', turnoFin: '17:00' },

  // --- Auxiliares de Enfermería (Turno Noche: 19:00 - 04:00) ---
  { documento: '1000020934', nombre: 'RAMIREZ QUIROGA ERIKA NATALIA', cargo: 'AUXILIAR DE ENFERMERIA PAD (N)', correo: 'erikarq@virreysolisips.com.co', password: 'password123', turnoInicio: '19:00', turnoFin: '04:00' },
  { documento: '1007702701', nombre: 'MORENO MOGOLLON JHOAN ANDRES', cargo: 'AUXILIAR DE ENFERMERIA PAD (N)', correo: 'JhoanJAM@VirreySolisIps.com.co', password: 'password123', turnoInicio: '19:00', turnoFin: '04:00' },
  { documento: '1012423124', nombre: 'RAMIREZ MADRIGAL ELIANA YICELA', cargo: 'AUXILIAR DE ENFERMERIA PAD (N)', correo: 'elianarm@virreysolisips.com.co', password: 'password123', turnoInicio: '19:00', turnoFin: '04:00' },
  { documento: '1018465178', nombre: 'ARIAS CAMARGO EDISON CAMILO', cargo: 'AUXILIAR DE ENFERMERIA PAD (N)', correo: 'edisonac@virreysolisips.com.co', password: 'password123', turnoInicio: '19:00', turnoFin: '04:00' },
  { documento: '1022932535', nombre: 'YAGUARA TAPIA LEANDRO', cargo: 'AUXILIAR DE ENFERMERIA PAD (N)', correo: 'leandroyat@virreysolisips.com.co', password: 'password123', turnoInicio: '19:00', turnoFin: '04:00' },
  { documento: '1022939408', nombre: 'ROJAS CASTRO JESUS ALVARO', cargo: 'AUXILIAR DE ENFERMERIA PAD (N)', correo: 'jesusarc@virreysolisips.com.co', password: 'password123', turnoInicio: '19:00', turnoFin: '04:00' },
  { documento: '1023896251', nombre: 'HERRERA MOSQUERA BREGMAN ANDRES', cargo: 'AUXILIAR DE ENFERMERIA PAD (N)', correo: 'bregmanhm@virreysolisips.com.co', password: 'password123', turnoInicio: '19:00', turnoFin: '04:00' },
  { documento: '1024488261', nombre: 'DIMATE VELASQUEZ WILSON GERMAN', cargo: 'AUXILIAR DE ENFERMERIA PAD (N)', correo: 'WilsonDV@VirreySolisIps.com.co', password: 'password123', turnoInicio: '19:00', turnoFin: '04:00' },
  { documento: '1024543934', nombre: 'MOLINA SANCHEZ JEANNIE MILADY', cargo: 'AUXILIAR DE ENFERMERIA PAD (N)', correo: 'jeanniems@virreysolisips.com.co', password: 'password123', turnoInicio: '19:00', turnoFin: '04:00' },
  { documento: '1024549373', nombre: 'DAZA GONZALEZ MAYRA LILIANA', cargo: 'AUXILIAR DE ENFERMERIA PAD (N)', correo: 'mayradg@virreysolisips.com.co', password: 'password123', turnoInicio: '19:00', turnoFin: '04:00' },
  { documento: '1030695055', nombre: 'BARAJAS PEDRAZA LINETTE YURANNY', cargo: 'AUXILIAR DE ENFERMERIA PAD (N)', correo: 'linettebp@virreysolisips.com.co', password: 'password123', turnoInicio: '19:00', turnoFin: '04:00' },
  { documento: '1090371713', nombre: 'GALVIS OLIVEROS JOSE AGUSTIN', cargo: 'AUXILIAR DE ENFERMERIA PAD (N)', correo: 'JoseGO@VirreySolisips.com.co', password: 'password123', turnoInicio: '19:00', turnoFin: '04:00' },
  { documento: '52756811', nombre: 'RODRIGUEZ SALINAS LEYDY YINED', cargo: 'AUXILIAR DE ENFERMERIA PAD (N)', correo: 'leydyrs@virreysolisips.com.co', password: 'password123', turnoInicio: '19:00', turnoFin: '04:00' },
  { documento: '74339900', nombre: 'SANABRIA PARRA JOHN JAIME', cargo: 'AUXILIAR DE ENFERMERIA PAD (N)', correo: 'johnsp@virreysolisips.com.co', password: 'password123', turnoInicio: '19:00', turnoFin: '04:00' },
  { documento: '80006315', nombre: 'FLOREZ ORJUELA RICARDO', cargo: 'AUXILIAR DE ENFERMERIA PAD (N)', correo: 'ricardofo@virreysolisips.com.co', password: 'password123', turnoInicio: '19:00', turnoFin: '04:00' },
  { documento: '80765083', nombre: 'MORIANO HERNANDO FERLEY', cargo: 'AUXILIAR DE ENFERMERIA PAD (N)', correo: 'ferleymh@virreysolisips.com.co', password: 'password123', turnoInicio: '19:00', turnoFin: '04:00' },
  
  // --- Enfermeras Jefe (Turnos Mixtos) ---
  { documento: '1010185024', nombre: 'GOMEZ OCHOA LEIDY JOHANNA', cargo: 'ENFERMERO(A) JEFE PAD', correo: 'LeidyG@Virreysolisips.com.co', password: 'password123' },
  { documento: '1233493891', nombre: 'PERDOMO BOHORQUEZ PAULA ANDREA', cargo: 'ENFERMERO(A) JEFE PAD', correo: 'PaulaBPA@VirreySolisIps.com.co', password: 'password123' },
  { documento: '1022425793', nombre: 'TUTALCHA TRUJILLO ANGIE LORENA', cargo: 'ENFERMERO(A) JEFE PAD ADMINISTRATIVO', correo: 'AngieTT@VirreySolisIps.com.co', password: 'password123' },
  { documento: '1033708555', nombre: 'CERINZA GOMEZ ANNY LUCERO', cargo: 'ENFERMERO(A) JEFE PAD ADMINISTRATIVO', correo: 'annycg@virreysolisips.com.co', password: 'password123' },
  { documento: '32786716', nombre: 'PALMA MERIÑO SANDRA MILENA', cargo: 'ENFERMERO(A) JEFE PAD ADMINISTRATIVO', correo: 'sandrapm@virreysolisips.com.co', password: 'password123' },
  { documento: '52096184', nombre: 'CHONG OTERO LINS LORING', cargo: 'ENFERMERO(A) JEFE PAD ADMINISTRATIVO', correo: 'LinsCO@VirreySolisIps.com.co', password: 'password123' },

  // --- Jefes PAD Administrativo (Turnos Mañana 07:00 - 13:00) ---
  { documento: '1000934888', nombre: 'CASTIBLANCO RENGIFO JOHNATHAN DAVID', cargo: 'ENFERMERO(A) JEFE PAD ADMINISTRATIVO', correo: 'JohnathanCR@VirreySolisIps.com.co', password: 'password123', turnoInicio: '07:00', turnoFin: '13:00' },
  { documento: '1003614184', nombre: 'CONTRERAS PEREZ MARY FERNANDA', cargo: 'ENFERMERO(A) JEFE PAD ADMINISTRATIVO', correo: 'MaryCP@VirreySolisIps.com.co', password: 'password123', turnoInicio: '07:00', turnoFin: '13:00' },
  { documento: '1020823621', nombre: 'ORTIZ CLAVIJO LAURA NATALIA', cargo: 'ENFERMERO(A) JEFE PAD ADMINISTRATIVO', correo: 'LauraOC@VirreySolisIps.com.co', password: 'password123', turnoInicio: '07:00', turnoFin: '13:00' },

  // --- Jefes PAD Administrativo (Turnos Tarde 13:00 - 19:00) ---
  { documento: '1088280145', nombre: 'RIOS GALVIS LAURA MARIA', cargo: 'ENFERMERO(A) JEFE PAD ADMINISTRATIVO', correo: 'LauraRG@VirreySolisIps.com.co', password: 'password123', turnoInicio: '13:00', turnoFin: '19:00' },
  { documento: '1123636258', nombre: 'ESCALONA BENT MELANIE MELISSA', cargo: 'ENFERMERO(A) JEFE PAD ADMINISTRATIVO', correo: 'MelanieEB@VirreySolisIps.com.co', password: 'password123', turnoInicio: '13:00', turnoFin: '19:00' },
  { documento: '52799975', nombre: 'CAÑAS CAÑAS DIANA MARIA', cargo: 'ENFERMERO(A) JEFE PAD ADMINISTRATIVO', correo: 'dianamcc@virreysolisips.com.co', password: 'password123', turnoInicio: '13:00', turnoFin: '19:00' },
  
  // --- Fisioterapeutas (Turno 7:00 - 17:00) ---
  { documento: '1012349083', nombre: 'MONROY CRUZ LEIDY JOHANNA', cargo: 'FISIOTERAPEUTA PAD', correo: 'leidymc@virreysolisips.com.co', password: 'password123', turnoInicio: '07:00', turnoFin: '17:00' },
  { documento: '1015421184', nombre: 'PARRA CRUZ KAREN LIZETH', cargo: 'FISIOTERAPEUTA PAD', correo: 'karenpc@virreysolisips.com.co', password: 'password123', turnoInicio: '07:00', turnoFin: '17:00' },
  { documento: '1018430192', nombre: 'ROMERO HERNADEZ OSCAR DAVID', cargo: 'FISIOTERAPEUTA PAD', correo: 'davidrh@virreysolisips.com.co', password: 'password123', turnoInicio: '07:00', turnoFin: '17:00' },
  { documento: '1018495309', nombre: 'SANABRIA ROBLES ANGIE TATIANA', cargo: 'FISIOTERAPEUTA PAD', correo: 'virreysolis.beneficios@medicallth.com', password: 'password123', turnoInicio: '07:00', turnoFin: '17:00' },
  { documento: '1022387204', nombre: 'RIAÑO RAMOS LILIANA MAGDALENA', cargo: 'FISIOTERAPEUTA PAD', correo: 'lilianarr@virreysolisips.com.co', password: 'password123', turnoInicio: '07:00', turnoFin: '17:00' },
  { documento: '1026559140', nombre: 'MATTA CARVAJAL JACQUELINE', cargo: 'FISIOTERAPEUTA PAD', correo: 'jacquelinemc@virreysolisips.com.co', password: 'password123', turnoInicio: '07:00', turnoFin: '17:00' },
  { documento: '1026590350', nombre: 'GUZMAN GUTIERREZ JACK WILLIAM', cargo: 'FISIOTERAPEUTA PAD', correo: 'jackgg@virreysolisips.com.co', password: 'password123', turnoInicio: '07:00', turnoFin: '17:00' },
  { documento: '1033710980', nombre: 'URREGO AVILES DIEGO ALEJANDRO', cargo: 'FISIOTERAPEUTA PAD', correo: 'diegoua@virreysolisips.com.co', password: 'password123', turnoInicio: '07:00', turnoFin: '17:00' },
  { documento: '1057591068', nombre: 'FIQUITIVA RODRIGUEZ ANDRES FELIPE', cargo: 'FISIOTERAPEUTA PAD', correo: 'AndresFR@virreysolisips.com.co', password: 'password123', turnoInicio: '07:00', turnoFin: '17:00' },
  { documento: '1073239366', nombre: 'PATIÑO ROMERO LAURA TERESA', cargo: 'FISIOTERAPEUTA PAD', correo: 'laurapr@virreysolisips.com.co', password: 'password123', turnoInicio: '07:00', turnoFin: '17:00' },
  { documento: '45498645', nombre: 'ZAMBRANO AGUILAR CLAUDIA ESTER', cargo: 'FISIOTERAPEUTA PAD', correo: 'claudiaza@virreysolisips.com.co', password: 'password123', turnoInicio: '07:00', turnoFin: '17:00' },
  { documento: '52469676', nombre: 'GONZALEZ RINCON GLORIA CECILIA', cargo: 'FISIOTERAPEUTA PAD', correo: 'gloriagr@virreysolisips.com.co', password: 'password123', turnoInicio: '07:00', turnoFin: '17:00' },
  { documento: '52527304', nombre: 'FONSECA ALVIS KAREN MARCELA', cargo: 'FISIOTERAPEUTA PAD', correo: 'karenfa@virreysolisips.com.co', password: 'password123', turnoInicio: '07:00', turnoFin: '17:00' },
  { documento: '53070775', nombre: 'ALARCON GOMEZ DENNYS ARLEDY', cargo: 'FISIOTERAPEUTA PAD', correo: 'dennysag@virreysolisips.com.co', password: 'password123', turnoInicio: '07:00', turnoFin: '17:00' },
  { documento: '80503553', nombre: 'COBA HERRERA EDGAR JOAQUIN', cargo: 'FISIOTERAPEUTA PAD', correo: 'edgarch@virreysolisips.com.co', password: 'password123', turnoInicio: '07:00', turnoFin: '17:00' },
  
  // --- Fonoaudiología (Turno 7:00 - 17:00) ---
  { documento: '1024583087', nombre: 'LOPEZ BERMUDEZ ANDREA CAROLINA', cargo: 'FONOAUDIOLOGO (A) PAD', correo: 'andrealb@virreysolisips.com.co', password: 'password123', turnoInicio: '07:00', turnoFin: '17:00' },
  { documento: '1030558739', nombre: 'ANZOLA REY INGRID CATHERINE', cargo: 'FONOAUDIOLOGO (A) PAD', correo: 'ingridar@virreysolisips.com.co', password: 'password123', turnoInicio: '07:00', turnoFin: '17:00' },
  { documento: '1143926308', nombre: 'MONTIEL BOLAÑOS LISBETH TATIANA', cargo: 'FONOAUDIOLOGO (A) PAD', correo: 'lisbethmb@virreysolisips.com.co', password: 'password123', turnoInicio: '07:00', turnoFin: '17:00' },
  { documento: '53039071', nombre: 'LEÓN PETEVI NIDIA AMANDA', cargo: 'FONOAUDIOLOGO (A) PAD', correo: 'nidialp@virreysolisips.com.co', password: 'password123', turnoInicio: '07:00', turnoFin: '17:00' },
  
  // --- MÉDICOS DOMICILIARIOS (Con Turnos) ---
  // Mañana: 7:00 - 13:00, Max Pacientes: 6
  { documento: '1015438244', nombre: 'ALFONSO VERGARA JULIETH KATHERINE', cargo: 'MEDICO DOMICILIARIO', correo: 'JuliethAV@Virreysolisips.com.co', password: 'password123', turnoInicio: '07:00', turnoFin: '13:00', maxPacientes: 6 },
  { documento: '1015480268', nombre: 'MONTAÑA URQUIJO SERGIO DAVID', cargo: 'MEDICO DOMICILIARIO', correo: 'sergiomu@virreysolisips.com.co', password: 'password123', turnoInicio: '07:00', turnoFin: '13:00', maxPacientes: 6 },
  { documento: '1016001200', nombre: 'VELASQUEZ SANTANA WILLIAM FERNANDO', cargo: 'MEDICO DOMICILIARIO', correo: 'williamvs@virreysolisips.com.co', password: 'password123', turnoInicio: '07:00', turnoFin: '13:00', maxPacientes: 6 },
  { documento: '1026302236', nombre: 'PACHECO MEZA PEDRO ANTONIO', cargo: 'MEDICO DOMICILIARIO', correo: 'pedroppm@virreysolisips.com.co', password: 'password123', turnoInicio: '07:00', turnoFin: '13:00', maxPacientes: 6 },
  { documento: '1032460348', nombre: 'VALENCIA BUITRAGO MARIA STEPHANIA', cargo: 'MEDICO DOMICILIARIO', correo: 'ValenciaMA@VirreySolisIps.com.co', password: 'password123', turnoInicio: '07:00', turnoFin: '13:00', maxPacientes: 6 },
  { documento: '1032477055', nombre: 'SANCHEZ ACOSTA CAROL VIVIAN', cargo: 'MEDICO DOMICILIARIO', correo: 'carolsa@virreysolisips.com.co', password: 'password123', turnoInicio: '07:00', turnoFin: '13:00', maxPacientes: 6 },
  { documento: '52815924', nombre: 'ACEVEDO GUTIERREZ GLORIA CATALINA', cargo: 'MEDICO DOMICILIARIO', correo: 'GloriaCA@VirreySolisIps.com.co', password: 'password123', turnoInicio: '07:00', turnoFin: '13:00', maxPacientes: 6 },
  { documento: '55229176', nombre: 'ROYERO BASTIDAS KARINA', cargo: 'MEDICO DOMICILIARIO', correo: 'karinarb@virreysolisips.com.co', password: 'password123', turnoInicio: '07:00', turnoFin: '13:00', maxPacientes: 6 },
  
  // Tarde: 13:00 - 19:00, Max Pacientes: 6
  { documento: '1018498543', nombre: 'RODRIGUEZ ROBLES ANDRES FELIPE', cargo: 'MEDICO DOMICILIARIO', correo: 'andresrr@virreysolisips.com.co', password: 'password123', turnoInicio: '13:00', turnoFin: '19:00', maxPacientes: 6 },
  { documento: '1018509660', nombre: 'TOSCANO MARIN LIZETH TATIANA', cargo: 'MEDICO DOMICILIARIO', correo: 'lizethtm@virreysolisips.com.co', password: 'password123', turnoInicio: '13:00', turnoFin: '19:00', maxPacientes: 6 },
  { documento: '1014235678', nombre: 'MENDEZ GUTIERREZ JULIANA', cargo: 'MEDICO DOMICILIARIO', correo: 'julianamg@virreysolisips.com.co', password: 'password123', turnoInicio: '13:00', turnoFin: '19:00', maxPacientes: 6 },
  { documento: '1026585042', nombre: 'RIAÑO ALARCON SULMA LILIAN', cargo: 'MEDICO DOMICILIARIO', correo: 'sulmara@virreysolisips.com.co', password: 'password123', turnoInicio: '13:00', turnoFin: '19:00', maxPacientes: 6 },
  { documento: '1030640058', nombre: 'FIGUEROA ACOSTA YEFERSSON CAMILO', cargo: 'MEDICO DOMICILIARIO', correo: 'yefersonfa@virreysolisips.com.co', password: 'password123', turnoInicio: '13:00', turnoFin: '19:00', maxPacientes: 6 },
  { documento: '1082749128', nombre: 'CASTILLO VILLOTA JHONN ERIK', cargo: 'MEDICO DOMICILIARIO', correo: 'jhonncv@virreysolisips.com.co', password: 'password123', turnoInicio: '13:00', turnoFin: '19:00', maxPacientes: 6 },
  { documento: '1083023258', nombre: 'ROJAS POLO MARIA CAROLINA', cargo: 'MEDICO DOMICILIARIO', correo: 'mariacrp@virreysolisips.com.co', password: 'password123', turnoInicio: '13:00', turnoFin: '19:00', maxPacientes: 6 },
  { documento: '1032498105', nombre: 'BENITEZ ROMAN ANGIE CAROLINA', cargo: 'MEDICO DOMICILIARIO', correo: 'angiecbr@virreysolisips.com.co', password: 'password123', turnoInicio: '13:00', turnoFin: '19:00', maxPacientes: 6 },

  // --- Otros (Turno 7:00 - 17:00) ---
  { documento: '1104016850', nombre: 'CORREA CRUZ DANNA JISSEL', cargo: 'NUTRICIONISTA', correo: 'dannacc@virreysolisips.com.co', password: 'password123', turnoInicio: '07:00', turnoFin: '17:00' },
  { documento: '1033723661', nombre: 'BRAVO TORRES GLADYS MARCELA', cargo: 'PSICOLOGO (A) CLINICO', correo: 'gladysbt@virreysolisips.com.co', password: 'password123', turnoInicio: '07:00', turnoFin: '17:00' },
  
  // --- Terapia Ocupacional (Turno 7:00 - 17:00) ---
  { documento: '1018477178', nombre: 'LOPEZ SARMIENTO DIEGO LEANDRO', cargo: 'TERAPEUTA OCUPACIONAL PAD', correo: 'DiegoLLS@Virreysolisips.com.co', password: 'password123', turnoInicio: '07:00', turnoFin: '17:00' },
  { documento: '1030665933', nombre: 'NIETO ALEMAN LAURA MELISA', cargo: 'TERAPEUTA OCUPACIONAL PAD', correo: 'laurana@virreysolisips.com.co', password: 'password123', turnoInicio: '07:00', turnoFin: '17:00' },
  { documento: '1032456613', nombre: 'REYES MOGOLLON LAURA ALEJANDRA', cargo: 'TERAPEUTA OCUPACIONAL PAD', correo: 'laurarem@virreysolisips.com.co', password: 'password123', turnoInicio: '07:00', turnoFin: '17:00' },
  { documento: '52661619', nombre: 'PULIDO CASTELLANOS ANA YINETH', cargo: 'TERAPEUTA OCUPACIONAL PAD', correo: 'yinethpc@virreysolisips.com.co', password: 'password123', turnoInicio: '07:00', turnoFin: '17:00' },
  
  // --- Trabajo Social (Turno 7:00 - 17:00) ---
  { documento: '1010125097', nombre: 'TELLEZ QUIROGA LAURA ALEJANDRA', cargo: 'TRABAJADOR (A) SOCIAL DOMICILIARIO', correo: 'lauratq@virreysolisips.com.co', password: 'password123', turnoInicio: '07:00', turnoFin: '17:00' },
  { documento: '1033690285', nombre: 'MENDEZ VANEGAS JENNIFFER', cargo: 'TRABAJADOR (A) SOCIAL DOMICILIARIO', correo: 'jennifermv@virreysolisips.com.co', password: 'password123', turnoInicio: '07:00', turnoFin: '17:00' },
  { documento: '1073693667', nombre: 'RODRIGUEZ BARRETO DANIEL', cargo: 'TRABAJADOR (A) SOCIAL DOMICILIARIO', correo: 'danielrb@virreysolisips.com.co', password: 'password123', turnoInicio: '07:00', turnoFin: '17:00' }
];
