import { useEffect, useState } from 'react';
import DocumentList from './components/DocumentList.jsx';
import UploadComponent from './components/UploadComponent.jsx';
import {
  downloadDocument,
  listDocuments,
  uploadDocument,
} from './services/documentApi.js';
import './styles.css';

export default function App() {
  const [owner, setOwner] = useState('user-123');
  const [documents, setDocuments] = useState([]);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, [owner]);

  async function loadDocuments() {
    setIsLoading(true);
    try {
      setDocuments(await listDocuments(owner));
      setStatus({ type: '', message: '' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpload(file) {
    try {
      await uploadDocument(file, owner);
      await loadDocuments();
      setStatus({ type: 'success', message: 'Documento enviado com sucesso.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    }
  }

  async function handleDownload(document) {
    try {
      const blob = await downloadDocument(document.id, owner);
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.originalName;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    }
  }

  return (
    <main className="app-shell">
      <header>
        <p className="eyebrow">Central de documentos</p>
        <h1>Document Management System</h1>
        <p className="subtitle">Envie, consulte e recupere seus documentos em um só lugar.</p>
      </header>

      <section className="workspace" aria-label="Gerenciamento de documentos">
        <div className="owner-field">
          <label htmlFor="owner">Identificador do usuário</label>
          <input
            id="owner"
            value={owner}
            onChange={(event) => setOwner(event.target.value)}
            placeholder="Ex.: user-123"
          />
        </div>

        <UploadComponent disabled={!owner.trim()} onUpload={handleUpload} />

        {status.message && <p className={`status ${status.type}`}>{status.message}</p>}

        <div className="documents-heading">
          <h2>Documentos</h2>
          <button className="refresh" type="button" onClick={loadDocuments} disabled={isLoading}>
            Atualizar
          </button>
        </div>
        {isLoading ? (
          <p className="empty-state">Carregando documentos...</p>
        ) : (
          <DocumentList documents={documents} onDownload={handleDownload} />
        )}
      </section>
    </main>
  );
}
