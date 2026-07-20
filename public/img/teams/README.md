# Logos d'écuries

Déposer ici `<constructorId>.png` — l'identifiant est celui de Jolpica, celui-là
même qui sert de clé en base (`constructors.id`).

```
mercedes.png   ferrari.png    red_bull.png   mclaren.png
aston_martin.png   alpine.png   williams.png   rb.png
haas.png   audi.png   cadillac.png
sauber.png   alfa.png   alphatauri.png
```

Le fichier est détecté au chargement de la page : aucun code à toucher. Tant
qu'il est absent, la ligne affiche un monogramme tracé à la couleur de l'écurie
(`components/f1/TeamLogo.tsx`) — c'est un repli assumé, pas une erreur.

Format conseillé : PNG à fond transparent, hauteur ~64 px, logo détouré clair
(les classements sont sur fond sombre).

Aucun logo n'est versionné : ce sont des marques déposées. À chacun d'y placer
les fichiers dont il a l'usage.
