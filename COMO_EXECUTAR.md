# Como executar

## Pré-requisitos

- [Go 1.23+](https://go.dev/dl/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Node.js 18+

---

## 1. Banco de dados

```bash
docker compose up -d
```

MySQL na porta 3306 · Adminer em http://localhost:8081

---

## 2. Backend

```bash
cd backend
go mod tidy
go run ./cmd/server
```

Sobe em http://localhost:8080, cria as tabelas e insere os dados de seed.

**Usuários de teste** (senha: `senha123`):

| Nome             | E-mail                 |
|------------------|------------------------|
| Iggor Rafhael    | iggor@jpproject.com    |
| Marcello Catchau | marcello@jpproject.com |
| Livia No-Gueira  | livia@jpproject.com    |
| Paulo Fighter    | paulo@jpproject.com    |
| Beatriz          | bia@jpproject.com      |

---

## 3. Frontend

```bash
npm run dev
```

Acesse http://localhost:3000 — redireciona para `/login` automaticamente.
