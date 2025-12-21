"""
Funciones auxiliares y utilidades
"""
import pandas as pd
import streamlit as st
from datetime import datetime
from typing import Dict, List


def format_triage_badge(nivel: str, nombre: str, color: str) -> str:
    """
    Genera HTML para badge de triage
    
    Args:
        nivel: Código de nivel
        nombre: Nombre del nivel
        color: Color hex
    
    Returns:
        HTML string
    """
    return f"""
    <div style="
        background-color: {color};
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        font-weight: bold;
        text-align: center;
        font-size: 18px;
        margin: 10px 0;
    ">
        Nivel {nivel} - {nombre}
    </div>
    """


def format_alarm_signs(signos: List[str]) -> str:
    """
    Formatea lista de signos de alarma
    
    Args:
        signos: Lista de signos detectados
    
    Returns:
        HTML string
    """
    if not signos:
        return "<p>No se detectaron signos de alarma</p>"
    
    items = "".join([f"<li>{signo}</li>" for signo in signos])
    return f"""
    <div style="
        background-color: #fff3cd;
        border-left: 4px solid #ffc107;
        padding: 15px;
        margin: 10px 0;
    ">
        <strong>⚠️ Signos de Alarma Detectados:</strong>
        <ul>
            {items}
        </ul>
    </div>
    """


def export_to_csv(df: pd.DataFrame, filename: str):
    """
    Exporta DataFrame a CSV descargable
    
    Args:
        df: DataFrame a exportar
        filename: Nombre del archivo
    """
    csv = df.to_csv(index=False)
    st.download_button(
        label="📥 Descargar CSV",
        data=csv,
        file_name=filename,
        mime="text/csv"
    )


def validate_date_range(start_date, end_date) -> bool:
    """
    Valida rango de fechas
    
    Args:
        start_date: Fecha inicial
        end_date: Fecha final
    
    Returns:
        True si es válido
    """
    if start_date > end_date:
        st.error("La fecha inicial debe ser anterior a la fecha final")
        return False
    return True


def format_number(num: float, decimals: int = 0) -> str:
    """
    Formatea número con separadores de miles
    
    Args:
        num: Número a formatear
        decimals: Decimales a mostrar
    
    Returns:
        String formateado
    """
    return f"{num:,.{decimals}f}".replace(",", ".")


def create_metric_card(title: str, value: str, delta: str = None, color: str = "#1f77b4") -> str:
    """
    Crea tarjeta de métrica HTML
    
    Args:
        title: Título de la métrica
        value: Valor principal
        delta: Cambio/delta (opcional)
        color: Color del borde
    
    Returns:
        HTML string
    """
    delta_html = f"<p style='color: #666; margin: 5px 0 0 0;'>{delta}</p>" if delta else ""
    
    return f"""
    <div style="
        border-left: 4px solid {color};
        padding: 15px;
        background-color: #f8f9fa;
        border-radius: 5px;
        margin: 10px 0;
    ">
        <h4 style="margin: 0 0 10px 0; color: #333;">{title}</h4>
        <p style="font-size: 24px; font-weight: bold; margin: 0; color: {color};">{value}</p>
        {delta_html}
    </div>
    """


def show_success_message(message: str):
    """Muestra mensaje de éxito"""
    st.success(f"✅ {message}")


def show_error_message(message: str):
    """Muestra mensaje de error"""
    st.error(f"❌ {message}")


def show_warning_message(message: str):
    """Muestra mensaje de advertencia"""
    st.warning(f"⚠️ {message}")


def show_info_message(message: str):
    """Muestra mensaje informativo"""
    st.info(f"ℹ️ {message}")
