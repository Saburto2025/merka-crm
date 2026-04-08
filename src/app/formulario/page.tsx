'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Send, CheckCircle, Loader2, MessageCircle, Mail, Building2, User } from 'lucide-react';

// Componente interno para manejar los parámetros de búsqueda
function FormContent() {
  const searchParams = useSearchParams();
  const businessId = searchParams.get('b'); // Captura el ID del negocio de la URL

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    whatsapp: '',
    company: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Preparamos los datos incluyendo el ID del negocio
    const dataToSend = {
      ...formData,
      businessId: businessId || 'default', // Si no hay ID, envía 'default'
    };

    try {
      const response = await fetch('/api/public/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        setIsSuccess(true);
        setFormData({ firstName: '', lastName: '', email: '', whatsapp: '', company: '', message: '' });
      } else {
        setError('Hubo un problema al enviar. Inténtalo de nuevo.');
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">¡Recibido!</h2>
          <p className="text-slate-600 mb-6">Tu información ha sido enviada correctamente.</p>
          <Button onClick={() => setIsSuccess(false)} variant="outline" className="w-full">Enviar otro</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg shadow-xl">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold">Contáctanos</CardTitle>
        <CardDescription>Completa los datos para atenderte</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input required value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Apellido *</Label>
              <Input required value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>WhatsApp</Label>
            <Input value={formData.whatsapp} onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Mensaje</Label>
            <Textarea rows={3} value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} />
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 hover:bg-emerald-700">
            {isSubmitting ? 'Enviando...' : 'Enviar'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// Componente principal con Suspense (necesario en Next.js para usar useSearchParams)
export default function FormularioLead() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Suspense fallback={<div>Cargando formulario...</div>}>
        <FormContent />
      </Suspense>
    </div>
  );
}
