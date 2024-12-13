from flask import Blueprint, request, jsonify
from utils import get_path, DATASETS_PATH
import os
from datetime import datetime


# Blueprint para rotas de datasets
datasetRoutes = Blueprint('dataset', __name__)


@datasetRoutes.route('/api/dataset', methods=['GET'])
def list_datasets():
    try:
        datasets = []
        for d in os.listdir(DATASETS_PATH):
            dataset_path = get_path(d)
            if os.path.isdir(dataset_path):
                creation_time = datetime.fromtimestamp(os.path.getctime(dataset_path)).isoformat()
                num_classes = sum(os.path.isdir(os.path.join(dataset_path, subdir)) for subdir in os.listdir(dataset_path))
                datasets.append({
                    "name": d,
                    "created_at": creation_time,
                    "num_classes": num_classes
                })
        return jsonify(datasets)
    except OSError:
        return jsonify({"error": "Diretório datasets não encontrado"}), 404

@datasetRoutes.route('/api/dataset/<dataset_name>', methods=['GET'])
def get_dataset_info(dataset_name):
    dataset_path = get_path(dataset_name)
    
    if not os.path.exists(dataset_path) or not os.path.isdir(dataset_path):
        return jsonify({"error": "Dataset não encontrado"}), 404

    try:
        creation_time = datetime.fromtimestamp(os.path.getctime(dataset_path)).isoformat()
        classes = []

        for class_name in os.listdir(dataset_path):
            class_path = os.path.join(dataset_path, class_name)
            if os.path.isdir(class_path):
                images = [img for img in os.listdir(class_path) if os.path.isfile(os.path.join(class_path, img))]
                classes.append({
                    "class_name": class_name,
                    "images": images
                })

        dataset_info = {
            "name": dataset_name,
            "created_at": creation_time,
            "classes": classes
        }

        return jsonify(dataset_info)
    except OSError:
        return jsonify({"error": "Erro ao acessar o dataset"}), 500


@datasetRoutes.route('/api/dataset', methods=['POST'])
def create_dataset():
    dataset_name = request.json.get('name')
    if not dataset_name:
        return jsonify({"error": "Nome do dataset é obrigatório"}), 400
    
    dataset_path = get_path(dataset_name)
    if os.path.exists(dataset_path):
        return jsonify({"error": "Dataset já existe"}), 400
    
    os.makedirs(dataset_path, exist_ok=True)
    creation_time = datetime.fromtimestamp(os.path.getctime(dataset_path)).isoformat()
    return jsonify({
        "message": "Dataset criado com sucesso",
        "dataset": dataset_name,
        "created_at": creation_time,
        "num_classes": 0
    }), 201


@datasetRoutes.route('/api/dataset/<dataset_name>', methods=['DELETE'])
def delete_dataset(dataset_name):
    dataset_path = get_path(dataset_name)
    if os.path.exists(dataset_path):
        import shutil
        shutil.rmtree(dataset_path)
        return jsonify({"message": "Dataset removido com sucesso"})
    return jsonify({"error": "Dataset não encontrado"}), 404
