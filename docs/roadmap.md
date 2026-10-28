# Roadmap

> Mise à jour par `/handoff`. Une étape = un critère de fin vérifiable sur l'iPhone.

## Plateformes
| Phase | Plateforme | Statut |
|---|---|---|
| 1 | iPhone (Expo) | 🟢 actif |
| 2 | Apple Watch via WorkoutKit (Development Build Codemagic, pas besoin de Mac) | ⏳ — nécessite une Apple Watch d'occasion (Series 4+ ou SE) pour tester |
| 3 | Garmin Connect IQ (Vivoactive 5) | 🟡 commencé en avance — voir `docs/garmin.md` |

## App iPhone — étapes
| Étape | Contenu | Statut |
|---|---|---|
| 1 | Bootstrap, onglets, design system | ✅ |
| 2-3 | Formats de séance (For Time, AMRAP, Intervals), exécution | ✅ |
| 4 | Corrections AMRAP/Intervals, Home, Profile, mode gym | ✅ |
| 5 | Polish, audio (`expo-audio`), haptics, stabilité | ✅ (à revalider, voir ci-dessous) |
| 6 | Import par photo (Claude Vision), vitesse GPS, records perso, analytics avec splits par round | ✅ |
| 7 | Refonte Liquid Glass (dégradé, cartes verre, Manrope) | ✅ partiel — tokens non centralisés (T-003) |
| 8 | Development Build iOS via Codemagic | 🟡 config commitée, bloqué jusqu'ici par l'activation du compte Apple Developer (pris en oct. 2026) |
| 9 | Intégration Garmin côté iPhone (module natif) | ⏳ dépend de l'étape 8 |
| 10 | Interval score partageable | ⏳ |
| 11 | Backend + communauté | ⏳ |

## Non-régression à revalider sur l'iPhone (ex-critères étape 5)
- [ ] Bip audio audible à 10 s de la fin (du bloc pour Intervals, du cap pour AMRAP), musique non coupée
- [ ] Haptics perceptibles à 10 s de la fin
- [ ] AMRAP : arrêt automatique au cap → écran résumé avec le nombre de rounds
- [ ] Intervals : passage auto au bloc suivant + bouton Skip
- [ ] Mode gym : badge « Round X/N » dans l'en-tête
- [ ] For Time et navigation entre séances sans régression

## Décisions en attente
- Définition exacte du premium (voir tension dans `docs/product.md`).
- Une seule famille de polices pour les chiffres (T-003).
- Proxy pour la clé API avant toute distribution externe, même TestFlight (T-002).
