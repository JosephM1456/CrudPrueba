# Sistema Multiempresa - Prototipo de Demostración

Realizado por el grupo conformado de: Jose Alberto Hidalgo, Joseph Muñoz, Fernando Almonte, Javier Gondres.

## Ejecución Local

### Requisitos
- Node.js 18+
- npm o yarn

### Backend (NestJS)
```bash
cd backend
npm install
npm run start:dev
# Disponible en http://localhost:3001
# Seed automático al iniciar
```

### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
# Disponible en http://localhost:3000
```

---

## Guía de Demo

1. **Abrir** http://localhost:3000 → Dashboard con resumen general
2. **Empresas**: Ver las 2 empresas de ejemplo. Cambiar empresa activa desde el selector superior
3. **Productos**: CRUD completo — crear, editar, ver detalle, eliminar. Filtrado por empresa
4. **Categorías**: Gestión de categorías por empresa
5. **Sucursales**: Locales asociados a cada empresa
6. **Proveedores**: Gestión de proveedores
7. **Clientes**: Registro de clientes con límite de crédito
8. **Empleados**: Personal asociado a empresa
9. **Stock**: Inventario por sucursal y producto
