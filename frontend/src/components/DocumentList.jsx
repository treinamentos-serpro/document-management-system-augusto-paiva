import DownloadButton from './DownloadButton.jsx';

function formatSize(size) {
  if (size < 1024) {
    return `${size} B`;
  }

  return `${(size / 1024).toFixed(1)} KB`;
}

export default function DocumentList({ documents, onDownload }) {
  if (documents.length === 0) {
    return <p className="empty-state">Nenhum documento enviado por este usuário.</p>;
  }

  return (
    <ul className="document-list">
      {documents.map((item) => (
        <li key={item.id}>
          <div>
            <strong>{item.originalName}</strong>
            <span>
              {formatSize(item.size)} ·{' '}
              {new Intl.DateTimeFormat('pt-BR', {
                dateStyle: 'medium',
                timeStyle: 'short',
              }).format(new Date(item.uploadedAt))}
            </span>
          </div>
          <DownloadButton document={item} onDownload={onDownload} />
        </li>
      ))}
    </ul>
  );
}