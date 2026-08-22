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
    socialDescription: string
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
    github: string
  }
  hero: {
    badge: string
    titlePrefix: string
    titleHighlight: string
    description: string
    trustLine: string
  }
  promises: Array<{ label: string; detail: string }>
  discoveries: {
    eyebrow: string
    title: string
    description: string
    items: Array<{ title: string; description: string }>
  }
  method: {
    eyebrow: string
    title: string
    description: string
    details: Array<{ title: string; description: string }>
    jsonGuide: string
    channelGuide: string
    limitationTitle: string
    limitationDescription: string
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
    title: string
    description: string
    facts: Array<{ title: string; detail: string }>
  }
  faq: {
    eyebrow: string
    title: string
    items: Array<{ question: string; answer: string }>
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
        "Import a Google Takeout ZIP or watch-history.json to analyze YouTube viewing stats, top channels, streaks, and trends—privately in your browser.",
      socialDescription: "Analyze your YouTube watch history from Google Takeout with private viewing stats, channel rankings, streaks, and trends.",
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
      github: "View Playback Stats on GitHub",
    },
    hero: {
      badge: "100% local — your file never leaves this browser",
      titlePrefix: "Analyze your",
      titleHighlight: "YouTube watch history",
      description:
        "Import your Google Takeout ZIP or watch-history.json to explore viewing stats, top channels, routines, and repeat favorites without sending the file to a server.",
      trustLine: "No YouTube login, API key, or server upload. Your browser builds a compact dashboard from the exported JSON.",
    },
    promises: [
      { label: "Your timeline", detail: "Daily activity across your export" },
      { label: "Your channels", detail: "Creators ranked by repeat views" },
      { label: "Your rhythm", detail: "Hours, streaks, and viewing habits" },
    ],
    discoveries: {
      eyebrow: "Inside your history",
      title: "YouTube watch history stats, with context",
      description: "This YouTube history analyzer turns your export into patterns you can scan, compare, and understand.",
      items: [
        { title: "Viewing trends", description: "Follow how your viewing changes over days, months, and the full life of your Google history." },
        { title: "Repeat favorites", description: "Find the videos and channels you returned to, with rankings grounded in your own history." },
        { title: "Personal patterns", description: "See your peak hour, favorite day, longest streak, and the shape of your viewing personality." },
        { title: "Private by design", description: "The browser keeps only compact chart data. Your original Takeout file never reaches a server." },
      ],
    },
    method: {
      eyebrow: "How the analysis works",
      title: "What this YouTube history analyzer measures",
      description:
        "Google Takeout's watch-history.json is a chronological list of viewing events. Playback Stats reads each valid video title, channel, and timestamp, then groups those records into useful comparisons without contacting YouTube or Google.",
      details: [
        { title: "Viewing activity", description: "Count watch events by day, month, weekday, and hour to see when your YouTube activity rises or falls." },
        { title: "Videos and channels", description: "Rank repeat videos, compare channel frequency, and measure how concentrated or varied your viewing history is." },
        { title: "Habits over time", description: "Find your first recorded video, busiest day, peak viewing hour, favorite weekday, and longest active streak." },
      ],
      jsonGuide: "Read the watch-history.json field guide",
      channelGuide: "See how channel rankings work",
      limitationTitle: "A deliberate limitation",
      limitationDescription:
        "YouTube's export does not include dependable watch duration for each history event. The dashboard therefore reports views and viewing patterns, not a made-up total watch-time number.",
    },
    export: {
      eyebrow: "Bring your own data",
      title: "How to export YouTube history",
      description: "Google Takeout lets you download watch history without granting this site access to your account.",
      action: "Open Google Takeout",
      guideAction: "See what is inside watch-history.json",
      steps: [
        { title: "Open Google Takeout", description: "Sign in, deselect everything, then choose YouTube and YouTube Music." },
        { title: "Keep history only", description: "Open the included-data options and leave only history selected before creating the export." },
        { title: "Download the export", description: "Keep the ZIP intact, or unzip it and locate history/watch-history.json inside the YouTube folder." },
        { title: "Explore locally", description: "Choose the Takeout ZIP or watch-history.json here. Parsing and analysis run inside this browser tab." },
      ],
    },
    privacy: {
      title: "Personal data should stay personal",
      description:
        "The original Takeout file is read locally and never sent to Playback Stats. Only compact dashboard summaries are stored for the current browser session.",
      facts: [
        { title: "Browser only", detail: "No upload endpoint" },
        { title: "Session only", detail: "Close to clear" },
        { title: "Open source", detail: "Inspect every rule" },
      ],
    },
    faq: {
      eyebrow: "Good to know",
      title: "YouTube history analyzer FAQ",
      items: [
        { question: "How do I see my YouTube stats as a viewer?", answer: "Export your YouTube and YouTube Music history with Google Takeout, then select the Takeout ZIP or resulting watch-history.json file here. Playback Stats turns those viewer records into channel rankings, viewing trends, streaks, and other personal stats without connecting to your YouTube account." },
        { question: "Does my YouTube history get uploaded?", answer: "No. The file is read and summarized locally in your browser. Playback Stats has no upload endpoint for history files." },
        { question: "Do I need a Google or Playback Stats login?", answer: "No. Export the file from Google Takeout, then analyze it without connecting an account or API key." },
        { question: "How far back will the dashboard go?", answer: "The dashboard goes back to the earliest valid watch record in your export. It cannot recover activity from periods when YouTube History was paused, items you deleted or Google removed through auto-delete, or records excluded by your Google activity settings." },
        { question: "What happens when I refresh?", answer: "The original file is never retained. Compact YouTube dashboard data stays only in this browser session and can be cleared by closing it." },
        { question: "Can this calculate my total YouTube watch time?", answer: "No. Google Takeout watch history records when a video was watched, but it does not provide reliable minutes watched for each event. Playback Stats reports viewing activity rather than inventing a watch-time estimate." },
        { question: "Why might the totals differ from YouTube itself?", answer: "The analyzer can only count valid records present in the exported JSON. Deleted history, paused history, private or unavailable videos, and changes to your Google activity settings can affect what the export contains." },
      ],
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
        unsupported_format: { title: "This file type is not supported", message: "Choose a Google Takeout viewing-history JSON file or the original Takeout ZIP archive.", action: "Use a .json or .zip file and keep the export unmodified." },
        malformed_json: { title: "The history JSON is damaged", message: "The file could not be decoded as valid JSON.", action: "Download the Takeout export again, or choose the original ZIP so Playback Stats can locate the file." },
        incorrect_takeout_path: { title: "YouTube watch history was not found", message: "This looks like a different export file, or the ZIP does not contain recognizable YouTube viewing history.", action: "In Takeout, include YouTube and YouTube Music history, then import the ZIP or its viewing-history JSON file." },
        empty_history: { title: "No viewing records were found", message: "The selected history is empty or contains no supported YouTube viewing events.", action: "Check that watch history was enabled and that the export contains the dates you expect." },
        memory_exhaustion: { title: "This export is too large to process safely", message: "The file or archive exceeds a local safety limit, or this browser ran out of memory.", action: "Create a smaller Takeout export, close other tabs, or use a desktop browser with more available memory." },
        browser_failure: { title: "The browser could not read this export", message: "A local browser or storage operation failed before the dashboard was ready.", action: "Try again in an up-to-date browser. Your selected file was not uploaded." },
      },
    },
  },
  de: {
    meta: {
      title: "YouTube-Wiedergabeverlauf analysieren | Playback Stats",
      description: "Importiere eine Google-Takeout-ZIP oder watch-history.json und analysiere YouTube-Statistiken, Top-Kanäle, Serien und Trends privat im Browser.",
      socialDescription: "Analysiere deinen YouTube-Wiedergabeverlauf aus Google Takeout mit privaten Statistiken, Kanal-Rankings, Serien und Trends.",
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
      github: "Playback Stats auf GitHub ansehen",
    },
    hero: {
      badge: "100 % lokal — deine Datei verlässt diesen Browser nie",
      titlePrefix: "Analysiere deinen",
      titleHighlight: "YouTube-Wiedergabeverlauf",
      description: "Importiere deine Google-Takeout-ZIP oder watch-history.json und entdecke Statistiken, Top-Kanäle, Routinen und wiederholte Favoriten, ohne die Datei an einen Server zu senden.",
      trustLine: "Kein YouTube-Login, API-Schlüssel oder Server-Upload. Dein Browser erstellt aus dem exportierten JSON ein kompaktes Dashboard.",
    },
    promises: [
      { label: "Deine Zeitleiste", detail: "Tägliche Aktivität im gesamten Export" },
      { label: "Deine Kanäle", detail: "Creator nach wiederholten Aufrufen sortiert" },
      { label: "Dein Rhythmus", detail: "Uhrzeiten, Serien und Sehgewohnheiten" },
    ],
    discoveries: {
      eyebrow: "In deinem Verlauf",
      title: "YouTube-Verlaufsstatistiken mit Kontext",
      description: "Dieser YouTube-Verlaufs-Analyzer verwandelt deinen Export in Muster, die du überblicken, vergleichen und verstehen kannst.",
      items: [
        { title: "Wiedergabetrends", description: "Verfolge, wie sich deine Nutzung über Tage, Monate und den gesamten Google-Verlauf verändert." },
        { title: "Wiederholte Favoriten", description: "Finde Videos und Kanäle, zu denen du zurückgekehrt bist – auf Basis deines eigenen Verlaufs." },
        { title: "Persönliche Muster", description: "Entdecke Spitzenzeiten, Lieblingstage, längste Serien und die Form deiner Sehgewohnheiten." },
        { title: "Privat konzipiert", description: "Der Browser speichert nur kompakte Diagrammdaten. Deine ursprüngliche Takeout-Datei erreicht keinen Server." },
      ],
    },
    method: {
      eyebrow: "So funktioniert die Analyse",
      title: "Was dieser YouTube-Verlaufs-Analyzer misst",
      description: "Google Takeouts watch-history.json ist eine chronologische Liste von Wiedergabeereignissen. Playback Stats liest gültige Videotitel, Kanäle und Zeitstempel und gruppiert sie in nützliche Vergleiche, ohne YouTube oder Google zu kontaktieren.",
      details: [
        { title: "Wiedergabeaktivität", description: "Zähle Ereignisse nach Tag, Monat, Wochentag und Stunde, um Veränderungen deiner YouTube-Aktivität zu erkennen." },
        { title: "Videos und Kanäle", description: "Ordne wiederholte Videos, vergleiche Kanalhäufigkeiten und erkenne, wie vielfältig dein Verlauf ist." },
        { title: "Gewohnheiten im Zeitverlauf", description: "Finde dein erstes Video, den aktivsten Tag, die Spitzenzeit, den Lieblingswochentag und die längste aktive Serie." },
      ],
      jsonGuide: "Feldbeschreibung für watch-history.json lesen",
      channelGuide: "So funktionieren Kanal-Rankings",
      limitationTitle: "Eine bewusste Einschränkung",
      limitationDescription: "YouTubes Export enthält keine verlässliche Wiedergabedauer für einzelne Verlaufsereignisse. Das Dashboard zeigt daher Aufrufe und Muster statt einer erfundenen Gesamtwiedergabezeit.",
    },
    export: {
      eyebrow: "Deine eigenen Daten",
      title: "So exportierst du deinen YouTube-Verlauf",
      description: "Mit Google Takeout kannst du deinen Wiedergabeverlauf herunterladen, ohne dieser Website Zugriff auf dein Konto zu geben.",
      action: "Google Takeout öffnen",
      guideAction: "Inhalt von watch-history.json ansehen",
      steps: [
        { title: "Google Takeout öffnen", description: "Melde dich an, wähle alles ab und dann YouTube und YouTube Music aus." },
        { title: "Nur Verlauf behalten", description: "Öffne die Optionen für enthaltene Daten und lasse vor dem Export nur den Verlauf ausgewählt." },
        { title: "Export herunterladen", description: "Behalte die ZIP-Datei oder entpacke sie und suche history/watch-history.json im YouTube-Ordner." },
        { title: "Lokal entdecken", description: "Wähle hier die Takeout-ZIP oder watch-history.json. Import und Analyse laufen in diesem Browser-Tab." },
      ],
    },
    privacy: {
      title: "Persönliche Daten sollten persönlich bleiben",
      description: "Die ursprüngliche Takeout-Datei wird lokal gelesen und nie an Playback Stats gesendet. Nur kompakte Dashboard-Zusammenfassungen bleiben in der aktuellen Browsersitzung.",
      facts: [
        { title: "Nur im Browser", detail: "Kein Upload-Endpunkt" },
        { title: "Nur diese Sitzung", detail: "Schließen zum Löschen" },
        { title: "Open Source", detail: "Jede Regel einsehbar" },
      ],
    },
    faq: {
      eyebrow: "Gut zu wissen",
      title: "FAQ zur YouTube-Verlaufsanalyse",
      items: [
        { question: "Wie kann ich meine YouTube-Statistiken als Zuschauer sehen?", answer: "Exportiere deinen YouTube- und YouTube-Music-Verlauf mit Google Takeout und wähle hier die Takeout-ZIP oder watch-history.json aus. Playback Stats erstellt daraus Kanal-Rankings, Trends, Serien und persönliche Statistiken, ohne dein YouTube-Konto zu verbinden." },
        { question: "Wird mein YouTube-Verlauf hochgeladen?", answer: "Nein. Die Datei wird lokal in deinem Browser gelesen und zusammengefasst. Playback Stats besitzt keinen Upload-Endpunkt für Verlaufsdateien." },
        { question: "Brauche ich ein Google- oder Playback-Stats-Login?", answer: "Nein. Exportiere die Datei über Google Takeout und analysiere sie ohne Kontoanbindung oder API-Schlüssel." },
        { question: "Wie weit reicht das Dashboard zurück?", answer: "Bis zum frühesten gültigen Eintrag im Export. Zeiträume mit pausiertem YouTube-Verlauf, gelöschte oder automatisch entfernte Einträge und durch Aktivitätseinstellungen ausgeschlossene Daten lassen sich nicht wiederherstellen." },
        { question: "Was passiert beim Aktualisieren?", answer: "Die Originaldatei wird nie gespeichert. Kompakte Dashboard-Daten bleiben nur in dieser Browsersitzung und lassen sich durch Schließen löschen." },
        { question: "Kann die gesamte YouTube-Wiedergabezeit berechnet werden?", answer: "Nein. Google Takeout erfasst, wann ein Video angesehen wurde, aber keine verlässlichen Minuten pro Ereignis. Playback Stats zeigt Aktivität, statt eine Wiedergabezeit zu erfinden." },
        { question: "Warum können die Summen von YouTube abweichen?", answer: "Gezählt werden nur gültige Datensätze im exportierten JSON. Gelöschter oder pausierter Verlauf, private oder nicht verfügbare Videos und geänderte Aktivitätseinstellungen beeinflussen den Export." },
      ],
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
      description: "Importez une archive Google Takeout ou watch-history.json pour analyser vos statistiques YouTube, chaînes favorites, séries et tendances en privé dans votre navigateur.",
      socialDescription: "Analysez votre historique YouTube depuis Google Takeout avec des statistiques privées, classements de chaînes, séries et tendances.",
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
      github: "Voir Playback Stats sur GitHub",
    },
    hero: {
      badge: "100 % local — votre fichier ne quitte jamais ce navigateur",
      titlePrefix: "Analysez votre",
      titleHighlight: "historique YouTube",
      description: "Importez votre archive Google Takeout ou watch-history.json pour explorer statistiques, chaînes favorites, habitudes et vidéos revues sans envoyer le fichier à un serveur.",
      trustLine: "Sans connexion YouTube, clé API ni envoi au serveur. Votre navigateur crée un tableau de bord compact depuis le JSON exporté.",
    },
    promises: [
      { label: "Votre chronologie", detail: "Activité quotidienne sur tout l’export" },
      { label: "Vos chaînes", detail: "Créateurs classés par vues répétées" },
      { label: "Votre rythme", detail: "Heures, séries et habitudes de visionnage" },
    ],
    discoveries: {
      eyebrow: "Dans votre historique",
      title: "Les statistiques de votre historique YouTube, avec leur contexte",
      description: "Cet analyseur transforme votre export YouTube en tendances faciles à parcourir, comparer et comprendre.",
      items: [
        { title: "Tendances de visionnage", description: "Suivez l’évolution de vos visionnages au fil des jours, des mois et de tout votre historique Google." },
        { title: "Vidéos favorites", description: "Retrouvez les vidéos et chaînes que vous avez revues, avec un classement fondé sur votre historique." },
        { title: "Habitudes personnelles", description: "Découvrez votre heure de pointe, votre jour favori, votre plus longue série et vos habitudes." },
        { title: "Privé par conception", description: "Le navigateur ne conserve que des données graphiques compactes. Votre fichier Takeout original n’atteint jamais un serveur." },
      ],
    },
    method: {
      eyebrow: "Fonctionnement de l’analyse",
      title: "Ce que mesure cet analyseur d’historique YouTube",
      description: "Le fichier watch-history.json de Google Takeout est une liste chronologique des visionnages. Playback Stats lit chaque titre, chaîne et horodatage valides, puis regroupe ces entrées en comparaisons utiles sans contacter YouTube ni Google.",
      details: [
        { title: "Activité de visionnage", description: "Comptez les visionnages par jour, mois, jour de la semaine et heure pour suivre l’évolution de votre activité YouTube." },
        { title: "Vidéos et chaînes", description: "Classez les vidéos revues, comparez les chaînes et mesurez la diversité de votre historique." },
        { title: "Habitudes dans le temps", description: "Retrouvez votre première vidéo, votre journée la plus active, votre heure de pointe, votre jour favori et votre plus longue série." },
      ],
      jsonGuide: "Lire le guide des champs de watch-history.json",
      channelGuide: "Comprendre le classement des chaînes",
      limitationTitle: "Une limite volontaire",
      limitationDescription: "L’export YouTube ne fournit pas de durée de visionnage fiable pour chaque événement. Le tableau de bord présente donc les vues et habitudes plutôt qu’une durée totale inventée.",
    },
    export: {
      eyebrow: "Vos propres données",
      title: "Comment exporter votre historique YouTube",
      description: "Google Takeout vous permet de télécharger votre historique sans donner à ce site l’accès à votre compte.",
      action: "Ouvrir Google Takeout",
      guideAction: "Voir le contenu de watch-history.json",
      steps: [
        { title: "Ouvrir Google Takeout", description: "Connectez-vous, désélectionnez tout, puis choisissez YouTube et YouTube Music." },
        { title: "Conserver uniquement l’historique", description: "Ouvrez les options des données incluses et ne gardez que l’historique avant de créer l’export." },
        { title: "Télécharger l’export", description: "Gardez l’archive ZIP intacte, ou décompressez-la et trouvez history/watch-history.json dans le dossier YouTube." },
        { title: "Explorer localement", description: "Choisissez ici l’archive Takeout ou watch-history.json. L’import et l’analyse se font dans cet onglet." },
      ],
    },
    privacy: {
      title: "Vos données personnelles doivent rester personnelles",
      description: "Le fichier Takeout original est lu localement et n’est jamais envoyé à Playback Stats. Seuls des résumés compacts restent dans la session actuelle du navigateur.",
      facts: [
        { title: "Navigateur uniquement", detail: "Aucun point d’envoi" },
        { title: "Session uniquement", detail: "Fermez pour effacer" },
        { title: "Open source", detail: "Chaque règle est consultable" },
      ],
    },
    faq: {
      eyebrow: "Bon à savoir",
      title: "FAQ de l’analyseur d’historique YouTube",
      items: [
        { question: "Comment voir mes statistiques YouTube en tant que spectateur ?", answer: "Exportez vos historiques YouTube et YouTube Music avec Google Takeout, puis choisissez ici l’archive Takeout ou watch-history.json. Playback Stats transforme ces entrées en classements de chaînes, tendances, séries et statistiques personnelles sans connecter votre compte YouTube." },
        { question: "Mon historique YouTube est-il envoyé ?", answer: "Non. Le fichier est lu et résumé localement dans votre navigateur. Playback Stats ne possède aucun point d’envoi pour les fichiers d’historique." },
        { question: "Ai-je besoin d’un compte Google ou Playback Stats ?", answer: "Non. Exportez le fichier depuis Google Takeout, puis analysez-le sans connecter de compte ni de clé API." },
        { question: "Jusqu’où remonte le tableau de bord ?", answer: "Jusqu’à la première entrée valide de l’export. Il ne peut pas récupérer les périodes où l’historique YouTube était suspendu, les éléments supprimés ou effacés automatiquement, ni les données exclues par vos paramètres d’activité." },
        { question: "Que se passe-t-il lorsque j’actualise la page ?", answer: "Le fichier original n’est jamais conservé. Les données compactes du tableau de bord restent uniquement dans cette session et peuvent être effacées en la fermant." },
        { question: "L’outil peut-il calculer mon temps total passé sur YouTube ?", answer: "Non. L’historique Google Takeout indique quand une vidéo a été regardée, mais pas une durée fiable pour chaque événement. Playback Stats présente l’activité sans inventer une durée." },
        { question: "Pourquoi les totaux peuvent-ils différer de ceux de YouTube ?", answer: "L’analyseur ne compte que les entrées valides du JSON exporté. Un historique supprimé ou suspendu, des vidéos privées ou indisponibles et les paramètres d’activité peuvent modifier le contenu de l’export." },
      ],
    },
    footer: {
      privacyStatement: "Votre historique reste sur votre appareil",
      jsonGuide: "Guide JSON",
      topChannels: "Chaînes favorites",
      privacy: "Confidentialité",
      terms: "Conditions",
    },
    upload: {
      chooseAriaLabel: "Choisir un historique YouTube JSON ou une archive Google Takeout ZIP",
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
