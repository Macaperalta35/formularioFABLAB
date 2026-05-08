import json
import io
from datetime import datetime

# Importar la base de datos compartida (en un entorno real usarías una DB externa)
try:
    from .api_visitas import visitas_db
except ImportError:
    # Fallback si no se puede importar
    visitas_db = []

def handler(event, context):
    """Exportar visitas en formato Excel"""

    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    }

    if event['httpMethod'] == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': ''
        }

    if event['httpMethod'] != 'GET':
        return {
            'statusCode': 405,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Método no permitido'})
        }

    try:
        # Crear CSV simple (en producción podrías usar openpyxl para Excel real)
        output = io.StringIO()
        output.write('ID,Nombre,RUT,Correo,Tipo Visita,Teléfono,Propósito,Fecha Creación\n')

        for visita in visitas_db:
            row = [
                str(visita.get('id', '')),
                visita.get('nombre', ''),
                visita.get('rut', ''),
                visita.get('correo', ''),
                visita.get('tipo_visita', ''),
                visita.get('telefono', ''),
                visita.get('proposito', ''),
                visita.get('created_at', '')
            ]
            # Escapar comas y comillas
            escaped_row = []
            for cell in row:
                cell_str = str(cell).replace('"', '""')
                if ',' in cell_str or '"' in cell_str or '\n' in cell_str:
                    cell_str = f'"{cell_str}"'
                escaped_row.append(cell_str)
            output.write(','.join(escaped_row) + '\n')

        csv_content = output.getvalue()
        output.close()

        return {
            'statusCode': 200,
            'headers': {
                **cors_headers,
                'Content-Type': 'text/csv',
                'Content-Disposition': f'attachment; filename=visitas_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
            },
            'body': csv_content
        }

    except Exception as e:
        print(f"Error en exportación: {str(e)}")
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Error al exportar datos'})
        }