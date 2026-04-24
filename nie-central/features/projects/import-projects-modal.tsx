/**
 * Import Projects Modal
 * Modal para importar projetos de planilha
 */

'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileSpreadsheet, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';

interface ImportProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (projects: any[]) => void;
}

interface ImportResult {
  success: number;
  errors: number;
  total: number;
  errorDetails: string[];
}

export function ImportProjectsModal({ isOpen, onClose, onImport }: ImportProjectsModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [preview, setPreview] = useState<any[] | null>(null);

  const processFile = useCallback((file: File) => {
    setIsLoading(true);
    setResult(null);

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Mapear dados da planilha para o formato do sistema
        const mappedProjects = jsonData.map((row: any, index: number) => {
          try {
            return {
              id: `imported-${Date.now()}-${index}`,
              nome: row['Nome do Projeto'] || row['Projeto'] || row['nome'] || 'Sem nome',
              descricao: row['Descrição'] || row['descricao'] || row['Descricao'] || '',
              categoria: mapCategory(row['Categoria'] || row['categoria'] || 'tecnologia'),
              status: mapStatus(row['Status'] || row['status'] || 'ativo'),
              diretoria: row['Diretoria'] || row['diretoria'] || 'Geral',
              responsavel: row['Responsável'] || row['Responsavel'] || row['responsavel'] || 'Não definido',
              link: row['Link'] || row['link'] || row['URL'] || '#',
              destaque: row['Destaque']?.toString().toLowerCase() === 'sim' || false,
              favorito: false,
              dataInicio: formatDate(row['Data Início'] || row['Data Inicio'] || row['dataInicio']),
              dataFim: formatDate(row['Data Fim'] || row['dataFim'] || row['Prazo']),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          } catch (err) {
            return null;
          }
        }).filter(Boolean);

        setPreview(mappedProjects.slice(0, 5));
        
        setResult({
          success: mappedProjects.length,
          errors: jsonData.length - mappedProjects.length,
          total: jsonData.length,
          errorDetails: [],
        });

        setIsLoading(false);
      } catch (error) {
        setResult({
          success: 0,
          errors: 1,
          total: 0,
          errorDetails: ['Erro ao processar arquivo. Verifique o formato.'],
        });
        setIsLoading(false);
      }
    };

    reader.readAsBinaryString(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv'))) {
      processFile(file);
    }
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleConfirmImport = () => {
    if (preview) {
      onImport(preview);
      onClose();
    }
  };

  const mapCategory = (cat: string): string => {
    const categories: Record<string, string> = {
      'tecnologia': 'tecnologia',
      'operacional': 'operacional',
      'rh': 'rh',
      'financeiro': 'financeiro',
      'marketing': 'marketing',
      'juridico': 'juridico',
      'estrategia': 'estrategia',
    };
    return categories[cat.toLowerCase()] || 'tecnologia';
  };

  const mapStatus = (status: string): string => {
    const statuses: Record<string, string> = {
      'ativo': 'ativo',
      'pausado': 'pausado',
      'concluido': 'concluido',
      'cancelado': 'cancelado',
      'planejamento': 'planejamento',
    };
    return statuses[status.toLowerCase()] || 'ativo';
  };

  const formatDate = (date: any): string => {
    if (!date) return '';
    if (typeof date === 'number') {
      // Excel date serial number
      const excelEpoch = new Date(1899, 11, 30);
      return new Date(excelEpoch.getTime() + date * 86400000).toISOString().split('T')[0];
    }
    return date.toString();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 z-50 overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#00A651]/10 flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5 text-[#00A651]" />
                  </div>
                  
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Importar Projetos
                    </h2>
                    <p className="text-sm text-gray-500">
                      Importe projetos de planilha Excel ou CSV
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!result ? (
                <>
                  {/* Drop Zone */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={cn(
                      'border-2 border-dashed rounded-xl p-8 text-center transition-colors',
                      isDragging 
                        ? 'border-[#00A651] bg-[#00A651]/5' 
                        : 'border-gray-300 dark:border-gray-700 hover:border-gray-400'
                    )}
                  >
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Arraste sua planilha aqui
                    </p>
                    
                    <p className="text-sm text-gray-500 mb-4">
                      ou clique para selecionar
                    </p>
                    
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#00A651] text-white rounded-lg cursor-pointer hover:bg-[#008c44] transition-colors">
                      <Upload className="w-4 h-4" />
                      Selecionar Arquivo
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileInput}
                        className="hidden"
                      />
                    </label>
                    
                    <p className="text-xs text-gray-400 mt-4">
                      Formatos suportados: .xlsx, .xls, .csv
                    </p>
                  </div>

                  {/* Template Info */}
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Colunas esperadas:
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                      <span>• Nome do Projeto</span>
                      <span>• Descrição</span>
                      <span>• Categoria</span>
                      <span>• Status</span>
                      <span>• Diretoria</span>
                      <span>• Responsável</span>
                      <span>• Link</span>
                      <span>• Data Início/Fim</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Result */}
                  <div className={cn(
                    'p-4 rounded-lg mb-6',
                    result.errors === 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
                  )}>
                    <div className="flex items-center gap-3">
                      {result.errors === 0 ? (
                        <Check className="w-6 h-6 text-green-600" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-yellow-600" />
                      )}
                      
                      <div>
                        <p className="font-medium text-gray-900">
                          {result.success} de {result.total} projetos processados
                        </p>
                        
                        {result.errors > 0 && (
                          <p className="text-sm text-yellow-700">
                            {result.errors} linhas com erro foram ignoradas
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  {preview && preview.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Pré-visualização:
                      </h3>
                      
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {preview.map((project, idx) => (
                          <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="font-medium text-sm text-gray-900 dark:text-white">
                              {project.nome}
                            </p>
                            <p className="text-xs text-gray-500">
                              {project.diretoria} • {project.responsavel}
                            </p>
                          </div>
                        ))}
                        
                        {result.success > 5 && (
                          <p className="text-center text-sm text-gray-500 py-2">
                            ... e mais {result.success - 5} projetos
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => { setResult(null); setPreview(null); }}
                    >
                      Voltar
                    </Button>
                    
                    <Button
                      className="flex-1"
                      onClick={handleConfirmImport}
                    >
                      Confirmar Importação
                    </Button>
                  </div>
                </>
              )}

              {isLoading && (
                <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#00A651] mb-2" />
                    <p className="text-sm text-gray-600">Processando...</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
