import os

DATASETS_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../datasets"))

# Utilitários
def get_path(*paths):
    return os.path.join(DATASETS_PATH, *paths)