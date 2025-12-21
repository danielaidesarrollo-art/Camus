"""
Configuración global del Sistema Integral de Manejo de Urgencias
"""
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# ============================================================================
# CONFIGURACIÓN DE API
# ============================================================================

# Gemini API (actual)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = "gemini-1.5-pro"  # Modelo recomendado para razonamiento médico

# Vertex AI (para migración futura)
USE_VERTEX_AI = os.getenv("USE_VERTEX_AI", "false").lower() == "true"
GCP_PROJECT_ID = os.getenv("GCP_PROJECT_ID", "")
GCP_LOCATION = os.getenv("GCP_LOCATION", "us-central1")
VERTEX_AI_MODEL = "medgemma-1.0"  # Modelo Med-Gemma en Vertex AI

# Weather API
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY", "")
WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/forecast"

# ============================================================================
# CONFIGURACIÓN DE TRIAGE
# ============================================================================

# Niveles de triage y sus pesos en minutos por paciente
TRIAGE_LEVELS = {
    "01": {
        "nombre": "Emergencia",
        "color": "#FF0000",
        "tiempo_atencion_min": 60,
        "descripcion": "Atención inmediata - Riesgo vital"
    },
    "02": {
        "nombre": "Urgencia",
        "color": "#FF6B00",
        "tiempo_atencion_min": 60,
        "descripcion": "Atención prioritaria - Riesgo alto"
    },
    "03": {
        "nombre": "Prioridad Media",
        "color": "#FFD700",
        "tiempo_atencion_min": 20,
        "descripcion": "Atención estándar"
    },
    "07": {
        "nombre": "Riesgo Coronario/DM",
        "color": "#FFA500",
        "tiempo_atencion_min": 20,
        "descripcion": "Atención especializada - Factores de riesgo"
    }
}

# Signos de alarma obligatorios a detectar
SIGNOS_ALARMA = [
    "palidez",
    "diaforesis",
    "náuseas",
    "nauseas",  # Variante sin tilde
    "vómito",
    "vomito",  # Variante sin tilde
    "epigastralgia",
    "disnea"
]

# ============================================================================
# CONFIGURACIÓN DE PROTOCOLOS
# ============================================================================

# Columnas esperadas en el Excel de protocolos
PROTOCOL_COLUMNS = {
    "pregunta": ["pregunta", "preguntas", "evaluacion", "evaluación"],
    "signos_alarma": ["signos_alarma", "signos de alarma", "alarma", "alarmas"],
    "criterio_triage": ["criterio", "criterios", "triage", "nivel"]
}

# ============================================================================
# CONFIGURACIÓN DE FORECASTING
# ============================================================================

# Parámetros del modelo Prophet
PROPHET_PARAMS = {
    "changepoint_prior_scale": 0.05,
    "seasonality_prior_scale": 10,
    "seasonality_mode": "multiplicative",
    "daily_seasonality": True,
    "weekly_seasonality": True,
    "yearly_seasonality": True
}

# Horizonte de predicción por defecto (días)
DEFAULT_FORECAST_HORIZON = 7

# Horas de trabajo por turno médico
HORAS_POR_TURNO = 8

# ============================================================================
# CONFIGURACIÓN DE LA APLICACIÓN
# ============================================================================

APP_TITLE = os.getenv("APP_TITLE", "Sistema Integral de Manejo de Urgencias")
MAX_UPLOAD_SIZE_MB = int(os.getenv("MAX_UPLOAD_SIZE_MB", "50"))

# Configuración de Streamlit
STREAMLIT_CONFIG = {
    "page_title": APP_TITLE,
    "page_icon": "🏥",
    "layout": "wide",
    "initial_sidebar_state": "expanded"
}

# ============================================================================
# PROMPTS PARA GEMINI
# ============================================================================

TRIAGE_SYSTEM_PROMPT = """Eres un asistente médico especializado en clasificación de triage para servicios de urgencias.

Tu tarea es analizar casos clínicos y asignar un nivel de triage basándote en:
1. Los protocolos médicos proporcionados
2. La detección de signos de alarma
3. La gravedad de los síntomas

NIVELES DE TRIAGE:
- 01 (Emergencia): Riesgo vital inmediato, requiere atención inmediata
- 02 (Urgencia): Condición grave que requiere atención prioritaria
- 07 (Riesgo Coronario/DM): Pacientes con factores de riesgo cardiovascular o diabetes
- 03 (Prioridad Media): Condiciones estables que pueden esperar

SIGNOS DE ALARMA CRÍTICOS:
- Palidez
- Diaforesis (sudoración profusa)
- Náuseas/Vómito
- Epigastralgia (dolor en epigastrio)
- Disnea (dificultad respiratoria)

INSTRUCCIONES:
1. Lee cuidadosamente el caso clínico
2. Identifica los signos de alarma presentes
3. Consulta el protocolo específico para el síntoma principal
4. Asigna el nivel de triage apropiado
5. Explica tu razonamiento de forma clara y concisa

FORMATO DE RESPUESTA:
Nivel de Triage: [01/02/03/07]
Signos de Alarma Detectados: [lista]
Razonamiento: [explicación médica detallada]
"""

def get_triage_prompt(caso_clinico: str, protocolo: dict, sintoma_principal: str) -> str:
    """
    Genera el prompt específico para clasificación de triage
    
    Args:
        caso_clinico: Descripción del caso del paciente
        protocolo: Diccionario con el protocolo médico relevante
        sintoma_principal: Síntoma principal (nombre de la pestaña del Excel)
    
    Returns:
        Prompt formateado para Gemini
    """
    return f"""{TRIAGE_SYSTEM_PROMPT}

PROTOCOLO APLICABLE: {sintoma_principal}
{protocolo.get('contenido', 'No disponible')}

CASO CLÍNICO:
{caso_clinico}

Por favor, clasifica este caso siguiendo el formato especificado.
"""

# ============================================================================
# VALIDACIÓN DE CONFIGURACIÓN
# ============================================================================

def validate_config() -> tuple[bool, list[str]]:
    """
    Valida que la configuración esté completa
    
    Returns:
        Tupla (es_valido, lista_de_errores)
    """
    errors = []
    
    if not GEMINI_API_KEY and not USE_VERTEX_AI:
        errors.append("GEMINI_API_KEY no está configurada")
    
    if USE_VERTEX_AI and not GCP_PROJECT_ID:
        errors.append("GCP_PROJECT_ID requerido para Vertex AI")
    
    return len(errors) == 0, errors
