import { useEffect, useState } from 'react';
import DocumentList from '../components/DocumentList.jsx';
import UploadComponent from '../components/UploadComponent.jsx';
import { listDocuments, uploadDocument } from '../services/documentsApi.js';

export default function DocumentsPage() {
  const [ownerInput, setOwnerInput] = useState('default');
  const [owner, setOwner] = useState('default');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setPageError('');

    listDocuments(owner)
      .then((items) => {
        if (active) {
          setDocuments(items);
        }
      })
      .catch((error) => {
        if (active) {
          setPageError(error.message);
          setDocuments([]);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [owner]);

  function handleOwnerSubmit(event) {
    event.preventDefault();
    const nextOwner = ownerInput.trim();
    if (!nextOwner || nextOwner.length > 100) {
      setPageError('O identificador deve ter de 1 a 100 caracteres.');
      return;
    }
    setOwner(nextOwner);
  }

  async function handleUpload(file) {
    const createdDocument = await uploadDocument(file, owner);
    setDocuments((currentDocuments) => [createdDocument, ...currentDocuments]);
    setPageError('');
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="DMS, início">
          <span className="brand-mark" aria-hidden="true">D</span>
          <span className="brand-name">DMS<span> / LOCAL</span></span>
        </a>
        <form className="user-form" onSubmit={handleOwnerSubmit}>
          <label htmlFor="owner-id">Usuário</label>
          <input
            id="owner-id"
            value={ownerInput}
            onChange={(event) => setOwnerInput(event.target.value)}
            maxLength={100}
            autoComplete="off"
          />
          <button type="submit" className="user-submit" aria-label="Abrir biblioteca do usuário">
            Abrir <span aria-hidden="true">→</span>
          </button>
        </form>
      </header>

      <main className="workspace">
        <div className="page-intro">
          <div>
            <p className="eyebrow">ESPAÇO DE TRABALHO</p>
            <h1>Documentos</h1>
          </div>
          <div className="local-indicator"><span /> Armazenamento local</div>
        </div>

        {pageError && <p className="page-error" role="alert">{pageError}</p>}

        <UploadComponent onUpload={handleUpload} />
        <DocumentList documents={documents} owner={owner} loading={loading} />
      </main>
      <footer className="footer-note">DMS <span>·</span> Arquivos mantidos neste servidor</footer>
    </div>
  );
}