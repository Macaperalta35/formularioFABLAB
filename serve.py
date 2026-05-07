import http.server
import socketserver
import os

# Servir archivos desde la carpeta del proyecto
os.chdir(os.path.dirname(os.path.abspath(__file__)))

PORT = 8000
Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Sirviendo en http://localhost:{PORT}")
    print(f"Abre http://localhost:{PORT}/index.html")
    httpd.serve_forever()
