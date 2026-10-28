# T-001 — Rapatrier l'app Garmin dans le repo

- **Statut** : à faire
- **Priorité** : P0 — le code n'existe que sur le PC, sans sauvegarde
- **Type** : chore
- **Dépend de** : —

## Pourquoi
Les sources Monkey C (`IntrvlWatchApp.mc`, `IntrvlWatchView.mc`, `CommManager.mc`, `WorkoutInputDelegate.mc`) ne sont dans aucun repo. Un disque qui lâche = travail perdu, et les agents ne voient pas le protocole JSON côté montre.

## Fichiers concernés
- Nouveau dossier `watch-garmin/` (sources, `manifest.xml`, `monkey.jungle`, `resources/`)
- `.gitignore` (déjà : `*.der`, `*.pem`, `watch-garmin/bin/`)
- `docs/garmin.md`

## À faire
1. Dams indique le dossier du projet Connect IQ sur son PC (chercher `IntrvlWatchApp.mc` dans l'explorateur Windows).
2. Copier le projet dans `watch-garmin/` **sans** la clé développeur ni le dossier `bin/`.
3. Vérifier qu'aucun secret n'est inclus (`git status`, puis relire la liste des fichiers ajoutés).
4. Documenter dans `docs/garmin.md` : format exact des messages JSON iPhone → montre, et la commande de build.

## Critère de fin
- [ ] Sur github.com, le dossier `watch-garmin/` contient les 4 fichiers `.mc` et le manifest, et aucun `.der` / `.pem`.
- [ ] Le build depuis `watch-garmin/` tourne toujours dans le simulateur Vivoactive 5.

## Hors périmètre
Finir la refonte design de la montre (ticket séparé, à créer après celui-ci).
