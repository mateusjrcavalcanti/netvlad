"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn/dialog";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/shadcn/form";
import { DatasetType, datasetSchema } from "@/schemas/dataset";

export default function DatasetForm({ onSuccess }: { onSuccess: () => void }) {
  const form = useForm<DatasetType>({
    resolver: zodResolver(datasetSchema),
    defaultValues: {
      name: "",
    },
  });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false); // Estado para controlar a visibilidade do Dialog

  function onSubmit(data: DatasetType) {
    setLoading(true);

    fetch("/api/dataset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (response.ok) {
          form.reset();
          onSuccess();
          setOpen(false);
        } else {
          throw new Error("Erro ao criar o Dataset");
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Criar novo Dataset</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar novo Dataset</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para criar um novo Dataset.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormDescription>Nome do Dataset.</FormDescription>
                  <FormMessage id="file-error" />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Reconhecendo..." : "Criar Dataset"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
