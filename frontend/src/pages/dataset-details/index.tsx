import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";
import { Button } from "@/components/shadcn/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/shadcn/tabs"; // Importar componentes de Tabs
import { NavLink } from "react-router-dom";
import Video from "./video";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/shadcn/collapsible";
import { useEffect, useState } from "react";

type DatasetDetailsType = {
  classes: { class_name: string; images: string[] }[];
  created_at: string;
  name: string;
};

export default function DatasetDetails() {
  const { datasetId } = useParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dataset, setDataset] = useState<DatasetDetailsType>({
    classes: [],
    created_at: "",
    name: "",
  });

  const fetchDatasets = () => {
    setLoading(true);
    fetch(`/api/dataset/${datasetId}`)
      .then((response) => response.json())
      .then((data) => {
        setDataset(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar datasets:", err);
        setError("Falha ao carregar os datasets.");
        setLoading(false);
      });
  };

  useEffect(() => {
    console.log(datasetId);
    
    fetchDatasets();
  }, []);

  const formattedDate = new Date(dataset.created_at).toLocaleDateString();

  return (
    <div className="h-screen pt-2 pb-24 pl-2 pr-2 md:pt-0 md:pr-0 md:pl-0">
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <Tabs defaultValue="informacoes" className="container mx-auto">
          <TabsList className="flex w-[370px] h-54 mb-5 bg-gray-400 rounded-lg text-white justify-between">
            <TabsTrigger
              value="informacoes"
              className="py-2 data-[state=active]:bg-primary data-[state=active]:text-black"
            >
              Informações
            </TabsTrigger>
            <TabsTrigger
              value="images"
              className="py-2 data-[state=active]:bg-primary data-[state=active]:text-black"
            >
              Imagens Salvas
            </TabsTrigger>
            <TabsTrigger
              value="video"
              className="py-2 data-[state=active]:bg-primary data-[state=active]:text-black"
            >
              Carregar Vídeo
            </TabsTrigger>
          </TabsList>
          <TabsContent value="informacoes" className="grid grid-cols-4 gap-4">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Detalhes do Dataset</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Nome:</h3>
                    <p>{dataset.name}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Criado em:</h3>
                    <p>{formattedDate}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <NavLink to="/datasets">
                  <Button variant="secondary">Voltar para a lista</Button>
                </NavLink>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="images" className="grid grid-cols-4 gap-4">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Imagens do Dataset</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dataset.classes?.map((classe) => (
                    <Collapsible key={classe.class_name}>
                      <CollapsibleTrigger className="text-lg font-semibold">
                        Classificação: {classe.class_name}
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-8 gap-4">
                          {classe.images.map((image) => (
                            <div
                              key={image}
                              className="flex flex-col items-center"
                            >
                              <img
                                src={`/datasets/${dataset.name}/${classe.class_name}/${image}`}
                                alt={classe.class_name}
                                className="rounded-lg max-w-full h-auto"
                              />
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="video" className="grid grid-cols-4 gap-4">
            <Video dataset={dataset} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
