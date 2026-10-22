# intrvl — app mobile (interval-app-v2)

Racine du projet : `C:\Users\DamienCOQUET\interval-app\interval-app-v2` (contient package.json et .git).
Toutes les commandes npm / npx / expo / git se lancent depuis ce dossier, jamais depuis le dossier parent.

## Stack
- Expo SDK 56+ avec expo-router (routes dans `app/`), Zustand (`store/`), AsyncStorage.
- Depuis le SDK 56 : aucun import `@react-navigation/*` dans le code de l'app → utiliser `expo-router/react-navigation`, `expo-router/js-tabs`, etc.
- Import de workout par photo : `app/(tabs)/activities/new.tsx`, appel direct à l'API Anthropic (Messages API).
  - Modèle à utiliser : `claude-sonnet-5-5` (les modèles Claude 4 sont retirés de l'API).
  - Clé API : variable `EXPO_PUBLIC_ANTHROPIC_KEY` dans `.env` (jamais en dur dans le code, jamais affichée dans le terminal).

## Lancer l'app
- `npx expo start --tunnel --clear --port 8082` (le mode tunnel est nécessaire : le réseau local ne passe pas).
- Après toute modif de `.env` : relancer avec `--clear`.

## Façon de travailler
- L'utilisateur (Dams) est product owner, pas développeur : fais les modifications toi-même, ne lui demande pas de copier-coller du code.
- Réponds en français, court, direct.
- Après chaque modif : `npx tsc --noEmit`, relis `git diff`, puis commit avec un message clair. Ne pousse pas sans qu'on te le demande.
- Termine toujours par la commande exacte à lancer pour tester sur l'iPhone.
