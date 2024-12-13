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
import { Input } from "@/components/shadcn/input";
import { z } from "zod";
import { Button } from "@/components/shadcn/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import Map from "@/components/map";

const fileSchema = z.object({
  file: z.instanceof(File)
    .refine(file => file.size > 0, { message: "File is required" })
    .refine(file => file.type.startsWith("image/"), { message: "Only image files are allowed" }),
});

type FileFormValues = z.infer<typeof fileSchema>;

export default function Home() {
  const form = useForm<FileFormValues>({
    resolver: zodResolver(fileSchema),
  });
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [responseData, setResponseData] = useState<any>(null);

  function onSubmit(data: FileFormValues) {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", data.file);

    fetch("/api/laboratorio_robotica/recognize", {
      method: "POST",
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        setResponseData(data);
      })
      .catch(error => {
        console.error("Error:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  console.log(responseData);
  

  return (
    <div className="h-screen pt-2 pb-24 pl-2 pr-2 overflow-auto md:pt-0 md:pr-0 md:pl-0">
      <div className="flex flex-col sm:flex-row justify-center items-center gap-8">
        {/* Card do formulário */}
        <div className="max-w-lg w-full p-6 bg-white shadow-lg rounded-lg">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recognize Image</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        onChange={(e) => {
                          if (e.target.files) {
                            field.onChange(e.target.files[0]);
                            const file = e.target.files[0];
                            setImage(URL.createObjectURL(file)); // Exibe a imagem selecionada
                          }
                        }}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        aria-describedby="file-error"
                      />
                    </FormControl>
                    <FormDescription>
                      Select an image to recognize.
                    </FormDescription>
                    <FormMessage id="file-error" />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Recognizing..." : "Recognize"}
              </Button>
            </form>
          </Form>
        </div>

        {/* Card para a imagem selecionada */}
        {image && (
          <div className="max-w-lg w-full p-6 bg-white shadow-lg rounded-lg">
            <h3 className="text-lg font-semibold">Selected Image</h3>
            <img src={image} alt="Selected" className="mt-4 w-full h-auto rounded" />
          </div>
        )}

        {/* Card para o JSON da resposta */}
        {responseData && (
          <div className="max-w-lg w-full p-6 bg-white shadow-lg rounded-lg">
            <h3 className="text-lg font-semibold">Response Data</h3>
            <div className="mt-4 max-h-60 overflow-y-auto bg-gray-100 p-4 rounded">
              <pre className="whitespace-pre-wrap break-words">{JSON.stringify(responseData, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>


      <div className="flex flex-col sm:flex-row justify-center items-center gap-8 mt-5">
        <div className="max-w-lg w-full p-6 bg-white shadow-lg rounded-lg">
          <h3 className="text-lg font-semibold">Map</h3>
          <Map selectedRectangle={responseData ? responseData.single_best_match_class : null} />
        </div>
      </div>
    </div>
  );
}
