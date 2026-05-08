# Netlify Functions - Backend Serverless

## 🚀 Despliegue Automático desde GitHub

Netlify puede ejecutar tu código Python como funciones serverless directamente desde tu repositorio de GitHub.

### Archivo: `netlify.toml`
```toml
[build]
  publish = "."
  functions = "netlify/functions"

[functions]
  directory = "netlify/functions"
```

### Archivo: `netlify/functions/api_visitas.py`
```python
import json
from datetime import datetime

# Simulación de base de datos (en producción usarías una real)
visitas_db = []

def handler(event, context):
    if event['httpMethod'] == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    if event['httpMethod'] == 'POST':
        try:
            data = json.loads(event['body'])
            
            # Validar datos
            required_fields = ['nombre', 'rut', 'correo', 'tipoVisita']
            for field in required_fields:
                if not data.get(field):
                    return {
                        'statusCode': 400,
                        'headers': {'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': f'Campo {field} requerido'})
                    }
            
            # Crear visita
            visita = {
                'id': len(visitas_db) + 1,
                'nombre': data['nombre'],
                'rut': data['rut'],
                'correo': data['correo'],
                'tipo_visita': data['tipoVisita'],
                'telefono': data.get('telefono'),
                'proposito': data.get('proposito'),
                'created_at': datetime.now().isoformat()
            }
            
            visitas_db.append(visita)
            
            return {
                'statusCode': 201,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'message': 'Registro guardado exitosamente',
                    'visita': visita
                })
            }
            
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': str(e)})
            }
    
    if event['httpMethod'] == 'GET':
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(visitas_db)
        }
    
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Método no permitido'})
    }
```

### URLs de Producción:
- **Frontend:** `https://macaperalta35.github.io/formularioFABLAB/`
- **Backend:** `https://macaperalta35.netlify.app/.netlify/functions/api_visitas`

### Ventajas:
✅ **Gratuito** (100k invocaciones/mes)  
✅ **Despliegue automático** desde GitHub  
✅ **Sin configuración de servidor**  
✅ **Escalado automático**  

¿Quieres que implemente esta solución?