import { supabase } from '@/lib/supabase'
import type { ApiResponse } from '@/types'

const BUCKET_NAME = 'business-assets'

export const storageService = {
  async uploadLogo(
    businessId: string,
    file: File
  ): Promise<ApiResponse<string>> {
    try {
      // Create a unique file name
      const fileExt = file.name.split('.').pop()
      const fileName = `${businessId}/logo.${fileExt}`

      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true, // Overwrite if exists
        })

      if (uploadError) {
        return { data: null, error: uploadError.message }
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName)

      return { data: urlData.publicUrl, error: null }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  },

  async deleteLogo(businessId: string): Promise<ApiResponse<boolean>> {
    try {
      // List files in the business folder
      const { data: files, error: listError } = await supabase.storage
        .from(BUCKET_NAME)
        .list(businessId)

      if (listError) {
        return { data: null, error: listError.message }
      }

      // Delete all logo files
      const logoFiles = files
        .filter((f) => f.name.startsWith('logo'))
        .map((f) => `${businessId}/${f.name}`)

      if (logoFiles.length > 0) {
        const { error: deleteError } = await supabase.storage
          .from(BUCKET_NAME)
          .remove(logoFiles)

        if (deleteError) {
          return { data: null, error: deleteError.message }
        }
      }

      return { data: true, error: null }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  },
}
