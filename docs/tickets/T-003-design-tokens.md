# T-003 — Centraliser les tokens de design

- **Statut** : à faire
- **Priorité** : P1 — prérequis à tout travail design avec l'agent Figma
- **Type** : design / chore
- **Dépend de** : décision de Dams sur les polices (voir ci-dessous)

## Pourquoi
Le dégradé, les couleurs de format et les polices sont recopiés dans chaque écran ; `constants/Colors.ts` est encore celui du template Expo. Impossible de synchroniser proprement avec les variables Figma, et chaque retouche de couleur touche 10 fichiers.

## Fichiers concernés
- `constants/Colors.ts` → remplacé par `constants/theme.ts`
- Tous les écrans de `app/` qui définissent `GRAD`, `DARK`, `FORMAT_COLOR` ou des hex en dur
- `app.json` (couleurs splash / icône encore beiges `#F0EFEB`)

## À faire
1. Créer `constants/theme.ts` : `colors`, `gradient`, `formatColors`, `fonts`, `radii`, `spacing`.
2. Remplacer les constantes locales par des imports, **sans changement visuel**.
3. Décision à faire valider par Dams : garder Inter **ou** Bebas Neue pour les chiffres (3 familles = une de trop).
4. Mettre à jour `docs/design-system.md`.

## Critère de fin
- [ ] Les 4 onglets + écran de séance (compact et gym) sont visuellement identiques à avant (comparer avec des captures avant/après).
- [ ] `grep -rn "#f0c4a0" app/` ne renvoie plus rien.

## Hors périmètre
Changer les couleurs elles-mêmes. Synchronisation des variables Figma (ticket suivant, via l'agent `design-figma`).
