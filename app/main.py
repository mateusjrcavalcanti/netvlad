import sys
import os
from flask import Flask, send_from_directory

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from routes.classes import classeRoutes
from routes.datasets import datasetRoutes
from routes.images import imageRoutes

app = Flask(__name__)

# Registrar as rotas para o backend
app.register_blueprint(classeRoutes)
app.register_blueprint(datasetRoutes)
app.register_blueprint(imageRoutes)

# Registrar rotas para o frontend
@app.route('/')
@app.route('/<path:path>')
def index(path=None):
    if path:
        # Verificar se o arquivo existe na pasta static
        static_path = os.path.join(app.static_folder, path)
        if os.path.exists(static_path):
            return send_from_directory(app.static_folder, path)

        # Obter o caminho correto para o diretório de dataset
        dataset_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        dataset_path = os.path.join(dataset_dir, path)
        
        # Verificar se o arquivo existe no diretório de dataset
        if os.path.exists(dataset_path):
            return send_from_directory(dataset_dir, path)

    # Se não encontrar, retornar o arquivo index.html
    return app.send_static_file('index.html')
  
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=3000)