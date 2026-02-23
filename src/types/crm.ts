// Tipos para el CRM Merka 2025

export type PipelineStage = string; // Dinámico

export type LostReason = 
  | 'PRECIO'
  | 'FALTA_CALIDAD'
  | 'FALTA_SEGUIMIENTO'
  | 'NO_APLICAMOS'
  | 'COMPETENCIA'
  | 'SIN_RESPUESTA'
  | 'PRESUPUESTO'
  | 'OTRO';

// Etapas por defecto del pipeline - Lead primero
export const DEFAULT_PIPELINE_STAGES: { key: string; label: string; color: string }[] = [
  { key: 'LEAD', label: 'Lead', color: '#60a5fa' },
  { key: 'PROSPECTO', label: 'Prospecto', color: '#94a3b8' },
  { key: 'PROSPECTO_CALIFICADO', label: 'Prospecto Calificado', color: '#34d399' },
  { key: 'PERSPECTIVA_CALIFICADA', label: 'Perspectiva Calificada', color: '#a78bfa' },
  { key: 'OFERTA_INICIAL_PRESENTADA', label: 'Oferta Inicial', color: '#fbbf24' },
  { key: 'PATROCINADOR_CALIFICADO', label: 'Patrocinador Calificado', color: '#f472b6' },
  { key: 'PATROCINADOR_CON_PODER', label: 'Patrocinador con Poder', color: '#fb923c' },
  { key: 'NEGOCIACION_ACORDADA', label: 'Negociación Acordada', color: '#2dd4bf' },
  { key: 'EN_ESPERA_FORMALIZACION', label: 'En Espera Formalización', color: '#818cf8' },
  { key: 'CONTRATO', label: 'Contrato', color: '#10b981' },
  { key: 'PERDIDA', label: 'Perdida', color: '#ef4444' },
];

export const LOST_REASONS: { key: LostReason; label: string; description: string }[] = [
  { key: 'PRECIO', label: 'Precio Alto', description: 'El cliente consideró el precio muy alto' },
  { key: 'FALTA_CALIDAD', label: 'Falta de Calidad', description: 'El cliente no quedó satisfecho con la calidad' },
  { key: 'FALTA_SEGUIMIENTO', label: 'Falta de Seguimiento', description: 'No se dio seguimiento adecuado al lead' },
  { key: 'NO_APLICAMOS', label: 'No Aplicamos', description: 'No ofrecemos el servicio/producto que necesita' },
  { key: 'COMPETENCIA', label: 'Competencia', description: 'El cliente eligió a la competencia' },
  { key: 'SIN_RESPUESTA', label: 'Sin Respuesta', description: 'El cliente no respondió a los intentos de contacto' },
  { key: 'PRESUPUESTO', label: 'Sin Presupuesto', description: 'El cliente no tiene presupuesto disponible' },
  { key: 'OTRO', label: 'Otro', description: 'Otra razón no especificada' },
];

// Fuentes de leads
export const LEAD_SOURCES: { key: string; label: string; icon: string }[] = [
  { key: 'manual', label: 'Manual', icon: '✏️' },
  { key: 'formulario', label: 'Formulario Web', icon: '🌐' },
  { key: 'whatsapp', label: 'WhatsApp', icon: '📱' },
  { key: 'facebook_organic', label: 'Facebook Orgánico', icon: '📘' },
  { key: 'facebook_ads', label: 'Facebook Ads', icon: '📘💰' },
  { key: 'instagram_organic', label: 'Instagram Orgánico', icon: '📷' },
  { key: 'instagram_ads', label: 'Instagram Ads', icon: '📷💰' },
  { key: 'google_ads', label: 'Google Ads', icon: '🔍💰' },
  { key: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { key: 'referral', label: 'Referido', icon: '🤝' },
  { key: 'website', label: 'Sitio Web', icon: '🌐' },
  { key: 'email', label: 'Email Marketing', icon: '📧' },
  { key: 'event', label: 'Evento/Feria', icon: '🎭' },
  { key: 'other', label: 'Otro', icon: '📌' },
];

// Colores disponibles para etapas
export const STAGE_COLORS = [
  '#60a5fa', '#34d399', '#a78bfa', '#fbbf24', '#f472b6', '#fb923c',
  '#2dd4bf', '#818cf8', '#f87171', '#94a3b8', '#10b981', '#ef4444',
];

export interface PipelineStageConfig {
  key: string;
  label: string;
  color: string;
  order: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  isActive: boolean;
  pipelineStages?: PipelineStageConfig[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomField {
  id: string;
  projectId: string;
  name: string;
  fieldType: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'file';
  options?: string;
  required: boolean;
  order: number;
}

export interface LeadCustomFieldValue {
  id: string;
  leadId: string;
  customFieldId: string;
  value: string;
}

export interface LeadFile {
  id: string;
  name: string;
  type: string;
  data: string;
  uploadedAt: string;
}

export interface Lead {
  id: string;
  projectId: string;
  firstName: string;
  lastName: string;
  company?: string;
  email?: string;
  whatsapp?: string;
  description?: string;
  source: string;
  sourceDetails?: string;
  stage: string;
  lostReason?: LostReason;
  lostNotes?: string;
  lostAt?: string;
  estimatedValue?: number;
  notes?: string;
  lastContactAt?: string;
  nextFollowUpAt?: string;
  createdAt: string;
  updatedAt: string;
  customFieldValues?: LeadCustomFieldValue[];
  files?: LeadFile[];
}

export interface Activity {
  id: string;
  leadId: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'stage_change';
  description: string;
  metadata?: string;
  createdAt: string;
}

export interface LeadWithExtras extends Lead {
  customFieldValues?: LeadCustomFieldValue[];
  activities?: Activity[];
}

export interface CreateLeadInput {
  projectId: string;
  firstName: string;
  lastName: string;
  company?: string;
  email?: string;
  whatsapp?: string;
  description?: string;
  source?: string;
  sourceDetails?: string;
  estimatedValue?: number;
  notes?: string;
  customFields?: { fieldId: string; value: string }[];
}

export interface UpdateLeadInput {
  firstName?: string;
  lastName?: string;
  company?: string;
  email?: string;
  whatsapp?: string;
  description?: string;
  stage?: string;
  lostReason?: LostReason;
  lostNotes?: string;
  estimatedValue?: number;
  notes?: string;
  lastContactAt?: string;
  nextFollowUpAt?: string;
  customFields?: { fieldId: string; value: string }[];
}

// Sistema de usuarios
export type UserRole = 'admin' | 'vendedor' | 'viewer';

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  name: string;
  createdAt: string;
}

export const DEFAULT_USERS: User[] = [
  { id: '1', username: 'migrante', password: 'crm2025', role: 'admin', name: 'Administrador', createdAt: new Date().toISOString() },
];

export const ROLE_PERMISSIONS = {
  admin: {
    label: 'Administrador',
    description: 'Acceso total al sistema',
    canCreateProject: true,
    canEditProject: true,
    canDeleteProject: true,
    canCreateLead: true,
    canEditLead: true,
    canDeleteLead: true,
    canManageUsers: true,
    canViewStats: true,
    canExport: true,
    canImport: true,
  },
  vendedor: {
    label: 'Vendedor',
    description: 'Puede gestionar leads',
    canCreateProject: false,
    canEditProject: false,
    canDeleteProject: false,
    canCreateLead: true,
    canEditLead: true,
    canDeleteLead: false,
    canManageUsers: false,
    canViewStats: true,
    canExport: true,
    canImport: true,
  },
  viewer: {
    label: 'Solo Lectura',
    description: 'Solo puede ver información',
    canCreateProject: false,
    canEditProject: false,
    canDeleteProject: false,
    canCreateLead: false,
    canEditLead: false,
    canDeleteLead: false,
    canManageUsers: false,
    canViewStats: true,
    canExport: false,
    canImport: false,
  },
};
