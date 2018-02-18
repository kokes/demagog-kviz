Tady najdete *naprosto neoficiální kvíz* na základě výroků ze serveru [Demagog.cz](http://demagog.cz). Můžete si otestovat, jak moc dobře byste zvládali fact check politických diskusí.

Data jsou stažená krapet na hulváta, takže bych poprosil o nereplikování této části mojí práce - commitnul jsem i raw data, tak můžete použít ty. Stahovací skripty jsou zde spíš pro úplnost. Lepší způsob získání dat by bylo požádat lidi z Demagoga přímo, to se stále nabízí. Nedělám si samozřejmě nárok na žádný obsah, který jsem z jejich serveru získal. Je to vše jen za účelem vytvoření tohoto kvízu.

**V každém případě doporučuji zvážit přispění serveru Demagog.cz, [na jejich webu](https://demagog.cz/diskuze/jak-je-projekt-demagogcz-financovan) najdete informace o jejich financování společně s informací o tom, jak můžete přispět i vy.**

----

**[Kvíz je tutaj](https://kokes.github.io/demagog-kviz/)**

Z technického hlediska to není nic velkého. Jde o jednoduchý skript, který líně načítá partitionovaná data pomocí HTTP requestu (takže je to 100% klientské). V Local Storage ukládá viděné výroky, aby se člověku nezobrazoval ten samý znova. Je tam nějaké základní nastavení. Používá to jen a pouze čistý JavaScript, není to zbabelované, takže to na spoustě konfigurací nepoběží, prostě taková domácí slátanina.

Co by chtělo dodělat:

- Přidání data vyřčení každého výroku - občas je to nutné pro pochopení souvislostí - bohužel toto datum není ve výpisu výroků, musel bych dělat request na každý výrok zvlášť, což by nebylo moc šetrné. Proto čekám na dump přímo z databáze.
- Filtrování na základě autora výroku - kód je vesměs hotový (a zakomentovaný), ale naráží to na nedokonalé načítání dat (asynchronost v synchronním kódu), ale i kdyby to fungovalo, tak to bude pomalé, takže by to chtělo spíš přepartitionovat vedle podle autorů (resp. stran).
- Opravit načítání dat (viz výše).
- Opravit relativní odkazy ve vysvětlení hodnocení - občas je vložen obrázek, který má adresu `/data/img/super_graf.png`, který ale logicky nemám u sebe). Proto by bylo dobré projít ten HTML stub a všechny relativní adresy nahradit za absolutní.

Stížnosti, výtky, problémy a jakékoliv další emoce můžete sdílet na mojem [e-mailu](mailto:ondrej.kokes@gmail.com) nebo [twitteru](https://twitter.com/kondrej).