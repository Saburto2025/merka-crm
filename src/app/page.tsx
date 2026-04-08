'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  DEFAULT_PIPELINE_STAGES,
  LOST_REASONS, 
  LEAD_SOURCES,
  STAGE_COLORS,
  DEFAULT_USERS,
  ROLE_PERMISSIONS,
  type Lead, 
  type Project,
  type CustomField,
  type LeadFile,
  type PipelineStageConfig,
  type User,
  type UserRole,
} from '@/types/crm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MessageCircle, Inbox, Copy, Check } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Search,
  Building2,
  Mail,
  MessageCircle,
  MoreVertical,
  Trash2,
  Edit,
  Download,
  Upload,
  FolderPlus,
  Eye,
  ExternalLink,
  Calendar,
  FileText,
  Paperclip,
  X,
  Settings,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Layers,
  CalendarDays,
  FileSpreadsheet,
  FileDown,
  RotateCcw,
  LogIn,
  LogOut,
  Lock,
  User,
  ChevronLeft,
  ArrowLeft,
  ArrowRight,
  ChevronsLeft,
  ChevronsRight,
  Inbox,
  UserPlus,
  Phone,
  BarChart3,
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  PieChart,
} from 'lucide-react';
import { toast } from 'sonner';
import GoogleDriveSync from '@/components/GoogleDriveSync';

// ============= LOCAL STORAGE HELPERS =============
const STORAGE_KEYS = {
  PROJECTS: 'merka-projects',
  LEADS: 'merka-leads',
  CUSTOM_FIELDS: 'merka-custom-fields',
  CURRENT_PROJECT: 'merka-current-project',
  PIPELINE_STAGES: 'merka-pipeline-stages',
  AUTH: 'crm-auth',
  CURRENT_USER: 'crm-current-user',
  USERS: 'crm-users',
};

function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============= LEAD CARD COMPONENT =============
interface LeadCardProps {
  lead: Lead;
  pipelineStages: PipelineStageConfig[];
  onView: (lead: Lead) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (leadId: string) => void;
  onStageChange: (lead: Lead, stage: string) => void;
}

function LeadCard({ lead, pipelineStages, onView, onEdit, onDelete, onStageChange }: LeadCardProps) {
  const currentStage = pipelineStages.find(s => s.key === lead.stage);
  const currentStageIndex = pipelineStages.findIndex(s => s.key === lead.stage);
  const sourceInfo = LEAD_SOURCES.find(s => s.key === lead.source);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Etapas anterior y siguiente para navegación rápida
  const prevStage = currentStageIndex > 0 ? pipelineStages[currentStageIndex - 1] : null;
  const nextStage = currentStageIndex < pipelineStages.length - 1 ? pipelineStages[currentStageIndex + 1] : null;

  return (
    <Card className="group cursor-pointer hover:shadow-md transition-all duration-200 border-l-4" 
      style={{ borderLeftColor: currentStage?.color || '#94a3b8' }}>
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{lead.firstName} {lead.lastName}</h4>
            {lead.company && (
              <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                <Building2 className="h-3 w-3" />{lead.company}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(lead)}><Eye className="h-4 w-4 mr-2" />Ver detalles</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(lead)}><Edit className="h-4 w-4 mr-2" />Editar</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(lead.id)} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" />Eliminar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex flex-wrap gap-1 mt-2">
          {lead.email && <Badge variant="secondary" className="text-xs"><Mail className="h-3 w-3 mr-1" />Email</Badge>}
          {lead.whatsapp && <Badge variant="secondary" className="text-xs"><MessageCircle className="h-3 w-3 mr-1" />WhatsApp</Badge>}
          {lead.files && lead.files.length > 0 && <Badge variant="secondary" className="text-xs"><Paperclip className="h-3 w-3 mr-1" />{lead.files.length}</Badge>}
        </div>
        
        {lead.estimatedValue && <p className="text-xs font-medium text-emerald-600 mt-2">${lead.estimatedValue.toLocaleString()}</p>}
        
        {sourceInfo && (
          <div className="mt-2 flex items-center gap-1">
            <Badge variant="outline" className="text-xs">{sourceInfo.icon} {sourceInfo.label}</Badge>
          </div>
        )}
        
        <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
          <Calendar className="h-3 w-3" />{formatDate(lead.createdAt)}
        </div>
        
        {lead.stage === 'PERDIDA' && lead.lostReason && (
          <div className="mt-2 p-2 bg-red-50 rounded text-xs">
            <p className="font-medium text-red-700">{LOST_REASONS.find(r => r.key === lead.lostReason)?.label}</p>
            {lead.lostNotes && <p className="text-red-600 mt-1 truncate">{lead.lostNotes}</p>}
          </div>
        )}
        
        {/* Selector de etapa simple */}
        {lead.stage !== 'PERDIDA' && (
          <div className="mt-3 pt-2 border-t border-slate-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full text-xs text-slate-500 hover:text-slate-700 flex items-center justify-center gap-1 px-2 py-1.5 rounded hover:bg-slate-50 border border-slate-200">
                  <Layers className="h-3 w-3" />
                  Cambiar etapa...
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                {pipelineStages.filter(s => s.key !== lead.stage).map((stage) => (
                  <DropdownMenuItem key={stage.key} onClick={() => onStageChange(lead, stage.key)}>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: stage.color }} />
                      {stage.label}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============= MAIN COMPONENT =============
export default function MerkaCRM() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(DEFAULT_USERS);

  const [projects, setProjects] = useState<Project[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [pipelineStages, setPipelineStages] = useState<PipelineStageConfig[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);
  
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [editProjectDialogOpen, setEditProjectDialogOpen] = useState(false);
  const [leadDialogOpen, setLeadDialogOpen] = useState(false);
  const [editLeadDialogOpen, setEditLeadDialogOpen] = useState(false);
  const [lostDialogOpen, setLostDialogOpen] = useState(false);
  const [viewLeadDialogOpen, setViewLeadDialogOpen] = useState(false);
  const [customFieldsDialogOpen, setCustomFieldsDialogOpen] = useState(false);
  const [pipelineStagesDialogOpen, setPipelineStagesDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [pendingStageChange, setPendingStageChange] = useState<{ lead: Lead; newStage: string } | null>(null);
  
  // Dashboard y Usuarios
  const [dashboardDialogOpen, setDashboardDialogOpen] = useState(false);
  const [usersDialogOpen, setUsersDialogOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ username: '', password: '', name: '', role: 'vendedor' as UserRole });
  
  const [projectForm, setProjectForm] = useState({ name: '', description: '', color: '#10b981' });
  const [leadForm, setLeadForm] = useState({
    firstName: '', lastName: '', company: '', email: '', whatsapp: '', description: '', source: 'manual', sourceDetails: '', estimatedValue: '', notes: '',
  });
  const [lostForm, setLostForm] = useState({ reason: '', notes: '' });
  const [leadFiles, setLeadFiles] = useState<LeadFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  
  const [exportForm, setExportForm] = useState({
    format: 'csv' as 'csv' | 'xlsx' | 'pdf',
    dateFrom: '',
    dateTo: '',
  });
  
  const [newCustomField, setNewCustomField] = useState({ name: '', fieldType: 'text' as const, options: '', required: false });
  const [editingStage, setEditingStage] = useState<PipelineStageConfig | null>(null);
  const [stageForm, setStageForm] = useState({ label: '', color: '#60a5fa' });
  const pipelineScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
  // Public leads from form
  const [publicLeadsDialogOpen, setPublicLeadsDialogOpen] = useState(false);
  const [publicLeads, setPublicLeads] = useState<any[]>([]);
  const [isLoadingPublicLeads, setIsLoadingPublicLeads] = useState(false);

  // Obtener permisos del usuario actual
  const permissions = currentUser ? ROLE_PERMISSIONS[currentUser.role] : null;

  // Initialize from localStorage
  useEffect(() => {
    // Cargar usuarios
    const savedUsers = getFromStorage<User[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
    setUsers(savedUsers);
    
    // Check if already authenticated
    const savedAuth = getFromStorage<boolean>(STORAGE_KEYS.AUTH, false);
    const savedCurrentUser = getFromStorage<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    
    if (savedAuth && savedCurrentUser) {
      setIsAuthenticated(true);
      setCurrentUser(savedCurrentUser);
    }

    const savedProjects = getFromStorage<Project[]>(STORAGE_KEYS.PROJECTS, []);
    const savedLeads = getFromStorage<Lead[]>(STORAGE_KEYS.LEADS, []);
    const savedCurrentProject = getFromStorage<Project | null>(STORAGE_KEYS.CURRENT_PROJECT, null);
    const savedCustomFields = getFromStorage<CustomField[]>(STORAGE_KEYS.CUSTOM_FIELDS, []);
    const savedPipelineStages = getFromStorage<PipelineStageConfig[]>(STORAGE_KEYS.PIPELINE_STAGES, []);
    
    setProjects(savedProjects);
    setLeads(savedLeads);
    setCustomFields(savedCustomFields);
    
    if (savedPipelineStages.length > 0) {
      const stagesWithOrder = savedPipelineStages.map((s, i) => ({
        ...s,
        order: s.order ?? i
      }));
      setPipelineStages(stagesWithOrder);
    } else {
      const defaultStages = DEFAULT_PIPELINE_STAGES.map((s, i) => ({
        key: s.key,
        label: s.label,
        color: s.color,
        order: i
      }));
      setPipelineStages(defaultStages);
      saveToStorage(STORAGE_KEYS.PIPELINE_STAGES, defaultStages);
    }
    
    if (savedCurrentProject && savedProjects.find(p => p.id === savedCurrentProject.id)) {
      setCurrentProject(savedCurrentProject);
    } else if (savedProjects.length > 0) {
      setCurrentProject(savedProjects[0]);
    }
    
    setIsHydrated(true);
  }, []);

  useEffect(() => { if (isHydrated) saveToStorage(STORAGE_KEYS.PROJECTS, projects); }, [projects, isHydrated]);
  useEffect(() => { if (isHydrated) saveToStorage(STORAGE_KEYS.LEADS, leads); }, [leads, isHydrated]);
  useEffect(() => { if (isHydrated) saveToStorage(STORAGE_KEYS.CURRENT_PROJECT, currentProject); }, [currentProject, isHydrated]);
  useEffect(() => { if (isHydrated) saveToStorage(STORAGE_KEYS.CUSTOM_FIELDS, customFields); }, [customFields, isHydrated]);
  useEffect(() => { if (isHydrated) saveToStorage(STORAGE_KEYS.PIPELINE_STAGES, pipelineStages); }, [pipelineStages, isHydrated]);
  useEffect(() => { if (isHydrated) saveToStorage(STORAGE_KEYS.USERS, users); }, [users, isHydrated]);

  // Auth handlers
  const handleLogin = () => {
    setIsLoggingIn(true);
    setTimeout(() => {
      const user = users.find(u => u.username === loginForm.username && u.password === loginForm.password);
      if (user) {
        setIsAuthenticated(true);
        setCurrentUser(user);
        saveToStorage(STORAGE_KEYS.AUTH, true);
        saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
        setLoginForm({ username: '', password: '' });
        toast.success(`Bienvenido, ${user.name}`);
      } else {
        toast.error('Usuario o contraseña incorrectos');
      }
      setIsLoggingIn(false);
    }, 500);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    saveToStorage(STORAGE_KEYS.AUTH, false);
    saveToStorage(STORAGE_KEYS.CURRENT_USER, null);
    toast.success('Sesión cerrada');
  };

  // User management
  const handleCreateUser = () => {
    if (!newUserForm.username || !newUserForm.password || !newUserForm.name) {
      toast.error('Todos los campos son requeridos');
      return;
    }
    if (users.find(u => u.username === newUserForm.username)) {
      toast.error('El usuario ya existe');
      return;
    }
    const newUser: User = {
      id: generateId(),
      username: newUserForm.username,
      password: newUserForm.password,
      name: newUserForm.name,
      role: newUserForm.role,
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => [...prev, newUser]);
    setNewUserForm({ username: '', password: '', name: '', role: 'vendedor' });
    toast.success('Usuario creado exitosamente');
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === '1') {
      toast.error('No se puede eliminar el usuario administrador principal');
      return;
    }
    if (currentUser?.id === userId) {
      toast.error('No puedes eliminar tu propio usuario');
      return;
    }
    if (!confirm('¿Eliminar este usuario?')) return;
    setUsers(prev => prev.filter(u => u.id !== userId));
    toast.success('Usuario eliminado');
  };

  // Project CRUD
  const handleCreateProject = () => {
    if (!projectForm.name.trim()) { toast.error('El nombre es requerido'); return; }
    const newProject: Project = { id: generateId(), name: projectForm.name, description: projectForm.description || undefined, color: projectForm.color, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    setProjects(prev => [...prev, newProject]);
    setCurrentProject(newProject);
    setProjectDialogOpen(false);
    setProjectForm({ name: '', description: '', color: '#10b981' });
    toast.success('Proyecto creado');
  };

  const handleEditProject = () => {
    if (!selectedProject) return;
    setProjects(prev => prev.map(p => p.id === selectedProject.id ? { ...p, name: projectForm.name, description: projectForm.description || undefined, color: projectForm.color, updatedAt: new Date().toISOString() } : p));
    if (currentProject?.id === selectedProject.id) setCurrentProject({ ...currentProject, name: projectForm.name, description: projectForm.description || undefined, color: projectForm.color });
    setEditProjectDialogOpen(false);
    setSelectedProject(null);
    setProjectForm({ name: '', description: '', color: '#10b981' });
    toast.success('Proyecto actualizado');
  };

  const handleDeleteProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    const leadCount = leads.filter(l => l.projectId === projectId).length;
    if (!confirm(`¿Eliminar "${project?.name}"?\n\nSe eliminarán ${leadCount} leads.`)) return;
    setProjects(prev => prev.filter(p => p.id !== projectId));
    setLeads(prev => prev.filter(l => l.projectId !== projectId));
    if (currentProject?.id === projectId) { const remaining = projects.filter(p => p.id !== projectId); setCurrentProject(remaining.length > 0 ? remaining[0] : null); }
    toast.success('Proyecto eliminado');
  };

  // File handling
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      if (file.type !== 'application/pdf') { toast.error('Solo archivos PDF'); return; }
      if (file.size > 5 * 1024 * 1024) { toast.error('Máximo 5MB'); return; }
      const reader = new FileReader();
      reader.onload = (e) => {
        const newFile: LeadFile = { id: generateId(), name: file.name, type: file.type, data: e.target?.result as string, uploadedAt: new Date().toISOString() };
        setLeadFiles(prev => [...prev, newFile]);
      };
      reader.readAsDataURL(file);
    });
    event.target.value = '';
  };

  const removeFile = (fileId: string) => setLeadFiles(prev => prev.filter(f => f.id !== fileId));

  // Lead CRUD
  const handleCreateLead = () => {
    if (!currentProject) { toast.error('Selecciona un proyecto'); return; }
    if (!leadForm.firstName.trim() || !leadForm.lastName.trim()) { toast.error('Nombre y apellido son requeridos'); return; }
    const firstStage = pipelineStages.find(s => s.key !== 'PERDIDA');
    const newLead: Lead = {
      id: generateId(), projectId: currentProject.id, firstName: leadForm.firstName, lastName: leadForm.lastName,
      company: leadForm.company || undefined, email: leadForm.email || undefined, whatsapp: leadForm.whatsapp || undefined,
      description: leadForm.description || undefined, source: leadForm.source, sourceDetails: leadForm.sourceDetails || undefined,
      estimatedValue: leadForm.estimatedValue ? parseFloat(leadForm.estimatedValue) : undefined, notes: leadForm.notes || undefined,
      stage: firstStage?.key || 'LEAD', files: leadFiles.length > 0 ? leadFiles : undefined,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    setLeads(prev => [...prev, newLead]);
    setLeadDialogOpen(false);
    setLeadForm({ firstName: '', lastName: '', company: '', email: '', whatsapp: '', description: '', source: 'manual', sourceDetails: '', estimatedValue: '', notes: '' });
    setLeadFiles([]);
    toast.success('Lead creado');
  };

  const handleEditLead = () => {
    if (!selectedLead) return;
    setLeads(prev => prev.map(lead => lead.id === selectedLead.id ? { ...lead, ...leadForm, estimatedValue: leadForm.estimatedValue ? parseFloat(leadForm.estimatedValue) : undefined, files: leadFiles.length > 0 ? leadFiles : lead.files, updatedAt: new Date().toISOString() } : lead));
    setEditLeadDialogOpen(false);
    setSelectedLead(null);
    setLeadFiles([]);
    toast.success('Lead actualizado');
  };

  const handleStageChange = (lead: Lead, newStage: string) => {
    if (newStage === 'PERDIDA') {
      setPendingStageChange({ lead, newStage });
      setLostDialogOpen(true);
    } else {
      setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, stage: newStage, updatedAt: new Date().toISOString() } : l));
      toast.success('Etapa actualizada');
    }
  };

  const handleConfirmLost = () => {
    if (!pendingStageChange || !lostForm.reason) { toast.error('Selecciona una razón'); return; }
    setLeads(prev => prev.map(l => l.id === pendingStageChange.lead.id ? { ...l, stage: 'PERDIDA', lostReason: lostForm.reason as any, lostNotes: lostForm.notes || undefined, lostAt: new Date().toISOString(), updatedAt: new Date().toISOString() } : l));
    setLostDialogOpen(false);
    setLostForm({ reason: '', notes: '' });
    setPendingStageChange(null);
    toast.success('Lead marcado como perdido');
  };

  const handleDeleteLead = (leadId: string) => {
    if (!confirm('¿Eliminar este lead?')) return;
    setLeads(prev => prev.filter(l => l.id !== leadId));
    toast.success('Lead eliminado');
  };

  // Public Leads Management - MODIFICADO PARA MULTI-NEGOCIO
  const fetchPublicLeads = async () => {
    setIsLoadingPublicLeads(true);
    try {
      // 1. Obtenemos el ID del negocio que configuramos en la PC (ej. Seguros-Lafise)
      const businessId = typeof window !== 'undefined' 
        ? localStorage.getItem('crm_user_id') || 'general' 
        : 'general';

      // 2. Pedimos a la API los leads filtrando por ese negocio específico
      const response = await fetch(`/api/public/lead?b=${businessId}&imported=false`);
      const data = await response.json();
      
      // 3. También leer de localStorage (respaldo local)
      const localLeads = getFromStorage<any[]>('merka-public-leads', []);
      const importedLeadIds = getFromStorage<string[]>('merka-imported-lead-ids', []);
      const unimportedLocalLeads = localLeads.filter(l => !importedLeadIds.includes(l.id));
      
      // 4. Combinar leads (API + Locales)
      const allLeads = [...(data.leads || []), ...unimportedLocalLeads];
      
      // 5. Remover duplicados
      const uniqueLeads = allLeads.filter((lead, index, self) => 
        index === self.findIndex(l => l.id === lead.id)
      );

      // Aquí deberías tener una línea como setPublicLeads(uniqueLeads) o similar
      setPublicLeads(uniqueLeads);

    } catch (error) {
      console.error("Error al cargar leads públicos:", error);
    } finally {
      setIsLoadingPublicLeads(false);
    }
  };
      
      setPublicLeads(uniqueLeads);
    } catch (error) {
      // Si falla la API, solo leer de localStorage
      const localLeads = getFromStorage<any[]>('merka-public-leads', []);
      const importedLeadIds = getFromStorage<string[]>('merka-imported-lead-ids', []);
      const unimportedLocalLeads = localLeads.filter(l => !importedLeadIds.includes(l.id));
      setPublicLeads(unimportedLocalLeads);
    } finally {
      setIsLoadingPublicLeads(false);
    }
  };

  const handleImportPublicLead = async (publicLead: any) => {
    if (!currentProject) {
      toast.error('Selecciona un proyecto primero');
      return;
    }

    const firstStage = pipelineStages.find(s => s.key !== 'PERDIDA');
    
    // Crear el lead en el CRM
    const newLead: Lead = {
      id: generateId(),
      projectId: currentProject.id,
      firstName: publicLead.firstName,
      lastName: publicLead.lastName,
      email: publicLead.email || undefined,
      whatsapp: publicLead.whatsapp || undefined,
      company: publicLead.company || undefined,
      description: publicLead.message || undefined,
      source: 'formulario' as any,
      stage: firstStage?.key || 'LEAD',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setLeads(prev => [...prev, newLead]);

    // Marcar como importado en localStorage
    const importedIds = getFromStorage<string[]>('merka-imported-lead-ids', []);
    saveToStorage('merka-imported-lead-ids', [...importedIds, publicLead.id]);

    // Intentar marcar en la base de datos también
    try {
      await fetch(`/api/public/lead/${publicLead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imported: true }),
      });
    } catch (error) {
      console.error('Error marking lead as imported in DB:', error);
    }

    // Remover de la lista local
    setPublicLeads(prev => prev.filter(l => l.id !== publicLead.id));
    toast.success(`Lead "${publicLead.firstName} ${publicLead.lastName}" importado`);
  };

  const handleImportAllPublicLeads = async () => {
    if (!currentProject) {
      toast.error('Selecciona un proyecto primero');
      return;
    }

    const firstStage = pipelineStages.find(s => s.key !== 'PERDIDA');
    let imported = 0;
    const newImportedIds: string[] = [];

    for (const publicLead of publicLeads) {
      const newLead: Lead = {
        id: generateId(),
        projectId: currentProject.id,
        firstName: publicLead.firstName,
        lastName: publicLead.lastName,
        email: publicLead.email || undefined,
        whatsapp: publicLead.whatsapp || undefined,
        company: publicLead.company || undefined,
        description: publicLead.message || undefined,
        source: 'formulario' as any,
        stage: firstStage?.key || 'LEAD',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setLeads(prev => [...prev, newLead]);
      newImportedIds.push(publicLead.id);
      imported++;
    }

    // Marcar todos como importados en localStorage
    const existingImportedIds = getFromStorage<string[]>('merka-imported-lead-ids', []);
    saveToStorage('merka-imported-lead-ids', [...existingImportedIds, ...newImportedIds]);

    setPublicLeads([]);
    toast.success(`${imported} leads importados al CRM`);
  };

  // Pipeline Stages Management
  const handleMoveStageUp = (index: number) => {
    if (index <= 0) return;
    const newStages = [...pipelineStages];
    [newStages[index - 1], newStages[index]] = [newStages[index], newStages[index - 1]];
    newStages.forEach((s, i) => s.order = i);
    setPipelineStages([...newStages]);
  };

  const handleMoveStageDown = (index: number) => {
    if (index >= pipelineStages.length - 1) return;
    const newStages = [...pipelineStages];
    [newStages[index], newStages[index + 1]] = [newStages[index + 1], newStages[index]];
    newStages.forEach((s, i) => s.order = i);
    setPipelineStages([...newStages]);
  };

  const handleAddStage = () => {
    const newStage: PipelineStageConfig = {
      key: generateId(),
      label: 'Nueva Etapa',
      color: STAGE_COLORS[pipelineStages.length % STAGE_COLORS.length],
      order: pipelineStages.length,
    };
    setPipelineStages(prev => [...prev, newStage]);
    toast.success('Etapa agregada');
  };

  const handleEditStage = (stage: PipelineStageConfig) => {
    setEditingStage(stage);
    setStageForm({ label: stage.label, color: stage.color });
  };

  const handleSaveStage = () => {
    if (!editingStage) return;
    setPipelineStages(prev => prev.map(s => s.key === editingStage.key ? { ...s, label: stageForm.label, color: stageForm.color } : s));
    setEditingStage(null);
    setStageForm({ label: '', color: '#60a5fa' });
    toast.success('Etapa actualizada');
  };

  const handleDeleteStage = (stageKey: string) => {
    if (pipelineStages.length <= 2) {
      toast.error('Debe haber al menos 2 etapas');
      return;
    }
    if (!confirm('¿Eliminar esta etapa? Los leads en esta etapa se moverán a la primera.')) return;
    const firstStage = pipelineStages.find(s => s.key !== stageKey);
    setLeads(prev => prev.map(l => l.stage === stageKey ? { ...l, stage: firstStage?.key || pipelineStages[0].key } : l));
    setPipelineStages(prev => prev.filter(s => s.key !== stageKey));
    toast.success('Etapa eliminada');
  };

  const handleResetStages = () => {
    if (!confirm('¿Restablecer etapas a valores por defecto? Esto NO afectará tus leads existentes.')) return;
    const defaultStages = DEFAULT_PIPELINE_STAGES.map((s, i) => ({
      key: s.key,
      label: s.label,
      color: s.color,
      order: i
    }));
    setPipelineStages(defaultStages);
    toast.success('Etapas restablecidas a valores por defecto');
  };

  const handleClearAllData = () => {
    if (!confirm('⚠️ ADVERTENCIA: Esto eliminará TODOS los datos guardados (proyectos, leads, campos personalizados).\n\n¿Estás seguro?')) return;
    if (!confirm('¿REALMENTE quieres borrar todo? Esta acción no se puede deshacer.')) return;
    Object.values(STORAGE_KEYS).forEach(key => { localStorage.removeItem(key); });
    setProjects([]);
    setLeads([]);
    setCustomFields([]);
    setCurrentProject(null);
    setPipelineStages(DEFAULT_PIPELINE_STAGES.map((s, i) => ({ key: s.key, label: s.label, color: s.color, order: i })));
    setPipelineStagesDialogOpen(false);
    toast.success('Todos los datos han sido eliminados.');
  };

  // Google Drive sync handlers
  const handleGoogleDriveLoad = (data: {
    projects?: unknown[];
    leads?: unknown[];
    customFields?: unknown[];
    pipelineStages?: unknown[];
  }) => {
    if (data.projects && Array.isArray(data.projects)) {
      setProjects(data.projects as Project[]);
      saveToStorage(STORAGE_KEYS.PROJECTS, data.projects);
    }
    if (data.leads && Array.isArray(data.leads)) {
      setLeads(data.leads as Lead[]);
      saveToStorage(STORAGE_KEYS.LEADS, data.leads);
    }
    if (data.customFields && Array.isArray(data.customFields)) {
      setCustomFields(data.customFields as CustomField[]);
      saveToStorage(STORAGE_KEYS.CUSTOM_FIELDS, data.customFields);
    }
    if (data.pipelineStages && Array.isArray(data.pipelineStages)) {
      const stages = (data.pipelineStages as PipelineStageConfig[]).map((s, i) => ({
        ...s,
        order: s.order ?? i
      }));
      setPipelineStages(stages);
      saveToStorage(STORAGE_KEYS.PIPELINE_STAGES, stages);
    }
    // Set current project
    if (data.projects && Array.isArray(data.projects) && data.projects.length > 0) {
      const firstProject = data.projects[0] as Project;
      setCurrentProject(firstProject);
      saveToStorage(STORAGE_KEYS.CURRENT_PROJECT, firstProject);
    }
  };

  const getGoogleDriveData = () => ({
    projects,
    leads,
    customFields,
    pipelineStages,
  });

  // Custom fields
  const handleCreateCustomField = () => {
    if (!newCustomField.name.trim()) { toast.error('El nombre es requerido'); return; }
    const field: CustomField = { id: generateId(), projectId: currentProject?.id || '', name: newCustomField.name, fieldType: newCustomField.fieldType, options: newCustomField.fieldType === 'select' ? newCustomField.options : undefined, required: newCustomField.required, order: customFields.length };
    setCustomFields(prev => [...prev, field]);
    setNewCustomField({ name: '', fieldType: 'text', options: '', required: false });
    toast.success('Campo creado');
  };

  const handleDeleteCustomField = (fieldId: string) => {
    setCustomFields(prev => prev.filter(f => f.id !== fieldId));
    toast.success('Campo eliminado');
  };

  // Import from file
  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const fileName = file.name.toLowerCase();
    
    try {
      if (fileName.endsWith('.json')) {
        const text = await file.text();
        const data = JSON.parse(text);
        if (data.projects) setProjects(data.projects);
        if (data.leads) setLeads(data.leads);
        if (data.customFields) setCustomFields(data.customFields);
        if (data.pipelineStages) setPipelineStages(data.pipelineStages.map((s: PipelineStageConfig, i: number) => ({ ...s, order: s.order ?? i })));
        if (data.projects?.length > 0) setCurrentProject(data.projects[0]);
        toast.success('Datos importados');
      } else if (fileName.endsWith('.csv')) {
        const text = await file.text();
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length < 2) { toast.error('Archivo CSV vacío'); return; }
        
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
        const firstNameIdx = headers.findIndex(h => h.includes('nombre') || h.includes('first'));
        const lastNameIdx = headers.findIndex(h => h.includes('apellido') || h.includes('last'));
        const emailIdx = headers.findIndex(h => h.includes('email') || h.includes('correo'));
        const phoneIdx = headers.findIndex(h => h.includes('phone') || h.includes('whatsapp') || h.includes('tel'));
        const companyIdx = headers.findIndex(h => h.includes('empresa') || h.includes('company'));
        const valueIdx = headers.findIndex(h => h.includes('valor') || h.includes('value') || h.includes('monto'));
        
        let imported = 0;
        const firstStage = pipelineStages.find(s => s.key !== 'PERDIDA');
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
          if (values.length > 0) {
            const firstName = values[firstNameIdx >= 0 ? firstNameIdx : 0];
            const lastName = values[lastNameIdx >= 0 ? lastNameIdx : 1] || '';
            if (firstName) {
              const newLead: Lead = {
                id: generateId(), projectId: currentProject?.id || '', firstName, lastName,
                email: emailIdx >= 0 ? values[emailIdx] : undefined,
                whatsapp: phoneIdx >= 0 ? values[phoneIdx] : undefined,
                company: companyIdx >= 0 ? values[companyIdx] : undefined,
                estimatedValue: valueIdx >= 0 ? parseFloat(values[valueIdx]) || undefined : undefined,
                source: 'manual', stage: firstStage?.key || 'LEAD',
                createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
              };
              setLeads(prev => [...prev, newLead]);
              imported++;
            }
          }
        }
        toast.success(`Importados ${imported} leads`);
      } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        const XLSX = await import('xlsx');
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[];
        
        let imported = 0;
        const firstStage = pipelineStages.find(s => s.key !== 'PERDIDA');
        
        for (const row of jsonData) {
          const keys = Object.keys(row).map(k => k.toLowerCase());
          const firstNameKey = keys.find(k => k.includes('nombre') || k.includes('first')) || keys[0];
          const lastNameKey = keys.find(k => k.includes('apellido') || k.includes('last')) || keys[1];
          const emailKey = keys.find(k => k.includes('email'));
          const phoneKey = keys.find(k => k.includes('phone') || k.includes('whatsapp'));
          const companyKey = keys.find(k => k.includes('empresa') || k.includes('company'));
          const valueKey = keys.find(k => k.includes('valor') || k.includes('value'));
          
          const firstName = String(row[firstNameKey] || '');
          if (firstName) {
            const newLead: Lead = {
              id: generateId(), projectId: currentProject?.id || '', firstName,
              lastName: String(row[lastNameKey] || ''),
              email: emailKey ? String(row[emailKey] || '') : undefined,
              whatsapp: phoneKey ? String(row[phoneKey] || '') : undefined,
              company: companyKey ? String(row[companyKey] || '') : undefined,
              estimatedValue: valueKey ? parseFloat(String(row[valueKey])) || undefined : undefined,
              source: 'manual', stage: firstStage?.key || 'LEAD',
              createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
            };
            setLeads(prev => [...prev, newLead]);
            imported++;
          }
        }
        toast.success(`Importados ${imported} leads desde Excel`);
      } else {
        toast.error('Formato no soportado. Use CSV, Excel o JSON');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Error al importar archivo');
    }
    event.target.value = '';
  };

  // Export
  const handleExport = async () => {
    if (!currentProject) return;
    
    let projectLeads = leads.filter(l => l.projectId === currentProject.id);
    
    if (exportForm.dateFrom) {
      const fromDate = new Date(exportForm.dateFrom);
      projectLeads = projectLeads.filter(l => new Date(l.createdAt) >= fromDate);
    }
    if (exportForm.dateTo) {
      const toDate = new Date(exportForm.dateTo);
      toDate.setHours(23, 59, 59);
      projectLeads = projectLeads.filter(l => new Date(l.createdAt) <= toDate);
    }
    
    if (projectLeads.length === 0) {
      toast.error('No hay leads para exportar');
      return;
    }

    const formatDate = (d: string) => new Date(d).toLocaleDateString('es-ES');
    const stageLabel = (key: string) => pipelineStages.find(s => s.key === key)?.label || key;
    const sourceLabel = (key: string) => LEAD_SOURCES.find(s => s.key === key)?.label || key;

    try {
      if (exportForm.format === 'csv') {
        const headers = ['Nombre', 'Apellido', 'Empresa', 'Email', 'WhatsApp', 'Etapa', 'Valor', 'Fuente', 'Creado', 'Notas'];
        const rows = projectLeads.map(l => [l.firstName, l.lastName, l.company || '', l.email || '', l.whatsapp || '', stageLabel(l.stage), l.estimatedValue?.toString() || '', sourceLabel(l.source), formatDate(l.createdAt), l.notes || '']);
        const csv = [headers, ...rows].map(row => row.map(c => `"${c}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `merka-leads-${currentProject.name}-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('CSV exportado');
      } else if (exportForm.format === 'xlsx') {
        const XLSX = await import('xlsx');
        const data = projectLeads.map(l => ({
          Nombre: l.firstName, Apellido: l.lastName, Empresa: l.company || '',
          Email: l.email || '', WhatsApp: l.whatsapp || '', Etapa: stageLabel(l.stage),
          Valor: l.estimatedValue || 0, Fuente: sourceLabel(l.source),
          Creado: formatDate(l.createdAt), Notas: l.notes || '',
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Leads');
        XLSX.writeFile(wb, `merka-leads-${currentProject.name}-${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success('Excel exportado');
      } else if (exportForm.format === 'pdf') {
        const { jsPDF } = await import('jspdf');
        await import('jspdf-autotable');
        
        const doc = new jsPDF('landscape');
        doc.setFontSize(18);
        doc.text(`Merka CRM - ${currentProject.name}`, 14, 22);
        doc.setFontSize(10);
        doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')} | Total: ${projectLeads.length} leads`, 14, 30);
        
        const tableData = projectLeads.map(l => [
          `${l.firstName} ${l.lastName}`, l.company || '-', l.email || '-', l.whatsapp || '-',
          stageLabel(l.stage), l.estimatedValue ? `$${l.estimatedValue.toLocaleString()}` : '-',
          sourceLabel(l.source), formatDate(l.createdAt),
        ]);
        
        (doc as any).autoTable({
          head: [['Nombre', 'Empresa', 'Email', 'WhatsApp', 'Etapa', 'Valor', 'Fuente', 'Creado']],
          body: tableData, startY: 35,
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [16, 185, 129] },
        });
        
        doc.save(`merka-leads-${currentProject.name}-${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success('PDF exportado');
      }
      setExportDialogOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Error al exportar');
    }
  };

  const handleViewLead = (lead: Lead) => { setSelectedLead(lead); setViewLeadDialogOpen(true); };
  const handleEditLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setLeadForm({
      firstName: lead.firstName, lastName: lead.lastName, company: lead.company || '', email: lead.email || '',
      whatsapp: lead.whatsapp || '', description: lead.description || '', source: lead.source, sourceDetails: lead.sourceDetails || '',
      estimatedValue: lead.estimatedValue?.toString() || '', notes: lead.notes || '',
    });
    setLeadFiles(lead.files || []);
    setEditLeadDialogOpen(true);
  };

  const filteredLeads = leads.filter(lead => {
    if (currentProject && lead.projectId !== currentProject.id) return false;
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return lead.firstName.toLowerCase().includes(query) || lead.lastName.toLowerCase().includes(query) || lead.company?.toLowerCase().includes(query) || lead.email?.toLowerCase().includes(query);
  });

  const leadsByStage = pipelineStages.reduce((acc, stage) => {
    acc[stage.key] = filteredLeads.filter(lead => lead.stage === stage.key);
    return acc;
  }, {} as Record<string, Lead[]>);

  const totalPipelineValue = filteredLeads.filter(l => l.stage !== 'PERDIDA').reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4" />
          <p className="text-slate-500">Cargando CRM MIGRANTE...</p>
        </div>
      </div>
    );
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">CRM MIGRANTE</h1>
              <p className="text-slate-500 mt-1">Ingresa tus credenciales para acceder</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Ingresa tu usuario"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    className="pl-10"
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="pl-10"
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>
              </div>

              <Button
                onClick={handleLogin}
                disabled={isLoggingIn || !loginForm.username || !loginForm.password}
                className="w-full bg-emerald-600 hover:bg-emerald-700 h-11"
              >
                {isLoggingIn ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <LogIn className="h-4 w-4 mr-2" />
                )}
                Iniciar Sesión
              </Button>
            </div>

            <p className="text-xs text-slate-400 text-center mt-6">
              v5.2-GDRIVE • Sistema seguro
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-full mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">CRM MIGRANTE <span className="text-xs text-emerald-500 font-normal">v5.2-GDRIVE</span></h1>
                <p className="text-xs text-slate-500">Sistema de gestión de leads y ventas</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-48 justify-between">
                    <div className="flex items-center gap-2">
                      {currentProject ? (
                        <><div className="h-2 w-2 rounded-full" style={{ backgroundColor: currentProject.color }} /><span className="truncate">{currentProject.name}</span></>
                      ) : <span className="text-slate-400">Seleccionar proyecto</span>}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm font-medium text-slate-500">Proyectos ({projects.length})</div>
                  <DropdownMenuSeparator />
                  {projects.map((project) => (
                    <DropdownMenuItem key={project.id} onClick={() => setCurrentProject(project)} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: project.color }} />
                        <span className={currentProject?.id === project.id ? 'font-medium' : ''}>{project.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); setSelectedProject(project); setProjectForm({ name: project.name, description: project.description || '', color: project.color }); setEditProjectDialogOpen(true); }}><Edit className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id); }}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </DropdownMenuItem>
                  ))}
                  {projects.length === 0 && <div className="px-2 py-4 text-center text-sm text-slate-400">No hay proyectos</div>}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setProjectDialogOpen(true)}><FolderPlus className="h-4 w-4 mr-2" />Nuevo Proyecto</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Google Drive Sync */}
              <GoogleDriveSync
                onDataLoad={handleGoogleDriveLoad}
                getData={getGoogleDriveData}
              />

              <Button
                size="sm"
                variant="outline"
                onClick={handleLogout}
                className="text-red-500 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-slate-200 px-4 py-2">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Buscar leads..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <input type="file" ref={importInputRef} accept=".csv,.xlsx,.xls,.json" onChange={handleImportFile} className="hidden" />
            
            {/* Botón Dashboard */}
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setDashboardDialogOpen(true)}
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Dashboard
            </Button>
            
            {/* Botón Leads del Formulario */}
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => { fetchPublicLeads(); setPublicLeadsDialogOpen(true); }}
              className="relative"
            >
              <Inbox className="h-4 w-4 mr-1" />
              Formulario
              {publicLeads.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {publicLeads.length}
                </span>
              )}
            </Button>
            
            <Button size="sm" variant="outline" onClick={() => importInputRef.current?.click()} disabled={!currentProject || !permissions?.canImport}>
              <Upload className="h-4 w-4 mr-1" />Importar
            </Button>
            
            <Button size="sm" variant="outline" onClick={() => setExportDialogOpen(true)} disabled={!currentProject || !permissions?.canExport}>
              <Download className="h-4 w-4 mr-1" />Exportar
            </Button>
            
            <Button size="sm" variant="outline" onClick={() => setPipelineStagesDialogOpen(true)}>
              <Layers className="h-4 w-4 mr-1" />Etapas
            </Button>
            
            <Button size="sm" variant="outline" onClick={() => setCustomFieldsDialogOpen(true)} disabled={!currentProject}>
              <Settings className="h-4 w-4 mr-1" />Campos
            </Button>
            
            {/* Botón Usuarios - Solo Admin */}
            {permissions?.canManageUsers && (
              <Button size="sm" variant="outline" onClick={() => setUsersDialogOpen(true)}>
                <Users className="h-4 w-4 mr-1" />Usuarios
              </Button>
            )}

            <Button size="sm" onClick={() => { setLeadForm({ firstName: '', lastName: '', company: '', email: '', whatsapp: '', description: '', source: 'manual', sourceDetails: '', estimatedValue: '', notes: '' }); setLeadFiles([]); setLeadDialogOpen(true); }} disabled={!currentProject || !permissions?.canCreateLead} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-1" />Nuevo Lead
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-slate-200 px-4 py-2">
        <div className="flex items-center gap-6 text-sm flex-wrap">
          <div className="flex items-center gap-2"><span className="text-slate-500">Total:</span><Badge variant="secondary">{filteredLeads.length}</Badge></div>
          <div className="flex items-center gap-2"><span className="text-slate-500">Activos:</span><Badge className="bg-emerald-100 text-emerald-700">{filteredLeads.filter(l => l.stage !== 'PERDIDA').length}</Badge></div>
          <div className="flex items-center gap-2"><span className="text-slate-500">Valor:</span><Badge className="bg-blue-100 text-blue-700">${totalPipelineValue.toLocaleString()}</Badge></div>
          <div className="flex items-center gap-2"><span className="text-slate-500">Perdidos:</span><Badge className="bg-red-100 text-red-700">{filteredLeads.filter(l => l.stage === 'PERDIDA').length}</Badge></div>
        </div>
      </div>

      <main className="flex-1 overflow-hidden relative">
        {!currentProject ? (
          <div className="h-full flex items-center justify-center">
            <Card className="max-w-md mx-4">
              <CardContent className="pt-6 text-center">
                <FolderPlus className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No hay proyectos</h3>
                <p className="text-slate-500 mb-4">Crea tu primer proyecto para comenzar</p>
                <Button onClick={() => setProjectDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700"><FolderPlus className="h-4 w-4 mr-2" />Crear Proyecto</Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="relative h-full">
            {/* Barra de navegación del Pipeline */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-white/95 backdrop-blur rounded-full shadow-lg px-3 py-1.5 border border-slate-200">
              {/* Ir al inicio */}
              <button
                onClick={() => {
                  if (pipelineScrollRef.current) {
                    pipelineScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                  }
                }}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                title="Ir al inicio"
              >
                <ChevronsLeft className="h-5 w-5 text-slate-600" />
              </button>
              
              {/* Desplazar izquierda */}
              <button
                onClick={() => {
                  if (pipelineScrollRef.current) {
                    pipelineScrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
                  }
                }}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                title="Mover a la izquierda"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600" />
              </button>
              
              {/* Indicador de etapas */}
              <div className="px-3 text-xs text-slate-500 font-medium">
                {pipelineStages.length} etapas
              </div>
              
              {/* Desplazar derecha */}
              <button
                onClick={() => {
                  if (pipelineScrollRef.current) {
                    pipelineScrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
                  }
                }}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                title="Mover a la derecha"
              >
                <ArrowRight className="h-5 w-5 text-slate-600" />
              </button>
              
              {/* Ir al final */}
              <button
                onClick={() => {
                  if (pipelineScrollRef.current) {
                    pipelineScrollRef.current.scrollTo({ left: pipelineScrollRef.current.scrollWidth, behavior: 'smooth' });
                  }
                }}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                title="Ir al final"
              >
                <ChevronsRight className="h-5 w-5 text-slate-600" />
              </button>
            </div>
            
            <div 
              ref={pipelineScrollRef}
              className="h-full overflow-x-auto overflow-y-auto p-4"
            >
              <div className="flex gap-4 pb-4" style={{ minWidth: 'max-content' }}>
                  {pipelineStages.map((stage) => (
                    <div key={stage.key} className="w-72 flex-shrink-0">
                      <div className="rounded-t-lg p-3 flex items-center justify-between" style={{ backgroundColor: `${stage.color}20` }}>
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: stage.color }} />
                          <h3 className="font-medium text-sm" style={{ color: stage.color }}>{stage.label}</h3>
                        </div>
                        <Badge variant="secondary" className="text-xs" style={{ backgroundColor: `${stage.color}30`, color: stage.color }}>{leadsByStage[stage.key]?.length || 0}</Badge>
                      </div>
                      <div className="rounded-b-lg p-2 min-h-[200px] space-y-2" style={{ backgroundColor: `${stage.color}05` }}>
                        {leadsByStage[stage.key]?.map((lead) => (
                          <LeadCard key={lead.id} lead={lead} pipelineStages={pipelineStages} onView={handleViewLead} onEdit={handleEditLeadClick} onDelete={handleDeleteLead} onStageChange={handleStageChange} />
                        ))}
                        {leadsByStage[stage.key]?.length === 0 && <div className="text-center py-8 text-slate-400 text-sm">Sin leads</div>}
                      </div>
                    </div>
                  ))}
                </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 px-4 py-3 mt-auto">
        <div className="flex items-center justify-between text-sm text-slate-500 flex-wrap gap-2">
          <p>Merka CRM 2025 - Datos guardados localmente</p>
          <p>WhatsApp: <a href="https://wa.me/50664498045" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline flex items-center gap-1"><MessageCircle className="h-4 w-4" />+506 6449 8045<ExternalLink className="h-3 w-3" /></a></p>
        </div>
      </footer>

      {/* Dialog: Nuevo Proyecto */}
      <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Crear Proyecto</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Nombre *</Label><Input value={projectForm.name} onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })} placeholder="Mi Empresa" /></div>
            <div className="space-y-2"><Label>Descripción</Label><Textarea value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} rows={2} /></div>
            <div className="space-y-2"><Label>Color</Label><div className="flex gap-2">{['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'].map((color) => (<button key={color} type="button" onClick={() => setProjectForm({ ...projectForm, color })} className={`h-8 w-8 rounded-full ${projectForm.color === color ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`} style={{ backgroundColor: color }} />))}</div></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setProjectDialogOpen(false)}>Cancelar</Button><Button onClick={handleCreateProject} className="bg-emerald-600 hover:bg-emerald-700">Crear</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Editar Proyecto */}
      <Dialog open={editProjectDialogOpen} onOpenChange={setEditProjectDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Proyecto</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Nombre *</Label><Input value={projectForm.name} onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Descripción</Label><Textarea value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} rows={2} /></div>
            <div className="space-y-2"><Label>Color</Label><div className="flex gap-2">{['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'].map((color) => (<button key={color} type="button" onClick={() => setProjectForm({ ...projectForm, color })} className={`h-8 w-8 rounded-full ${projectForm.color === color ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`} style={{ backgroundColor: color }} />))}</div></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setEditProjectDialogOpen(false)}>Cancelar</Button><Button onClick={handleEditProject} className="bg-emerald-600 hover:bg-emerald-700">Guardar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Nuevo/Editar Lead */}
      <Dialog open={leadDialogOpen || editLeadDialogOpen} onOpenChange={(open) => { if (!open) { setLeadDialogOpen(false); setEditLeadDialogOpen(false); setLeadFiles([]); }}}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editLeadDialogOpen ? 'Editar Lead' : 'Nuevo Lead'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nombre *</Label><Input value={leadForm.firstName} onChange={(e) => setLeadForm({ ...leadForm, firstName: e.target.value })} /></div>
              <div className="space-y-2"><Label>Apellido *</Label><Input value={leadForm.lastName} onChange={(e) => setLeadForm({ ...leadForm, lastName: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Empresa</Label><Input value={leadForm.company} onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={leadForm.email} onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })} /></div>
              <div className="space-y-2"><Label>WhatsApp</Label><Input value={leadForm.whatsapp} onChange={(e) => setLeadForm({ ...leadForm, whatsapp: e.target.value })} placeholder="+506 0000 0000" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Origen del Lead</Label>
                <Select value={leadForm.source} onValueChange={(value) => setLeadForm({ ...leadForm, source: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{LEAD_SOURCES.map((s) => (<SelectItem key={s.key} value={s.key}>{s.icon} {s.label}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Valor Estimado ($)</Label><Input type="number" value={leadForm.estimatedValue} onChange={(e) => setLeadForm({ ...leadForm, estimatedValue: e.target.value })} /></div>
            </div>
            {['facebook_ads', 'instagram_ads', 'google_ads', 'referral', 'other'].includes(leadForm.source) && (
              <div className="space-y-2"><Label>Detalles del origen</Label><Input value={leadForm.sourceDetails} onChange={(e) => setLeadForm({ ...leadForm, sourceDetails: e.target.value })} placeholder="Ej: Campaña verano 2024" /></div>
            )}
            <div className="space-y-2"><Label>Descripción</Label><Textarea value={leadForm.description} onChange={(e) => setLeadForm({ ...leadForm, description: e.target.value })} rows={2} /></div>
            <div className="space-y-2"><Label>Notas</Label><Textarea value={leadForm.notes} onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })} rows={2} /></div>
            
            <div className="space-y-2">
              <Label>Archivos PDF (Cotizaciones)</Label>
              <input type="file" ref={fileInputRef} accept=".pdf" multiple onChange={handleFileUpload} className="hidden" />
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}><Upload className="h-4 w-4 mr-2" />Subir PDF</Button>
              {leadFiles.length > 0 && (
                <div className="space-y-2 mt-2">{leadFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-red-500" /><span className="text-sm truncate">{file.name}</span></div>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => removeFile(file.id)}><X className="h-4 w-4" /></Button>
                  </div>
                ))}</div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setLeadDialogOpen(false); setEditLeadDialogOpen(false); setLeadFiles([]); }}>Cancelar</Button>
            <Button onClick={editLeadDialogOpen ? handleEditLead : handleCreateLead} className="bg-emerald-600 hover:bg-emerald-700">{editLeadDialogOpen ? 'Guardar' : 'Crear'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Ver Lead */}
      <Dialog open={viewLeadDialogOpen} onOpenChange={setViewLeadDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Detalles del Lead</DialogTitle></DialogHeader>
          {selectedLead && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="text-emerald-700 font-bold text-lg">{selectedLead.firstName[0]}{selectedLead.lastName[0]}</span>
                </div>
                <div>
                  <h3 className="font-semibold">{selectedLead.firstName} {selectedLead.lastName}</h3>
                  {selectedLead.company && <p className="text-slate-500 flex items-center gap-1"><Building2 className="h-4 w-4" />{selectedLead.company}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {selectedLead.email && <div><p className="text-slate-500">Email</p><p className="font-medium">{selectedLead.email}</p></div>}
                {selectedLead.whatsapp && <div><p className="text-slate-500">WhatsApp</p><p className="font-medium">{selectedLead.whatsapp}</p></div>}
                <div><p className="text-slate-500">Etapa</p><Badge style={{ backgroundColor: pipelineStages.find(s => s.key === selectedLead.stage)?.color }}>{pipelineStages.find(s => s.key === selectedLead.stage)?.label}</Badge></div>
                <div><p className="text-slate-500">Origen</p><p className="font-medium">{LEAD_SOURCES.find(s => s.key === selectedLead.source)?.icon} {LEAD_SOURCES.find(s => s.key === selectedLead.source)?.label}</p></div>
                {selectedLead.estimatedValue && <div><p className="text-slate-500">Valor</p><p className="font-medium text-emerald-600">${selectedLead.estimatedValue.toLocaleString()}</p></div>}
                <div><p className="text-slate-500">Creado</p><p className="font-medium">{new Date(selectedLead.createdAt).toLocaleDateString('es-ES')}</p></div>
              </div>
              {selectedLead.description && <div><p className="text-slate-500 text-sm">Descripción</p><p>{selectedLead.description}</p></div>}
              {selectedLead.notes && <div><p className="text-slate-500 text-sm">Notas</p><p>{selectedLead.notes}</p></div>}
              {selectedLead.files && selectedLead.files.length > 0 && (
                <div><p className="text-slate-500 text-sm mb-2">Archivos</p><div className="space-y-2">{selectedLead.files.map((file) => (<a key={file.id} href={file.data} download={file.name} className="flex items-center gap-2 p-2 bg-slate-50 rounded hover:bg-slate-100"><FileText className="h-4 w-4 text-red-500" /><span className="text-sm">{file.name}</span></a>))}</div></div>
              )}
              {selectedLead.lostReason && (
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-red-700 font-medium">{LOST_REASONS.find(r => r.key === selectedLead.lostReason)?.label}</p>
                  {selectedLead.lostNotes && <p className="text-red-600 text-sm mt-1">{selectedLead.lostNotes}</p>}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewLeadDialogOpen(false)}>Cerrar</Button>
            <Button onClick={() => { setViewLeadDialogOpen(false); if (selectedLead) handleEditLeadClick(selectedLead); }} className="bg-emerald-600 hover:bg-emerald-700">Editar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Lead Perdido */}
      <Dialog open={lostDialogOpen} onOpenChange={setLostDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Marcar como Perdido</DialogTitle><DialogDescription>Selecciona la razón de pérdida</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">{LOST_REASONS.map((reason) => (
              <button key={reason.key} type="button" onClick={() => setLostForm({ ...lostForm, reason: reason.key })} className={`w-full p-3 text-left rounded-lg border transition-all ${lostForm.reason === reason.key ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-slate-300'}`}>
                <p className="font-medium">{reason.label}</p>
                <p className="text-sm text-slate-500">{reason.description}</p>
              </button>
            ))}</div>
            <div className="space-y-2"><Label>Notas adicionales</Label><Textarea value={lostForm.notes} onChange={(e) => setLostForm({ ...lostForm, notes: e.target.value })} rows={2} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setLostDialogOpen(false)}>Cancelar</Button><Button onClick={handleConfirmLost} className="bg-red-600 hover:bg-red-700">Confirmar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Pipeline Stages Editor */}
      <Dialog open={pipelineStagesDialogOpen} onOpenChange={setPipelineStagesDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Editar Etapas del Pipeline</DialogTitle><DialogDescription>Reordena, renombra o elimina etapas</DialogDescription></DialogHeader>
          <div className="space-y-3 py-4">
            {pipelineStages.map((stage, index) => (
              <div key={stage.key} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg group">
                <div className="flex flex-col gap-1">
                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0" disabled={index === 0} onClick={() => handleMoveStageUp(index)}><ArrowUp className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0" disabled={index === pipelineStages.length - 1} onClick={() => handleMoveStageDown(index)}><ArrowDown className="h-3 w-3" /></Button>
                </div>
                <div className="h-4 w-4 rounded-full" style={{ backgroundColor: stage.color }} />
                <span className="flex-1 font-medium text-sm">{stage.label}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleEditStage(stage)}><Edit className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:bg-red-50" onClick={() => handleDeleteStage(stage.key)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleAddStage} className="flex-1"><Plus className="h-4 w-4 mr-2" />Agregar Etapa</Button>
            <Button variant="outline" onClick={handleResetStages} className="flex-1 text-amber-600 hover:bg-amber-50">
              <RotateCcw className="h-4 w-4 mr-2" />Restablecer
            </Button>
          </div>
          
          {editingStage && (
            <div className="mt-4 p-3 bg-slate-100 rounded-lg space-y-3">
              <div className="flex gap-2">
                <Input value={stageForm.label} onChange={(e) => setStageForm({ ...stageForm, label: e.target.value })} className="flex-1" />
                <div className="flex gap-1">{STAGE_COLORS.slice(0, 8).map((color) => (<button key={color} type="button" onClick={() => setStageForm({ ...stageForm, color })} className={`h-8 w-8 rounded-full ${stageForm.color === color ? 'ring-2 ring-offset-1 ring-slate-400' : ''}`} style={{ backgroundColor: color }} />))}</div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditingStage(null)}>Cancelar</Button>
                <Button size="sm" onClick={handleSaveStage} className="bg-emerald-600 hover:bg-emerald-700">Guardar</Button>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="destructive" size="sm" onClick={handleClearAllData} className="w-full sm:w-auto">
              <Trash2 className="h-4 w-4 mr-2" />Limpiar Todo
            </Button>
            <Button variant="outline" onClick={() => setPipelineStagesDialogOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Export */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Exportar Leads</DialogTitle><DialogDescription>Selecciona el formato y filtros</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Formato</Label>
              <div className="grid grid-cols-3 gap-2">
                <button type="button" onClick={() => setExportForm({ ...exportForm, format: 'csv' })} className={`p-3 rounded-lg border flex flex-col items-center gap-1 transition-all ${exportForm.format === 'csv' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <FileDown className="h-5 w-5" /><span className="text-xs">CSV</span>
                </button>
                <button type="button" onClick={() => setExportForm({ ...exportForm, format: 'xlsx' })} className={`p-3 rounded-lg border flex flex-col items-center gap-1 transition-all ${exportForm.format === 'xlsx' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <FileSpreadsheet className="h-5 w-5" /><span className="text-xs">Excel</span>
                </button>
                <button type="button" onClick={() => setExportForm({ ...exportForm, format: 'pdf' })} className={`p-3 rounded-lg border flex flex-col items-center gap-1 transition-all ${exportForm.format === 'pdf' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <FileText className="h-5 w-5 text-red-500" /><span className="text-xs">PDF</span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label><CalendarDays className="h-4 w-4 inline mr-1" />Desde</Label>
                <Input type="date" value={exportForm.dateFrom} onChange={(e) => setExportForm({ ...exportForm, dateFrom: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label><CalendarDays className="h-4 w-4 inline mr-1" />Hasta</Label>
                <Input type="date" value={exportForm.dateTo} onChange={(e) => setExportForm({ ...exportForm, dateTo: e.target.value })} />
              </div>
            </div>
            <p className="text-xs text-slate-500">Deja las fechas vacías para exportar todos los leads</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleExport} className="bg-emerald-600 hover:bg-emerald-700"><Download className="h-4 w-4 mr-2" />Exportar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Leads del Formulario */}
      <Dialog open={publicLeadsDialogOpen} onOpenChange={setPublicLeadsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Inbox className="h-5 w-5 text-emerald-600" />
              Leads del Formulario
            </DialogTitle>
            <DialogDescription>
              Personas que han llenado el formulario público y están pendientes de importar
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {isLoadingPublicLeads ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : publicLeads.length === 0 ? (
            <div className="text-center py-8">
  <Inbox className="h-12 w-12 text-slate-300 mx-auto mb-3" />
  <p className="text-slate-500 font-medium">Leads del Formulario Público</p>
  
  <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100 shadow-sm">
    <p className="text-xs text-emerald-700 font-bold uppercase tracking-wider mb-2">
      Tu Link de Captación Personalizado
    </p>
    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-emerald-200 mb-3">
      <code className="flex-1 text-[11px] text-emerald-600 truncate text-left px-1">
        {typeof window !== 'undefined' 
          ? `${window.location.origin}/formulario?b=${localStorage.getItem('crm_user_id') || 'general'}` 
          : '/formulario'}
      </code>
      <Button 
        size="sm" 
        variant="ghost" 
        className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
        onClick={() => {
          const link = `${window.location.origin}/formulario?b=${localStorage.getItem('crm_user_id') || 'general'}`;
          navigator.clipboard.writeText(link);
          alert("¡Link copiado al portapapeles!");
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
      </Button>
    </div>

    <div className="flex gap-2">
      <Button 
        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9"
        onClick={() => {
          const link = `${window.location.origin}/formulario?b=${localStorage.getItem('crm_user_id') || 'general'}`;
          window.open(`https://wa.me/?text=${encodeURIComponent('Hola, por favor completa este formulario: ' + link)}`, '_blank');
        }}
      >
        <MessageCircle className="h-4 w-4 mr-2" /> Compartir por WhatsApp
      </Button>
    </div>
  </div>
</div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary">{publicLeads.length} pendientes</Badge>
                  <Button 
                    size="sm" 
                    onClick={handleImportAllPublicLeads}
                    disabled={!currentProject}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Importar todos
                  </Button>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {publicLeads.map((lead) => (
                    <Card key={lead.id} className="border-l-4 border-l-emerald-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{lead.firstName} {lead.lastName}</h4>
                            {lead.company && (
                              <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                <Building2 className="h-3 w-3" />{lead.company}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-2 mt-2">
                              {lead.email && (
                                <Badge variant="outline" className="text-xs">
                                  <Mail className="h-3 w-3 mr-1" />{lead.email}
                                </Badge>
                              )}
                              {lead.whatsapp && (
                                <Badge variant="outline" className="text-xs">
                                  <MessageCircle className="h-3 w-3 mr-1" />{lead.whatsapp}
                                </Badge>
                              )}
                              {lead.phone && (
                                <Badge variant="outline" className="text-xs">
                                  <Phone className="h-3 w-3 mr-1" />{lead.phone}
                                </Badge>
                              )}
                            </div>
                            {lead.message && (
                              <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-2 rounded">
                                "{lead.message}"
                              </p>
                            )}
                            <p className="text-xs text-slate-400 mt-2">
                              <Calendar className="h-3 w-3 inline mr-1" />
                              {new Date(lead.createdAt).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          
                          <Button
                            size="sm"
                            onClick={() => handleImportPublicLead(lead)}
                            disabled={!currentProject}
                            className="bg-emerald-600 hover:bg-emerald-700 ml-4"
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Importar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setPublicLeadsDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Dashboard de Estadísticas */}
      <Dialog open={dashboardDialogOpen} onOpenChange={setDashboardDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
              Dashboard de Estadísticas
            </DialogTitle>
            <DialogDescription>
              Resumen del rendimiento de tu pipeline de ventas
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-6">
            {/* Métricas principales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-emerald-600">Total Leads</p>
                      <p className="text-2xl font-bold text-emerald-700">{filteredLeads.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-blue-600">Activos</p>
                      <p className="text-2xl font-bold text-blue-700">{filteredLeads.filter(l => l.stage !== 'PERDIDA').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-amber-500 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-amber-600">Valor Total</p>
                      <p className="text-2xl font-bold text-amber-700">${totalPipelineValue.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center">
                      <TrendingDown className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-red-600">Perdidos</p>
                      <p className="text-2xl font-bold text-red-700">{filteredLeads.filter(l => l.stage === 'PERDIDA').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Leads por Etapa */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Layers className="h-4 w-4" /> Leads por Etapa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pipelineStages.map((stage) => {
                    const count = filteredLeads.filter(l => l.stage === stage.key).length;
                    const percentage = filteredLeads.length > 0 ? (count / filteredLeads.length) * 100 : 0;
                    return (
                      <div key={stage.key} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: stage.color }} />
                            {stage.label}
                          </span>
                          <span className="font-medium">{count} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all"
                            style={{ width: `${percentage}%`, backgroundColor: stage.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
            {/* Leads por Fuente */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <PieChart className="h-4 w-4" /> Leads por Fuente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {LEAD_SOURCES.map((source) => {
                    const count = filteredLeads.filter(l => l.source === source.key).length;
                    if (count === 0) return null;
                    return (
                      <div key={source.key} className="p-3 bg-slate-50 rounded-lg text-center">
                        <p className="text-lg">{source.icon}</p>
                        <p className="text-xs text-slate-600 mt-1">{source.label}</p>
                        <p className="text-lg font-bold text-slate-800">{count}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
            {/* Tasa de Conversión */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Tasa de Conversión</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-3xl font-bold text-emerald-600">
                      {filteredLeads.length > 0 
                        ? ((filteredLeads.filter(l => l.stage === 'CONTRATO').length / filteredLeads.length) * 100).toFixed(1)
                        : 0}%
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Cerrados</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-3xl font-bold text-red-600">
                      {filteredLeads.length > 0 
                        ? ((filteredLeads.filter(l => l.stage === 'PERDIDA').length / filteredLeads.length) * 100).toFixed(1)
                        : 0}%
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Perdidos</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600">
                      {filteredLeads.length > 0 
                        ? ((filteredLeads.filter(l => l.stage !== 'PERDIDA' && l.stage !== 'CONTRATO').length / filteredLeads.length) * 100).toFixed(1)
                        : 0}%
                    </p>
                    <p className="text-xs text-slate-500 mt-1">En Proceso</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDashboardDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Gestión de Usuarios */}
      <Dialog open={usersDialogOpen} onOpenChange={setUsersDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" />
              Gestión de Usuarios
            </DialogTitle>
            <DialogDescription>
              Administra los usuarios del sistema
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {/* Lista de usuarios existentes */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Usuarios existentes</h4>
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-slate-500">@{user.username} • {ROLE_PERMISSIONS[user.role].label}</p>
                  </div>
                  {user.id !== '1' && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-red-500 hover:bg-red-50"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
            {/* Formulario nuevo usuario */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3">Crear nuevo usuario</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Nombre</Label>
                    <Input 
                      value={newUserForm.name}
                      onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                      placeholder="Juan Pérez"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Usuario</Label>
                    <Input 
                      value={newUserForm.username}
                      onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                      placeholder="juanp"
                      className="h-9"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Contraseña</Label>
                    <Input 
                      type="password"
                      value={newUserForm.password}
                      onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                      placeholder="••••••"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Rol</Label>
                    <Select value={newUserForm.role} onValueChange={(value) => setNewUserForm({ ...newUserForm, role: value as UserRole })}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="vendedor">Vendedor</SelectItem>
                        <SelectItem value="viewer">Solo Lectura</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleCreateUser} size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700">
                  <UserPlus className="h-4 w-4 mr-1" /> Crear Usuario
                </Button>
              </div>
            </div>
            
            {/* Descripción de roles */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-2">Permisos por Rol</h4>
              <div className="space-y-2 text-xs">
                {Object.entries(ROLE_PERMISSIONS).map(([key, perm]) => (
                  <div key={key} className="p-2 bg-slate-50 rounded">
                    <p className="font-medium">{perm.label}</p>
                    <p className="text-slate-500">{perm.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setUsersDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Custom Fields */}
      <Dialog open={customFieldsDialogOpen} onOpenChange={setCustomFieldsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Campos Personalizados</DialogTitle><DialogDescription>Crea campos adicionales para tus leads</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-slate-50 rounded-lg space-y-3">
              <Input value={newCustomField.name} onChange={(e) => setNewCustomField({ ...newCustomField, name: e.target.value })} placeholder="Nombre del campo" />
              <div className="grid grid-cols-2 gap-2">
                <Select value={newCustomField.fieldType} onValueChange={(value) => setNewCustomField({ ...newCustomField, fieldType: value as typeof newCustomField.fieldType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Texto</SelectItem>
                    <SelectItem value="number">Número</SelectItem>
                    <SelectItem value="date">Fecha</SelectItem>
                    <SelectItem value="select">Selección</SelectItem>
                    <SelectItem value="textarea">Texto largo</SelectItem>
                    <SelectItem value="file">Archivo</SelectItem>
                  </SelectContent>
                </Select>
                {newCustomField.fieldType === 'select' && <Input value={newCustomField.options} onChange={(e) => setNewCustomField({ ...newCustomField, options: e.target.value })} placeholder="Opciones (coma)" />}
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="required" checked={newCustomField.required} onChange={(e) => setNewCustomField({ ...newCustomField, required: e.target.checked })} className="rounded" />
                <Label htmlFor="required" className="text-sm">Obligatorio</Label>
              </div>
              <Button onClick={handleCreateCustomField} size="sm" className="w-full"><Plus className="h-4 w-4 mr-2" />Agregar Campo</Button>
            </div>
            {customFields.filter(f => f.projectId === currentProject?.id).length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Campos existentes</p>
                {customFields.filter(f => f.projectId === currentProject?.id).map((field) => (
                  <div key={field.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <div><p className="font-medium text-sm">{field.name}</p><p className="text-xs text-slate-500">{field.fieldType} {field.required && '(obligatorio)'}</p></div>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500" onClick={() => handleDeleteCustomField(field.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setCustomFieldsDialogOpen(false)}>Cerrar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
