# T-004 — Nettoyer les restes du template et les imports interdits

- **Statut** : à faire
- **Priorité** : P1
- **Type** : chore
- **Dépend de** : —

## Pourquoi
- Un `_layout.tsx` traîne à la racine du repo, en double (différent) de `app/_layout.tsx` : source de confusion pour les agents. C'est aussi lui qui importe encore `@react-navigation/native`, interdit depuis le SDK 56.
- Fichiers du template Expo inutilisés : `app/modal.tsx`, `components/EditScreenInfo.tsx`, `components/__tests__/`, etc.

## Fichiers concernés
- `_layout.tsx` (racine), `app/_layout.tsx`
- `app/modal.tsx`, `components/*`

## À faire
1. Comparer `_layout.tsx` (racine) et `app/_layout.tsx` ; reporter dans `app/_layout.tsx` ce qui serait utile, puis supprimer celui de la racine.
2. Vérifier qu'aucun import `@react-navigation/*` ne subsiste dans `app/`, et retirer la dépendance `@react-navigation/native` de `package.json` si plus rien ne l'utilise (vérifier avec Context7).
3. Supprimer les fichiers de template non utilisés (attention : `app/modal.tsx` est peut-être déclaré dans `app/_layout.tsx`) (vérifier avec `grep` avant chaque suppression).

## Critère de fin
- [ ] L'app démarre, les 4 onglets s'ouvrent, une séance se lance et se sauvegarde.
- [ ] `npx tsc --noEmit` passe.

## Hors périmètre
Refacto de `run.tsx`.
