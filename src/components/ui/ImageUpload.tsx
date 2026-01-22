import { useRef, useState, useCallback } from 'react'
import { Icon } from './Icon'
import { AppButton } from './AppButton'

interface ImageUploadProps {
  currentImageUrl?: string
  onUpload: (file: File) => Promise<void>
  onRemove?: () => Promise<void>
  isLoading?: boolean
  accept?: string
  maxSizeMB?: number
  label?: string
  placeholder?: string
}

export function ImageUpload({
  currentImageUrl,
  onUpload,
  onRemove,
  isLoading = false,
  accept = 'image/png,image/jpeg,image/webp',
  maxSizeMB = 2,
  label = 'העלאת תמונה',
  placeholder = 'גרור תמונה לכאן או לחץ לבחירה',
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateFile = (file: File): string | null => {
    const acceptedTypes = accept.split(',').map((t) => t.trim())
    if (!acceptedTypes.includes(file.type)) {
      return 'סוג קובץ לא נתמך. השתמש ב-PNG, JPEG או WebP'
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `הקובץ גדול מדי. גודל מקסימלי: ${maxSizeMB}MB`
    }
    return null
  }

  const handleFile = useCallback(
    async (file: File) => {
      setError(null)
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }
      await onUpload(file)
    },
    [onUpload, maxSizeMB, accept]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
    // Reset input so same file can be selected again
    e.target.value = ''
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleClick = () => {
    inputRef.current?.click()
  }

  return (
    <div className="image-upload">
      <label className="image-upload__label">{label}</label>
      
      <div
        className={`image-upload__dropzone ${isDragging ? 'image-upload__dropzone--dragging' : ''} ${currentImageUrl ? 'image-upload__dropzone--has-image' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="image-upload__input"
          disabled={isLoading}
        />

        {isLoading ? (
          <div className="image-upload__loading">
            <div className="spinner" />
            <span>מעלה...</span>
          </div>
        ) : currentImageUrl ? (
          <div className="image-upload__preview">
            <img src={currentImageUrl} alt="תצוגה מקדימה" />
            <div className="image-upload__overlay">
              <Icon name="edit" size="lg" />
              <span>שנה תמונה</span>
            </div>
          </div>
        ) : (
          <div className="image-upload__placeholder">
            <Icon name="cloud_upload" size="xl" />
            <span>{placeholder}</span>
            <span className="image-upload__hint">
              PNG, JPEG או WebP עד {maxSizeMB}MB
            </span>
          </div>
        )}
      </div>

      {error && <p className="image-upload__error">{error}</p>}

      {currentImageUrl && onRemove && (
        <AppButton
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          disabled={isLoading}
          className="image-upload__remove"
        >
          <Icon name="delete" size="sm" />
          הסר לוגו
        </AppButton>
      )}
    </div>
  )
}
