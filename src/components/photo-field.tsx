"use client";

import { Button, Label } from "@heroui/react";
import { IconPhoto, IconX } from "@tabler/icons-react";
import { useId, useRef, useState } from "react";

import { MAX_PHOTOS } from "@/lib/validation";

type Photo = { file: File; previewUrl: string };

type PhotoFieldProps = {
  isDisabled: boolean;
};

export function PhotoField({ isDisabled }: PhotoFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);

  function syncInputFiles(next: Photo[]) {
    const input = inputRef.current;
    if (!input) return;
    const transfer = new DataTransfer();
    for (const photo of next) transfer.items.add(photo.file);
    input.files = transfer.files;
  }

  function handleChange() {
    const files = Array.from(inputRef.current?.files ?? []);
    for (const photo of photos) URL.revokeObjectURL(photo.previewUrl);
    setPhotos(files.map((file) => ({ file, previewUrl: URL.createObjectURL(file) })));
  }

  function removeAt(index: number) {
    URL.revokeObjectURL(photos[index].previewUrl);
    const next = photos.filter((_, i) => i !== index);
    setPhotos(next);
    syncInputFiles(next);
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={inputId}>Photos</Label>
      <p className="text-muted text-sm">Up to {MAX_PHOTOS} photos, JPEG/PNG/WebP, 4 MB each.</p>

      <input
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        disabled={isDisabled}
        id={inputId}
        multiple
        name="photos"
        onChange={handleChange}
        ref={inputRef}
        type="file"
      />

      <div className="flex flex-wrap gap-3">
        {photos.map((photo, index) => (
          <div
            className="border-border rounded-stub relative h-24 w-24 overflow-hidden border"
            key={photo.previewUrl}
          >
            {/* biome-ignore lint/performance/noImgElement: blob: preview URL, next/image cannot fetch it */}
            <img alt="" className="h-full w-full object-cover" src={photo.previewUrl} />
            <button
              aria-label="Remove photo"
              className="bg-background/80 absolute top-1 right-1 rounded-full p-1"
              disabled={isDisabled}
              onClick={() => removeAt(index)}
              type="button"
            >
              <IconX className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {photos.length < MAX_PHOTOS ? (
          <Button
            className="h-24 w-24"
            isDisabled={isDisabled}
            onPress={() => inputRef.current?.click()}
            variant="outline"
          >
            <IconPhoto className="h-6 w-6" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
