"use client";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/shadcn/card";
import DatasetForm from "./form";
import { useState, useEffect } from "react";
import { DatasetType } from "@/schemas/dataset";

interface DatasetWithClassses extends DatasetType {
  num_classes: number;
}

export default function Datasets() {
  const [datasets, setDatasets] = useState<DatasetWithClassses[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchDatasets = () => {
    setLoading(true);
    fetch("/api/dataset")
      .then((response) => response.json())
      .then((data) => {
        setDatasets(data);  
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar datasets:", err);
        setError("Falha ao carregar os datasets.");
        setLoading(false);
      });
  };

  // Carrega os datasets ao montar o componente
  useEffect(() => {
    fetchDatasets();
  }, []);

  return (
    <div className="h-screen pt-2 pb-24 pl-2 pr-2 overflow-auto md:pt-0 md:pr-0 md:pl-0 flex flex-col">
      <Card>
        <CardHeader>
          <CardTitle>Datasets</CardTitle>
          <CardDescription>
            Lista de conjuntos de dados disponíveis no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <DataTable columns={columns} data={datasets} />
          )}
        </CardContent>
        <CardFooter>
          <DatasetForm onSuccess={fetchDatasets} />
        </CardFooter>
      </Card>
    </div>
  );
}
