from flask import Blueprint, request, jsonify
from utils import get_path
import os
import shutil

classeRoutes = Blueprint('classe', __name__)

@classeRoutes.route('/api/dataset/<dataset_name>/classes', methods=['POST'])
def create_class(dataset_name):
    class_name = request.json.get('class_name')
    if not class_name or '/' in class_name or '\\' in class_name:
        return jsonify({"error": "Nome da classe inválido ou ausente"}), 400
    
    class_path = get_path(dataset_name, class_name)
    os.makedirs(class_path, exist_ok=True)
    return jsonify({"message": "Classe criada com sucesso", "class": class_name}), 201

@classeRoutes.route('/api/dataset/<dataset_name>/classes/<class_name>', methods=['DELETE'])
def delete_class(dataset_name, class_name):
    class_path = get_path(dataset_name, class_name)
    if os.path.exists(class_path):
        shutil.rmtree(class_path)
        return jsonify({"message": "Classe removida com sucesso"})
    return jsonify({"error": "Classe não encontrada"}), 404
