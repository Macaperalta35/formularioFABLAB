# 🚀 INICIO RÁPIDO - FAB LAB Registro de Visitas

## 1️⃣ Primer Arranque (Una sola vez)

### Terminal 1 - Servidor Backend
```bash
cd c:\Users\SSP_LAB\Desktop\formularioFABLAB
pip install -r requirements.txt
pip install openpyxl
python fablab_app.py
```
✅ Deberías ver: `Running on http://127.0.0.1:5000`

### Terminal 2 - Servidor de Formulario
```bash
cd c:\Users\SSP_LAB\Desktop\formularioFABLAB
python serve.py
```
✅ Deberías ver: `Sirviendo en http://localhost:8000`

## 2️⃣ Usar el Sistema

**Registrar una visita:**
1. Abre [http://localhost:8000/fablab-simple.html](http://localhost:8000/fablab-simple.html)
2. Completa el formulario
3. Haz clic en "Registrar Visita"
4. ¡Listo! Los datos se guardaron

**Ver y descargar registros:**
1. Abre [http://localhost:8000/admin-visitas.html](http://localhost:8000/admin-visitas.html)
2. Haz clic en:
   - 📥 **Descargar Excel** para obtener `.xlsx`
   - 📥 **Descargar CSV** para obtener `.csv`

## 📁 Archivos Principales

```
c:\Users\macas\Downloads\
├── fablab-simple.html       ← Formulario
├── admin-visitas.html       ← Panel de control
├── serve.py                 ← Servidor local
├── README_FABLAB.md         ← Documentación completa
└── GUIA_PRUEBAS.md         ← Casos de prueba

c:\Users\macas\OneDrive\Desktop\carbon_y_cheddar_api\backend\
├── app.py                   ← Servidor Flask
├── models.py                ← Modelos de BD
├── routes/visitas.py        ← API de visitas
└── carbo_cheddar_new.db     ← Base de datos (se crea automáticamente)
```

## 🔗 URLs de Acceso

| Función | URL |
|---------|-----|
| Formulario | http://localhost:8000/fablab-simple.html |
| Admin | http://localhost:8000/admin-visitas.html |
| API - Crear | POST http://127.0.0.1:5000/api/visitas |
| API - Listar | GET http://127.0.0.1:5000/api/visitas |
| API - Exportar Excel | GET http://127.0.0.1:5000/api/visitas/export?format=excel |
| API - Exportar CSV | GET http://127.0.0.1:5000/api/visitas/export?format=csv |

## ✨ Características

✅ Validación en tiempo real  
✅ Base de datos automática  
✅ Exportación a Excel profesional  
✅ Panel administrativo  
✅ Diseño responsive  
✅ Colores corporativos INACAP  

## 🎯 Campos del Formulario

| Campo | Tipo | Validación |
|-------|------|-----------|
| Nombre | Texto | Requerido, mín 2 caracteres |
| RUT | Texto | XX.XXX.XXX-X |
| Correo | Email | Formato válido |
| Tipo Visita | Radio | Estudiante, Docente, Externo, Empresa |
| Teléfono | Texto | Opcional, formato flexible |
| Propósito | TextArea | Opcional |

## 🔒 Validación de RUT

Formato: `12.345.678-9`
- 2 dígitos, punto
- 3 dígitos, punto  
- 3 dígitos, guión
- 1 dígito verificador

Ejemplo válido: `15.234.567-8`

## 📊 Datos en Excel

El archivo generado incluye:
- Encabezado con fondo azul
- Todas las columnas de datos
- Fechas en formato DD/MM/YYYY HH:MM
- Formato profesional listo para presentar

## ⚙️ Requisitos

✅ Python 3.7+  
✅ Flask  
✅ Flask-CORS  
✅ Flask-SQLAlchemy  
✅ Openpyxl (para Excel)  
✅ Navegador moderno (Chrome, Firefox, Edge, Safari)  

## 🐛 Troubleshooting Rápido

**"Error al conectar"** → Verifica que Flask está corriendo en puerto 5000  
**"No veo el formulario"** → Verifica que serve.py está corriendo en puerto 8000  
**"Datos no se guardan"** → Revisa la consola de Flask para errores  
**"No me descarga Excel"** → Verifica que openpyxl está instalado  

## 🔄 Parar y Reiniciar

```bash
# Para Flask (Terminal 1)
Presiona: Ctrl + C

# Para serve.py (Terminal 2)  
Presiona: Ctrl + C

# Reiniciar
Repite los pasos de "Primer Arranque"
```

## 📈 Próximos Pasos Opcionales

- Agregar autenticación al panel administrativo
- Enviar emails de confirmación
- Generar reportes por fecha
- Integrar con calendario
- Agregar fotos del visitante
- Enviar SMS de confirmación

## ❓ Preguntas Frecuentes

**¿Dónde se guardan los datos?**  
En la base de datos SQLite: `backend/instance/carbo_cheddar_new.db`

**¿Puedo usar esto en producción?**  
Este servidor Flask es para desarrollo. Para producción, usa Gunicorn o similar.

**¿Cuántas visitas puedo registrar?**  
Ilimitadas (según espacio en disco)

**¿Los datos persisten?**  
Sí, se guardan en la base de datos SQLite

**¿Puedo acceder desde otra máquina?**  
Sí, desde http://[TU_IP]:5000 (cambiar 127.0.0.1 en código)

---

**¿Listo para empezar? 🎉**

1. Abre 2 terminales
2. Sigue los comandos de "Primer Arranque"
3. Abre http://localhost:8000/fablab-simple.html
4. ¡Empieza a registrar visitas!
