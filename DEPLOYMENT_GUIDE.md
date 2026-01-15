# 🚀 Guía de Despliegue a Producción - Camus

## 📋 Pasos para Build de Producción

### 1. Probar Build Localmente

Primero, verifica que el build de producción funcione en tu máquina:

```bash
# Instalar dependencias si no lo has hecho
npm install

# Crear build de producción
npm run build

# Probar el build localmente con preview
npm run preview
```

Si todo funciona correctamente, deberías ver la app en http://localhost:4173

### 2. Desplegar a Google Cloud Run (Producción)

#### Opción A: Despliegue Automático con Cloud Build

```bash
# Desde el directorio del proyecto
cd C:\Users\johan\.gemini\antigravity\scratch\Camus\src_camus

# Desplegar usando el archivo de producción
gcloud builds submit --config=cloudbuild.production.yaml
```

Este comando:
- ✅ Construye la imagen Docker con Nginx
- ✅ Crea un build optimizado de producción
- ✅ Sube la imagen a Container Registry
- ✅ Despliega automáticamente a Cloud Run
- ✅ Genera versiones con tags (SHA + latest)

#### Opción B: Despliegue Manual

```bash
# 1. Build de la imagen
docker build -f Dockerfile.production -t gcr.io/PROJECT_ID/camus-frontend:latest .

# 2. Push a Container Registry
docker push gcr.io/PROJECT_ID/camus-frontend:latest

# 3. Deploy a Cloud Run
gcloud run deploy camus-frontend \
  --image gcr.io/PROJECT_ID/camus-frontend:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1
```

### 3. Verificar Despliegue

```bash
# Obtener URL del servicio
gcloud run services describe camus-frontend --region=us-central1 --format="value(status.url)"

# Ver logs en tiempo real
gcloud run services logs tail camus-frontend --region=us-central1
```

---

## 🔄 Workflow de Desarrollo Continuo

### Sí, puedes seguir agregando funciones después del lanzamiento!

Aquí está el workflow recomendado:

### 1. **Desarrollo Local**
```bash
# Trabajar en localhost
npm run dev

# Hacer cambios y probar
# La app se recarga automáticamente
```

### 2. **Commit a Git**
```bash
# Agregar cambios
git add .

# Commit con mensaje descriptivo
git commit -m "feat: Nueva funcionalidad X"

# Push a GitHub
git push origin main
```

### 3. **Desplegar a Producción**
```bash
# Opción 1: Despliegue automático
gcloud builds submit --config=cloudbuild.production.yaml

# Opción 2: Solo si quieres probar el build primero
npm run build
npm run preview
# Si todo está bien, entonces deploy
```

---

## 🎯 Estrategia de Versionamiento

### Versiones Automáticas

El archivo `cloudbuild.production.yaml` crea automáticamente dos tags:

1. **`$SHORT_SHA`** - Hash único del commit (ej: `abc123f`)
2. **`latest`** - Siempre apunta a la última versión

Esto te permite:
- ✅ Rollback a versiones anteriores si algo falla
- ✅ Mantener historial de deployments
- ✅ Probar versiones específicas

### Rollback a Versión Anterior

```bash
# Ver todas las versiones
gcloud container images list-tags gcr.io/PROJECT_ID/camus-frontend

# Hacer rollback a una versión específica
gcloud run deploy camus-frontend \
  --image gcr.io/PROJECT_ID/camus-frontend:abc123f \
  --region us-central1
```

---

## 🔧 Configuración de Variables de Entorno

### Para Producción

Si necesitas variables de entorno en producción:

```bash
# Opción 1: Durante el deploy
gcloud run deploy camus-frontend \
  --image gcr.io/PROJECT_ID/camus-frontend:latest \
  --set-env-vars "VITE_SIRIUS_URL=https://sirius-api.daniel-ai.com,VITE_ORION_URL=https://orion-api.daniel-ai.com"

# Opción 2: Actualizar variables sin redesplegar
gcloud run services update camus-frontend \
  --update-env-vars "VITE_VEGA_URL=https://vega-api.daniel-ai.com" \
  --region us-central1
```

### Habilitar Servicios del Ecosistema

Para activar Sirius, Orion o Vega en producción:

1. Editar `config/ecosystem.ts`:
```typescript
services: {
    sirius: {
        enabled: true,  // Cambiar a true
        // ...
    }
}
```

2. Commit y deploy:
```bash
git add config/ecosystem.ts
git commit -m "feat: Enable Sirius integration"
git push origin main
gcloud builds submit --config=cloudbuild.production.yaml
```

---

## 📊 Monitoreo Post-Despliegue

### Ver Logs
```bash
# Logs en tiempo real
gcloud run services logs tail camus-frontend --region=us-central1

# Logs de las últimas 24 horas
gcloud run services logs read camus-frontend --region=us-central1 --limit=100
```

### Métricas
```bash
# Ver métricas del servicio
gcloud run services describe camus-frontend --region=us-central1
```

### Health Check
```bash
# Verificar que el servicio responde
curl https://camus-frontend-XXXXX.run.app/health
```

---

## 🚨 Troubleshooting

### Si el build falla

1. **Verificar localmente primero:**
```bash
npm run build
```

2. **Ver logs del build:**
```bash
gcloud builds list --limit=5
gcloud builds log BUILD_ID
```

3. **Probar Docker localmente:**
```bash
docker build -f Dockerfile.production -t camus-test .
docker run -p 8080:8080 camus-test
```

### Si la app no carga en Cloud Run

1. **Verificar logs:**
```bash
gcloud run services logs tail camus-frontend --region=us-central1
```

2. **Verificar que el puerto sea 8080**
3. **Verificar que Nginx esté sirviendo correctamente**

---

## 📝 Checklist de Despliegue

Antes de cada despliegue a producción:

- [ ] ✅ Código probado localmente (`npm run dev`)
- [ ] ✅ Build de producción exitoso (`npm run build`)
- [ ] ✅ Preview funciona correctamente (`npm run preview`)
- [ ] ✅ Commit a Git con mensaje descriptivo
- [ ] ✅ Push a GitHub
- [ ] ✅ Deploy a Cloud Run
- [ ] ✅ Verificar URL del servicio
- [ ] ✅ Probar funcionalidades críticas
- [ ] ✅ Verificar logs sin errores
- [ ] ✅ Confirmar que PWA se instala correctamente

---

## 🎉 Ventajas del Workflow

### ✅ Desarrollo Continuo
- Puedes seguir agregando features sin interrumpir producción
- Desarrollo local rápido con hot-reload
- Testing antes de desplegar

### ✅ Despliegues Seguros
- Versionamiento automático
- Rollback fácil si algo falla
- Build optimizado para producción

### ✅ Escalabilidad
- Cloud Run escala automáticamente
- Paga solo por uso
- Sin downtime durante deploys

### ✅ Monitoreo
- Logs centralizados
- Métricas en tiempo real
- Health checks automáticos

---

## 🚀 Comando Rápido para Deploy

Para despliegues rápidos después de hacer cambios:

```bash
# Todo en uno
git add . && \
git commit -m "feat: Descripción del cambio" && \
git push origin main && \
gcloud builds submit --config=cloudbuild.production.yaml
```

---

**¡Listo para producción!** 🎯

El sistema está configurado para desarrollo continuo. Puedes seguir agregando funciones, hacer commits, y desplegar cuando quieras. Cada despliegue es versionado y reversible.
