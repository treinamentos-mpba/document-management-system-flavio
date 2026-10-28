# Especificação - Document Management System

## 1. Objetivo

Entregar uma aplicação web para que usuários identifiquem seus documentos, enviem arquivos, consultem a lista de documentos e baixem os arquivos armazenados localmente.

## 2. Escopo

### Dentro do escopo

- Upload de um documento por requisição.
- Listagem dos documentos associados ao usuário da requisição.
- Download de um documento pelo identificador.
- Exibição de nome original, tamanho e data do upload.
- Interface React para selecionar usuário, enviar, listar e baixar arquivos.
- Persistência de arquivos no filesystem local e metadados em memória.

### Fora do escopo

- Armazenamento externo ou em nuvem.
- Banco de dados e persistência de metadados entre reinicializações.
- Versionamento, edição, exclusão e compartilhamento de documentos.
- Autenticação e autorização robustas.

## 3. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O usuário pode informar um identificador para separar sua lista de documentos. |
| RF-02 | O usuário pode enviar um arquivo usando `multipart/form-data` no campo `file`. |
| RF-03 | O sistema gera um identificador e um nome interno únicos para cada arquivo. |
| RF-04 | O sistema registra os metadados do documento e o identificador do usuário dono. |
| RF-05 | O usuário pode listar os metadados dos documentos associados ao seu identificador. |
| RF-06 | O usuário pode baixar um documento da sua lista pelo identificador. |
| RF-07 | O sistema rejeita upload sem arquivo e upload acima do limite configurado. |
| RF-08 | O sistema retorna erro consistente quando um documento não existe, não pertence ao usuário ou seu arquivo local não está disponível. |
| RF-09 | A interface informa estados de carregamento e erros nas operações de upload, listagem e download. |

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | Os arquivos são gravados no filesystem local em `backend/storage` por padrão, usando Multer com `diskStorage`. |
| RNF-02 | O diretório de armazenamento e o tamanho máximo são configuráveis por `STORAGE_DIR` e `MAX_FILE_SIZE_BYTES`. |
| RNF-03 | O limite padrão de upload é 10 MiB. |
| RNF-04 | Metadados ficam em memória e são perdidos ao reiniciar o processo; os arquivos no disco permanecem. |
| RNF-05 | O backend usa Node.js, Express e CommonJS; os testes usam `node:test`. |
| RNF-06 | O frontend usa React + Vite e consome o backend via `fetch` no prefixo `/api`, removido pelo proxy de desenvolvimento. |
| RNF-07 | O backend segue o fluxo `routes -> controllers -> services -> repositories`. |

## 5. Modelo de dados

### Metadados públicos do documento

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | string | Identificador único gerado pelo servidor. |
| `originalName` | string | Nome de arquivo apresentado pelo usuário, sem caminhos locais. |
| `size` | number | Tamanho do arquivo em bytes. |
| `uploadedAt` | string | Data e hora do upload em ISO 8601. |
| `owner` | string | Identificador do usuário recebido em `X-User-Id`; usa `default` quando ausente. |

### Dados internos de persistência

O registro mantido pelo repository também inclui `storageName`, nome aleatório interno usado para localizar o arquivo. Esse campo nunca é enviado nas respostas públicas e não deriva do nome fornecido pelo cliente.

## 6. Contratos de API

O backend expõe as rotas abaixo sem prefixo. Durante desenvolvimento, o proxy do Vite mapeia `/api/*` para essas rotas removendo `/api`.

Todas as rotas de documentos aceitam o cabeçalho opcional `X-User-Id`. O valor é aparado e precisa ter de 1 a 100 caracteres. Se omitido, o usuário é `default`. Esse identificador serve apenas para organização, não comprova identidade.

### `POST /upload`

- Entrada: `multipart/form-data` com um arquivo no campo `file`; cabeçalho opcional `X-User-Id`.
- Sucesso: `201 Created`, corpo `{ "document": { "id", "originalName", "size", "uploadedAt", "owner" } }`.
- Erros: `400` (`FILE_REQUIRED`, `INVALID_OWNER`), `413` (`FILE_TOO_LARGE`) ou `500` (`INTERNAL_ERROR`).

### `GET /documents`

- Entrada: cabeçalho opcional `X-User-Id`.
- Sucesso: `200 OK`, corpo `{ "documents": [...] }`, incluindo somente metadados do usuário identificado.
- Erro: `400` (`INVALID_OWNER`) ou `500` (`INTERNAL_ERROR`). Uma lista sem documentos retorna array vazio.

### `GET /documents/:id/download`

- Entrada: identificador na URL e cabeçalho opcional `X-User-Id`.
- Sucesso: `200 OK`, conteúdo binário e cabeçalho `Content-Disposition` com o nome original.
- Erros: `400` (`INVALID_OWNER`), `404` (`DOCUMENT_NOT_FOUND`) ou `500` (`INTERNAL_ERROR`). Documento de outro usuário também responde `404`.

### Formato dos erros

Respostas de erro JSON seguem `{ "error": { "code": "...", "message": "..." } }`. As mensagens são em português; códigos são estáveis para tratamento pelo frontend.

## 7. Decisões arquiteturais

- `routes/` registra os endpoints e conecta middleware de upload aos controllers.
- `controllers/` interpreta cabeçalhos, valida entrada HTTP e monta respostas.
- `services/` aplica regras de negócio, ownership e montagem dos metadados.
- `repositories/` mantém os metadados em memória e grava/localiza arquivos no filesystem.
- Multer usa `diskStorage`; nomes físicos são UUIDs e não caminhos fornecidos pelo cliente.
- O frontend organiza a página, componentes reutilizáveis e cliente `fetch` em `pages/`, `components/` e `services/`.
- Não há autenticação: `X-User-Id` pode ser forjado e não deve ser tratado como controle de acesso em produção.

## 8. Riscos e limitações

- Reiniciar o processo elimina os metadados em memória, deixando arquivos locais sem registro.
- Uma falha entre a gravação do arquivo e o registro de metadados pode deixar um arquivo órfão.
- `X-User-Id` é um identificador fornecido pelo cliente, não uma identidade autenticada.
- O limite de tamanho evita uploads excessivos, mas não há lista de tipos de arquivo permitidos no MVP.
- O armazenamento local depende de espaço em disco e do ciclo de vida do host da aplicação.

## 9. Plano de execução

1. Criar este documento de especificação e revisar contratos, limites e decisões.
2. Construir repositories de metadados em memória e storage local com Multer `diskStorage`.
3. Implementar services, controllers, routes e composição no Express, preservando `/health`.
4. Cobrir upload, listagem, download, isolamento por usuário e erros com `node:test`.
5. Criar cliente de API e componentes React para identidade informativa, upload, lista e download.
6. Validar o build do frontend, testes do backend e o fluxo integrado via proxy do Vite.