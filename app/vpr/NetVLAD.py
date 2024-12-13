import torch
import torch.nn as nn
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

class NetVLAD(nn.Module):
    def __init__(self, num_clusters=64, dim=512):
        super(NetVLAD, self).__init__()
        self.num_clusters = num_clusters
        self.dim = dim
        self.conv = nn.Conv2d(dim, num_clusters, kernel_size=(1, 1), bias=True)
        self.centroids = nn.Parameter(torch.rand(num_clusters, dim))

    def forward(self, x):
        N, C, H, W = x.shape  # Recupera as dimensões de entrada (batch, channels, height, width)
        x_flatten = x.view(N, C, -1)  # Achata as dimensões H e W para um vetor de características de C x (H*W)
        soft_assign = self.conv(x).view(N, self.num_clusters, -1)  # Aplica conv para obter soft-assignments
        soft_assign = torch.nn.functional.softmax(soft_assign, dim=1)

        vlad = torch.zeros([N, self.num_clusters, C], dtype=x.dtype, device=x.device)
        for C_idx in range(self.num_clusters):
            residual = x_flatten - self.centroids[C_idx:C_idx + 1, :].view(1, C, 1)
            residual *= soft_assign[:, C_idx:C_idx + 1, :].expand_as(residual)
            vlad[:, C_idx:C_idx + 1, :] = residual.sum(dim=-1)

        vlad = vlad.view(N, -1)  # Achata a saída
        vlad = torch.nn.functional.normalize(vlad, p=2, dim=1)  # Normalização L2
        return vlad

class NetVLADComparator():
  def compare_descriptors(self, descriptor_one, descriptor_two, method='euclidean'):
      if method == 'euclidean':
          return self.euclidean_distance(descriptor_one, descriptor_two)
      elif method == 'cosine':
          return self.cosine_similarity_metric(descriptor_one, descriptor_two)
      elif method == 'manhattan':
          return self.manhattan_distance(descriptor_one, descriptor_two)
      elif method == 'chebyshev':
          return self.chebyshev_distance(descriptor_one, descriptor_two)
      elif method == 'minkowski':
          return self.minkowski_distance(descriptor_one, descriptor_two, p=3)
      elif method == 'bray_curtis':
          return self.bray_curtis_distance(descriptor_one, descriptor_two)
      else:
          raise ValueError("Método de comparação inválido. Escolha entre 'euclidean', 'cosine', 'manhattan', 'chebyshev', 'minkowski' ou 'bray_curtis'.")

  def euclidean_distance(self, descriptor_one, descriptor_two):
      return np.linalg.norm(descriptor_one - descriptor_two)

  def cosine_similarity_metric(self, descriptor_one, descriptor_two):
      return cosine_similarity(descriptor_one.reshape(1, -1), descriptor_two.reshape(1, -1))[0][0]

  def manhattan_distance(self, descriptor_one, descriptor_two):
      return np.sum(np.abs(descriptor_one - descriptor_two))

  def chebyshev_distance(self, descriptor_one, descriptor_two):
      return np.max(np.abs(descriptor_one - descriptor_two))

  def minkowski_distance(self, descriptor_one, descriptor_two, p=3):
      return np.sum(np.abs(descriptor_one - descriptor_two) ** p) ** (1 / p)

  def bray_curtis_distance(self, descriptor_one, descriptor_two):
      return np.sum(np.abs(descriptor_one - descriptor_two)) / np.sum(np.abs(descriptor_one + descriptor_two))

