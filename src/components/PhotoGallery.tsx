import { Camera } from 'lucide-react'

interface PhotoGalleryProps {
  photos: string[]
  alt?: string
}

export function PhotoGallery({ photos, alt = 'Photo' }: PhotoGalleryProps) {
  if (photos.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 bg-background rounded-xl border border-border">
        <div className="flex flex-col items-center gap-2 text-muted">
          <Camera className="w-6 h-6" />
          <span className="text-xs">No photos</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
      {photos.map((url, i) => (
        <img
          key={i}
          src={url}
          alt={`${alt} ${i + 1}`}
          className="w-28 h-28 rounded-xl object-cover shrink-0 border border-border"
        />
      ))}
    </div>
  )
}
