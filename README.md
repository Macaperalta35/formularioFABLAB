# FAB LAB INACAP - Sistema de Registro de Visitas 🚀 (v1.0)

Bienvenido al repositorio oficial del **Sistema de Registro de Visitas del FAB LAB INACAP Sede San Pedro de la Paz**. 
Este sistema ha sido diseñado para centralizar y digitalizar el ingreso de estudiantes, docentes, empresas y visitantes externos, facilitando la recolección de datos y el análisis del ecosistema de innovación.

## 🔗 Enlaces Rápidos

*   **💻 Formulario en Vivo (Frontend):** [Registro FAB LAB](https://macaperalta35.github.io/formularioFABLAB/)
*   **📱 Código QR Oficial:** [Página del QR](https://macaperalta35.github.io/formularioFABLAB/qr.html)
*   **📊 Base de Datos (Google Sheets):** *(Acceso restringido a administradores)* - [Acceder a Respuestas](https://docs.google.com/spreadsheets/)

---

## 🛠️ Características Principales (Versión 1.0)

- **Diseño Institucional:** Interfaz gráfica moderna, "mobile-first", que respeta los lineamientos de marca de INACAP (colores corporativos, tipografía, logotipo oficial en SVG/CSS).
- **Acceso mediante Código QR:** Creado específicamente para ser escaneado con rapidez desde la cámara de cualquier teléfono móvil al ingresar al laboratorio.
- **Validaciones Estrictas (En Tiempo Real):**
  - *Nombre:* Solo acepta letras y espacios. Eliminación inmediata de números, símbolos especiales (ej: ☆) o emojis.
  - *RUT:* Autocompletado con formato chileno (XX.XXX.XXX-X). Límite técnico inquebrantable de 9 caracteres base.
  - *Teléfono:* Campo obligatorio con validación de longitud (mínimo 8 dígitos, máximo 15).
  - *Correo Electrónico:* Verificación inteligente de estructura estándar.
  - *Propósito de Visita:* Campo de texto obligatorio con exigencia mínima de descripción (5 caracteres).
- **Arquitectura Serverless:** No requiere pagar servidores. La comunicación se hace a través de un endpoint API de Google Apps Script (`doPost`).

---

## 🏗️ Arquitectura Tecnológica

1. **Frontend:** Construido con HTML5, CSS3 puro y JavaScript moderno. Desplegado en **GitHub Pages**.
2. **Backend/API:** Google Apps Script procesa las peticiones POST enviadas por el formulario mediante `fetch` (CORS-friendly).
3. **Base de Datos:** Google Sheets. Almacenamiento directo en tiempo real, lo que permite al administrador descargar la información a Microsoft Excel (`.xlsx`) en 2 clics.

---

## 🧪 Pruebas de QA (Quality Assurance) - Aprobadas

El sistema superó exitosamente el protocolo de pruebas automatizadas simulando comportamiento humano en la versión final en vivo (V1.0):

✅ **Prueba de Inyección (Nombre):** Imposibilidad física de escribir caracteres no alfabéticos.
✅ **Prueba de Desbordamiento (RUT):** Ingresar texto masivo no rompe el formato; el sistema recorta a 9 caracteres limpios de forma segura.
✅ **Prueba de Bloqueo de Envío Vacío:** Intentar enviar el formulario sin los campos obligatorios (`Teléfono`, `Propósito`, etc.) genera alertas visuales precisas impidiendo la recarga de página.
✅ **Prueba End-to-End (E2E) Completa:** Flujo exitoso de registro simulado, validando la transición del botón a "Registrando...", la aparición de la pantalla de éxito "¡Registro Exitoso!" y el envío final de datos a la nube.

---

## 📋 Guía Rápida de Mantenimiento

Para futuras actualizaciones en el destino de los datos:
1. Abre el panel de **Google Apps Script** asociado a la hoja "FAB LAB - Visitas".
2. Realiza cambios en `Codigo.gs`.
3. Presiona **Implementar > Nueva Implementación**.
4. Copia la nueva URL que te entregue Google.
5. Edita el archivo `index.html` de este repositorio y reemplaza la constante `GOOGLE_SCRIPT_URL` con la nueva dirección.

---
*Desarrollado para el fortalecimiento del ecosistema de innovación, prototipado y transferencia tecnológica de INACAP San Pedro de la Paz.*
