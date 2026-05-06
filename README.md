# FAB LAB INACAP - Sistema de Registro de Visitas

## 📋 Descripción
Formulario web para el registro de visitas al Laboratorio de Fabricación Digital de INACAP, con validación en tiempo real, diseño corporativo y funcionalidad offline básica.

## ✨ Características

### 🎨 Diseño Corporativo
- Logo de INACAP
- Colores institucionales rojos (#ED1C24)
- Tipografía Montserrat
- Diseño profesional y responsive

### 🔒 Validación de Datos
- **Nombre Completo**: requerido, mínimo 2 caracteres
- **RUT**: válido con dígito verificador chileno
- **Correo Electrónico**: formato correcto obligatorio
- **Tipo de Visita**: selección obligatoria
- **Teléfono**: opcional, pero validado si se ingresa
- **Propósito de la Visita**: campo opcional

### 🚫 Prevención de Envío
- Botón deshabilitado hasta completar los campos obligatorios
- Mensajes de error por campo
- Validación en tiempo real mientras se escribe
- No permite enviar si hay datos inválidos

### 💾 Funcionalidades
- Contador de visitas almacenado en `localStorage`
- Pantalla de confirmación tras el registro
- Reinicio automático del formulario después de 5 segundos
- Diseño adaptado para móviles y escritorio

## 🚀 Cómo usar

### Abrir directamente
1. Abre `index.html` en un navegador web
2. El formulario carga y funciona sin servidor

### Usar con servidor local
1. Abre terminal en la carpeta del proyecto
2. Ejecuta:
   ```bash
   python -m http.server 8000
   ```
3. Abre en tu navegador:
   ```
   http://localhost:8000/index.html
   ```

## 📁 Estructura del proyecto

```
fablab-formulario/
├── index.html           # Formulario con estilos embebidos
├── index-separado.html  # Formulario con CSS externo
├── styles.css           # Estilos compartidos para la versión separada
└── README.md            # Documentación en español
```

## 🛠️ Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript puro
- Google Fonts (Montserrat)

## 📱 Compatibilidad

Funciona en navegadores modernos como:
- Chrome
- Firefox
- Safari
- Edge
- Navegadores móviles modernos

## 🎯 Campos del formulario

### Requeridos
- Nombre Completo
- RUT
- Correo Electrónico
- Tipo de Visita

### Opcionales
- Teléfono
- Propósito de la Visita

## 🔧 Personalización

Para cambiar el formulario o estilos:
- `index.html`: versión autoconfigurada con estilos embebidos
- `index-separado.html`: versión con CSS externo en `styles.css`
- `styles.css`: editar colores, tipografías y diseño
- Validación: editar las funciones JavaScript en cada HTML

## 📊 Datos que guarda localmente

- Contador de visitas totales en `localStorage`
- No guarda directamente los datos personales del formulario

## 🤝 Notas finales
Este proyecto es un formulario estático listo para usar y fácil de personalizar. Si necesitas que también guarde datos en un servidor o en una base de datos, puedo ayudarte a integrarlo.
</content>
<parameter name="filePath">c:\Users\macas\Desktop\fablab-formulario\README.md