-- Crear tabla de leads públicos
CREATE TABLE IF NOT EXISTS public_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "firstName" VARCHAR(255) NOT NULL,
  "lastName" VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  whatsapp VARCHAR(50),
  company VARCHAR(255),
  message TEXT,
  source VARCHAR(50) DEFAULT 'formulario',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  imported BOOLEAN DEFAULT false,
  "importedAt" TIMESTAMP WITH TIME ZONE,
  "projectId" VARCHAR(255)
);

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_public_leads_imported ON public_leads(imported);
CREATE INDEX IF NOT EXISTS idx_public_leads_created ON public_leads("createdAt" DESC);
