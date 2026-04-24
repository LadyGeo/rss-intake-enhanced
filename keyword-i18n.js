/**
 * Non-English regulatory phrases → English canonical labels + keyword_type.
 * Matched with diacritic folding (é→e, ß→ss). Extend by jurisdiction.
 * Loaded after keyword-lists.js.
 */
(function () {
  window.RSS_INTAKE_I18N_RULES = {
    enforcement: [
      {
        en: "enforcement action",
        patterns: [
          "action d'enquête",
          "action de poursuite",
          "procedure administrative de sanction",
          "procédure administrative de sanction",
          "sanction administrative",
          "mise en demeure",
          "injonction de faire",
          "durchsetzung",
          "durchsetzungsmassnahme",
          "durchsetzungsmaßnahme",
          "bußgeldbescheid",
          "bussgeldbescheid",
          "ordnungswidrigkeit",
          "zwangsgeld",
          "sanción administrativa",
          "expediente sancionador",
          "resolución sancionadora",
          "procedimiento sancionador",
          "sanzione amministrativa",
          "procedimento sanzionatorio",
          "sanction administrative",
          "handhavingsactie",
          "last onder dwangsom",
          "coercieve handhaving",
        ],
      },
      {
        en: "penalty imposed",
        patterns: [
          "amende infligée",
          "sanction pécuniaire",
          "amende de",
          "geldboete opgelegd",
          "boete opgelegd",
          "multa imposta",
          "multa impuesta",
          "sanción pecuniaria",
          "geldstrafe verhängt",
          "bußgeld festgesetzt",
          "bussgeld festgesetzt",
        ],
      },
      {
        en: "formal investigation",
        patterns: [
          "enquête formelle",
          "formelle untersuchung",
          "investigación formal",
          "indagine formale",
        ],
      },
    ],
    severity: [
      {
        en: "fine",
        patterns: [
          "amende de",
          "amende d'un montant",
          "multa de",
          "multa di",
          "geldboete",
          "boete van",
          "geldstrafe",
          "bußgeld",
          "bussgeld",
          "denda",
          "kara pieniężna",
          "kara pieniezna",
        ],
      },
      {
        en: "product recall",
        patterns: [
          "rappel de produit",
          "rappel produit",
          "rückruf",
          "rueckruf",
          "retirada del mercado",
          "ritiro dal mercato",
          "terugroepactie",
        ],
      },
    ],
    deadline: [
      {
        en: "deadline",
        patterns: [
          "date limite",
          "au plus tard le",
          "au plus tard au",
          "fristende",
          "stichtag",
          "letzte frist",
          "fecha límite",
          "fecha limite",
          "termin per il",
          "termine per il",
          "prazo final",
          "data limite",
        ],
      },
      {
        en: "comes into force",
        patterns: [
          "entre en vigueur",
          "entré en vigueur",
          "inkrafttreten",
          "tritt in kraft",
          "entra en vigor",
          "entra in vigore",
          "treedt in werking",
          "entra em vigor",
        ],
      },
      {
        en: "effective date",
        patterns: [
          "date d'effet",
          "date d'entrée en vigueur",
          "datum des inkrafttretens",
          "fecha de entrada en vigor",
          "data di entrata in vigore",
        ],
      },
    ],
    timing: [
      {
        en: "effective immediately",
        patterns: [
          "effet immédiat",
          "effet immediat",
          "sofort wirksam",
          "de inmediato",
          "con effetto immediato",
        ],
      },
    ],
    proposal: [
      {
        en: "public consultation",
        patterns: [
          "consultation publique",
          "consultation publique",
          "öffentliche konsultation",
          "oeffentliche konsultation",
          "consulta pública",
          "consulta publica",
          "consultazione pubblica",
          "openbare consultatie",
          "audiência pública",
          "consulta pública",
        ],
      },
      {
        en: "draft regulation",
        patterns: [
          "projet de règlement",
          "projet de reglement",
          "regelungsentwurf",
          "referentenentwurf",
          "anteproyecto de ley",
          "progetto di decreto",
          "wetsvoorstel",
        ],
      },
      {
        en: "bill introduced",
        patterns: [
          "proposition de loi",
          "loi déposée",
          "gesetzentwurf eingebracht",
          "proyecto de ley",
        ],
      },
    ],
    litigation: [
      {
        en: "lawsuit filed",
        patterns: [
          "recours contentieux",
          "action en justice",
          "klage eingereicht",
          "demanda interpuesta",
          "ricorso giurisdizionale",
        ],
      },
      {
        en: "class action",
        patterns: [
          "action de groupe",
          "sammelklage",
          "acción colectiva",
          "azione collettiva",
        ],
      },
      {
        en: "settlement",
        patterns: [
          "transaction pénale",
          "accord transactionnel",
          "vergleich",
          "acuerdo transaccional",
          "accordo transattivo",
        ],
      },
    ],
    context: [
      {
        en: "competition and markets authority",
        patterns: [
          "autorité de la concurrence",
          "autorite de la concurrence",
          "bundeskartellamt",
          "kartellamt",
          "autoridad de competencia",
          "autorità garante della concorrenza",
          "nederlandse mededingingsautoriteit",
          "autoridade da concorrência",
          "autoridade da concorrencia",
        ],
      },
      {
        en: "digital markets act",
        patterns: [
          "marchés numériques",
          "marches numeriques",
          "digitale märkte",
          "digitale maerkte",
          "mercados digitales",
          "mercati digitali",
        ],
      },
      {
        en: "digital services act",
        patterns: [
          "services numériques",
          "services numeriques",
          "digitale diensten",
          "servicios digitales",
          "servizi digitali",
        ],
      },
      {
        en: "european commission",
        patterns: [
          "commission européenne",
          "commission europeenne",
          "europäische kommission",
          "europaeische kommission",
          "comisión europea",
          "commissione europea",
          "europese commissie",
          "comissão europeia",
          "comissao europeia",
        ],
      },
    ],
    privacy: [
      {
        en: "personal data",
        patterns: [
          "données personnelles",
          "donnees personnelles",
          "personenbezogene daten",
          "datos personales",
          "dati personali",
          "gegevens van betrokkenen",
          "dados pessoais",
        ],
      },
      {
        en: "data protection",
        patterns: [
          "protection des données",
          "protection des donnees",
          "datenschutz",
          "protección de datos",
          "proteccion de datos",
          "protezione dei dati",
          "gegevensbescherming",
          "proteção de dados",
          "protecao de dados",
          "個人情報",
          "개인정보",
        ],
      },
      {
        en: "gdpr",
        patterns: [
          "rgpd",
          "règlement général sur la protection des données",
          "reglement general sur la protection des donnees",
          "dsgvo",
          "avg",
        ],
      },
    ],
    pricing: [
      {
        en: "drip pricing",
        patterns: [
          "prix décomposé",
          "prix decompose",
          "preisaufteilung",
          "precio fraccionado",
          "prezzo frazionato",
        ],
      },
      {
        en: "hidden fee",
        patterns: [
          "frais cachés",
          "frais caches",
          "versteckte gebühr",
          "versteckte gebuehr",
          "cargo oculto",
          "costo nascosto",
        ],
      },
    ],
    checkout: [
      {
        en: "buy now pay later",
        patterns: [
          "paiement différé",
          "paiement differe",
          "ratenzahlung",
          "pago aplazado",
          "paga dopo",
        ],
      },
      {
        en: "automatic renewal",
        patterns: [
          "renouvellement automatique",
          "automatische verlängerung",
          "automatische verlaengerung",
          "renovación automática",
          "rinnovo automatico",
        ],
      },
    ],
    shipping: [
      {
        en: "cross-border",
        patterns: [
          "transfrontalier",
          "grenzüberschreitend",
          "grenzueberschreitend",
          "transfronterizo",
          "transfrontaliero",
        ],
      },
      {
        en: "import duty",
        patterns: [
          "droit d'importation",
          "droit d importation",
          "einfuhrzoll",
          "arancel de importación",
          "arancel de importacion",
          "dazio di importazione",
        ],
      },
    ],
    accessibility: [
      {
        en: "wcag",
        patterns: [
          "référentiel général d'amélioration de l'accessibilité",
          "referentiel general d'amelioration de l'accessibilite",
          "barrierefreiheit",
          "accessibilità web",
          "accessibilidad web",
        ],
      },
    ],
    pdp: [
      {
        en: "country of origin",
        patterns: [
          "pays d'origine",
          "pays d origine",
          "herkunftsland",
          "país de origen",
          "pais de origen",
          "paese d'origine",
          "paese d origine",
        ],
      },
      {
        en: "misleading representation",
        patterns: [
          "pratique commerciale trompeuse",
          "irreführende geschäftspraktik",
          "irrefuehrende geschaeftspraktik",
          "práctica comercial engañosa",
          "pratica commerciale scorretta",
        ],
      },
    ],
  };
})();
