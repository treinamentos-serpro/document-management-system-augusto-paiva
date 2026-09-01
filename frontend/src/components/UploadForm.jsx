import { useRef, useState } from 'react';

export default function UploadForm({ disabled, onUpload }) {
  const inputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedFile) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
      inputRef.current.value = '';
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <label className="file-picker" htmlFor="document-file">
        <span>Selecione um documento</span>
        <strong>{selectedFile ? selectedFile.name : 'Nenhum arquivo selecionado'}</strong>
      </label>
      <input
        ref={inputRef}
        id="document-file"
        type="file"
        onChange={(event) => setSelectedFile(event.target.files[0] || null)}
      />
      <button type="submit" disabled={disabled || !selectedFile || isSubmitting}>
        {isSubmitting ? 'Enviando...' : 'Enviar documento'}
      </button>
    </form>
  );
}