# Intégrations et ressources

## Anthropic API (import par photo)
- Appel : `app/(tabs)/activities/new.tsx`, Messages API, modèle `claude-sonnet-5-5`, `max_tokens: 2000`.
- Clé : `EXPO_PUBLIC_ANTHROPIC_KEY` dans `.env` (ignoré par git).
- ⚠️ Toute variable `EXPO_PUBLIC_*` est compilée dans le JS de l'app : n'importe qui avec l'app peut extraire la clé. OK pour Expo Go en local, **interdit** dès qu'un build sort du téléphone de Dams. Ticket T-002 (proxy serverless).

## Builds iOS : Codemagic + EAS
- `codemagic.yaml` : workflow `ios-development-build`, Mac mini M2, `expo prebuild` → CocoaPods → signature ad hoc → `.ipa`.
- Déclenché **à chaque push sur `master`** : chaque merge consomme des minutes de build. Si ça devient coûteux, passer en déclenchement manuel ou sur tag.
- Groupes de variables Codemagic : `expo_credentials` (`EXPO_TOKEN`), `apple_credentials` (clés App Store Connect).
- Bundle ID : `com.damslore.intrvl`. Compte Apple Developer actif depuis oct. 2026.
- `eas.json` : profils `development` (dev client, interne), `preview`, `production`.

## Figma (MCP, lecture + écriture)
- Fichier : `akSiGekTw8lwC4Hr0UQJBp` — « Another Intrval App ».
- Usage : agent `.claude/agents/design-figma.md`.

## Notion (MCP, **lecture seule**)
Notion = vitrine stratégie / décisions. Le repo (`docs/`) = mémoire de dev. En cas de conflit, le code et `docs/` font foi.
| Page | ID |
|---|---|
| Hub projet | `33e604dbf808810383cfc57185e7f676` |
| Cahier des charges | `341604dbf80881329a991f944350fef61` ⚠️ 33 caractères au lieu de 32 : ID à vérifier |
| Data Model v2 | `341604dbf80881ff893cc379f1fb1feb` |
| Launch Brief | `341604dbf80881e8a583e143c03f8924` |
| Communities v2 | `36c604dbf808812f8a08fccdadba3d54` |
| Plan d'exécution | `35d604dbf80881dfb265d44cc0d7d497` |

## Webflow
Landing page prévue, site créé mais vide : `anotherinterval-app.design.webflow.com`. Hors périmètre du repo pour l'instant.

## GitHub
Repo `github.com/dams-lore/intrvl`, branche `master`. Push et merge via GitHub Desktop.
