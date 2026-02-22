import { serve } from "bun";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasourceUrl: "file:../../db/crm.db"
});

const PORT = 3001;

// HTML del formulario
const getFormHTML = (message?: string, isError?: boolean) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Formulario de Contacto - CRM Migrante</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .fade-in { animation: fadeIn 0.3s ease-out; }
  </style>
</head>
<body class="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo y título -->
      <div class="text-center mb-8">
        <div class="h-16 w-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-slate-900">Contáctanos</h1>
        <p class="text-slate-500 mt-1">Completa el formulario y te contactaremos pronto</p>
      </div>

      ${message ? `
        <div class="mb-4 p-4 rounded-lg fade-in ${isError ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}">
          ${isError ? '❌' : '✅'} ${message}
        </div>
      ` : ''}

      <!-- Formulario -->
      <form action="/api/submit" method="POST" class="bg-white rounded-xl shadow-xl p-6 space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
            <input 
              type="text" 
              name="firstName" 
              required
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              placeholder="Juan"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Apellido *</label>
            <input 
              type="text" 
              name="lastName" 
              required
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              placeholder="Pérez"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Empresa</label>
          <input 
            type="text" 
            name="company"
            class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            placeholder="Tu empresa (opcional)"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input 
            type="email" 
            name="email"
            class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            placeholder="correo@ejemplo.com"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">WhatsApp / Teléfono</label>
          <input 
            type="tel" 
            name="whatsapp"
            class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            placeholder="+506 0000 0000"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Mensaje</label>
          <textarea 
            name="message"
            rows="3"
            class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
            placeholder="¿En qué podemos ayudarte?"
          ></textarea>
        </div>

        <button 
          type="submit"
          class="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
        >
          Enviar Solicitud
        </button>

        <p class="text-xs text-slate-400 text-center mt-4">
          Al enviar este formulario, aceptas que te contactemos.
        </p>
      </form>

      <p class="text-center text-sm text-slate-500 mt-6">
        Powered by <span class="font-semibold text-emerald-600">CRM Migrante</span>
      </p>
    </div>
  </div>
</body>
</html>
`;

const server = serve({
  port: PORT,
  
  async fetch(req) {
    const url = new URL(req.url);
    
    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Servir formulario
    if (url.pathname === "/" && req.method === "GET") {
      return new Response(getFormHTML(), {
        headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders }
      });
    }

    // API: Enviar formulario
    if (url.pathname === "/api/submit" && req.method === "POST") {
      try {
        const formData = await req.formData();
        
        const firstName = formData.get("firstName")?.toString();
        const lastName = formData.get("lastName")?.toString();
        
        if (!firstName || !lastName) {
          return new Response(getFormHTML("Nombre y apellido son requeridos", true), {
            headers: { "Content-Type": "text/html; charset=utf-8" }
          });
        }

        // Guardar en la base de datos
        await prisma.publicLead.create({
          data: {
            firstName,
            lastName,
            email: formData.get("email")?.toString() || null,
            phone: formData.get("phone")?.toString() || null,
            whatsapp: formData.get("whatsapp")?.toString() || null,
            company: formData.get("company")?.toString() || null,
            message: formData.get("message")?.toString() || null,
            source: "formulario",
          }
        });

        return new Response(getFormHTML("¡Gracias! Te contactaremos pronto."), {
          headers: { "Content-Type": "text/html; charset=utf-8" }
        });
      } catch (error) {
        console.error("Error:", error);
        return new Response(getFormHTML("Error al enviar. Intenta de nuevo.", true), {
          headers: { "Content-Type": "text/html; charset=utf-8" }
        });
      }
    }

    // API: Obtener leads (para el CRM)
    if (url.pathname === "/api/leads" && req.method === "GET") {
      try {
        const unimportedOnly = url.searchParams.get("unimported") === "true";
        
        const leads = await prisma.publicLead.findMany({
          where: unimportedOnly ? { imported: false } : undefined,
          orderBy: { createdAt: "desc" },
          take: 100,
        });

        return new Response(JSON.stringify({ leads }), {
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      } catch (error) {
        console.error("Error:", error);
        return new Response(JSON.stringify({ error: "Error al obtener leads" }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }
    }

    // API: Marcar como importado
    if (url.pathname === "/api/leads/import" && req.method === "POST") {
      try {
        const body = await req.json();
        const { id } = body;

        await prisma.publicLead.update({
          where: { id },
          data: { imported: true, importedAt: new Date() }
        });

        return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      } catch (error) {
        console.error("Error:", error);
        return new Response(JSON.stringify({ error: "Error al actualizar" }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }
    }

    // 404
    return new Response("Not found", { status: 404 });
  },
});

console.log(`🚀 Formulario público corriendo en http://localhost:${PORT}`);
console.log(`📝 Accede al formulario: http://localhost:${PORT}/`);
