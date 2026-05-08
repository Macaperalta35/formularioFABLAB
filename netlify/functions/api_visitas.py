import json
from datetime import datetime

# Simulación de base de datos en memoria (en producción usarías una base de datos real)
visitas_db = []

def handler(event, context):
    """Manejador de visitas para Netlify Functions"""

    # Manejar CORS preflight
    if event['httpMethod'] == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Origin, X-Requested-With',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    # Configurar headers CORS para todas las respuestas
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Origin, X-Requested-With'
    }

    try:
        if event['httpMethod'] == 'POST':
            # Crear nueva visita
            data = json.loads(event['body'])

            # Validar campos requeridos
            required_fields = ['nombre', 'rut', 'correo', 'tipoVisita']
            for field in required_fields:
                if not data.get(field, '').strip():
                    return {
                        'statusCode': 400,
                        'headers': cors_headers,
                        'body': json.dumps({'error': f'Campo {field} requerido'})
                    }

            # Crear objeto visita
            visita = {
                'id': len(visitas_db) + 1,
                'nombre': data['nombre'].strip(),
                'rut': data['rut'].strip(),
                'correo': data['correo'].strip(),
                'tipo_visita': data['tipoVisita'].strip(),
                'telefono': data.get('telefono', '').strip(),
                'proposito': data.get('proposito', '').strip(),
                'created_at': datetime.now().isoformat()
            }

            # Guardar en "base de datos"
            visitas_db.append(visita)

            return {
                'statusCode': 201,
                'headers': cors_headers,
                'body': json.dumps({
                    'message': 'Registro guardado exitosamente',
                    'visita': visita
                })
            }

        elif event['httpMethod'] == 'GET':
            # Listar todas las visitas
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps(visitas_db)
            }

        else:
            return {
                'statusCode': 405,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Método no permitido'})
            }

    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': cors_headers,
            'body': json.dumps({'error': 'JSON inválido'})
        }
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Error interno del servidor'})
        }