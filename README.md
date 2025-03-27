# React + TypeScript + Vite

Ce modèle fournit une configuration minimale pour utiliser React avec Vite, incluant le rechargement à chaud (HMR) et quelques règles ESLint.

Actuellement, deux plugins officiels sont disponibles :

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) utilise [Babel](https://babeljs.io/) pour Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) utilise [SWC](https://swc.rs/) pour Fast Refresh

## Extension de la configuration ESLint

Si vous développez une application destinée à la production, nous vous recommandons de mettre à jour la configuration afin d'activer des règles de lint plus strictes et adaptées aux types :

- Configurez la propriété `parserOptions` de premier niveau comme ceci :

```js
export default tseslint.config({
  languageOptions: {
    // autres options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Remplacez `tseslint.configs.recommended` par `tseslint.configs.recommendedTypeChecked` ou `tseslint.configs.strictTypeChecked`
- Ajoutez éventuellement `...tseslint.configs.stylisticTypeChecked`
- Installez [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) et mettez à jour la configuration :

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Définir la version de React
  settings: { react: { version: '18.3' } },
  plugins: {
    // Ajouter le plugin React
    react,
  },
  rules: {
    // autres règles...
    // Activer les règles recommandées
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```

