# Camus - Integración con Ecosistema Daniel_AI

## 🌐 Arquitectura del Ecosistema

Camus es parte del ecosistema Daniel_AI y se integra con los siguientes servicios:

```
┌─────────────────────────────────────────────────────────┐
│                  Daniel_AI Ecosystem                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐          │
│  │  SIRIUS  │───▶│  CAMUS   │◀───│   VEGA   │          │
│  │  (Auth)  │    │  (Home   │    │  (Data)  │          │
│  └──────────┘    │   Care)  │    └──────────┘          │
│                  └────┬─────┘                           │
│                       │                                  │
│                       ▼                                  │
│                  ┌──────────┐                           │
│                  │  ORION   │                           │
│                  │ (Triage) │                           │
│                  └──────────┘                           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 🔗 Servicios Integrados

### 1. **Sirius** - Authentication & Authorization Gateway
- **Propósito**: Autenticación centralizada y gestión de sesiones
- **Endpoints**:
  - `/auth/login` - Login con credenciales
  - `/auth/validate` - Validación de tokens
  - `/auth/biometric` - Autenticación biométrica
  - `/auth/register` - Registro de nuevos usuarios
- **Estado**: ✅ Configurado (Deshabilitado por defecto)
- **Características**:
  - Autenticación biométrica
  - Control de acceso basado en roles
  - Refresh de tokens automático

### 2. **Orion** - Triage & Clinical Decision Support
- **Propósito**: Análisis clínico con IA y soporte a decisiones
- **Endpoints**:
  - `/triage/assess` - Evaluación de triage
  - `/clinical/notes` - Notas clínicas
  - `/ai/analyze` - Análisis con IA
  - `/ai/recommendations` - Recomendaciones clínicas
- **Estado**: ✅ Configurado (Deshabilitado por defecto)
- **Características**:
  - Triage automatizado con IA
  - Análisis clínico inteligente
  - Evaluación de riesgos

### 3. **Vega** - Data Core & Analytics
- **Propósito**: Almacenamiento centralizado y analytics
- **Endpoints**:
  - `/data/patients` - Gestión de pacientes
  - `/data/handovers` - Entregas de turno
  - `/analytics/dashboard` - Dashboard de analytics
  - `/sync/bidirectional` - Sincronización bidireccional
- **Estado**: ✅ Configurado (Deshabilitado por defecto)
- **Características**:
  - Sincronización en tiempo real
  - Analytics y reportes
  - Data warehouse centralizado

### 4. **Phoenix** - Wound Care (Opcional)
- **Propósito**: Gestión especializada de heridas
- **Estado**: ⚠️ Integración opcional
- **Características**:
  - Evaluación de heridas
  - Análisis de imágenes
  - Seguimiento de cicatrización

## 🔐 SafeCore SDK

Camus utiliza el SafeCore SDK para garantizar comunicación segura y compliance con HIPAA:

```typescript
import { safeCore } from './utils/SafeCoreSDK';

// Autenticación con Sirius
const authResult = await safeCore.authenticateWithSirius(documento, password);

// Análisis clínico con Orion
const analysis = await safeCore.requestOrionAnalysis(clinicalData);

// Sincronización con Vega
const syncResult = await safeCore.syncWithVega(patientData);

// Health check del ecosistema
const health = safeCore.getHealthStatus();
```

## ⚙️ Configuración

### Variables de Entorno

Crear archivo `.env` con las siguientes variables:

```env
# Sirius - Authentication
VITE_SIRIUS_URL=https://sirius-api.daniel-ai.com

# Orion - Triage & AI
VITE_ORION_URL=https://orion-api.daniel-ai.com

# Vega - Data Core
VITE_VEGA_URL=https://vega-api.daniel-ai.com

# Phoenix - Wound Care (Opcional)
VITE_PHOENIX_URL=https://phoenix-api.daniel-ai.com
```

### Habilitar Servicios

Editar `config/ecosystem.ts` para habilitar/deshabilitar servicios:

```typescript
services: {
    sirius: {
        enabled: true,  // Cambiar a true para habilitar
        // ...
    },
    orion: {
        enabled: true,  // Cambiar a true para habilitar
        // ...
    },
    vega: {
        enabled: true,  // Cambiar a true para habilitar
        // ...
    }
}
```

## 📊 Estado Actual de Integración

| Servicio | Estado | Modo Actual | Próximos Pasos |
|----------|--------|-------------|----------------|
| **Sirius** | ✅ Configurado | LocalStorage | Habilitar auth remota |
| **Orion** | ✅ Configurado | Gemini local | Integrar API Orion |
| **Vega** | ✅ Configurado | LocalStorage | Habilitar sync remoto |
| **Phoenix** | ⚠️ Opcional | N/A | Evaluar necesidad |

## 🚀 Despliegue en Google Cloud

### Arquitectura Cloud

```
┌─────────────────────────────────────────┐
│         Google Cloud Platform            │
├─────────────────────────────────────────┤
│                                          │
│  ┌────────────┐      ┌────────────┐    │
│  │   Cloud    │─────▶│   Cloud    │    │
│  │   Build    │      │    Run     │    │
│  └────────────┘      └──────┬─────┘    │
│                             │           │
│                             ▼           │
│                      ┌────────────┐    │
│                      │  Camus App │    │
│                      │  (Container)│    │
│                      └────────────┘    │
│                                          │
└─────────────────────────────────────────┘
```

### Comando de Despliegue

```bash
# Build y deploy automático
gcloud builds submit --config=cloudbuild.yaml

# O manual
docker build -t gcr.io/PROJECT_ID/camus-frontend .
docker push gcr.io/PROJECT_ID/camus-frontend
gcloud run deploy camus-frontend \
  --image gcr.io/PROJECT_ID/camus-frontend \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated
```

## 🔍 Verificación de Integración

### 1. Verificar en Consola del Navegador

Al cargar la aplicación, deberías ver en la consola:

```
[SafeCore] Camus Station initialized
[SafeCore] Ecosystem Integration Status:
  - Sirius (Auth): ❌ Disabled
  - Orion (Triage): ❌ Disabled
  - Vega (Data): ❌ Disabled
  - Phoenix (Wounds): ❌ Disabled
```

### 2. Verificar Health Status

```typescript
import { safeCore } from './utils/SafeCoreSDK';

const health = safeCore.getHealthStatus();
console.log(health);
/*
{
  station: "Camus-01",
  compliance: "v2.0-HIPAA",
  services: {
    sirius: false,
    orion: false,
    vega: false,
    phoenix: false
  },
  timestamp: "2026-01-15T18:00:00.000Z"
}
*/
```

### 3. Headers de Compliance

Todas las peticiones al ecosistema incluyen:

```
X-DanielAI-Compliance: <base64-encoded-signature>
X-DanielAI-Station: Camus-01
X-DanielAI-Encryption: AES-256
X-DanielAI-Version: v1.0.0-PWA
Content-Type: application/json
```

## 📝 Próximos Pasos para Integración Completa

### Fase 1: Autenticación Centralizada (Sirius)
1. Configurar endpoints de Sirius en producción
2. Habilitar `sirius.enabled = true`
3. Migrar autenticación de localStorage a Sirius
4. Implementar refresh de tokens
5. Agregar autenticación biométrica

### Fase 2: Análisis Clínico (Orion)
1. Configurar endpoints de Orion
2. Habilitar `orion.enabled = true`
3. Integrar análisis de IA en HandoverForm
4. Implementar recomendaciones automáticas
5. Agregar evaluación de riesgos

### Fase 3: Sincronización de Datos (Vega)
1. Configurar endpoints de Vega
2. Habilitar `vega.enabled = true`
3. Implementar sync bidireccional
4. Configurar resolución de conflictos
5. Agregar analytics dashboard

### Fase 4: Monitoreo y Compliance
1. Implementar logging centralizado
2. Configurar alertas de seguridad
3. Auditoría de accesos
4. Reportes de compliance HIPAA
5. Métricas de performance

## 🛡️ Seguridad y Compliance

- **Encriptación**: AES-256 para datos en tránsito
- **Compliance**: HIPAA v2.0
- **Autenticación**: Multi-factor con Sirius
- **Auditoría**: Logs completos de todas las operaciones
- **Retención**: 90 días de datos históricos
- **PII/PHI**: Protección automática de datos sensibles

## 📞 Soporte

Para problemas de integración con el ecosistema:
- Revisar logs de SafeCore en consola
- Verificar configuración en `config/ecosystem.ts`
- Validar variables de entorno
- Contactar al equipo de Daniel_AI

---

**Versión**: v1.0.0-PWA  
**Última actualización**: 2026-01-15  
**Estación**: Camus-01  
**Ecosistema**: Daniel_AI
