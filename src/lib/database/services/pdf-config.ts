// ** import supabase client
import { supabase } from '@/lib/supabase'

// ** import types
import type { PDFConfig } from '@/lib/types'

/**
 * PDF Config service for managing PDF configuration data
 */
export const pdfConfigService = {
  /**
   * Get PDF config by organization
   */
  async getByOrganization(organizationId: string): Promise<PDFConfig | null> {
    const { data, error } = await supabase
      .from('pdf_configs')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data as PDFConfig | null
  },

  /**
   * Upsert PDF config
   */
  async upsert(config: Omit<PDFConfig, 'id' | 'created_at' | 'updated_at'>): Promise<PDFConfig> {
    const { data, error } = await supabase
      .from('pdf_configs')
      .upsert(config, { 
        onConflict: 'organization_id',
        ignoreDuplicates: false 
      })
      .select()
      .single()
    
    if (error) throw error
    return data as PDFConfig
  }
} 