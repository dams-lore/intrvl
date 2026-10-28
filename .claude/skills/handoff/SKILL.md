---
name: handoff
description: Fin de session — met à jour docs/ (roadmap, learnings, tickets) avec ce qui a été fait, appris et décidé pendant la session, pour que la session suivante reparte sans contexte perdu. À lancer quand Dams dit « on s'arrête », « handoff » ou « fin de session ».
---

# /handoff — passation de fin de session

Objectif : la prochaine session (toi, sans mémoire de celle-ci) doit pouvoir reprendre en lisant `CLAUDE.md` + `docs/`.

## 1. Collecter
- `git log master..HEAD --oneline` et `git status` sur la branche courante.
- Relis la conversation : tickets touchés, retours de test iPhone de Dams, bugs rencontrés, décisions prises.

## 2. Mettre à jour (uniquement ce qui a changé)
- **`docs/tickets/`** : statut de chaque ticket touché (`fait` seulement si Dams a confirmé sur l'iPhone). Nouveaux tickets pour les problèmes découverts (utilise `docs/tickets/_template.md`, ID suivant). Mets à jour `docs/tickets/README.md`.
- **`docs/learnings.md`** : chaque piège qui a coûté plus d'un essai → une règle d'une ligne, dans la bonne section. Pas d'historique narratif.
- **`docs/roadmap.md`** : statuts des étapes, décisions en attente tranchées ou nouvelles.
- **`docs/design-system.md`** / **`docs/product.md`** : seulement si une décision de Dams les change.
- **`CLAUDE.md`** : seulement si une règle devient critique (s'applique à presque chaque session). Garde-le sous 100 lignes.

Règles d'écriture : français, factuel, daté (`28/10/2026`), aucune spéculation. Ce que Dams a décidé ≠ ce que tu as proposé : n'écris comme décision que ce qu'il a validé.

## 3. Committer
`docs(handoff): session du <date>` — sans pousser.

## 4. Résumé à Dams (5 lignes max)
- Ce qui est fait / à tester / bloqué.
- Le prochain ticket recommandé, et pourquoi.
- Rappel : pousser la branche via GitHub Desktop.
