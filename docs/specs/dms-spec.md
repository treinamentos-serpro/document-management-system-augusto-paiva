# Especificação - Document Management System

## 1. Objetivo

Permitir que usuários enviem, listem e baixem seus documentos, com arquivos
armazenados localmente pela aplicação e metadados mantidos em memória.

## 2. Escopo

### Dentro do escopo

- Upload de um documento por vez.
- Listagem de documentos por usuário.
- Download de um documento pelo seu identificador.
- Associação simples do documento a um proprietário informado no cabeçalho
  `x-owner-id`.
- Armazenamento de arquivos no diretório local `backend/storage`.

### Fora do escopo

- Autenticação e autorização completas.
- Exclusão, edição, busca e compartilhamento de documentos.
- Versionamento de documentos.
- Banco de dados, armazenamento em nuvem ou serviços externos.
- Antivírus e classificação de conteúdo.

## 3. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O usuário pode enviar um arquivo no campo multipart `file`. |
| RF-02 | O sistema registra identificador, nome original, tamanho, data de envio e proprietário para cada upload concluído. |
| RF-03 | O usuário pode listar somente os metadados dos documentos do proprietário informado. |
| RF-04 | O usuário pode baixar um documento próprio usando seu identificador. |
| RF-05 | O sistema rejeita upload sem arquivo, sem proprietário ou maior que 50 MiB. |
| RF-06 | O sistema retorna erro estruturado para entradas inválidas e recursos indisponíveis. |

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | Os arquivos devem ser gravados no filesystem local usando `multer` com `diskStorage`. |
| RNF-02 | Os metadados devem permanecer apenas em memória durante esta fase; reiniciar a aplicação remove essa lista. |
| RNF-03 | A porta HTTP deve ser configurável pela variável de ambiente `PORT`, com padrão `3000`. |
| RNF-04 | O backend deve respeitar a separação `routes -> controllers -> services -> repositories`. |
| RNF-05 | O tamanho máximo de upload é 50 MiB. |
| RNF-06 | As respostas JSON de erro devem usar o formato definido nesta especificação. |

## 5. Modelo de dados (metadados do documento)

| Campo | Tipo | Descrição |
| --- | --- | --- |
| id | string | UUID gerado no servidor para identificar o documento. |
| originalName | string | Nome do arquivo informado no upload. |
| size | number | Tamanho do arquivo em bytes; deve ser maior que zero. |
| uploadedAt | string | Data e hora do upload no formato ISO 8601, em UTC. |
| owner | string | Identificador não vazio do proprietário recebido em `x-owner-id`. |

Os dados internos de persistência, como o caminho local e o nome físico do
arquivo, não devem ser expostos nas respostas da API.

## 6. Contratos de API

As rotas do backend não usam o prefixo `/api`. O frontend o utiliza apenas no
ambiente de desenvolvimento, pois o proxy do Vite o remove antes de encaminhar
a solicitação ao backend.

### Cabeçalho de proprietário

As três operações exigem `x-owner-id` com valor não vazio. Esse mecanismo é
provisório e não substitui autenticação em produção.

### POST /upload

- Entrada: `multipart/form-data` com um único arquivo no campo `file`.
- Cabeçalho obrigatório: `x-owner-id`.
- Sucesso: `201 Created` com os metadados públicos do documento.

```json
{
  "id": "f4c7a869-1f83-4b6b-a291-f554791ad8e7",
  "originalName": "relatorio.pdf",
  "size": 24576,
  "uploadedAt": "2026-09-01T12:00:00.000Z",
  "owner": "user-123"
}
```

- Erros: `400 FILE_REQUIRED`, `400 OWNER_REQUIRED` e `413 FILE_TOO_LARGE`.

### GET /documents

- Cabeçalho obrigatório: `x-owner-id`.
- Sucesso: `200 OK` com uma lista de metadados do proprietário, ou uma lista
  vazia quando ele ainda não tiver documentos.
- Erro: `400 OWNER_REQUIRED`.

```json
[
  {
    "id": "f4c7a869-1f83-4b6b-a291-f554791ad8e7",
    "originalName": "relatorio.pdf",
    "size": 24576,
    "uploadedAt": "2026-09-01T12:00:00.000Z",
    "owner": "user-123"
  }
]
```

### GET /documents/:id/download

- Parâmetro: `id`, UUID do documento.
- Cabeçalho obrigatório: `x-owner-id`.
- Sucesso: `200 OK` com conteúdo binário e cabeçalho `Content-Disposition`
  para download com o nome original do arquivo.
- Erros: `400 OWNER_REQUIRED`, `404 DOCUMENT_NOT_FOUND` e `404 FILE_NOT_FOUND`.

### Formato de erro

```json
{
  "error": {
    "code": "FILE_REQUIRED",
    "message": "Envie um arquivo no campo file."
  }
}
```

## 7. Decisões arquiteturais

- `routes` define endpoints e configura o middleware `multer`.
- `controllers` valida a entrada HTTP e constrói respostas HTTP.
- `services` cria metadados e aplica as regras de acesso por proprietário.
- `repositories` mantém os metadados em memória e fornece consultas simples.
- `multer.diskStorage` grava os arquivos localmente em `backend/storage`; não
  haverá provedores externos nem banco de dados nesta fase.
- O frontend React consome o backend com `fetch` no prefixo `/api`, encaminhado
  pelo proxy Vite para o backend local.

## 8. Plano de execução

1. Criar as camadas de backend e configurar o armazenamento local com `multer`.
2. Implementar `POST /upload`, incluindo validações e registro de metadados.
3. Implementar listagem isolada por proprietário e download pelo identificador.
4. Criar testes de integração para upload inválido, upload válido, listagem e
   download.
5. Criar o serviço HTTP do React para consumir os contratos da API.
6. Criar componentes de interface para identificar o usuário, enviar arquivos,
   listar documentos e iniciar downloads.
7. Executar testes do backend, build do frontend e uma verificação manual do
   fluxo completo.