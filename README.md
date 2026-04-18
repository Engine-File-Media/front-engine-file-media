# Engine File Media - Volume Purchase System

Frontend e-commerce para publicaciones tecnicas de motorsport. Esta aplicacion usa React, TypeScript y Vite, con integracion de pagos via PayPal y una arquitectura preparada para escalar a multiples volumenes.

---

## Project Overview

Engine File Media permite:
- mostrar el catalogo de volumenes con galeria visual
- cotizar costos de envio e impuestos por direccion
- completar checkout con redireccion a PayPal
- persistir datos clave de compra en localStorage

El alcance actual se centra en Volume I, pero la estructura esta orientada a evolucionar hacia rutas dinamicas tipo `/volumes/:volumeId`.

---

## Architecture and File Structure

```text
src/
  api/
    client.ts
    payments.ts
    types.ts
  components/
    layout/
      Footer.tsx
      FooterGeneral.tsx
      Navbar.tsx
      Navbar.css
    pages/
      AboutPage.tsx
      HomePage.tsx
      JournalPage.tsx
      NotFoundPage.tsx
      PurchaseCancelPage.tsx
      PurchasePage.tsx
      PurchaseReturnPage.tsx
      Volume1Page.tsx
  utils/
    storage.ts
  App.tsx
  App.css
  index.css
  main.tsx
```

Nota: se omiten detalles de `src/assets/` segun lo solicitado.

---

## Main Components

### Layout
- `Navbar.tsx`: navegacion principal.
- `Footer.tsx` y `FooterGeneral.tsx`: pie de pagina.

### Pages
- `HomePage.tsx`: portada y entrada al catalogo.
- `Volume1Page.tsx`: detalle del volumen.
- `PurchasePage.tsx`: formulario de compra, cotizacion y checkout.
- `PurchaseReturnPage.tsx`: estado exitoso de regreso desde PayPal.
- `PurchaseCancelPage.tsx`: cancelacion de pago.
- `AboutPage.tsx` y `JournalPage.tsx`: contenido institucional/editorial.
- `NotFoundPage.tsx`: fallback 404.

---

## Services

### API Layer (`src/api`)
- `client.ts`: cliente Axios.
- `payments.ts`: operaciones principales del flujo de compra.
  - `getBooksPricing()`
  - `createQuote(payload)`
  - `createCheckout(quoteId)`
- `types.ts`: contratos de datos (`BookPricing`, `QuoteResponse`, `CheckoutResponse`, `OrderStatus`, etc.).

### Storage Layer (`src/utils/storage.ts`)
- persistencia de estado de compra
- recuperacion con ventana de validez temporal
- limpieza del estado almacenado

---

## Routes

Rutas actuales:
- `/` -> `HomePage`
- `/volume-i` -> `Volume1Page`
- `/purchase` -> `PurchasePage`
- `/purchase/return` -> `PurchaseReturnPage`
- `/purchase/cancel` -> `PurchaseCancelPage`
- `/about` -> `AboutPage`
- `/journal` -> `JournalPage`
- `*` -> `NotFoundPage`

Ruta objetivo de escalabilidad:
- `/volumes/:volumeId`

---

## Technology Stack

- React 18
- TypeScript
- Vite
- React Router
- Axios
- Tailwind CSS
- CSS tradicional (archivos locales)

Integraciones externas:
- PayPal (checkout)
- backend de pricing/quote/checkout (via proxy `/api`)

---

## Local Development

### Prerequisites
- Node.js 18+
- npm

### Install
```bash
npm install
```

### Run in dev mode
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Preview build
```bash
npm run preview
```

### Lint
```bash
npm run lint
```

---

## CAPTCHA (Cloudflare Turnstile)

Frontend captcha is configured through:

```bash
VITE_TURNSTILE_SITE_KEY=
```

Setup:
1. Copy `.env.example` to `.env`.
2. Set `VITE_TURNSTILE_SITE_KEY` with your Cloudflare Turnstile site key.
3. Restart the Vite dev server after updating env values.

Behavior by backend mode:
1. If backend `CAPTCHA_ENABLED=true`, quote and checkout requests include `X-Captcha-Token` and require solving captcha.
2. If backend `CAPTCHA_ENABLED=false`, frontend can run without site key and requests continue without captcha header.

Error handling in checkout flow:
1. `401` + `timeout-or-duplicate`: widget is reset and user must solve a new challenge.
2. `401` missing/invalid token: blocking message shown until captcha is solved.
3. `502` verification outage: temporary message shown and user can retry manually.

---

## Purchase Flow Summary

1. El usuario entra a `Volume1Page`.
2. Continua a `PurchasePage`.
3. Completa datos de envio y contacto.
4. Se solicita una cotizacion al backend (`createQuote`).
5. Se crea checkout (`createCheckout`) y se redirige a PayPal.
6. El retorno se maneja en `PurchaseReturnPage` o `PurchaseCancelPage`.

---

## Convertir PNG a WebP

Para optimizar imagenes PNG a formato WebP en el directorio actual, usa este comando PowerShell:

```powershell
Get-ChildItem *.png | ForEach-Object {
  $webpFile = $_.BaseName + ".webp"
  magick $_.FullName $webpFile
  Remove-Item $_.FullName
}
```

### Que hace?
1. `Get-ChildItem *.png` obtiene todos los PNG del directorio.
2. `ForEach-Object` recorre cada archivo.
3. `$_.BaseName + ".webp"` genera el nombre del archivo de salida.
4. `magick` convierte PNG a WebP.
5. `Remove-Item` elimina el PNG original.

### Herramientas requeridas
- [ImageMagick](https://imagemagick.org/)
- Instalacion sugerida en Windows: `choco install imagemagick`

---

## License

Proprietary - Engine File Media
