import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Upload, Link, X, File } from 'lucide-react';
import { toast } from 'sonner';

const FileUploadDialog = ({ isOpen, onClose, onUpload, title = "Upload de Arquivo" }) => {
  const [uploadMethod, setUploadMethod] = useState('url'); // 'url' or 'file'
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSubmit = () => {
    if (uploadMethod === 'url') {
      if (!fileUrl.trim()) {
        toast.error('Por favor, insira uma URL válida');
        return;
      }
      onUpload({
        url: fileUrl,
        name: fileName || 'Arquivo sem nome',
        type: 'url',
      });
    } else {
      if (!selectedFile) {
        toast.error('Por favor, selecione um arquivo');
        return;
      }
      // Em produção, aqui seria feito o upload para S3/Supabase
      // Por enquanto, apenas retornamos info do arquivo
      onUpload({
        url: URL.createObjectURL(selectedFile),
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
      });
    }

    // Reset
    setFileUrl('');
    setFileName('');
    setSelectedFile(null);
    onClose();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Limite de 10MB
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Limite: 10MB');
        return;
      }
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Adicione um arquivo por URL ou faça upload</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={uploadMethod === 'url' ? 'default' : 'outline'}
              onClick={() => setUploadMethod('url')}
              className={uploadMethod === 'url' ? 'bg-blue-600' : ''}
            >
              <Link size={16} className="mr-2" />
              URL
            </Button>
            <Button
              type="button"
              variant={uploadMethod === 'file' ? 'default' : 'outline'}
              onClick={() => setUploadMethod('file')}
              className={uploadMethod === 'file' ? 'bg-blue-600' : ''}
            >
              <Upload size={16} className="mr-2" />
              Upload
            </Button>
          </div>

          {uploadMethod === 'url' ? (
            <div className="space-y-3">
              <div>
                <Label htmlFor="file-url">URL do Arquivo</Label>
                <Input
                  id="file-url"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://exemplo.com/arquivo.pdf"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="file-name">Nome do Arquivo (opcional)</Label>
                <Input
                  id="file-name"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="Meu arquivo"
                  className="mt-1"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <Label htmlFor="file-upload">Selecionar Arquivo</Label>
                <div className="mt-1">
                  <input
                    id="file-upload"
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center w-full p-6 border-2 border-dashed border-zinc-800 rounded-lg cursor-pointer hover:border-blue-600 transition-colors"
                  >
                    {selectedFile ? (
                      <div className="text-center">
                        <File className="mx-auto text-blue-500 mb-2" size={32} />
                        <p className="text-sm font-medium">{selectedFile.name}</p>
                        <p className="text-xs text-zinc-500 mt-1">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="mx-auto text-zinc-600 mb-2" size={32} />
                        <p className="text-sm text-zinc-400">Clique para selecionar</p>
                        <p className="text-xs text-zinc-600 mt-1">PDF, DOC, Imagens, Vídeos (max 10MB)</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
              {selectedFile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                  className="w-full"
                >
                  <X size={16} className="mr-2" />
                  Remover arquivo
                </Button>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Adicionar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileUploadDialog;
