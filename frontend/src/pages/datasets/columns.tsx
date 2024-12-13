"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn/dialog";
import { Button } from "@/components/shadcn/button";
import { NavLink } from "react-router-dom";
import { DatasetType } from "@/schemas/dataset";

// Componente para formatar a data
function DateCell({ date }: { date: string }) {
  const formattedDate = new Date(date).toLocaleDateString();
  return <span>{formattedDate}</span>;
}

// Componente para gerenciar ações de uma linha
function RowActions({ name }: { name: string }) {
  const [isDialogOpen, setDialogOpen] = useState(false);

  const handleDelete = () => {
    alert(`Item ${name} excluído!`);
    setDialogOpen(false);
  };

  return (
    <div className="flex gap-2">
      <NavLink to={`/datasets/${name}`}>
        <Button variant="default">Editar</Button>
      </NavLink>
      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive">Excluir</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
          </DialogHeader>
          <p>
            Tem certeza que deseja excluir o item <strong>{name}</strong>?
          </p>
          <DialogFooter>
            <Button variant="destructive" onClick={handleDelete}>
              Confirmar
            </Button>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const columns: ColumnDef<DatasetType>[] = [
  {
    accessorKey: "name",
    header: "Nome",
  },
  {
    accessorKey: "created_at",
    header: "Criado em",
    cell: ({ row }) => <DateCell date={row.getValue("created_at")} />,
  },
  
  {
    accessorKey: "num_classes",
    header: "Classes",
    // cell: ({ row }) => <DateCell date={row.getValue("created_at")} />,
  },
  {
    id: "options",
    header: "Opções",
    cell: ({ row }) => <RowActions name={row.getValue("name")} />,
  },
];
