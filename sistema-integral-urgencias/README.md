# Sistema Integral de Manejo de Urgencias

Sistema web desarrollado en Streamlit para la gestión predictiva de urgencias médicas, utilizando IA (Gemini/Med-Gemma) para clasificación inteligente de triage y predicción de demanda de personal médico.

## 🎯 Características Principales

- **Clasificación Inteligente de Triage**: Utiliza Gemini API (migrable a Vertex AI) para analizar casos clínicos y asignar niveles de triage basados en protocolos médicos
- **Gestión de Protocolos**: Carga y gestión de protocolos médicos desde Excel con pestañas por síntoma
- **Predicción de Demanda**: Forecasting de volumen de pacientes y cálculo de personal médico necesario
- **Integración de Datos Externos**: APIs de clima y eventos masivos para mejorar predicciones
- **Razonamiento Transparente**: Visualización del proceso de decisión de la IA para validación médica

## 📋 Niveles de Triage

- **01 - Emergencia**: Atención inmediata (60 min/médico)
- **02 - Urgencia**: Atención prioritaria (60 min/médico)
- **03 - Prioridad Media**: Atención estándar (20 min/médico)
- **07 - Riesgo Coronario/DM**: Atención especializada (20 min/médico)

## 🚀 Instalación

### Requisitos Previos

- Python 3.9 o superior
- Cuenta de Google Cloud con Gemini API habilitada
- API Key de Gemini

### Pasos de Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/sistema-integral-urgencias.git
cd sistema-integral-urgencias

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env y agregar tu GEMINI_API_KEY
```

### Configuración

1. Obtén tu API Key de Gemini desde [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crea el archivo `.env` con tu configuración:

```env
GEMINI_API_KEY=tu_api_key_aqui
WEATHER_API_KEY=tu_weather_api_key  # Opcional
```

## 📊 Uso

### Iniciar la Aplicación

```bash
streamlit run app.py
```

La aplicación estará disponible en `http://localhost:8501`

### Cargar Protocolos Médicos

1. En el sidebar, usa el uploader "Cargar Protocolos (Excel)"
2. Selecciona tu archivo Excel con protocolos
3. El sistema cargará automáticamente todas las pestañas

**Formato del Excel:**
- Cada pestaña = un síntoma clave (ej: "Dolor Torácico", "Trauma")
- Columnas requeridas: preguntas de evaluación, signos de alarma, criterios de triage

### Clasificar Triage

1. Ve a la pestaña "Simulación de Triage"
2. Selecciona el síntoma principal
3. Ingresa los síntomas del paciente
4. Haz clic en "Clasificar Triage"
5. Revisa el nivel asignado y el razonamiento de la IA

### Predicción de Demanda

1. Ve a la pestaña "Predicción de Demanda"
2. Carga el CSV de datos históricos
3. Configura eventos masivos o picos epidemiológicos
4. Genera el pronóstico
5. Visualiza la demanda predicha y recomendaciones de personal

## 📁 Estructura del Proyecto

```
sistema-integral-urgencias/
├── app.py                  # Aplicación principal Streamlit
├── config.py              # Configuración global
├── requirements.txt       # Dependencias Python
├── .env.example          # Template de variables de entorno
├── modules/
│   ├── protocol_loader.py    # Carga de protocolos Excel
│   ├── med_engine.py         # Motor de IA (Gemini/Vertex AI)
│   ├── forecaster.py         # Predicción de demanda
│   └── weather_api.py        # Integración API clima
├── utils/
│   └── helpers.py            # Funciones auxiliares
├── sample_data/
│   ├── protocols_template.xlsx
│   ├── historical_data_template.csv
│   └── events_template.csv
└── README.md
```

## 🔄 Migración a Vertex AI

Para despliegue masivo, el sistema está preparado para migrar de Gemini API a Vertex AI:

1. Actualiza `config.py` con credenciales de GCP
2. Modifica `med_engine.py` para usar `aiplatform` SDK
3. Configura el endpoint de Med-Gemma en Vertex AI

Ver documentación detallada en `/docs/vertex_ai_migration.md`

## 📈 Datos Históricos

El sistema espera un CSV con las siguientes columnas:

- `fecha_hora`: Timestamp de la consulta
- `tiempo_espera_triage`: Minutos hasta triage
- `triage_asignado`: Nivel (01, 02, 03, 07)
- `tiempo_espera_atencion`: Minutos hasta atención médica
- `tiempo_atencion`: Duración de la atención
- `direccionamiento`: Salida (remisión, observación, hospitalización, alta)

## 🛡️ Signos de Alarma

El sistema detecta automáticamente los siguientes signos de alarma:

- Palidez
- Diaforesis
- Náuseas
- Vómito
- Epigastralgia
- Disnea

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo `LICENSE` para detalles.

## 👥 Autores

- **Johan Dario Roa** - Desarrollo inicial

## 🙏 Agradecimientos

- Google Gemini API
- Comunidad de Streamlit
- Profesionales médicos que validaron los protocolos
