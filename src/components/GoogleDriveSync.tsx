'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Cloud, CloudOff, Upload, Download, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// Google API Configuration - TU CLIENT ID
const GOOGLE_CLIENT_ID = '232167969183-feen9e4pk66nrho8mqo4qh4ju7l7j4vi.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const FILE_NAME = 'merka-crm-data.json';

interface GoogleDriveSyncProps {
  onDataLoad: (data: {
    projects?: unknown[];
    leads?: unknown[];
    customFields?: unknown[];
    pipelineStages?: unknown[];
  }) => void;
  getData: () => {
    projects: unknown[];
    leads: unknown[];
    customFields: unknown[];
    pipelineStages: unknown[];
  };
}

declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }) => { requestAccessToken: (options?: { prompt?: string }) => void };
        };
      };
    };
    tokenClient?: {
      requestAccessToken: (options?: { prompt?: string }) => void;
    };
  }
}

export default function GoogleDriveSync({ onDataLoad, getData }: GoogleDriveSyncProps) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fileId, setFileId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Load saved state from localStorage
  useEffect(() => {
    const savedLastSync = localStorage.getItem('merka-gdrive-last-sync');
    const savedFileId = localStorage.getItem('merka-gdrive-file-id');
    const savedToken = localStorage.getItem('merka-gdrive-token');
    const savedExpiry = localStorage.getItem('merka-gdrive-token-expiry');
    
    if (savedLastSync) setLastSync(savedLastSync);
    if (savedFileId) setFileId(savedFileId);
    
    // Check if token is still valid
    if (savedToken && savedExpiry) {
      const expiryTime = parseInt(savedExpiry);
      if (Date.now() < expiryTime) {
        setAccessToken(savedToken);
        setIsSignedIn(true);
      } else {
        // Token expired, clear it
        localStorage.removeItem('merka-gdrive-token');
        localStorage.removeItem('merka-gdrive-token-expiry');
      }
    }
  }, []);

  // Load Google Identity Services script
  const loadGoogleScript = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      if (typeof window.google !== 'undefined' && window.google.accounts) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google script'));
      document.head.appendChild(script);
    });
  }, []);

  // Sign in with Google
  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await loadGoogleScript();
      
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: (response) => {
          if (response.error) {
            console.error('OAuth error:', response.error);
            toast.error('Error de autenticación: ' + response.error);
            setIsLoading(false);
            return;
          }
          
          const token = response.access_token || '';
          if (!token) {
            toast.error('No se recibió token de acceso');
            setIsLoading(false);
            return;
          }
          
          // Token expires in 1 hour
          const expiryTime = Date.now() + (60 * 60 * 1000);
          
          setAccessToken(token);
          localStorage.setItem('merka-gdrive-token', token);
          localStorage.setItem('merka-gdrive-token-expiry', expiryTime.toString());
          setIsSignedIn(true);
          setIsLoading(false);
          toast.success('Conectado a Google Drive');
        },
      });
      
      // Force consent screen to ensure fresh token
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (error) {
      console.error('Error signing in:', error);
      toast.error('Error al conectar con Google Drive');
      setIsLoading(false);
    }
  };

  // Sign out
  const handleSignOut = () => {
    setAccessToken(null);
    setFileId(null);
    setIsSignedIn(false);
    localStorage.removeItem('merka-gdrive-token');
    localStorage.removeItem('merka-gdrive-token-expiry');
    localStorage.removeItem('merka-gdrive-file-id');
    localStorage.removeItem('merka-gdrive-last-sync');
    setLastSync(null);
    toast.success('Desconectado de Google Drive');
  };

  // Find existing file in Google Drive
  const findFile = async (token: string): Promise<string | null> => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${FILE_NAME}' and trashed=false&spaces=drive&fields=files(id,name)&pageSize=1`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Drive API error:', errorData);
        return null;
      }
      
      const data = await response.json();
      if (data.files && data.files.length > 0) {
        return data.files[0].id;
      }
      return null;
    } catch (error) {
      console.error('Error finding file:', error);
      return null;
    }
  };

  // Save data to Google Drive
  const handleSave = async () => {
    if (!accessToken) {
      toast.error('No está conectado a Google Drive');
      return;
    }
    
    setIsLoading(true);
    try {
      const data = getData();
      const jsonData = JSON.stringify(data, null, 2);
      
      let currentFileId = fileId;
      
      // Find existing file if we don't have fileId
      if (!currentFileId) {
        currentFileId = await findFile(accessToken);
      }
      
      if (currentFileId) {
        // Update existing file
        const response = await fetch(
          `https://www.googleapis.com/upload/drive/v3/files/${currentFileId}?uploadType=media`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: jsonData,
          }
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error updating file:', errorData);
          throw new Error('Error updating file: ' + (errorData.error?.message || 'Unknown error'));
        }
      } else {
        // Create new file using multipart upload
        const metadata = {
          name: FILE_NAME,
          mimeType: 'application/json',
        };
        
        const boundary = 'merka_crm_boundary';
        const body = [
          `--${boundary}`,
          'Content-Type: application/json; charset=UTF-8',
          '',
          JSON.stringify(metadata),
          `--${boundary}`,
          'Content-Type: application/json; charset=UTF-8',
          '',
          jsonData,
          `--${boundary}--`,
        ].join('\r\n');
        
        const response = await fetch(
          'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': `multipart/related; boundary=${boundary}`,
            },
            body: body,
          }
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error creating file:', errorData);
          throw new Error('Error creating file: ' + (errorData.error?.message || 'Unknown error'));
        }
        
        const result = await response.json();
        currentFileId = result.id;
      }
      
      if (currentFileId) {
        setFileId(currentFileId);
        localStorage.setItem('merka-gdrive-file-id', currentFileId);
      }
      
      const now = new Date().toISOString();
      setLastSync(now);
      localStorage.setItem('merka-gdrive-last-sync', now);
      
      toast.success('Datos guardados en Google Drive');
    } catch (error) {
      console.error('Error saving to Google Drive:', error);
      toast.error('Error al guardar: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
    setIsLoading(false);
  };

  // Load data from Google Drive
  const handleLoad = async () => {
    if (!accessToken) {
      toast.error('No está conectado a Google Drive');
      return;
    }
    
    setIsLoading(true);
    try {
      let currentFileId = fileId;
      
      // Find existing file if we don't have fileId
      if (!currentFileId) {
        currentFileId = await findFile(accessToken);
      }
      
      if (!currentFileId) {
        toast.error('No se encontró archivo de respaldo en Google Drive. Primero guarda tus datos.');
        setIsLoading(false);
        return;
      }
      
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${currentFileId}?alt=media`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error loading file:', errorData);
        throw new Error('Error loading file: ' + (errorData.error?.message || 'Unknown error'));
      }
      
      const data = await response.json();
      
      setFileId(currentFileId);
      localStorage.setItem('merka-gdrive-file-id', currentFileId);
      
      const now = new Date().toISOString();
      setLastSync(now);
      localStorage.setItem('merka-gdrive-last-sync', now);
      
      onDataLoad(data);
      toast.success('Datos cargados desde Google Drive');
    } catch (error) {
      console.error('Error loading from Google Drive:', error);
      toast.error('Error al cargar: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
    setIsLoading(false);
  };

  const formatLastSync = (dateStr: string | null) => {
    if (!dateStr) return 'Nunca';
    const date = new Date(dateStr);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <Button
        size="sm"
        variant={isSignedIn ? 'default' : 'outline'}
        onClick={() => setDialogOpen(true)}
        className={isSignedIn ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
      >
        {isSignedIn ? (
          <>
            <Cloud className="h-4 w-4 mr-1" />
            Sincronizado
          </>
        ) : (
          <>
            <CloudOff className="h-4 w-4 mr-1" />
            Google Drive
          </>
        )}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-emerald-600" />
              Sincronización con Google Drive
            </DialogTitle>
            <DialogDescription>
              Guarda y sincroniza tus datos en la nube para acceder desde cualquier dispositivo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Status */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2">
                {isSignedIn ? (
                  <>
                    <Check className="h-5 w-5 text-emerald-600" />
                    <span className="font-medium">Conectado</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    <span className="font-medium">No conectado</span>
                  </>
                )}
              </div>
              <Badge variant={isSignedIn ? 'default' : 'secondary'} className={isSignedIn ? 'bg-emerald-600' : ''}>
                {isSignedIn ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>

            {/* Last Sync */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Última sincronización:</span>
              <span className="font-medium">{formatLastSync(lastSync)}</span>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              {!isSignedIn ? (
                <Button
                  onClick={handleSignIn}
                  disabled={isLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Cloud className="h-4 w-4 mr-2" />
                  )}
                  Conectar con Google Drive
                </Button>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={handleSave}
                      disabled={isLoading}
                      variant="outline"
                      className="w-full"
                    >
                      {isLoading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Guardar
                    </Button>
                    <Button
                      onClick={handleLoad}
                      disabled={isLoading}
                      variant="outline"
                      className="w-full"
                    >
                      {isLoading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Cargar
                    </Button>
                  </div>
                  <Button
                    onClick={handleSignOut}
                    variant="ghost"
                    className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <CloudOff className="h-4 w-4 mr-2" />
                    Desconectar
                  </Button>
                </>
              )}
            </div>

            {/* Info */}
            <div className="text-xs text-slate-500 space-y-1">
              <p>• Los datos se guardan en tu cuenta de Google Drive</p>
              <p>• Solo tú puedes acceder a tus datos</p>
              <p>• Sincroniza entre dispositivos fácilmente</p>
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
