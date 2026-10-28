import DownloadButton from './DownloadButton.jsx';

function formatSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function DocumentList({ documents, owner, loading }) {
  return (
    <section className="documents-section" aria-labelledby="documents-heading">
      <div className="section-heading documents-heading">
        <div>
          <span className="eyebrow">BIBLIOTECA</span>
          <h2 id="documents-heading">Seus documentos</h2>
        </div>
        <span className="document-count" aria-label={`${documents.length} documentos`}>
          {String(documents.length).padStart(2, '0')}
        </span>
      </div>

      {loading ? (
        <p className="list-message">Carregando documentos...</p>
      ) : documents.length === 0 ? (
        <div className="empty-state">
          <span className="empty-mark" aria-hidden="true">0</span>
          <p>Nenhum documento nesta biblioteca.</p>
        </div>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">Nome</th>
                <th scope="col">Tamanho</th>
                <th scope="col">Enviado em</th>
                <th scope="col"><span className="visually-hidden">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              {documents.map((document) => (
                <tr key={document.id}>
                  <td className="document-name">
                    <span className="document-mark" aria-hidden="true">DOC</span>
                    <span title={document.originalName}>{document.originalName}</span>
                  </td>
                  <td className="metadata-cell">{formatSize(document.size)}</td>
                  <td className="metadata-cell">{formatDate(document.uploadedAt)}</td>
                  <td className="action-cell">
                    <DownloadButton document={document} owner={owner} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}