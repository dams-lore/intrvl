# T-005 — Section « Mes scores » dans Profile

- **Statut** : à faire
- **Priorité** : P2
- **Type** : feat
- **Dépend de** : T-003 (pour utiliser les tokens)

## Pourquoi
Les records running et force existent (`store/recordsStore.ts`, écran `app/records.tsx`) mais ne sont pas visibles depuis `profile.tsx`. C'est la base de la calibration des intervalles par l'import photo : l'athlète doit les voir et les remplir facilement.

## Fichiers concernés
- `app/(tabs)/profile.tsx`
- `store/recordsStore.ts` (lecture seule)
- `app/records.tsx` (navigation)

## À faire
1. Carte « Mes scores » dans Profile : 3-4 records clés (ex. 1 km, 5 km, 1RM) avec allure / poids.
2. Tap sur la carte → `app/records.tsx`.
3. État vide : invitation à saisir un premier record.

## Critère de fin
- [ ] Profile affiche les records saisis ; un record ajouté dans Records apparaît au retour sur Profile.
- [ ] Sans record : l'état vide s'affiche et mène à l'écran Records.

## Hors périmètre
Nouveaux types de records, calcul automatique depuis les séances.
