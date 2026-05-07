# FAB LAB INACAP - Guía de Uso

## 🚀 Inicio Rápido

### 1. Iniciar Servidores
Ejecuta el archivo `iniciar.bat` para iniciar ambos servidores automáticamente.

### 2. Acceder a los Formularios
**IMPORTANTE:** Los formularios deben abrirse desde el servidor web HTTP, NO directamente desde el archivo.

#### URLs Correctas:
- **Formulario Principal:** http://127.0.0.1:8000/index.html
- **Formulario Simple (React):** http://127.0.0.1:8000/fablab-simple.html
- **Formulario Móvil:** http://127.0.0.1:8000/fablab-mobile-fix.html
- **Panel de Administración:** http://127.0.0.1:8000/admin-visitas.html

#### ❌ NO Abrir Desde Archivo
- ❌ Clic derecho → Abrir con → Navegador (desde el Explorador de Archivos)
- ❌ Arrastrar archivo al navegador
- ❌ file:///C:/ruta/al/archivo.html

### 3. Verificar Conexión
Si ves "Failed to fetch", verifica:
1. Que ambos servidores estén ejecutándose (puertos 5001 y 8000)
2. Que abras los formularios desde http://127.0.0.1:8000/
3. Que no haya bloqueadores de anuncios o extensiones que bloqueen las peticiones

## 🔧 Solución de Problemas

### Error "Failed to fetch"
- **Causa:** Formulario abierto desde `file://` en lugar de `http://`
- **Solución:** Usa las URLs con `http://127.0.0.1:8000/`

### Error de Validación RUT
- La validación actual es permisiva y acepta RUT con dígito "K"
- Si persiste el error, verifica que el RUT tenga formato `12.345.678-K`

### Servidores No Inician
- Ejecuta `iniciar.bat` como Administrador
- Verifica que los puertos 5001 y 8000 estén libres

## 📱 Uso en Móviles
- Abre los formularios desde un navegador móvil
- Usa la URL completa: `http://[IP_DEL_SERVIDOR]:8000/index.html`
- Para probar desde otro dispositivo en la red, reemplaza `127.0.0.1` con la IP de tu computadora

## 🛠️ Desarrollo
- Backend Flask: `fablab_app.py` (puerto 5001)
- Servidor HTTP: `serve.py` (puerto 8000)
- Base de datos: `instance/fablab_visitas.db`</content>
<parameter name="filePath">c:\Users\macas\OneDrive\Desktop\fablab formulario\GUIA_USUARIO.md