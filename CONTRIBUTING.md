# Contributing Guide

Thank you for contributing to CyberSoluce Asset Manager!

## Development Setup

1. **Clone and install**
   ```bash
   git clone <repository-url>
   cd CyberSoluce-AssetManager
   npm install
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env.local
   # Add your Supabase credentials
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

## Code Standards

- TypeScript strict mode
- 80%+ test coverage
- Follow ESLint rules
- Comprehensive error handling

## Testing

- Write tests for new features
- Run: `npm test`
- Coverage: `npm run test:coverage`

## Database

- Migrations in `supabase/migrations/`
- Test RLS policies
- Verify data isolation

## Commit Messages

Follow Conventional Commits format.

---

Thank you! 🎉

