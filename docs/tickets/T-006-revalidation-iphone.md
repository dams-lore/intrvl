# T-006 — Revalidation complète sur l'iPhone (baseline)

- **Statut** : à faire
- **Priorité** : P0 — premier ticket de la nouvelle organisation
- **Type** : test
- **Dépend de** : —

## Pourquoi
Les documents de suivi ont divergé du code pendant des mois. Avant de déléguer aux agents, il faut une baseline vérifiée : ce qui marche vraiment aujourd'hui.

## Fichiers concernés
Aucun changement de code. Mise à jour de `docs/roadmap.md` uniquement.

## À faire
1. Dams lance l'app : `npx expo start --tunnel --clear --port 8082`.
2. Dams déroule la checklist de `docs/roadmap.md` § Non-régression, plus : import par photo, records, analytics avec splits.
3. Dams donne le résultat ligne par ligne ; Claude met à jour la roadmap et crée un ticket `fix` par point KO.

## Critère de fin
- [ ] Chaque ligne de la checklist est cochée OK ou a un ticket `fix` associé.

## Hors périmètre
Corriger quoi que ce soit pendant ce ticket.
