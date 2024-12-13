from flask import Blueprint, current_app, g, request, jsonify, send_file
from vpr.lib import extract_netvlad_descriptor
from vpr.NetVLAD import NetVLADComparator
from utils import get_path
from collections import Counter
import os
import sqlite3
import numpy as np
import json
import uuid
from werkzeug.utils import secure_filename

vprRoutes = Blueprint('vpr', __name__)
app = current_app

# Define o caminho para a pasta 'descriptors' na raiz do projeto
BASEDIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..','..')
DESCRIPTORS_FOLDER = os.path.join(BASEDIR,'descriptors')

# Cria a pasta 'descriptors' se não existir
if not os.path.exists(DESCRIPTORS_FOLDER):
    os.makedirs(DESCRIPTORS_FOLDER)

def get_db(db_name):
    db_path = os.path.join(DESCRIPTORS_FOLDER, f"{db_name}.db")
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(db_path)
    return db

def init_db(dataset_name):
    with app.app_context():
        db = get_db(dataset_name)        
        cursor = db.cursor()
        cursor.execute('''
                CREATE TABLE IF NOT EXISTS descriptors (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    class TEXT NOT NULL,
                    descriptor TEXT NOT NULL
                );
            ''')
        db.commit()
        
def save_image_descriptor(dataset_name, query_image_path, descriptor):
    db = get_db(dataset_name)
    cursor = db.cursor()
    cursor.execute(
        'INSERT INTO descriptors (class, descriptor) VALUES (?, ?)',
        (query_image_path, json.dumps(descriptor.tolist()))
    )
    db.commit()

def single_best_match(dataset_name, query_descriptor):
    db = get_db(dataset_name)
    cursor = db.cursor()
    cursor.execute('SELECT * FROM descriptors')
    all_descriptors = cursor.fetchall()

    best_match_class = None
    best_similarity = float('inf')
    netvlad_comparator = NetVLADComparator()

    for descriptor_id, descriptor_class, dataset_descriptor in all_descriptors:
        descriptor = np.array(json.loads(dataset_descriptor), dtype=np.float32)
        similarity = netvlad_comparator.compare_descriptors(query_descriptor, descriptor, 'euclidean')

        if similarity < best_similarity:
            best_similarity = similarity
            best_match_class = descriptor_class

    cursor.close()
    db.close()

    return best_match_class

def multimatch(query_descriptor, top_n=5):
    db = get_db()
    cursor = db.cursor()
    cursor.execute('SELECT * FROM descriptors')
    all_descriptors = cursor.fetchall()

    netvlad_comparator = NetVLADComparator()

    similarities = []

    for descriptor_id, descriptor_class, dataset_descriptor in all_descriptors:
        dataset_descriptor = np.array(json.loads(dataset_descriptor), dtype=np.float32)
        similarity = netvlad_comparator.compare_descriptors(query_descriptor, dataset_descriptor, 'cosine')
        similarities.append((similarity, descriptor_class))

    similarities.sort(key=lambda x: x[0])
    top_matches = similarities[:top_n]
    top_classes = [match[1] for match in top_matches]
    class_counts = Counter(top_classes)
    best_match_class = class_counts.most_common(1)[0][0]

    return best_match_class

@vprRoutes.route('/api/dataset/<dataset_name>/describe', methods=['GET'])
def describe_dataset_images(dataset_name):
    dataset_dir = os.path.join(BASEDIR,'datasets', dataset_name)
    init_db(dataset_name)
    
    # Verificar se o diretório do dataset existe
    if not os.path.exists(dataset_dir):
        return f'Dataset {dataset_name} não encontrado', 404

    # Iterar sobre as classes (subpastas) dentro do diretório do dataset
    for class_name in os.listdir(dataset_dir):
        class_dir = os.path.join(dataset_dir, class_name)

        # Verificar se o item é uma pasta (classe)
        if os.path.isdir(class_dir):
            # Iterar sobre os arquivos dentro da classe
            for filename in os.listdir(class_dir):
                file_path = os.path.abspath(os.path.join(class_dir, filename))

                # Verificar se é um arquivo de imagem (ajuste a extensão conforme necessário)
                if os.path.isfile(file_path) and filename.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.gif')):
                    # Extrair descritor NetVLAD da imagem
                    print(f'Extracting descriptor from {file_path}')
                    descriptor = extract_netvlad_descriptor(file_path)
                    
                    # Salvar o descritor da imagem
                    save_image_descriptor(dataset_name, class_name, descriptor)

    return jsonify({"message": "Described dataset images successfully"})

def save_query_image():
    file = request.files['file']
    filename = secure_filename(f"{uuid.uuid4()}.jpg")
    upload_dir = os.path.abspath(os.path.join(BASEDIR, 'upload'))
    filepath = os.path.abspath(os.path.join(upload_dir, filename))
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
    file.save(filepath)

    return filepath

@vprRoutes.route('/api/<dataset_name>/recognize', methods=['POST'])
def recognize_place(dataset_name):
    if 'file' not in request.files:
        return 'No file part', 400

    # Salva o arquivo de imagem e obtém o caminho completo
    query_image_path = save_query_image()

    # Extrai o descritor NetVLAD da imagem
    descriptor = extract_netvlad_descriptor(query_image_path)

    # Realiza a correspondência com a classe mais próxima do dataset
    single_best_match_class = single_best_match(dataset_name, descriptor)

    return jsonify({
        'query_image': query_image_path,
        'descriptor': descriptor.tolist(),
        'single_best_match_class': single_best_match_class,
    })
