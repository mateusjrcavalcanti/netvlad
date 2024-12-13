from flask import Blueprint, request, jsonify, send_file
from utils import get_path
import os

imageRoutes = Blueprint('image', __name__)

@imageRoutes.route('/api/dataset/<dataset_name>/<class_name>', methods=['POST'])
def upload_image(dataset_name, class_name):
    if 'file' not in request.files:
        return jsonify({"error": "Nenhum arquivo enviado"}), 400

    file = request.files['file']
    file_path = get_path(dataset_name, class_name, file.filename)
    file.save(file_path)

    return jsonify({"message": "Imagem enviada com sucesso", "filename": file.filename}), 201

@imageRoutes.route('/api/dataset/<dataset_name>/<class_name>/<filename>', methods=['GET'])
def download_image(dataset_name, class_name, filename):
    file_path = get_path(dataset_name, class_name, filename)
    if os.path.exists(file_path):
        return send_file(file_path)
    return jsonify({"error": "Arquivo não encontrado"}), 404

@imageRoutes.route('/api/dataset/<dataset_name>/<class_name>/<filename>', methods=['DELETE'])
def delete_image(dataset_name, class_name, filename):
    file_path = get_path(dataset_name, class_name, filename)
    if os.path.exists(file_path):
        os.remove(file_path)
        return jsonify({"message": "Imagem removida com sucesso"})
    return jsonify({"error": "Arquivo não encontrado"}), 404
