import http.server
import socketserver
import os
import socket

# Servir archivos desde la carpeta del proyecto
os.chdir(os.path.dirname(os.path.abspath(__file__)))

PORT = 8000
Handler = http.server.SimpleHTTPRequestHandler

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except Exception:
        return "127.0.0.1"

local_ip = get_local_ip()

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Sirviendo en http://{local_ip}:{PORT}")
    print(f"Abre http://{local_ip}:{PORT}/index.html desde tu PC y escanéalo con el celular")
    httpd.serve_forever()
