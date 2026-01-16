# Password Recovery System - Setup Guide

## 📧 EmailJS Configuration (Required for Production)

Para habilitar el envío de emails de recuperación de contraseña, necesitas configurar EmailJS:

### 1. Crear Cuenta en EmailJS

1. Ve a [https://www.emailjs.com/](https://www.emailjs.com/)
2. Crea una cuenta gratuita (200 emails/mes)
3. Verifica tu email

### 2. Configurar Servicio de Email

1. En el dashboard de EmailJS, ve a **Email Services**
2. Click en **Add New Service**
3. Selecciona tu proveedor (Gmail, Outlook, etc.)
4. Sigue las instrucciones para conectar tu cuenta
5. Copia el **Service ID** (ej: `service_abc123`)

### 3. Crear Template de Email

1. Ve a **Email Templates**
2. Click en **Create New Template**
3. Usa el siguiente template:

```
Asunto: Código de Recuperación de Contraseña - CAMUS

Hola {{to_name}},

Has solicitado restablecer tu contraseña en CAMUS.

Tu código de verificación es: {{reset_code}}

Este código es válido por {{validity_minutes}} minutos.

Si no solicitaste este cambio, ignora este mensaje.

---
CAMUS - Atención Extramural Inteligente
Virrey Solís IPS
```

4. Copia el **Template ID** (ej: `template_xyz789`)

### 4. Obtener Public Key

1. Ve a **Account** → **General**
2. Copia tu **Public Key** (ej: `abc123xyz789`)

### 5. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto (`src_camus/.env`):

```env
VITE_EMAILJS_SERVICE_ID=service_abc123
VITE_EMAILJS_TEMPLATE_ID=template_xyz789
VITE_EMAILJS_PUBLIC_KEY=abc123xyz789
```

**⚠️ IMPORTANTE**: Agrega `.env` a tu `.gitignore` para no subir las credenciales al repositorio.

### 6. Rebuild y Deploy

```bash
npm run build
```

---

## 🧪 Modo de Desarrollo (Sin EmailJS)

Si EmailJS no está configurado, el sistema funcionará en **modo desarrollo**:
- El código de verificación se mostrará en la consola del navegador
- El código también se mostrará en la UI para facilitar las pruebas
- Esto permite probar la funcionalidad sin configurar email

Para ver el código en desarrollo:
1. Abre las DevTools del navegador (F12)
2. Ve a la pestaña Console
3. Busca el mensaje: `[DEV MODE] Reset code for [nombre]: [código]`

---

## 📱 Uso del Sistema de Recuperación

### Para Usuarios

1. En la pantalla de login, click en **"¿Olvidaste tu contraseña?"**
2. Ingresa tu documento de identidad o correo electrónico
3. Click en **"Enviar Código"**
4. Revisa tu email (o consola en dev mode) para obtener el código
5. Ingresa el código de 6 dígitos
6. Establece tu nueva contraseña
7. Confirma la contraseña
8. Click en **"Restablecer Contraseña"**

### Características de Seguridad

- ✅ Códigos de 6 dígitos aleatorios
- ✅ Expiración de 15 minutos
- ✅ Un código por usuario (el nuevo reemplaza al anterior)
- ✅ Código se elimina después de usarse
- ✅ Validación de contraseña (mínimo 6 caracteres)
- ✅ Confirmación de contraseña

---

## 🔧 Troubleshooting

### El email no llega

1. Verifica que las credenciales en `.env` sean correctas
2. Revisa la carpeta de spam
3. Verifica que el servicio de EmailJS esté activo
4. Revisa la consola del navegador para errores
5. En modo dev, el código siempre se muestra en consola

### Error "Usuario no encontrado"

- Verifica que el documento o email exista en la base de datos
- El usuario debe estar registrado en `collaborators.ts` o en localStorage

### Código inválido o expirado

- Los códigos expiran después de 15 minutos
- Solicita un nuevo código si el anterior expiró
- Verifica que estés ingresando el código correcto (6 dígitos)

---

## 🚀 Próximos Pasos (Producción)

Para un sistema de producción más robusto, considera:

1. **Backend API**: Implementar endpoint de recuperación en el servidor
2. **Hash de Contraseñas**: Usar bcrypt para almacenar contraseñas
3. **Rate Limiting**: Limitar intentos de recuperación por IP
4. **2FA**: Agregar autenticación de dos factores
5. **Logs de Seguridad**: Registrar intentos de recuperación
6. **Notificaciones**: Alertar al usuario cuando se cambia su contraseña
