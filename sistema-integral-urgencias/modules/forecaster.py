"""
Módulo de predicción de demanda usando series temporales
"""
import pandas as pd
import numpy as np
from prophet import Prophet
import streamlit as st
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
import config


class Forecaster:
    """Predictor de demanda de urgencias usando Prophet"""
    
    def __init__(self):
        self.model = None
        self.historical_data = None
        self.is_trained = False
    
    def load_historical_data(self, csv_file) -> pd.DataFrame:
        """
        Carga datos históricos desde CSV
        
        Args:
            csv_file: Archivo CSV con datos históricos
        
        Returns:
            DataFrame con datos procesados
        """
        try:
            df = pd.read_csv(csv_file)
            
            # Validar columnas requeridas
            required_cols = ["fecha_hora"]
            missing_cols = [col for col in required_cols if col not in df.columns]
            
            if missing_cols:
                st.error(f"Columnas faltantes en CSV: {missing_cols}")
                return pd.DataFrame()
            
            # Convertir fecha_hora a datetime
            df["fecha_hora"] = pd.to_datetime(df["fecha_hora"])
            
            # Agregar por día si hay múltiples registros por día
            df_daily = self._aggregate_daily(df)
            
            self.historical_data = df_daily
            return df_daily
        
        except Exception as e:
            st.error(f"Error al cargar datos históricos: {str(e)}")
            return pd.DataFrame()
    
    def _aggregate_daily(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Agrega datos por día
        
        Args:
            df: DataFrame con datos por consulta
        
        Returns:
            DataFrame agregado por día
        """
        df["fecha"] = df["fecha_hora"].dt.date
        
        # Agrupar por fecha
        daily = df.groupby("fecha").agg({
            "fecha_hora": "count",  # Total de pacientes
        }).rename(columns={"fecha_hora": "pacientes_total"})
        
        # Agregar conteos por nivel de triage si existe la columna
        if "triage_asignado" in df.columns:
            triage_counts = df.groupby(["fecha", "triage_asignado"]).size().unstack(fill_value=0)
            daily = daily.join(triage_counts, how="left")
        
        daily = daily.reset_index()
        daily["fecha"] = pd.to_datetime(daily["fecha"])
        
        return daily
    
    def add_external_features(
        self,
        df: pd.DataFrame,
        weather_data: Optional[pd.DataFrame] = None,
        events: Optional[pd.DataFrame] = None
    ) -> pd.DataFrame:
        """
        Agrega features externos (clima, eventos)
        
        Args:
            df: DataFrame base
            weather_data: DataFrame con datos de clima
            events: DataFrame con eventos masivos/epidemiológicos
        
        Returns:
            DataFrame con features adicionales
        """
        df = df.copy()
        
        # Agregar features temporales
        df["dia_semana"] = df["fecha"].dt.dayofweek
        df["mes"] = df["fecha"].dt.month
        df["es_fin_semana"] = df["dia_semana"].isin([5, 6]).astype(int)
        
        # Agregar datos de clima si están disponibles
        if weather_data is not None:
            df = df.merge(weather_data, on="fecha", how="left")
        
        # Agregar eventos si están disponibles
        if events is not None:
            df = df.merge(events, on="fecha", how="left")
            df["tiene_evento"] = df["evento_tipo"].notna().astype(int)
        
        return df
    
    def train(self, df: pd.DataFrame, target_col: str = "pacientes_total") -> bool:
        """
        Entrena el modelo Prophet
        
        Args:
            df: DataFrame con datos históricos
            target_col: Columna objetivo a predecir
        
        Returns:
            True si el entrenamiento fue exitoso
        """
        try:
            # Preparar datos para Prophet (requiere columnas 'ds' y 'y')
            prophet_df = pd.DataFrame({
                "ds": df["fecha"],
                "y": df[target_col]
            })
            
            # Crear y configurar modelo
            self.model = Prophet(**config.PROPHET_PARAMS)
            
            # Agregar regresores si hay features adicionales
            if "es_fin_semana" in df.columns:
                prophet_df["es_fin_semana"] = df["es_fin_semana"]
                self.model.add_regressor("es_fin_semana")
            
            if "tiene_evento" in df.columns:
                prophet_df["tiene_evento"] = df["tiene_evento"]
                self.model.add_regressor("tiene_evento")
            
            # Entrenar modelo
            self.model.fit(prophet_df)
            self.is_trained = True
            
            return True
        
        except Exception as e:
            st.error(f"Error al entrenar modelo: {str(e)}")
            return False
    
    def predict(
        self,
        horizon_days: int = 7,
        future_events: Optional[pd.DataFrame] = None
    ) -> pd.DataFrame:
        """
        Genera predicciones
        
        Args:
            horizon_days: Días a predecir
            future_events: DataFrame con eventos futuros
        
        Returns:
            DataFrame con predicciones
        """
        if not self.is_trained:
            st.error("Modelo no entrenado. Llama a train() primero.")
            return pd.DataFrame()
        
        try:
            # Crear dataframe futuro
            future = self.model.make_future_dataframe(periods=horizon_days)
            
            # Agregar regresores para fechas futuras
            if future_events is not None:
                future = future.merge(future_events, left_on="ds", right_on="fecha", how="left")
                future["tiene_evento"] = future["evento_tipo"].notna().astype(int)
            else:
                future["tiene_evento"] = 0
            
            # Agregar feature de fin de semana
            future["es_fin_semana"] = future["ds"].dt.dayofweek.isin([5, 6]).astype(int)
            
            # Predecir
            forecast = self.model.predict(future)
            
            return forecast
        
        except Exception as e:
            st.error(f"Error al generar predicciones: {str(e)}")
            return pd.DataFrame()
    
    def calculate_staff_needs(
        self,
        forecast: pd.DataFrame,
        triage_distribution: Optional[Dict[str, float]] = None
    ) -> pd.DataFrame:
        """
        Calcula necesidades de personal médico
        
        Args:
            forecast: DataFrame con predicciones
            triage_distribution: Distribución porcentual por nivel de triage
                                Ej: {"01": 0.1, "02": 0.2, "03": 0.5, "07": 0.2}
        
        Returns:
            DataFrame con recomendaciones de personal
        """
        # Distribución por defecto si no se proporciona
        if triage_distribution is None:
            triage_distribution = {
                "01": 0.10,  # 10% emergencias
                "02": 0.20,  # 20% urgencias
                "03": 0.50,  # 50% prioridad media
                "07": 0.20   # 20% riesgo coronario/DM
            }
        
        # Calcular pacientes por nivel de triage
        forecast["pacientes_01_02"] = forecast["yhat"] * (
            triage_distribution.get("01", 0) + triage_distribution.get("02", 0)
        )
        forecast["pacientes_03_07"] = forecast["yhat"] * (
            triage_distribution.get("03", 0) + triage_distribution.get("07", 0)
        )
        
        # Calcular minutos totales necesarios
        forecast["minutos_necesarios"] = (
            forecast["pacientes_01_02"] * 60 +  # 60 min para 01/02
            forecast["pacientes_03_07"] * 20     # 20 min para 03/07
        )
        
        # Convertir a horas médico
        forecast["horas_medico"] = forecast["minutos_necesarios"] / 60
        
        # Calcular número de médicos (asumiendo turnos de 8 horas)
        forecast["medicos_necesarios"] = np.ceil(
            forecast["horas_medico"] / config.HORAS_POR_TURNO
        )
        
        return forecast
    
    def get_forecast_summary(self, forecast: pd.DataFrame, days: int = 7) -> Dict:
        """
        Genera resumen de predicciones
        
        Args:
            forecast: DataFrame con predicciones
            days: Número de días a resumir
        
        Returns:
            Diccionario con resumen
        """
        # Filtrar solo predicciones futuras
        future_forecast = forecast.tail(days)
        
        return {
            "promedio_pacientes_dia": future_forecast["yhat"].mean(),
            "max_pacientes_dia": future_forecast["yhat"].max(),
            "min_pacientes_dia": future_forecast["yhat"].min(),
            "total_pacientes_periodo": future_forecast["yhat"].sum(),
            "promedio_medicos_dia": future_forecast["medicos_necesarios"].mean() if "medicos_necesarios" in future_forecast.columns else 0,
            "max_medicos_dia": future_forecast["medicos_necesarios"].max() if "medicos_necesarios" in future_forecast.columns else 0,
            "fecha_mayor_demanda": future_forecast.loc[future_forecast["yhat"].idxmax(), "ds"] if len(future_forecast) > 0 else None
        }


def create_sample_historical_data(days: int = 365 * 5) -> pd.DataFrame:
    """
    Crea datos históricos sintéticos para demostración
    
    Args:
        days: Número de días de datos a generar
    
    Returns:
        DataFrame con datos sintéticos
    """
    np.random.seed(42)
    
    # Generar fechas
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    dates = pd.date_range(start=start_date, end=end_date, freq="D")
    
    # Generar volumen base con tendencia y estacionalidad
    trend = np.linspace(100, 150, len(dates))
    seasonal = 20 * np.sin(2 * np.pi * np.arange(len(dates)) / 365)
    weekly = 10 * np.sin(2 * np.pi * np.arange(len(dates)) / 7)
    noise = np.random.normal(0, 10, len(dates))
    
    volume = trend + seasonal + weekly + noise
    volume = np.maximum(volume, 50)  # Mínimo 50 pacientes/día
    
    # Crear DataFrame
    df = pd.DataFrame({
        "fecha": dates,
        "pacientes_total": volume.astype(int)
    })
    
    # Agregar distribución de triage
    df["01"] = (df["pacientes_total"] * 0.10).astype(int)
    df["02"] = (df["pacientes_total"] * 0.20).astype(int)
    df["03"] = (df["pacientes_total"] * 0.50).astype(int)
    df["07"] = (df["pacientes_total"] * 0.20).astype(int)
    
    return df


@st.cache_resource
def get_forecaster() -> Forecaster:
    """
    Retorna instancia cacheada del forecaster
    
    Returns:
        Instancia de Forecaster
    """
    return Forecaster()
