'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { CustomField } from '@/types/crm';
import { Plus, Settings, Trash2, Edit, GripVertical, Save } from 'lucide-react';
import { toast } from 'sonner';

interface CustomFieldManagerProps {
  projectId: string;
  onFieldsChange?: () => void;
}

export function CustomFieldManager({ projectId, onFieldsChange }: CustomFieldManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fields, setFields] = useState<CustomField[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editField, setEditField] = useState<CustomField | null>(null);
  const [newField, setNewField] = useState({
    name: '',
    fieldType: 'text' as 'text' | 'number' | 'date' | 'select' | 'textarea',
    options: '',
    required: false,
  });

  useEffect(() => {
    if (projectId && dialogOpen) {
      loadFields();
    }
  }, [projectId, dialogOpen]);

  const loadFields = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/custom-fields`);
      const data = await response.json();
      setFields(data);
    } catch (error) {
      console.error('Error loading custom fields:', error);
      toast.error('Error al cargar campos personalizados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateField = async () => {
    if (!newField.name.trim()) {
      toast.error('El nombre del campo es requerido');
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/custom-fields`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newField.name,
          fieldType: newField.fieldType,
          options: newField.fieldType === 'select' && newField.options 
            ? newField.options.split(',').map(o => o.trim()).filter(o => o)
            : null,
          required: newField.required,
        }),
      });

      if (response.ok) {
        const createdField = await response.json();
        setFields([...fields, createdField]);
        setNewField({ name: '', fieldType: 'text', options: '', required: false });
        toast.success('Campo creado exitosamente');
        onFieldsChange?.();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al crear campo');
      }
    } catch (error) {
      console.error('Error creating field:', error);
      toast.error('Error al crear campo');
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    if (!confirm('¿Estás seguro de eliminar este campo? Se perderán todos los datos asociados.')) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/custom-fields/${fieldId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFields(fields.filter(f => f.id !== fieldId));
        toast.success('Campo eliminado');
        onFieldsChange?.();
      }
    } catch (error) {
      console.error('Error deleting field:', error);
      toast.error('Error al eliminar campo');
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setDialogOpen(true)}
        className="gap-2"
      >
        <Settings className="h-4 w-4" />
        Configurar Campos
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Campos Personalizados</DialogTitle>
            <DialogDescription>
              Define campos adicionales para capturar información específica de tus leads
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* New Field Form */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Nuevo Campo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fieldName">Nombre del Campo *</Label>
                    <Input
                      id="fieldName"
                      value={newField.name}
                      onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                      placeholder="Ej: Número de Empleados"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fieldType">Tipo de Campo</Label>
                    <Select
                      value={newField.fieldType}
                      onValueChange={(value: 'text' | 'number' | 'date' | 'select' | 'textarea') => 
                        setNewField({ ...newField, fieldType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Texto</SelectItem>
                        <SelectItem value="number">Número</SelectItem>
                        <SelectItem value="date">Fecha</SelectItem>
                        <SelectItem value="select">Selección</SelectItem>
                        <SelectItem value="textarea">Texto Largo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {newField.fieldType === 'select' && (
                  <div className="space-y-2">
                    <Label htmlFor="options">Opciones (separadas por coma)</Label>
                    <Input
                      id="options"
                      value={newField.options}
                      onChange={(e) => setNewField({ ...newField, options: e.target.value })}
                      placeholder="Ej: Pequeña, Mediana, Grande"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="required"
                    checked={newField.required}
                    onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="required" className="text-sm">Campo obligatorio</Label>
                </div>

                <Button onClick={handleCreateField} size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Campo
                </Button>
              </CardContent>
            </Card>

            {/* Existing Fields */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Campos Existentes ({fields.length})</h4>
              
              {isLoading ? (
                <div className="text-center py-4 text-slate-500">Cargando...</div>
              ) : fields.length === 0 ? (
                <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-lg">
                  No hay campos personalizados definidos
                </div>
              ) : (
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2 pr-4">
                    {fields.map((field) => (
                      <div
                        key={field.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <GripVertical className="h-4 w-4 text-slate-300" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{field.name}</span>
                              {field.required && (
                                <Badge variant="outline" className="text-xs">Obligatorio</Badge>
                              )}
                            </div>
                            <span className="text-xs text-slate-500">
                              {field.fieldType === 'text' && 'Texto'}
                              {field.fieldType === 'number' && 'Número'}
                              {field.fieldType === 'date' && 'Fecha'}
                              {field.fieldType === 'select' && 'Selección'}
                              {field.fieldType === 'textarea' && 'Texto Largo'}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteField(field.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
