# Devisutra Admin Panel

Admin frontend for Devi Sutra e-commerce platform.

## Port
- Development: `http://localhost:3001`
- Production: Configure via deployment

## Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Commands
```bash
npm install
npm run dev    # Start development server on port 3001
npm run build  # Build for production
npm start      # Start production server
```

## Architecture
- Pure frontend application (no backend code)
- Communicates with devisutra-api via REST API
- Admin authentication handled by API
- Dashboard, products, orders, and customers management
