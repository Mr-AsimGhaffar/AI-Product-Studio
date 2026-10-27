# Backend

Express + PostgreSQL API for generated product images.

```bash
cd backend
npm install
cp .env.example .env   # set DATABASE_URL
npm run migrate
npm run dev
```

| Method         | Path                   | Purpose                                       |
| -------------- | ---------------------- | --------------------------------------------- |
| GET/POST       | `/api/projects`        | list / create (optionally with `images[]`)    |
| GET/PUT/DELETE | `/api/projects/:id`    | get with images / update / delete (cascades)  |
| GET/POST       | `/api/images`          | list (`?projectId=`) / create                 |
| GET/PUT/DELETE | `/api/images/:id`      | metadata / update `angle`, `details` / delete |
| GET            | `/api/images/:id/file` | raw image bytes                               |
