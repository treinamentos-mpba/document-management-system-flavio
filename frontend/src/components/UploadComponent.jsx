import { useState } from 'react';

export default function UploadComponent({ onUpload }) {
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file || submitting) {
      return;
    }

    const form = event.currentTarget;
    setSubmitting(true);
    setError('');
    try {
      await onUpload(file);
      setFile(null);
      form.reset();
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="upload-section" aria-labelledby="upload-heading">
      <div className="section-heading">
        <div>
          <span className="eyebrow">ARQUIVO LOCAL</span>
          <h2 id="upload-heading">Adicionar documento</h2>
        </div>
        <span className="size-note">Limite de 10 MiB</span>
      </div>
      <form className="upload-form" onSubmit={handleSubmit}>
        <label className="file-picker">
          <span className="file-symbol" aria-hidden="true">+</span>
          <span className="file-picker-copy">
            <strong>{file ? file.name : 'Escolher arquivo'}</strong>
            <span>{file ? `${(file.size / 1024).toFixed(1)} KB` : 'Qualquer formato'}</span>
          </span>
          <input
            type="file"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            aria-label="Selecionar documento"
          />
        </label>
        <button className="button button-primary" type="submit" disabled={!file || submitting}>
          {submitting ? 'Enviando...' : 'Enviar documento'}
        </button>
      </form>
      {error && <p className="inline-error" role="alert">{error}</p>}
    </section>
  );
}