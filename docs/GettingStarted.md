# Getting Started Guide

This guide covers the initial setup, configuration, and code quality standards for the **node_dhi** project.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: >= 12.x
- **MongoDB**: >= 4.x
- **Redis**: For caching and background jobs

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (see [Configuration](#configuration))
4. Run in development mode:
   ```bash
   npm run dev
   ```

### Available Scripts
- `npm start`: Start production server
- `npm run dev`: Start development server with nodemon
- `npm test`: Run tests with Jest
- `npm run lint`: Run ESLint
- `npm run format`: Format code with Prettier

---

## ⚙️ Configuration

The application uses environment variables for configuration. All settings are centralized in `config/index.js` and validated using `config/validateEnv.js`.

### Required Environment Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5001` |
| `DB_URL` | MongoDB URI | `mongodb://localhost:27017/db` |
| `JWT_SECRET` | Secret for token signing | `min-32-chars-secret` |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` |
| `NODE_ENV` | Environment | `development`, `production` |

### Adding New Config
1. Add the variable to `.env` and `.env.example`.
2. Update the schema in `config/validateEnv.js`.
3. Add the mapping in `config/index.js`.
4. Use it via `const config = require('./config')`.

---

## ✨ Code Quality & Automation

We enforce high code quality standards through automated tools and Git hooks.

### 🛠️ Toolchain
- **ESLint**: For static code analysis and identifying patterns.
- **Prettier**: For consistent code formatting.
- **Husky**: For Git hooks management.
- **lint-staged**: To run linting only on changed files.

### 🛡️ Pre-commit Hooks
Whenever you run `git commit`, the following actions occur automatically:
1. **Linting**: ESLint checks your code and auto-fixes style issues.
2. **Formatting**: Prettier ensures your code matches the project's style guide.
3. **Prevention**: If linting fails, the commit is blocked to prevent bad code from entering the repo.

### 🎨 Style Guide Highlights
- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Mandatory
- **Line Length**: Max 100 characters

For more detailed coding standards, see the [Architecture & Code Guide](./ArchitectureGuide.md).
