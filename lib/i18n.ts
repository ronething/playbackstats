import type { ImportErrorGuidance, YoutubeImportErrorCode } from "@/lib/youtube-import"

export const locales = ["en", "de", "fr"] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "en"

export const localeNames: Record<Locale, string> = {
  en: "English",
  de: "Deutsch",
  fr: "Français",
}

interface LandingContent {
  meta: {
    title: string
    description: string
    ogLocale: string
  }
  promo: {
    label: string
    mobileDescription: string
    desktopDescription: string
    action: string
    ariaLabel: string
  }
  nav: {
    homeAriaLabel: string
    navigationAriaLabel: string
    guide: string
    language: string
    skipToContent: string
    productFacts: string
    github: string
  }
  hero: {
    eyebrow: string
    title: string
    highlight: string
    description: string
    primaryAction: string
    secondaryAction: string
    trustLine: string
    panelEyebrow: string
    panelTitle: string
    panelDescription: string
    fileLabel: string
    dashboardLabel: string
  }
  proof: Array<{ label: string; value: string }>
  discoveries: {
    eyebrow: string
    title: string
    description: string
    items: Array<{ index: string; title: string; description: string }>
  }
  method: {
    eyebrow: string
    title: string
    description: string
    steps: Array<{ title: string; description: string }>
    limitationLabel: string
    limitationTitle: string
    limitationDescription: string
    jsonGuide: string
    channelGuide: string
  }
  export: {
    eyebrow: string
    title: string
    description: string
    action: string
    guideAction: string
    steps: Array<{ title: string; description: string }>
  }
  privacy: {
    eyebrow: string
    title: string
    description: string
    facts: Array<{ title: string; description: string }>
  }
  faq: {
    eyebrow: string
    title: string
    items: Array<{ question: string; answer: string }>
  }
  finalCta: {
    eyebrow: string
    title: string
    description: string
    action: string
    localPrivate: string
  }
  footer: {
    privacyStatement: string
    jsonGuide: string
    topChannels: string
    privacy: string
    terms: string
  }
  upload: {
    chooseAriaLabel: string
    dropTitle: string
    idleTitle: string
    descriptionStart: string
    chooseFile: string
    formats: string
    localNote: string
    processedLocally: string
    removeFile: string
    analyze: string
    progress: {
      archive: string
      json: string
      summaries: string
      saving: string
      opening: string
    }
    errors: Record<YoutubeImportErrorCode, ImportErrorGuidance>
  }
}

export function isLocale(value: string | null | undefined): value is Locale {
  return locales.includes(value as Locale)
}

export function localizeHome(locale: Locale): string {
  return locale === defaultLocale ? "/" : `/${locale}`
}

export const landingContent: Record<Locale, LandingContent> = {
  en: {
    meta: {
      title: "YouTube Watch History Analyzer & Stats | Playback Stats",
      description:
        "Analyze your YouTube watch history from Google Takeout. Discover top channels, repeat videos, streaks, and viewing patterns privately in your browser.",
      ogLocale: "en_US",
    },
    promo: {
      label: "AI music for creators",
      mobileDescription: "Create BGM for your next video.",
      desktopDescription: "Generate songs, BGM, and lyrics for videos, streams, and podcasts.",
      action: "Try Musefy",
      ariaLabel: "Create AI music and background tracks with Musefy",
    },
    nav: {
      homeAriaLabel: "Playback Stats home",
      navigationAriaLabel: "Playback Stats navigation",
      guide: "Export guide",
      language: "Language",
      skipToContent: "Skip to content",
      productFacts: "Product facts",
      github: "View Playback Stats on GitHub",
    },
    hero: {
      eyebrow: "Your private viewing archive",
      title: "A YouTube watch history analyzer that turns old views into",
      highlight: "clear patterns.",
      description:
        "Bring a Google Takeout ZIP or watch-history.json. Playback Stats reveals your top channels, repeat favorites, active days, and viewing rhythms without uploading the file.",
      primaryAction: "Analyze my history",
      secondaryAction: "See how it works",
      trustLine: "No YouTube login · no API key · no server upload",
      panelEyebrow: "Local analysis room",
      panelTitle: "Your file stays in this tab.",
      panelDescription: "Choose the original Takeout archive or its YouTube watch-history JSON file.",
      fileLabel: "File",
      dashboardLabel: "Local dashboard",
    },
    proof: [
      { label: "Processing", value: "100% in your browser" },
      { label: "Accepted files", value: "Takeout ZIP + JSON" },
      { label: "Account needed", value: "None" },
      { label: "Result", value: "A private dashboard" },
    ],
    discoveries: {
      eyebrow: "Inside the archive",
      title: "Not more data. A better view of the data you already own.",
      description:
        "Playback Stats organizes valid viewing events into comparisons that are easy to scan and honest about what the export can prove.",
      items: [
        {
          index: "01",
          title: "Viewing trends",
          description: "Follow daily and monthly activity across the full date range in your export.",
        },
        {
          index: "02",
          title: "Top channels",
          description: "Rank creators by recorded views and see how concentrated your viewing is.",
        },
        {
          index: "03",
          title: "Repeat favorites",
          description: "Find the videos you returned to most often, based on real history entries.",
        },
        {
          index: "04",
          title: "Personal rhythms",
          description: "See your busiest weekday, peak hour, active streaks, and long-term habits.",
        },
      ],
    },
    method: {
      eyebrow: "Transparent by design",
      title: "From export to insight, without a detour through our servers.",
      description:
        "Google Takeout provides a chronological list of viewing events. Playback Stats reads the supported fields, removes unusable rows, and creates compact chart data locally.",
      steps: [
        { title: "Export", description: "You download your own YouTube history from Google Takeout." },
        { title: "Read locally", description: "This browser tab opens the file and validates supported viewing records." },
        { title: "Explore", description: "A compact dashboard groups dates, videos, channels, and viewing patterns." },
      ],
      limitationLabel: "Important limitation",
      limitationTitle: "Views are not watch time.",
      limitationDescription:
        "YouTube watch-history exports do not include dependable minutes watched for each event. Playback Stats reports recorded views and activity patterns instead of inventing a total watch-time estimate.",
      jsonGuide: "Read the watch-history.json field guide",
      channelGuide: "See how channel rankings work",
    },
    export: {
      eyebrow: "Four simple steps",
      title: "How to export your YouTube watch history",
      description:
        "Use Google Takeout to create a copy of your history without granting Playback Stats access to your Google account.",
      action: "Open Google Takeout",
      guideAction: "View the detailed JSON guide",
      steps: [
        { title: "Open Google Takeout", description: "Sign in, deselect everything, then choose YouTube and YouTube Music." },
        { title: "Keep history only", description: "Open the included-data options and leave only history selected." },
        { title: "Download the export", description: "Keep the ZIP intact, or locate history/watch-history.json inside it." },
        { title: "Analyze it here", description: "Choose the ZIP or JSON above. Processing runs inside this browser tab." },
      ],
    },
    privacy: {
      eyebrow: "Privacy is the product",
      title: "Personal history should stay personal.",
      description:
        "The original Takeout file never reaches Playback Stats. Only compact dashboard summaries remain in the current browser session, and closing it clears them.",
      facts: [
        { title: "Browser only", description: "There is no history-file upload endpoint." },
        { title: "Session only", description: "Close the tab to clear the compact dashboard." },
        { title: "Open source", description: "Inspect the parsing and analysis rules yourself." },
      ],
    },
    faq: {
      eyebrow: "Good to know",
      title: "YouTube watch history analyzer FAQ",
      items: [
        {
          question: "How do I see my YouTube stats as a viewer?",
          answer:
            "Export YouTube and YouTube Music history with Google Takeout, then choose the Takeout ZIP or watch-history.json here. Playback Stats converts valid viewer records into channel rankings, trends, streaks, and personal patterns without connecting to your YouTube account.",
        },
        {
          question: "How do I see my most-watched YouTube channels?",
          answer:
            "Import your Takeout history and Playback Stats will group valid viewing events by channel. The result is a frequency ranking based on recorded views, not an invented watch-time total.",
        },
        {
          question: "Does my YouTube history get uploaded?",
          answer: "No. The file is read and summarized locally in your browser. Playback Stats has no upload endpoint for history files.",
        },
        {
          question: "How far back will the dashboard go?",
          answer:
            "It goes back to the earliest valid record in your export. It cannot recover periods when YouTube History was paused, items you deleted or Google removed through auto-delete, or records excluded by your activity settings.",
        },
        {
          question: "Can this calculate my total YouTube watch time?",
          answer:
            "No. Takeout records when a video was watched but does not provide reliable minutes watched for each event. Playback Stats reports viewing activity rather than making up a watch-time estimate.",
        },
        {
          question: "Why might the totals differ from YouTube?",
          answer:
            "Only valid records present in the exported JSON can be counted. Deleted or paused history, private or unavailable videos, auto-delete, and activity-setting changes can affect the export.",
        },
      ],
    },
    finalCta: {
      eyebrow: "Ready when you are",
      title: "Your viewing story is already in the file.",
      description: "Open it privately and turn years of watch history into something you can actually understand.",
      action: "Choose my history file",
      localPrivate: "Local / private",
    },
    footer: {
      privacyStatement: "Your history stays on your device",
      jsonGuide: "JSON guide",
      topChannels: "Top channels",
      privacy: "Privacy",
      terms: "Terms",
    },
    upload: {
      chooseAriaLabel: "Choose a YouTube watch history JSON file or Google Takeout ZIP",
      dropTitle: "Drop it here",
      idleTitle: "Bring your YouTube history",
      descriptionStart: "Drop the Takeout ZIP or JSON here, or",
      chooseFile: "choose a file",
      formats: "Takeout .zip or watch-history.json · up to 100 MB",
      localNote: "Archive checks, extraction, and analysis stay in this tab",
      processedLocally: "processed locally",
      removeFile: "Remove file",
      analyze: "Analyze my watch history",
      progress: {
        archive: "Checking archive safety limits...",
        json: "Reading JSON locally...",
        summaries: "Building private viewing summaries...",
        saving: "Saving this dashboard in the current tab...",
        opening: "Opening your dashboard...",
      },
      errors: {
        unsupported_format: {
          title: "This file type is not supported",
          message: "Choose a Google Takeout viewing-history JSON file or the original Takeout ZIP archive.",
          action: "Use a .json or .zip file and keep the export unmodified.",
        },
        malformed_json: {
          title: "The history JSON is damaged",
          message: "The file could not be decoded as valid JSON.",
          action: "Download the Takeout export again, or choose the original ZIP so Playback Stats can locate the file.",
        },
        incorrect_takeout_path: {
          title: "YouTube watch history was not found",
          message: "This looks like a different export file, or the ZIP does not contain recognizable YouTube viewing history.",
          action: "In Takeout, include YouTube and YouTube Music history, then import the ZIP or its viewing-history JSON file.",
        },
        empty_history: {
          title: "No viewing records were found",
          message: "The selected history is empty or contains no supported YouTube viewing events.",
          action: "Check that watch history was enabled and that the export contains the dates you expect.",
        },
        memory_exhaustion: {
          title: "This export is too large to process safely",
          message: "The file or archive exceeds a local safety limit, or this browser ran out of memory.",
          action: "Create a smaller Takeout export, close other tabs, or use a desktop browser with more available memory.",
        },
        browser_failure: {
          title: "The browser could not read this export",
          message: "A local browser or storage operation failed before the dashboard was ready.",
          action: "Try again in an up-to-date browser. Your selected file was not uploaded.",
        },
      },
    },
  },
  de: {
    meta: {
      title: "YouTube-Wiedergabeverlauf analysieren | Playback Stats",
      description:
        "Analysiere deinen YouTube-Wiedergabeverlauf aus Google Takeout. Entdecke Top-Kanäle, wiederholte Videos, Serien und Sehgewohnheiten – privat im Browser.",
      ogLocale: "de_DE",
    },
    promo: {
      label: "KI-Musik für Creator",
      mobileDescription: "Erstelle Musik für dein nächstes Video.",
      desktopDescription: "Erzeuge Songs, Hintergrundmusik und Texte für Videos, Streams und Podcasts.",
      action: "Musefy testen",
      ariaLabel: "KI-Musik und Hintergrundmusik mit Musefy erstellen",
    },
    nav: {
      homeAriaLabel: "Playback Stats Startseite",
      navigationAriaLabel: "Playback Stats Navigation",
      guide: "Export-Anleitung",
      language: "Sprache",
      skipToContent: "Zum Inhalt springen",
      productFacts: "Produktmerkmale",
      github: "Playback Stats auf GitHub ansehen",
    },
    hero: {
      eyebrow: "Dein privates Wiedergabearchiv",
      title: "Ein Analyzer für deinen YouTube-Wiedergabeverlauf, der alte Aufrufe in",
      highlight: "klare Muster verwandelt.",
      description:
        "Importiere eine Google-Takeout-ZIP oder watch-history.json. Playback Stats zeigt Top-Kanäle, wiederholte Favoriten, aktive Tage und Sehgewohnheiten, ohne die Datei hochzuladen.",
      primaryAction: "Verlauf analysieren",
      secondaryAction: "So funktioniert es",
      trustLine: "Kein YouTube-Login · kein API-Schlüssel · kein Server-Upload",
      panelEyebrow: "Lokaler Analyseraum",
      panelTitle: "Deine Datei bleibt in diesem Tab.",
      panelDescription: "Wähle das ursprüngliche Takeout-Archiv oder die YouTube-Datei watch-history.json.",
      fileLabel: "Datei",
      dashboardLabel: "Lokales Dashboard",
    },
    proof: [
      { label: "Verarbeitung", value: "100 % in deinem Browser" },
      { label: "Dateiformate", value: "Takeout-ZIP + JSON" },
      { label: "Konto erforderlich", value: "Nein" },
      { label: "Ergebnis", value: "Privates Dashboard" },
    ],
    discoveries: {
      eyebrow: "Im Archiv",
      title: "Nicht mehr Daten. Sondern ein besserer Blick auf deine eigenen.",
      description:
        "Playback Stats ordnet gültige Wiedergabeereignisse in verständliche Vergleiche ein und zeigt ehrlich, was der Export belegen kann.",
      items: [
        { index: "01", title: "Wiedergabetrends", description: "Verfolge tägliche und monatliche Aktivität über den gesamten Exportzeitraum." },
        { index: "02", title: "Top-Kanäle", description: "Ordne Creator nach erfassten Aufrufen und erkenne, wie vielfältig dein Verlauf ist." },
        { index: "03", title: "Wiederholte Favoriten", description: "Finde Videos, zu denen du laut deinen echten Verlaufseinträgen zurückgekehrt bist." },
        { index: "04", title: "Persönliche Rhythmen", description: "Entdecke deinen aktivsten Wochentag, Spitzenzeiten, Serien und langfristige Gewohnheiten." },
      ],
    },
    method: {
      eyebrow: "Bewusst transparent",
      title: "Vom Export zur Erkenntnis – ohne Umweg über unsere Server.",
      description:
        "Google Takeout liefert eine chronologische Liste von Wiedergabeereignissen. Playback Stats liest unterstützte Felder, entfernt unbrauchbare Einträge und erstellt die Diagrammdaten lokal.",
      steps: [
        { title: "Exportieren", description: "Du lädst deinen eigenen YouTube-Verlauf über Google Takeout herunter." },
        { title: "Lokal lesen", description: "Dieser Browser-Tab öffnet die Datei und prüft unterstützte Wiedergabeeinträge." },
        { title: "Entdecken", description: "Ein kompaktes Dashboard gruppiert Daten, Videos, Kanäle und Sehgewohnheiten." },
      ],
      limitationLabel: "Wichtige Einschränkung",
      limitationTitle: "Aufrufe sind keine Wiedergabezeit.",
      limitationDescription:
        "YouTube-Verlaufsexporte enthalten keine verlässlichen Wiedergabeminuten pro Ereignis. Playback Stats zeigt erfasste Aufrufe und Aktivitätsmuster, statt eine Gesamtzeit zu erfinden.",
      jsonGuide: "Feldbeschreibung für watch-history.json lesen",
      channelGuide: "So funktionieren Kanal-Rankings",
    },
    export: {
      eyebrow: "Vier einfache Schritte",
      title: "So exportierst du deinen YouTube-Wiedergabeverlauf",
      description:
        "Erstelle mit Google Takeout eine Kopie deines Verlaufs, ohne Playback Stats Zugriff auf dein Google-Konto zu geben.",
      action: "Google Takeout öffnen",
      guideAction: "Ausführliche JSON-Anleitung ansehen",
      steps: [
        { title: "Google Takeout öffnen", description: "Melde dich an, wähle alles ab und dann YouTube und YouTube Music aus." },
        { title: "Nur Verlauf behalten", description: "Öffne die Datenoptionen und lasse nur den Verlauf ausgewählt." },
        { title: "Export herunterladen", description: "Behalte die ZIP-Datei oder suche darin history/watch-history.json." },
        { title: "Hier analysieren", description: "Wähle oben ZIP oder JSON. Die Verarbeitung läuft in diesem Browser-Tab." },
      ],
    },
    privacy: {
      eyebrow: "Datenschutz ist das Produkt",
      title: "Persönlicher Verlauf sollte persönlich bleiben.",
      description:
        "Die ursprüngliche Takeout-Datei erreicht Playback Stats nie. Nur kompakte Dashboard-Daten bleiben in der aktuellen Browsersitzung; beim Schließen werden sie gelöscht.",
      facts: [
        { title: "Nur im Browser", description: "Es gibt keinen Upload-Endpunkt für Verlaufsdateien." },
        { title: "Nur diese Sitzung", description: "Schließe den Tab, um das kompakte Dashboard zu löschen." },
        { title: "Open Source", description: "Prüfe die Regeln für Import und Analyse selbst." },
      ],
    },
    faq: {
      eyebrow: "Gut zu wissen",
      title: "FAQ zur YouTube-Verlauf-Analyse",
      items: [
        {
          question: "Wie kann ich meine YouTube-Statistiken als Zuschauer sehen?",
          answer:
            "Exportiere deinen YouTube- und YouTube-Music-Verlauf mit Google Takeout und wähle hier die Takeout-ZIP oder watch-history.json. Playback Stats erstellt daraus Kanal-Rankings, Trends, Serien und persönliche Muster, ohne dein YouTube-Konto zu verbinden.",
        },
        {
          question: "Wie sehe ich meine meistgesehenen YouTube-Kanäle?",
          answer:
            "Importiere deinen Takeout-Verlauf. Playback Stats gruppiert gültige Wiedergabeereignisse nach Kanal und erstellt daraus eine Häufigkeitsrangliste auf Basis erfasster Aufrufe, nicht einer erfundenen Wiedergabezeit.",
        },
        { question: "Wird mein YouTube-Verlauf hochgeladen?", answer: "Nein. Die Datei wird lokal in deinem Browser gelesen und zusammengefasst. Playback Stats besitzt keinen Upload-Endpunkt für Verlaufsdateien." },
        {
          question: "Wie weit reicht das Dashboard zurück?",
          answer:
            "Bis zum frühesten gültigen Eintrag im Export. Zeiträume mit pausiertem YouTube-Verlauf, gelöschte oder automatisch entfernte Einträge und durch Aktivitätseinstellungen ausgeschlossene Daten lassen sich nicht wiederherstellen.",
        },
        {
          question: "Kann die gesamte YouTube-Wiedergabezeit berechnet werden?",
          answer:
            "Nein. Takeout erfasst, wann ein Video angesehen wurde, aber keine verlässlichen Wiedergabeminuten pro Ereignis. Playback Stats zeigt Aktivität, statt eine Wiedergabezeit zu erfinden.",
        },
        {
          question: "Warum können die Summen von YouTube abweichen?",
          answer:
            "Gezählt werden nur gültige Datensätze im exportierten JSON. Gelöschter oder pausierter Verlauf, private oder nicht verfügbare Videos, automatische Löschung und geänderte Einstellungen beeinflussen den Export.",
        },
      ],
    },
    finalCta: {
      eyebrow: "Wenn du bereit bist",
      title: "Deine Wiedergabegeschichte steckt bereits in der Datei.",
      description: "Öffne sie privat und verwandle Jahre deines Verlaufs in etwas, das du wirklich verstehen kannst.",
      action: "Verlaufsdatei auswählen",
      localPrivate: "Lokal / privat",
    },
    footer: {
      privacyStatement: "Dein Verlauf bleibt auf deinem Gerät",
      jsonGuide: "JSON-Anleitung",
      topChannels: "Top-Kanäle",
      privacy: "Datenschutz",
      terms: "Bedingungen",
    },
    upload: {
      chooseAriaLabel: "YouTube-Verlaufsdatei als JSON oder Google-Takeout-ZIP auswählen",
      dropTitle: "Hier ablegen",
      idleTitle: "YouTube-Verlauf hinzufügen",
      descriptionStart: "Takeout-ZIP oder JSON hier ablegen oder",
      chooseFile: "Datei auswählen",
      formats: "Takeout .zip oder watch-history.json · bis 100 MB",
      localNote: "Prüfung, Entpacken und Analyse bleiben in diesem Tab",
      processedLocally: "lokal verarbeitet",
      removeFile: "Datei entfernen",
      analyze: "Wiedergabeverlauf analysieren",
      progress: {
        archive: "Sicherheitslimits des Archivs werden geprüft...",
        json: "JSON wird lokal gelesen...",
        summaries: "Private Zusammenfassung wird erstellt...",
        saving: "Dashboard wird in diesem Tab gespeichert...",
        opening: "Dashboard wird geöffnet...",
      },
      errors: {
        unsupported_format: { title: "Dieser Dateityp wird nicht unterstützt", message: "Wähle eine YouTube-Verlaufsdatei aus Google Takeout als JSON oder das ursprüngliche ZIP-Archiv.", action: "Verwende eine unveränderte .json- oder .zip-Datei." },
        malformed_json: { title: "Die Verlaufsdatei ist beschädigt", message: "Die Datei konnte nicht als gültiges JSON gelesen werden.", action: "Lade den Takeout-Export erneut herunter oder wähle die ursprüngliche ZIP-Datei." },
        incorrect_takeout_path: { title: "Kein YouTube-Wiedergabeverlauf gefunden", message: "Die Datei gehört offenbar zu einem anderen Export oder die ZIP enthält keinen erkennbaren YouTube-Verlauf.", action: "Nimm in Takeout den Verlauf von YouTube und YouTube Music auf und importiere ZIP oder JSON erneut." },
        empty_history: { title: "Keine Wiedergabeeinträge gefunden", message: "Der ausgewählte Verlauf ist leer oder enthält keine unterstützten YouTube-Ereignisse.", action: "Prüfe, ob der Wiedergabeverlauf aktiviert war und die erwarteten Daten enthält." },
        memory_exhaustion: { title: "Dieser Export ist für eine sichere Verarbeitung zu groß", message: "Die Datei überschreitet ein lokales Limit oder der Browser hat nicht genug Speicher.", action: "Erstelle einen kleineren Export, schließe andere Tabs oder nutze einen Desktop-Browser mit mehr Speicher." },
        browser_failure: { title: "Der Browser konnte den Export nicht lesen", message: "Ein lokaler Browser- oder Speichervorgang ist vor dem Dashboard fehlgeschlagen.", action: "Versuche es in einem aktuellen Browser erneut. Die Datei wurde nicht hochgeladen." },
      },
    },
  },
  fr: {
    meta: {
      title: "Analyser l’historique YouTube et vos statistiques | Playback Stats",
      description:
        "Analysez votre historique YouTube depuis Google Takeout. Découvrez vos chaînes préférées, vidéos répétées, séries et habitudes, en privé dans votre navigateur.",
      ogLocale: "fr_FR",
    },
    promo: {
      label: "Musique IA pour les créateurs",
      mobileDescription: "Créez la musique de votre prochaine vidéo.",
      desktopDescription: "Générez chansons, musiques de fond et paroles pour vidéos, streams et podcasts.",
      action: "Essayer Musefy",
      ariaLabel: "Créer de la musique et des fonds sonores avec Musefy",
    },
    nav: {
      homeAriaLabel: "Accueil Playback Stats",
      navigationAriaLabel: "Navigation Playback Stats",
      guide: "Guide d’export",
      language: "Langue",
      skipToContent: "Aller au contenu",
      productFacts: "Caractéristiques du produit",
      github: "Voir Playback Stats sur GitHub",
    },
    hero: {
      eyebrow: "Vos archives de visionnage privées",
      title: "Un analyseur d’historique YouTube qui transforme vos anciennes vues en",
      highlight: "tendances claires.",
      description:
        "Importez une archive Google Takeout ou watch-history.json. Playback Stats révèle vos chaînes favorites, vidéos revues, jours actifs et habitudes sans téléverser le fichier.",
      primaryAction: "Analyser mon historique",
      secondaryAction: "Voir le fonctionnement",
      trustLine: "Sans connexion YouTube · sans clé API · sans envoi au serveur",
      panelEyebrow: "Espace d’analyse local",
      panelTitle: "Votre fichier reste dans cet onglet.",
      panelDescription: "Choisissez l’archive Takeout originale ou son fichier YouTube watch-history.json.",
      fileLabel: "Fichier",
      dashboardLabel: "Tableau de bord local",
    },
    proof: [
      { label: "Traitement", value: "100 % dans votre navigateur" },
      { label: "Fichiers acceptés", value: "Archive Takeout + JSON" },
      { label: "Compte nécessaire", value: "Aucun" },
      { label: "Résultat", value: "Tableau de bord privé" },
    ],
    discoveries: {
      eyebrow: "Dans vos archives",
      title: "Pas plus de données. Une meilleure lecture de celles qui vous appartiennent.",
      description:
        "Playback Stats organise les événements valides en comparaisons faciles à lire et reste transparent sur ce que l’export permet réellement de prouver.",
      items: [
        { index: "01", title: "Tendances de visionnage", description: "Suivez l’activité quotidienne et mensuelle sur toute la période de votre export." },
        { index: "02", title: "Chaînes favorites", description: "Classez les créateurs par vues enregistrées et mesurez la diversité de votre historique." },
        { index: "03", title: "Vidéos revues", description: "Retrouvez les vidéos auxquelles vous êtes revenu selon les entrées réelles de l’historique." },
        { index: "04", title: "Rythmes personnels", description: "Découvrez votre jour le plus actif, vos heures de pointe, séries et habitudes à long terme." },
      ],
    },
    method: {
      eyebrow: "Transparent par nature",
      title: "De l’export aux enseignements, sans détour par nos serveurs.",
      description:
        "Google Takeout fournit une liste chronologique des visionnages. Playback Stats lit les champs pris en charge, écarte les lignes inutilisables et crée les données des graphiques localement.",
      steps: [
        { title: "Exporter", description: "Vous téléchargez votre propre historique YouTube avec Google Takeout." },
        { title: "Lire localement", description: "Cet onglet ouvre le fichier et valide les entrées de visionnage prises en charge." },
        { title: "Explorer", description: "Un tableau de bord regroupe dates, vidéos, chaînes et habitudes de visionnage." },
      ],
      limitationLabel: "Limite importante",
      limitationTitle: "Les vues ne sont pas du temps de visionnage.",
      limitationDescription:
        "L’export de l’historique YouTube n’indique pas de durée fiable pour chaque événement. Playback Stats présente les vues enregistrées et les tendances d’activité sans inventer une durée totale.",
      jsonGuide: "Lire le guide des champs de watch-history.json",
      channelGuide: "Comprendre le classement des chaînes",
    },
    export: {
      eyebrow: "Quatre étapes simples",
      title: "Comment exporter votre historique de visionnage YouTube",
      description:
        "Utilisez Google Takeout pour créer une copie de votre historique sans donner à Playback Stats l’accès à votre compte Google.",
      action: "Ouvrir Google Takeout",
      guideAction: "Consulter le guide JSON détaillé",
      steps: [
        { title: "Ouvrir Google Takeout", description: "Connectez-vous, désélectionnez tout, puis choisissez YouTube et YouTube Music." },
        { title: "Garder uniquement l’historique", description: "Ouvrez les options de données et ne conservez que l’historique." },
        { title: "Télécharger l’export", description: "Gardez l’archive intacte ou trouvez history/watch-history.json à l’intérieur." },
        { title: "L’analyser ici", description: "Choisissez l’archive ou le JSON ci-dessus. Tout se passe dans cet onglet." },
      ],
    },
    privacy: {
      eyebrow: "La confidentialité est le produit",
      title: "Votre historique personnel doit rester personnel.",
      description:
        "Le fichier Takeout original n’atteint jamais Playback Stats. Seuls les résumés compacts restent dans la session actuelle et disparaissent lorsque vous la fermez.",
      facts: [
        { title: "Navigateur uniquement", description: "Aucun point d’envoi n’existe pour les fichiers d’historique." },
        { title: "Session uniquement", description: "Fermez l’onglet pour effacer le tableau de bord compact." },
        { title: "Open source", description: "Vérifiez vous-même les règles d’import et d’analyse." },
      ],
    },
    faq: {
      eyebrow: "Bon à savoir",
      title: "FAQ de l’analyseur d’historique YouTube",
      items: [
        {
          question: "Comment voir mes statistiques YouTube en tant que spectateur ?",
          answer:
            "Exportez l’historique YouTube et YouTube Music avec Google Takeout, puis choisissez ici l’archive ou watch-history.json. Playback Stats transforme les entrées valides en classements de chaînes, tendances, séries et habitudes sans connecter votre compte YouTube.",
        },
        {
          question: "Comment voir mes chaînes YouTube les plus regardées ?",
          answer:
            "Importez votre historique Takeout. Playback Stats regroupe les événements valides par chaîne et crée un classement de fréquence fondé sur les vues enregistrées, sans inventer de temps de visionnage.",
        },
        { question: "Mon historique YouTube est-il téléversé ?", answer: "Non. Le fichier est lu et résumé localement dans votre navigateur. Playback Stats ne possède aucun point d’envoi pour les historiques." },
        {
          question: "Jusqu’où remonte le tableau de bord ?",
          answer:
            "Jusqu’à la plus ancienne entrée valide de l’export. Il ne peut pas récupérer les périodes où l’historique était suspendu, les éléments supprimés manuellement ou automatiquement, ni ceux exclus par vos paramètres d’activité.",
        },
        {
          question: "Peut-il calculer mon temps de visionnage YouTube total ?",
          answer:
            "Non. Takeout enregistre le moment d’une vue, mais pas une durée fiable pour chaque événement. Playback Stats présente l’activité sans fabriquer d’estimation du temps de visionnage.",
        },
        {
          question: "Pourquoi les totaux peuvent-ils différer de YouTube ?",
          answer:
            "Seules les entrées valides du JSON exporté sont comptées. L’historique supprimé ou suspendu, les vidéos privées ou indisponibles, la suppression automatique et les paramètres d’activité influencent l’export.",
        },
      ],
    },
    finalCta: {
      eyebrow: "Quand vous voulez",
      title: "Votre histoire de visionnage est déjà dans le fichier.",
      description: "Ouvrez-la en privé et transformez des années d’historique en informations réellement compréhensibles.",
      action: "Choisir mon fichier d’historique",
      localPrivate: "Local / privé",
    },
    footer: {
      privacyStatement: "Votre historique reste sur votre appareil",
      jsonGuide: "Guide JSON",
      topChannels: "Chaînes favorites",
      privacy: "Confidentialité",
      terms: "Conditions",
    },
    upload: {
      chooseAriaLabel: "Choisir un historique YouTube au format JSON ou une archive Google Takeout",
      dropTitle: "Déposez-le ici",
      idleTitle: "Ajoutez votre historique YouTube",
      descriptionStart: "Déposez l’archive Takeout ou le JSON ici, ou",
      chooseFile: "choisissez un fichier",
      formats: "Takeout .zip ou watch-history.json · 100 Mo maximum",
      localNote: "Vérification, extraction et analyse restent dans cet onglet",
      processedLocally: "traité localement",
      removeFile: "Retirer le fichier",
      analyze: "Analyser mon historique",
      progress: {
        archive: "Vérification des limites de sécurité de l’archive...",
        json: "Lecture locale du JSON...",
        summaries: "Création de votre résumé privé...",
        saving: "Enregistrement du tableau de bord dans cet onglet...",
        opening: "Ouverture de votre tableau de bord...",
      },
      errors: {
        unsupported_format: { title: "Ce type de fichier n’est pas pris en charge", message: "Choisissez l’historique Google Takeout au format JSON ou l’archive ZIP originale.", action: "Utilisez un fichier .json ou .zip non modifié." },
        malformed_json: { title: "Le fichier d’historique est endommagé", message: "Le fichier n’a pas pu être décodé comme un JSON valide.", action: "Téléchargez de nouveau l’export Takeout ou choisissez l’archive ZIP originale." },
        incorrect_takeout_path: { title: "Historique YouTube introuvable", message: "Ce fichier semble provenir d’un autre export ou l’archive ne contient aucun historique YouTube reconnu.", action: "Incluez l’historique YouTube et YouTube Music dans Takeout, puis importez l’archive ou son JSON." },
        empty_history: { title: "Aucun visionnage trouvé", message: "L’historique sélectionné est vide ou ne contient aucun événement YouTube pris en charge.", action: "Vérifiez que l’historique était activé et que l’export couvre les dates attendues." },
        memory_exhaustion: { title: "Cet export est trop volumineux pour être traité en toute sécurité", message: "Le fichier dépasse une limite locale ou le navigateur manque de mémoire.", action: "Créez un export plus petit, fermez d’autres onglets ou utilisez un navigateur de bureau disposant de plus de mémoire." },
        browser_failure: { title: "Le navigateur n’a pas pu lire cet export", message: "Une opération locale du navigateur ou du stockage a échoué avant l’ouverture du tableau de bord.", action: "Réessayez dans un navigateur à jour. Le fichier sélectionné n’a pas été téléversé." },
      },
    },
  },
}

export function getLandingContent(locale: Locale): LandingContent {
  return landingContent[locale]
}
