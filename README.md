# NINI'S Birthday · 25

Invitación web para el cumpleaños de Nicole Wu, con confirmación de asistencia y panel de administración.

- **Invitación:** `/` (general) y `/i/CÓDIGO` (enlace personal de cada invitado).
- **Panel:** `/admin` (protegido con contraseña).
- **Base de datos:** Supabase (tabla `guests`).

Los datos del evento (fecha, hora, lugar, dirección del mapa) están en `lib/event.ts`.

El sitio está marcado como `noindex`: no aparece en Google.

---

## 1. Crear la base de datos en Supabase

1. Entra a [supabase.com](https://supabase.com) y crea un proyecto nuevo (región recomendada: *East US*).
2. Ve a **SQL Editor → New query**, pega todo el contenido de `supabase/schema.sql` y presiona **Run**.
3. Ve a **Project Settings → API Keys / Data API** y copia:
   - **Project URL** → será `SUPABASE_URL`
   - La clave **service_role** (o una *secret key* `sb_secret_…`) → será `SUPABASE_SERVICE_ROLE_KEY`

> La clave secreta solo vive en el servidor. Nunca la pongas con prefijo `NEXT_PUBLIC_`.
> La tabla tiene RLS activado y sin políticas públicas, así que nadie puede leerla desde el navegador.

## 2. Subir a Vercel

1. Sube esta carpeta a un repositorio de GitHub.
2. En [vercel.com](https://vercel.com) → **Add New → Project** → importa el repositorio (Vercel detecta Next.js solo).
3. En **Environment Variables** agrega:

| Variable | Valor |
|---|---|
| `ADMIN_PASSWORD` | La contraseña para entrar a `/admin` |
| `SUPABASE_URL` | Project URL de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave service_role / secret de Supabase |
| `SESSION_SECRET` | *(Opcional)* texto largo aleatorio: `openssl rand -base64 32` |
| `NEXT_PUBLIC_SITE_URL` | *(Opcional)* dominio final, ej. `https://ninis25.vercel.app` |

4. Presiona **Deploy**.

> Alternativa: en Vercel, **Storage → Connect Database → Supabase** crea el proyecto y las variables `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` automáticamente. Igual debes correr `supabase/schema.sql` en el SQL Editor.

Si cambias variables después del primer despliegue, haz **Redeploy** para que tomen efecto.

## 3. Usar el panel

1. Entra a `https://tu-dominio/admin` con tu `ADMIN_PASSWORD`.
2. Agrega invitados uno por uno o en bloque (un invitado por línea: `nombre, lugares, whatsapp`).
3. Para cada invitado puedes copiar su enlace o enviarlo directo por WhatsApp.
4. Verás quién abrió el sobre, quién confirmó, cuántas personas van y sus mensajes. Exporta todo a CSV cuando quieras.

Solo las personas de la lista pueden confirmar. Si alguien entra a la página general, se le pide el código de su invitación.

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # completa las variables
npm run dev
```

Sin variables de Supabase, en local los datos se guardan en memoria (se borran al reiniciar). En Vercel, Supabase es obligatorio.

## Estructura

```
app/                  páginas y API (Next.js App Router)
  api/admin/…         login, invitados (crear/editar/borrar), exportar CSV
  api/rsvp            buscar invitación por código y confirmar
  api/calendar        archivo .ics para Apple/Outlook
components/invite/    sobre, hero, cuenta regresiva, detalles + mapa, RSVP
components/admin/     login y panel
lib/event.ts          datos del evento
lib/store.ts          acceso a Supabase
supabase/schema.sql   tabla guests
public/stickers/      stickers recortados de las imágenes de referencia
public/nini/          fotos de Nini de niña (sin fondo, con borde) y sombreritos de fiesta
lib/nini.ts           tamaño de cada foto y posición de su sombrerito
public/og.jpg         vista previa al compartir por WhatsApp
```
