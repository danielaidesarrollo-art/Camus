"""
Motor de IA para clasificación de triage usando Gemini API
Preparado para migración a Vertex AI / Med-Gemma
"""
import google.generativeai as genai
import streamlit as st
from typing import Dict, List, Tuple, Optional
import re
import config


class MedEngine:
    """Motor de IA para clasificación inteligente de triage"""
    
    def __init__(self):
        """Inicializa el motor de IA"""
        self.model = None
        self._initialize_model()
    
    def _initialize_model(self):
        """Inicializa el modelo de Gemini"""
        try:
            if config.USE_VERTEX_AI:
                # TODO: Implementar Vertex AI cuando se migre
                st.warning("Vertex AI no implementado aún. Usando Gemini API.")
                self._init_gemini()
            else:
                self._init_gemini()
        except Exception as e:
            st.error(f"Error al inicializar el modelo: {str(e)}")
    
    def _init_gemini(self):
        """Inicializa Gemini API"""
        if not config.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY no configurada")
        
        genai.configure(api_key=config.GEMINI_API_KEY)
        self.model = genai.GenerativeModel(config.GEMINI_MODEL)
    
    def classify_triage(
        self,
        caso_clinico: str,
        sintoma_principal: str,
        protocolo: Dict
    ) -> Dict:
        """
        Clasifica un caso clínico y asigna nivel de triage
        
        Args:
            caso_clinico: Descripción de síntomas y signos del paciente
            sintoma_principal: Síntoma principal (ej: "Dolor Torácico")
            protocolo: Diccionario con el protocolo médico relevante
        
        Returns:
            Diccionario con:
                - nivel_triage: str (01, 02, 03, 07)
                - signos_alarma: List[str]
                - razonamiento: str
                - confianza: float
        """
        try:
            # Detectar signos de alarma en el caso clínico
            signos_detectados = self.detect_alarm_signs(caso_clinico)
            
            # Generar prompt para Gemini
            prompt = config.get_triage_prompt(caso_clinico, protocolo, sintoma_principal)
            
            # Llamar al modelo
            response = self.model.generate_content(prompt)
            response_text = response.text
            
            # Parsear la respuesta
            nivel_triage = self._extract_triage_level(response_text)
            razonamiento = self._extract_reasoning(response_text)
            signos_en_respuesta = self._extract_alarm_signs_from_response(response_text)
            
            # Combinar signos detectados
            todos_signos = list(set(signos_detectados + signos_en_respuesta))
            
            # Calcular confianza basada en la presencia de signos de alarma
            confianza = self._calculate_confidence(nivel_triage, todos_signos, protocolo)
            
            return {
                "nivel_triage": nivel_triage,
                "signos_alarma": todos_signos,
                "razonamiento": razonamiento,
                "confianza": confianza,
                "respuesta_completa": response_text
            }
        
        except Exception as e:
            st.error(f"Error en clasificación de triage: {str(e)}")
            return {
                "nivel_triage": "03",  # Nivel por defecto en caso de error
                "signos_alarma": [],
                "razonamiento": f"Error en clasificación: {str(e)}",
                "confianza": 0.0,
                "respuesta_completa": ""
            }
    
    def detect_alarm_signs(self, texto: str) -> List[str]:
        """
        Detecta signos de alarma en el texto del caso clínico
        
        Args:
            texto: Texto a analizar
        
        Returns:
            Lista de signos de alarma detectados
        """
        texto_lower = texto.lower()
        signos_detectados = []
        
        for signo in config.SIGNOS_ALARMA:
            if signo.lower() in texto_lower:
                signos_detectados.append(signo.capitalize())
        
        return list(set(signos_detectados))  # Eliminar duplicados
    
    def _extract_triage_level(self, response_text: str) -> str:
        """
        Extrae el nivel de triage de la respuesta del modelo
        
        Args:
            response_text: Texto de respuesta del modelo
        
        Returns:
            Nivel de triage (01, 02, 03, 07)
        """
        # Buscar patrones como "Nivel de Triage: 01" o "Triage: 02"
        patterns = [
            r"Nivel de Triage:\s*(\d{2})",
            r"Triage:\s*(\d{2})",
            r"Nivel:\s*(\d{2})",
            r"\b(01|02|03|07)\b"
        ]
        
        for pattern in patterns:
            match = re.search(pattern, response_text, re.IGNORECASE)
            if match:
                nivel = match.group(1)
                if nivel in ["01", "02", "03", "07"]:
                    return nivel
        
        # Si no se encuentra, retornar nivel por defecto
        return "03"
    
    def _extract_reasoning(self, response_text: str) -> str:
        """
        Extrae el razonamiento médico de la respuesta
        
        Args:
            response_text: Texto de respuesta del modelo
        
        Returns:
            Razonamiento extraído
        """
        # Buscar sección de razonamiento
        patterns = [
            r"Razonamiento:\s*(.+?)(?:\n\n|\Z)",
            r"Explicación:\s*(.+?)(?:\n\n|\Z)",
            r"Justificación:\s*(.+?)(?:\n\n|\Z)"
        ]
        
        for pattern in patterns:
            match = re.search(pattern, response_text, re.IGNORECASE | re.DOTALL)
            if match:
                return match.group(1).strip()
        
        # Si no se encuentra sección específica, retornar todo el texto
        return response_text.strip()
    
    def _extract_alarm_signs_from_response(self, response_text: str) -> List[str]:
        """
        Extrae signos de alarma mencionados en la respuesta
        
        Args:
            response_text: Texto de respuesta del modelo
        
        Returns:
            Lista de signos de alarma
        """
        # Buscar sección de signos de alarma
        pattern = r"Signos de Alarma Detectados:\s*(.+?)(?:\n\n|\n[A-Z]|\Z)"
        match = re.search(pattern, response_text, re.IGNORECASE | re.DOTALL)
        
        if match:
            signos_text = match.group(1)
            # Extraer items de lista
            signos = re.findall(r"[-•]\s*(.+?)(?:\n|$)", signos_text)
            return [s.strip() for s in signos if s.strip()]
        
        return []
    
    def _calculate_confidence(
        self,
        nivel_triage: str,
        signos_alarma: List[str],
        protocolo: Dict
    ) -> float:
        """
        Calcula un score de confianza para la clasificación
        
        Args:
            nivel_triage: Nivel asignado
            signos_alarma: Signos detectados
            protocolo: Protocolo utilizado
        
        Returns:
            Score de confianza (0.0 - 1.0)
        """
        confianza = 0.5  # Base
        
        # Aumentar confianza si hay signos de alarma para niveles altos
        if nivel_triage in ["01", "02"] and len(signos_alarma) > 0:
            confianza += 0.3
        
        # Aumentar si hay múltiples signos de alarma
        if len(signos_alarma) >= 2:
            confianza += 0.1
        
        # Aumentar si el protocolo tiene información detallada
        if protocolo.get("criterios_triage"):
            confianza += 0.1
        
        return min(confianza, 1.0)  # Cap en 1.0
    
    def explain_triage_level(self, nivel: str) -> str:
        """
        Retorna explicación del nivel de triage
        
        Args:
            nivel: Código de nivel (01, 02, 03, 07)
        
        Returns:
            Descripción del nivel
        """
        if nivel in config.TRIAGE_LEVELS:
            info = config.TRIAGE_LEVELS[nivel]
            return f"{info['nombre']}: {info['descripcion']}"
        return "Nivel desconocido"
    
    def batch_classify(
        self,
        casos: List[Dict]
    ) -> List[Dict]:
        """
        Clasifica múltiples casos en batch
        
        Args:
            casos: Lista de diccionarios con {caso_clinico, sintoma_principal, protocolo}
        
        Returns:
            Lista de resultados de clasificación
        """
        resultados = []
        for caso in casos:
            resultado = self.classify_triage(
                caso["caso_clinico"],
                caso["sintoma_principal"],
                caso["protocolo"]
            )
            resultados.append(resultado)
        
        return resultados


@st.cache_resource
def get_med_engine() -> MedEngine:
    """
    Retorna instancia cacheada del motor de IA
    
    Returns:
        Instancia de MedEngine
    """
    return MedEngine()
