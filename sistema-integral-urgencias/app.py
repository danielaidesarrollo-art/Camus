"""
Sistema Integral de Manejo de Urgencias
Aplicación principal Streamlit
"""
import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta

# Importar módulos locales
import config
from modules.protocol_loader import ProtocolLoader
from modules.med_engine import get_med_engine
from modules.forecaster import get_forecaster, create_sample_historical_data
from utils.helpers import (
    format_triage_badge,
    format_alarm_signs,
    export_to_csv,
    create_metric_card,
    show_success_message,
    show_error_message,
    show_info_message
)

# ============================================================================
# CONFIGURACIÓN DE LA PÁGINA
# ============================================================================

st.set_page_config(**config.STREAMLIT_CONFIG)

# Validar configuración
is_valid, errors = config.validate_config()
if not is_valid:
    st.error("⚠️ Configuración incompleta:")
    for error in errors:
        st.error(f"  - {error}")
    st.info("Por favor, configura el archivo .env con las credenciales necesarias")
    st.stop()

# ============================================================================
# ESTADO DE LA SESIÓN
# ============================================================================

if "protocols_loaded" not in st.session_state:
    st.session_state.protocols_loaded = False
    st.session_state.protocols = {}
    st.session_state.protocol_loader = ProtocolLoader()

if "historical_loaded" not in st.session_state:
    st.session_state.historical_loaded = False
    st.session_state.historical_data = None

if "forecaster" not in st.session_state:
    st.session_state.forecaster = get_forecaster()

if "med_engine" not in st.session_state:
    st.session_state.med_engine = get_med_engine()

# ============================================================================
# SIDEBAR - CARGA DE DATOS
# ============================================================================

st.sidebar.title("📁 Carga de Datos")

# Uploader de protocolos
st.sidebar.subheader("Protocolos Médicos")
protocol_file = st.sidebar.file_uploader(
    "Cargar Excel de Protocolos",
    type=["xlsx", "xls"],
    help="Excel con pestañas por síntoma (Dolor Torácico, Trauma, etc.)"
)

if protocol_file is not None:
    if not st.session_state.protocols_loaded:
        with st.spinner("Cargando protocolos..."):
            protocols = st.session_state.protocol_loader.load_from_excel(protocol_file)
            if protocols:
                st.session_state.protocols = protocols
                st.session_state.protocols_loaded = True
                show_success_message(f"Protocolos cargados: {len(protocols)} síntomas")

# Uploader de datos históricos
st.sidebar.subheader("Datos Históricos")
historical_file = st.sidebar.file_uploader(
    "Cargar CSV Histórico",
    type=["csv"],
    help="CSV con fecha_hora, triage_asignado, etc."
)

if historical_file is not None:
    if not st.session_state.historical_loaded:
        with st.spinner("Cargando datos históricos..."):
            df = st.session_state.forecaster.load_historical_data(historical_file)
            if not df.empty:
                st.session_state.historical_data = df
                st.session_state.historical_loaded = True
                show_success_message(f"Datos cargados: {len(df)} días")

# Opción para generar datos de demostración
if not st.session_state.historical_loaded:
    if st.sidebar.button("🎲 Generar Datos Demo"):
        with st.spinner("Generando datos sintéticos..."):
            demo_data = create_sample_historical_data(days=365*5)
            st.session_state.historical_data = demo_data
            st.session_state.historical_loaded = True
            show_success_message("Datos demo generados (5 años)")

# ============================================================================
# HEADER
# ============================================================================

st.title("🏥 Sistema Integral de Manejo de Urgencias")
st.markdown("**Clasificación inteligente de triage y predicción de demanda médica**")
st.divider()

# ============================================================================
# TABS PRINCIPALES
# ============================================================================

tab1, tab2, tab3, tab4 = st.tabs([
    "🩺 Simulación de Triage",
    "📊 Predicción de Demanda",
    "📋 Protocolos",
    "ℹ️ Información"
])

# ============================================================================
# TAB 1: SIMULACIÓN DE TRIAGE
# ============================================================================

with tab1:
    st.header("Simulación de Clasificación de Triage")
    
    if not st.session_state.protocols_loaded:
        show_info_message("Por favor, carga el archivo Excel de protocolos en el sidebar")
    else:
        col1, col2 = st.columns([2, 1])
        
        with col1:
            # Selector de síntoma principal
            sintomas_disponibles = st.session_state.protocol_loader.get_all_symptoms()
            sintoma_seleccionado = st.selectbox(
                "Síntoma Principal",
                sintomas_disponibles,
                help="Selecciona el síntoma principal del paciente"
            )
            
            # Área de texto para caso clínico
            caso_clinico = st.text_area(
                "Descripción del Caso Clínico",
                height=150,
                placeholder="Ejemplo: Paciente masculino de 55 años con dolor torácico opresivo de 30 minutos de evolución, presenta palidez, diaforesis profusa y náuseas...",
                help="Describe los síntomas, signos y contexto del paciente"
            )
            
            # Botón de clasificación
            if st.button("🔍 Clasificar Triage", type="primary", use_container_width=True):
                if not caso_clinico.strip():
                    show_error_message("Por favor, ingresa la descripción del caso clínico")
                else:
                    with st.spinner("Analizando caso con IA..."):
                        # Obtener protocolo
                        protocolo = st.session_state.protocol_loader.get_protocol(sintoma_seleccionado)
                        
                        # Clasificar
                        resultado = st.session_state.med_engine.classify_triage(
                            caso_clinico,
                            sintoma_seleccionado,
                            protocolo
                        )
                        
                        # Guardar en session state
                        st.session_state.ultimo_resultado = resultado
        
        with col2:
            # Mostrar protocolo relevante
            if sintoma_seleccionado:
                st.subheader("📋 Protocolo")
                protocolo = st.session_state.protocol_loader.get_protocol(sintoma_seleccionado)
                
                if protocolo:
                    with st.expander("Ver Protocolo Completo", expanded=False):
                        st.markdown(st.session_state.protocol_loader.get_protocol_summary(sintoma_seleccionado))
        
        # Mostrar resultados
        if "ultimo_resultado" in st.session_state:
            st.divider()
            st.subheader("📊 Resultado de Clasificación")
            
            resultado = st.session_state.ultimo_resultado
            nivel = resultado["nivel_triage"]
            
            # Badge de nivel de triage
            if nivel in config.TRIAGE_LEVELS:
                info = config.TRIAGE_LEVELS[nivel]
                st.markdown(
                    format_triage_badge(nivel, info["nombre"], info["color"]),
                    unsafe_allow_html=True
                )
            
            # Métricas
            col1, col2, col3 = st.columns(3)
            
            with col1:
                st.metric(
                    "Nivel de Triage",
                    nivel,
                    help="Nivel asignado por el sistema"
                )
            
            with col2:
                st.metric(
                    "Signos de Alarma",
                    len(resultado["signos_alarma"]),
                    help="Cantidad de signos de alarma detectados"
                )
            
            with col3:
                confianza_pct = f"{resultado['confianza']*100:.0f}%"
                st.metric(
                    "Confianza",
                    confianza_pct,
                    help="Nivel de confianza del sistema"
                )
            
            # Signos de alarma
            if resultado["signos_alarma"]:
                st.markdown(
                    format_alarm_signs(resultado["signos_alarma"]),
                    unsafe_allow_html=True
                )
            
            # Razonamiento médico
            st.subheader("🧠 Razonamiento del Sistema")
            st.info(resultado["razonamiento"])
            
            # Respuesta completa (expandible)
            with st.expander("Ver Respuesta Completa de la IA"):
                st.text(resultado["respuesta_completa"])

# ============================================================================
# TAB 2: PREDICCIÓN DE DEMANDA
# ============================================================================

with tab2:
    st.header("Predicción de Demanda y Personal")
    
    if not st.session_state.historical_loaded:
        show_info_message("Por favor, carga datos históricos o genera datos demo en el sidebar")
    else:
        # Configuración de predicción
        col1, col2 = st.columns(2)
        
        with col1:
            horizon_days = st.slider(
                "Días a Predecir",
                min_value=1,
                max_value=30,
                value=7,
                help="Horizonte de predicción"
            )
        
        with col2:
            st.subheader("Distribución de Triage")
            st.caption("Ajusta la distribución esperada de pacientes por nivel")
        
        # Distribución de triage
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            pct_01 = st.number_input("% Nivel 01", min_value=0, max_value=100, value=10) / 100
        with col2:
            pct_02 = st.number_input("% Nivel 02", min_value=0, max_value=100, value=20) / 100
        with col3:
            pct_03 = st.number_input("% Nivel 03", min_value=0, max_value=100, value=50) / 100
        with col4:
            pct_07 = st.number_input("% Nivel 07", min_value=0, max_value=100, value=20) / 100
        
        triage_dist = {
            "01": pct_01,
            "02": pct_02,
            "03": pct_03,
            "07": pct_07
        }
        
        # Eventos manuales
        st.subheader("📅 Eventos Especiales")
        with st.expander("Agregar Eventos Masivos o Picos Epidemiológicos"):
            evento_fecha = st.date_input("Fecha del Evento")
            evento_tipo = st.selectbox("Tipo", ["Evento Masivo", "Pico Epidemiológico", "Festivo"])
            evento_impacto = st.slider("Impacto Esperado (%)", 0, 200, 100)
            
            if st.button("Agregar Evento"):
                show_success_message(f"Evento agregado para {evento_fecha}")
        
        # Botón de predicción
        if st.button("🔮 Generar Predicción", type="primary", use_container_width=True):
            with st.spinner("Entrenando modelo y generando predicciones..."):
                # Entrenar modelo
                success = st.session_state.forecaster.train(
                    st.session_state.historical_data,
                    target_col="pacientes_total"
                )
                
                if success:
                    # Generar predicciones
                    forecast = st.session_state.forecaster.predict(horizon_days=horizon_days)
                    
                    # Calcular necesidades de personal
                    forecast_with_staff = st.session_state.forecaster.calculate_staff_needs(
                        forecast,
                        triage_dist
                    )
                    
                    # Guardar en session state
                    st.session_state.forecast = forecast_with_staff
                    show_success_message("Predicción generada exitosamente")
        
        # Mostrar resultados de predicción
        if "forecast" in st.session_state:
            st.divider()
            forecast = st.session_state.forecast
            
            # Filtrar solo predicciones futuras
            future_forecast = forecast.tail(horizon_days)
            
            # Resumen
            summary = st.session_state.forecaster.get_forecast_summary(forecast, horizon_days)
            
            st.subheader("📈 Resumen de Predicción")
            
            col1, col2, col3, col4 = st.columns(4)
            
            with col1:
                st.markdown(
                    create_metric_card(
                        "Promedio Pacientes/Día",
                        f"{summary['promedio_pacientes_dia']:.0f}",
                        color="#1f77b4"
                    ),
                    unsafe_allow_html=True
                )
            
            with col2:
                st.markdown(
                    create_metric_card(
                        "Día de Mayor Demanda",
                        f"{summary['max_pacientes_dia']:.0f}",
                        f"{summary['fecha_mayor_demanda'].strftime('%d/%m/%Y') if summary['fecha_mayor_demanda'] else 'N/A'}",
                        color="#ff7f0e"
                    ),
                    unsafe_allow_html=True
                )
            
            with col3:
                st.markdown(
                    create_metric_card(
                        "Promedio Médicos/Día",
                        f"{summary['promedio_medicos_dia']:.0f}",
                        color="#2ca02c"
                    ),
                    unsafe_allow_html=True
                )
            
            with col4:
                st.markdown(
                    create_metric_card(
                        "Máximo Médicos/Día",
                        f"{summary['max_medicos_dia']:.0f}",
                        color="#d62728"
                    ),
                    unsafe_allow_html=True
                )
            
            # Gráfico de predicción de pacientes
            st.subheader("📊 Predicción de Volumen de Pacientes")
            
            fig_patients = go.Figure()
            
            fig_patients.add_trace(go.Scatter(
                x=future_forecast["ds"],
                y=future_forecast["yhat"],
                mode="lines+markers",
                name="Predicción",
                line=dict(color="#1f77b4", width=2)
            ))
            
            fig_patients.add_trace(go.Scatter(
                x=future_forecast["ds"],
                y=future_forecast["yhat_upper"],
                mode="lines",
                name="Límite Superior",
                line=dict(width=0),
                showlegend=False
            ))
            
            fig_patients.add_trace(go.Scatter(
                x=future_forecast["ds"],
                y=future_forecast["yhat_lower"],
                mode="lines",
                name="Límite Inferior",
                line=dict(width=0),
                fillcolor="rgba(31, 119, 180, 0.2)",
                fill="tonexty",
                showlegend=False
            ))
            
            fig_patients.update_layout(
                title="Predicción de Pacientes por Día",
                xaxis_title="Fecha",
                yaxis_title="Número de Pacientes",
                hovermode="x unified"
            )
            
            st.plotly_chart(fig_patients, use_container_width=True)
            
            # Gráfico de necesidades de personal
            st.subheader("👨‍⚕️ Necesidades de Personal Médico")
            
            fig_staff = px.bar(
                future_forecast,
                x="ds",
                y="medicos_necesarios",
                title="Médicos Necesarios por Día",
                labels={"ds": "Fecha", "medicos_necesarios": "Médicos"},
                color="medicos_necesarios",
                color_continuous_scale="Reds"
            )
            
            st.plotly_chart(fig_staff, use_container_width=True)
            
            # Tabla detallada
            st.subheader("📋 Detalle Diario")
            
            tabla_detalle = future_forecast[["ds", "yhat", "medicos_necesarios"]].copy()
            tabla_detalle.columns = ["Fecha", "Pacientes Estimados", "Médicos Necesarios"]
            tabla_detalle["Fecha"] = tabla_detalle["Fecha"].dt.strftime("%d/%m/%Y")
            tabla_detalle["Pacientes Estimados"] = tabla_detalle["Pacientes Estimados"].round(0).astype(int)
            tabla_detalle["Médicos Necesarios"] = tabla_detalle["Médicos Necesarios"].astype(int)
            
            st.dataframe(tabla_detalle, use_container_width=True, hide_index=True)
            
            # Exportar
            export_to_csv(tabla_detalle, f"prediccion_demanda_{datetime.now().strftime('%Y%m%d')}.csv")

# ============================================================================
# TAB 3: PROTOCOLOS
# ============================================================================

with tab3:
    st.header("Protocolos Médicos Cargados")
    
    if not st.session_state.protocols_loaded:
        show_info_message("No hay protocolos cargados. Por favor, carga el archivo Excel en el sidebar")
    else:
        # Estadísticas
        stats = st.session_state.protocol_loader.get_stats()
        
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.metric("Total Protocolos", stats["total_protocolos"])
        with col2:
            st.metric("Total Preguntas", stats["total_preguntas"])
        with col3:
            st.metric("Total Signos de Alarma", stats["total_signos_alarma"])
        
        st.divider()
        
        # Selector de protocolo
        sintoma = st.selectbox(
            "Seleccionar Protocolo",
            stats["sintomas"]
        )
        
        if sintoma:
            st.markdown(st.session_state.protocol_loader.get_protocol_summary(sintoma))

# ============================================================================
# TAB 4: INFORMACIÓN
# ============================================================================

with tab4:
    st.header("Información del Sistema")
    
    st.markdown("""
    ### 🎯 Acerca de este Sistema
    
    El **Sistema Integral de Manejo de Urgencias** es una herramienta de apoyo a la decisión médica que combina:
    
    - **Inteligencia Artificial (Gemini)** para clasificación automática de triage
    - **Análisis de series temporales** para predicción de demanda
    - **Protocolos médicos estandarizados** para garantizar consistencia
    
    ### 📋 Niveles de Triage
    """)
    
    for nivel, info in config.TRIAGE_LEVELS.items():
        st.markdown(
            format_triage_badge(nivel, info["nombre"], info["color"]),
            unsafe_allow_html=True
        )
        st.markdown(f"**Descripción:** {info['descripcion']}")
        st.markdown(f"**Tiempo de atención:** {info['tiempo_atencion_min']} minutos por paciente")
        st.markdown("---")
    
    st.markdown("""
    ### 🛡️ Signos de Alarma
    
    El sistema detecta automáticamente los siguientes signos de alarma críticos:
    """)
    
    for signo in config.SIGNOS_ALARMA:
        st.markdown(f"- {signo.capitalize()}")
    
    st.markdown("""
    ### 🔄 Migración a Vertex AI
    
    Este sistema está diseñado para usar Gemini API en desarrollo, pero puede migrarse fácilmente a Vertex AI con Med-Gemma para despliegue en producción.
    
    Para migrar:
    1. Configura las credenciales de GCP en `.env`
    2. Activa `USE_VERTEX_AI=true`
    3. El sistema cambiará automáticamente al endpoint de Vertex AI
    
    ### 📞 Soporte
    
    Para soporte técnico o consultas, contacta al equipo de desarrollo.
    """)

# ============================================================================
# FOOTER
# ============================================================================

st.divider()
st.caption("Sistema Integral de Manejo de Urgencias v1.0 | Desarrollado con Streamlit y Gemini AI")
