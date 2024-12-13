import torch
import torch.nn as nn
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
from vpr.NetVLAD import NetVLAD

# Carregar o modelo base (exemplo: ResNet-18)
def get_base_cnn_model():
    model = models.resnet18(pretrained=True)
    layers = list(model.children())[:-2]  # Remover as últimas camadas
    model = nn.Sequential(*layers)
    return model

# Pipeline de transformação para a imagem
def preprocess_image(image_path):
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    image = Image.open(image_path).convert('RGB')
    return transform(image).unsqueeze(0)

# Função para extrair o descritor NetVLAD
def extract_netvlad_descriptor(image_path):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # Modelo base + NetVLAD
    base_model = get_base_cnn_model().to(device)
    netvlad = NetVLAD(num_clusters=64, dim=512).to(device)

    # Pré-processar imagem e extrair recursos CNN
    image_tensor = preprocess_image(image_path).to(device)
    with torch.no_grad():
        features = base_model(image_tensor)
        descriptor = netvlad(features)

    return descriptor.cpu().numpy()

def generate_netvlad_descriptors():
    pass

