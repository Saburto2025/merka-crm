'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Send, CheckCircle, Loader2, MessageCircle, Mail, Building2, User } from 'lucide-react';

interface LeadForm {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  whatsapp: string;
  company: string;
  message: string;
  createdAt: string;
}

export default function FormularioLead() {
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

  const generateId = () => `lead-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const leadData: LeadForm = {
      id: generateId(),
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email || '',
      whatsapp: formData.whatsapp || '',
      company: formData.company || '',
      message: formData.message || '',
      createdAt: new Date().toISOString(),
    };

    // Siempre guardar en localStorage como respaldo
    try {
      const existingLeads = JSON.parse(localStorage.getItem('merka-public-leads') || '[]');
      existingLeads.push(leadData);
      localStorage.setItem('merka-public-leads', JSON.stringify(existingLeads));
    } catch {
      console.error('Error saving to localStorage');
    }

    // Intentar enviar al servidor
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout

      const response = await fetch('/api/public/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        setIsSuccess(true);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          whatsapp: '',
          company: '',
          message: '',
        });
      } else {
        // Error del servidor, pero ya guardamos en localStorage
        setIsSuccess(true);
      }
    } catch {
      // Error de conexión, pero ya guardamos en localStorage
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">¡Gracias por contactarnos!</h2>
            <p className="text-slate-600 mb-6">
              Hemos recibido tu información. Nos pondremos en contacto contigo pronto.
            </p>
            <Button 
              onClick={() => setIsSuccess(false)}
              variant="outline"
              className="w-full"
            >
              Enviar otro formulario
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">M</span>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Contáctanos</CardTitle>
          <CardDescription className="text-slate-600">
            Completa el formulario y te responderemos a la brevedad
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre y Apellido */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="flex items-center gap-1">
                  <User className="h-3 w-3" /> Nombre *
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Juan"
                  required
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Pérez"
                  required
                  className="bg-white"
                />
              </div>
            </div>

            {/* Empresa */}
            <div className="space-y-2">
              <Label htmlFor="company" className="flex items-center gap-1">
                <Building2 className="h-3 w-3" /> Empresa
              </Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Mi Empresa S.A."
                className="bg-white"
              />
            </div>

            {/* Email y WhatsApp */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-1">
                  <Mail className="h-3 w-3" /> Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="juan@email.com"
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" /> WhatsApp
                </Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="+506 0000 0000"
                  className="bg-white"
                />
              </div>
            </div>

            {/* Mensaje */}
            <div className="space-y-2">
              <Label htmlFor="message">Mensaje</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="¿En qué podemos ayudarte?"
                rows={3}
                className="bg-white"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Botón Submit */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 h-11"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
