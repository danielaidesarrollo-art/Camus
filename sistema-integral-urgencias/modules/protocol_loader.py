"""
Módulo para carga y gestión de protocolos médicos desde Excel
"""
import pandas as pd
import streamlit as st
from typing import Dict, List, Optional
import config


class ProtocolLoader:
    """Gestor de protocolos médicos desde archivos Excel"""
    
    def __init__(self):
        self.protocols = {}
        self.sheet_names = []
    
    def load_from_excel(self, excel_file) -> Dict[str, pd.DataFrame]:
        """
        Carga protocolos desde un archivo Excel con múltiples pestañas
        
        Args:
            excel_file: Archivo Excel cargado con st.file_uploader
        
        Returns:
            Diccionario con {nombre_pestaña: DataFrame}
        """
        try:
            # Leer todas las pestañas del Excel
            excel_data = pd.ExcelFile(excel_file)
            self.sheet_names = excel_data.sheet_names
            
            # Cargar cada pestaña como un protocolo
            for sheet_name in self.sheet_names:
                df = pd.read_excel(excel_file, sheet_name=sheet_name)
                self.protocols[sheet_name] = self._parse_protocol(sheet_name, df)
            
            return self.protocols
        
        except Exception as e:
            st.error(f"Error al cargar el archivo Excel: {str(e)}")
            return {}
    
    def _parse_protocol(self, sheet_name: str, df: pd.DataFrame) -> Dict:
        """
        Parsea una pestaña del Excel en un protocolo estructurado
        
        Args:
            sheet_name: Nombre de la pestaña (síntoma principal)
            df: DataFrame con el contenido de la pestaña
        
        Returns:
            Diccionario con el protocolo estructurado
        """
        protocol = {
            "sintoma": sheet_name,
            "preguntas": [],
            "signos_alarma": [],
            "criterios_triage": [],
            "contenido_completo": df.to_string()
        }
        
        # Intentar extraer columnas específicas si existen
        for col in df.columns:
            col_lower = col.lower().strip()
            
            # Detectar columna de preguntas
            if any(keyword in col_lower for keyword in config.PROTOCOL_COLUMNS["pregunta"]):
                protocol["preguntas"] = df[col].dropna().tolist()
            
            # Detectar columna de signos de alarma
            elif any(keyword in col_lower for keyword in config.PROTOCOL_COLUMNS["signos_alarma"]):
                protocol["signos_alarma"] = df[col].dropna().tolist()
            
            # Detectar columna de criterios de triage
            elif any(keyword in col_lower for keyword in config.PROTOCOL_COLUMNS["criterio_triage"]):
                protocol["criterios_triage"] = df[col].dropna().tolist()
        
        return protocol
    
    def get_protocol(self, sintoma: str) -> Optional[Dict]:
        """
        Obtiene un protocolo específico por nombre de síntoma
        
        Args:
            sintoma: Nombre del síntoma (debe coincidir con nombre de pestaña)
        
        Returns:
            Diccionario con el protocolo o None si no existe
        """
        return self.protocols.get(sintoma)
    
    def get_all_symptoms(self) -> List[str]:
        """
        Retorna lista de todos los síntomas disponibles
        
        Returns:
            Lista de nombres de síntomas
        """
        return list(self.protocols.keys())
    
    def search_protocols(self, query: str) -> List[Dict]:
        """
        Busca protocolos que contengan el término de búsqueda
        
        Args:
            query: Término a buscar
        
        Returns:
            Lista de protocolos que coinciden
        """
        query_lower = query.lower()
        results = []
        
        for sintoma, protocol in self.protocols.items():
            if query_lower in sintoma.lower():
                results.append(protocol)
            elif query_lower in protocol["contenido_completo"].lower():
                results.append(protocol)
        
        return results
    
    def get_protocol_summary(self, sintoma: str) -> str:
        """
        Genera un resumen legible del protocolo
        
        Args:
            sintoma: Nombre del síntoma
        
        Returns:
            String con resumen formateado
        """
        protocol = self.get_protocol(sintoma)
        if not protocol:
            return f"Protocolo '{sintoma}' no encontrado"
        
        summary = f"**Protocolo: {protocol['sintoma']}**\n\n"
        
        if protocol["preguntas"]:
            summary += "**Preguntas de Evaluación:**\n"
            for i, pregunta in enumerate(protocol["preguntas"], 1):
                summary += f"{i}. {pregunta}\n"
            summary += "\n"
        
        if protocol["signos_alarma"]:
            summary += "**Signos de Alarma:**\n"
            for signo in protocol["signos_alarma"]:
                summary += f"- {signo}\n"
            summary += "\n"
        
        if protocol["criterios_triage"]:
            summary += "**Criterios de Triage:**\n"
            for criterio in protocol["criterios_triage"]:
                summary += f"- {criterio}\n"
        
        return summary
    
    def export_to_dict(self) -> Dict:
        """
        Exporta todos los protocolos a un diccionario serializable
        
        Returns:
            Diccionario con todos los protocolos
        """
        return self.protocols
    
    def get_stats(self) -> Dict:
        """
        Obtiene estadísticas de los protocolos cargados
        
        Returns:
            Diccionario con estadísticas
        """
        return {
            "total_protocolos": len(self.protocols),
            "sintomas": self.get_all_symptoms(),
            "total_preguntas": sum(len(p["preguntas"]) for p in self.protocols.values()),
            "total_signos_alarma": sum(len(p["signos_alarma"]) for p in self.protocols.values())
        }


@st.cache_data
def load_protocols_cached(excel_file) -> Dict:
    """
    Versión cacheada de la carga de protocolos para Streamlit
    
    Args:
        excel_file: Archivo Excel
    
    Returns:
        Diccionario con protocolos
    """
    loader = ProtocolLoader()
    return loader.load_from_excel(excel_file)
