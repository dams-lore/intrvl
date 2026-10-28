# T-002 — Sortir la clé Anthropic de l'app (proxy)

- **Statut** : à faire
- **Priorité** : P0 avant toute distribution hors du téléphone de Dams (TestFlight inclus)
- **Type** : feat / sécurité
- **Dépend de** : décision de Dams sur l'hébergeur

## Pourquoi
`EXPO_PUBLIC_ANTHROPIC_KEY` est compilée dans le JS de l'app. Avec un Development Build ou un TestFlight, n'importe qui peut l'extraire et consommer le crédit API.

## Fichiers concernés
- `app/(tabs)/activities/new.tsx` (fonction `importFromPhoto`)
- Nouveau : fonction serverless (dossier `server/` ou repo séparé)

## À faire
1. Dams choisit l'hébergeur (proposition : Cloudflare Workers, gratuit, une seule fonction).
2. Fonction `POST /parse-workout` : reçoit l'image en base64, appelle l'API Anthropic avec la clé stockée en secret côté serveur, renvoie le JSON.
3. L'app appelle cette URL (`EXPO_PUBLIC_PARSE_URL`) à la place de `api.anthropic.com`.
4. Protection minimale contre l'abus : limite de taille d'image + limite de débit.
5. Supprimer `EXPO_PUBLIC_ANTHROPIC_KEY` du code et de `.env`, puis régénérer la clé dans la console Anthropic.

## Critère de fin
- [ ] Import par photo d'un WOD réel → séance créée comme avant.
- [ ] `grep -r ANTHROPIC_KEY app/` ne renvoie plus rien.

## Hors périmètre
Comptes utilisateurs, backend complet.
