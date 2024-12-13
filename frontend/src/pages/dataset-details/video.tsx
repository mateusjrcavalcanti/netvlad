import { useState, useRef } from "react";
import { useFieldArray, useForm } from "react-hook-form";
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
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/shadcn/card";
import { Button } from "@/components/shadcn/button";

import { Clock, Plus, Trash2, Video, Download } from "lucide-react";
import { DatasetType } from "@/schemas/dataset";

const videoSchema = z.object({
  file: z
    .any()
    .refine((file) => file?.[0]?.size > 0, "Video file is required")
    .refine(
      (file) => file?.[0]?.type.startsWith("video/"),
      "Only video files are allowed"
    ),
  fps: z.number().min(1, "FPS must be at least 1"),
  intervals: z.array(
    z.object({
      start: z.number().min(0),
      end: z.number().min(0),
      class: z.string().min(1, "Class name is required"),
    })
  ),
});

type FormValues = z.infer<typeof videoSchema>;
type ExtractedFrame = { time: number; class: string; url: string };
type Intervals = FormValues["intervals"];

export default function VideoFrameExtractor({ dataset }: { dataset: DatasetType }) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [frames, setFrames] = useState<
    Array<{ time: number; class: string; url: string }>
  >([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(videoSchema),
    defaultValues: {
      fps: 1,
      intervals: [{ start: 0, end: 5, class: "" }], // Garantir valor inicial para intervals
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "intervals",
  });

  const handleAddInterval = () => {
    const lastEnd = fields[fields.length - 1]?.end || 0;
    const currentTime = videoRef.current?.currentTime || 0;

    append({
      start: lastEnd,
      end: currentTime > lastEnd ? currentTime : lastEnd + 10,
      class: "",
    });
  };

  const extraction = async (data: FormValues) => {
    if (!videoRef.current) return;

    setIsProcessing(true);
    setFrames([]);
    const extractedFrames: ExtractedFrame[] = [];
    const fps = data.fps;
    const frameInterval = 1 / fps;

    let totalFrames = 0;
    let processedFrames = 0;

    // Calcular o número total de frames a serem extraídos
    for (const interval of data.intervals) {
      totalFrames += Math.floor((interval.end - interval.start) * fps);
    }

    for (const interval of data.intervals) {
      for (
        let time = interval.start;
        time <= interval.end;
        time += frameInterval
      ) {
        videoRef.current.currentTime = time;
        await new Promise((resolve) => {
          videoRef.current!.onseeked = () => {
            const canvas = document.createElement("canvas");
            canvas.width = videoRef.current!.videoWidth / 2; // Limitar a resolução
            canvas.height = videoRef.current!.videoHeight / 2;
            const ctx = canvas.getContext("2d");
            ctx?.drawImage(videoRef.current!, 0, 0);
            extractedFrames.push({
              time,
              class: interval.class,
              url: canvas.toDataURL("image/jpeg"),
            });
            processedFrames += 1;
            setProgress((processedFrames / totalFrames) * 100); // Atualizar o progresso
            resolve(null);
          };
        });
      }
    }

    setFrames(extractedFrames);
    setIsProcessing(false);
  };

  const downloadFrame = (url: string, index: number) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `frame_${index}.jpg`;
    link.click();
  };

  const calculateGaps = (fields: Intervals) => {
    const totalDuration = videoRef.current?.duration || 0;
    const sortedFields = [...fields].sort((a, b) => a.start - b.start);

    const gaps: { start: number; end: number }[] = [];
    let lastEnd = 0;

    sortedFields.forEach(({ start, end }) => {
      if (start > lastEnd) {
        gaps.push({ start: lastEnd, end: start - 1 });
      }
      lastEnd = Math.max(lastEnd, end);
    });

    if (lastEnd < totalDuration) {
      gaps.push({ start: lastEnd, end: totalDuration });
    }

    return gaps;
  };

  const checkOverlaps = (intervals: Intervals) => {
    const overlaps: string[] = [];
    for (let i = 0; i < intervals.length; i++) {
      for (let j = i + 1; j < intervals.length; j++) {
        if (
          intervals[i].start < intervals[j].end &&
          intervals[i].end > intervals[j].start
        ) {
          overlaps.push(`Interval ${i + 1} overlaps with Interval ${j + 1}`);
        }
      }
    }
    return overlaps;
  };

  const overlaps = checkOverlaps(fields);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(() => console.log("submit"))}
        className="col-span-4 grid grid-cols-4 gap-4"
      >
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              Video Input
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upload Video</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setVideoUrl(URL.createObjectURL(file));
                          field.onChange(e.target.files); // Register the file with react-hook-form
                        } else {
                          field.onChange(null); // Reset if no file is selected
                        }
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Select a video file to extract frames from
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fps"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frames Per Second</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Number of frames to extract per second
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {videoUrl && (
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                className="mt-4 w-full h-auto rounded"
              />
            </CardContent>
          </Card>
        )}

        {videoUrl && (
          <Card className="col-span-1 md:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle>Time Intervals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Header com Labels apenas na primeira linha */}
                <div className="flex gap-4 items-center font-semibold">
                  <div className="w-1/3">
                    <FormLabel>Start Time (s)</FormLabel>
                  </div>
                  <div className="w-1/3">
                    <FormLabel>End Time (s)</FormLabel>
                  </div>
                  <div className="w-1/3">
                    <FormLabel>Class Name</FormLabel>
                  </div>
                </div>

                {/* Campos de input repetidos com botão de delete */}
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-4 items-center">
                    <div className="w-1/3">
                      <FormField
                        control={form.control}
                        name={`intervals.${index}.start`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                step="0.1"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="w-1/3">
                      <FormField
                        control={form.control}
                        name={`intervals.${index}.end`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                step="0.1"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="w-1/3">
                      <FormField
                        control={form.control}
                        name={`intervals.${index}.class`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="button"
                      onClick={() => remove(index)}
                      variant="destructive"
                      className="ml-4"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                color="green"
                onClick={() => handleAddInterval()}
              >
                <Plus className="w-4 h-4" />
                Add Interval
              </Button>
            </CardFooter>
          </Card>
        )}

        {videoUrl && (
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Gaps</CardTitle>
            </CardHeader>
            <CardContent>
              {calculateGaps(fields).map((gap, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center mt-2"
                >
                  <span>
                    Start: {gap.start.toFixed(2)}s - End: {gap.end.toFixed(2)}s
                  </span>
                </div>
              ))}
              {calculateGaps(fields).length === 0 && <p>No gaps available.</p>}
              {overlaps.length > 0 && (
                <p className="text-red-500">
                  Overlaps detected: {overlaps.join(", ")}
                </p>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              {isProcessing ? (
                <progress
                  value={progress}
                  max={100}
                  className="w-full h-4"
                ></progress>
              ) : (
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={isProcessing}
                    onClick={() => extraction(form.getValues())}
                  >
                    Start Extraction
                  </Button>

                  <Button
                    type="button"
                    disabled={frames.length === 0}
                    onClick={async () => {
                      const response = await fetch(`/api/datasets/${dataset.name}/image`, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          images: frames.map((frame) => ({
                            time: frame.time,
                            class: frame.class,
                            dataUrl: frame.url, // Envia a URL Base64 da imagem
                          })),
                        }),
                      });

                      if (response.ok) {
                        alert("Images successfully submitted!");
                      } else {
                        alert("Failed to submit images.");
                      }
                    }}
                  >
                    Submit Extracted Images
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        )}

        {frames.length > 0 && (
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Extracted Frames</CardTitle>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-8 gap-4">
                {frames.map((frame, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <img
                      src={frame.url}
                      alt={`Frame ${index}`}
                      className="rounded-lg max-w-full h-auto"
                    />
                    <p>
                      {frame.time}- {frame.class}
                    </p>
                    <Button
                      className="mt-1"
                      variant="outline"
                      size="sm"
                      onClick={() => downloadFrame(frame.url, index)}
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </Form>
  );
}
