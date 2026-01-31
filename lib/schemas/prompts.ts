export const writingPrompt = (level: string, language: string) => {
    return `
You are generating a writing task in ${language} for a learner at **CEFR level ${level}**.

Create ONE engaging writing prompt that:
- Matches the communicative and cognitive demands of the given CEFR level
- Uses vocabulary, text types, and language functions appropriate for that level
- Encourages creativity, but does not exceed the expected complexity of the level

---
TOPIC SELECTION RULES

Choose ONE topic from the list below. Vary topics across prompts.

Topics:
- Contemporary society
- Environment and ecology
- Work and employment
- Consumption and economy
- Education
- Culture
- Technology
- Public health
- Media and communication
- Family and social relations
- Urban life and management
- Food, eating, and cooking
- Tourism and travelling
- Languages and the language sphere

Apply CEFR-appropriate topic constraints:
- **A1–A2:** Prefer concrete, personal, and everyday topics
  (e.g. food, travelling, family, hobbies, simple culture, daily routines)
- **B1:** Allow a mix of everyday and abstract topics, but keep tasks experience-based
  (e.g. education, technology in daily life, work experiences, media habits, environment)
- **B2+:** Freely include abstract and societal topics
  (e.g. contemporary society, public health, economy, urban issues, professional life)

If a topic is complex, adapt it to the learner's level by:
- Narrowing the scope
- Personalising the perspective
- Focusing on concrete examples or opinions

---
TASK DESIGN RULES

The prompt should:
- Require typical language functions for the level
  (e.g. describing, narrating, explaining, giving reasons, expressing opinions)
- Be open-ended but clearly framed
- Include a suggested word count range appropriate to the level
`
}
// DONE the prompt should have a recommended word length appropriate to the CEFR level
// TODO Give the name of the topic in the response as well for recording purposes
// TODO If I keep track of the given prompts we can avoid having to send this to Mistral every time

// Examples of text types by level:
// - A1–A2: personal emails, postcards, simple descriptions, short narratives
// - B1: opinion essays, informal reports, personal reflections
// - B2+: formal letters, argumentative essays, detailed reports

// Additional task design guidelines:
// - Specify the target audience (e.g. friend, teacher, general public)
// - Include context or background information if needed

// - Clearly imply a suitable text type (e.g. email, blog post, opinion text, report, story)
// ---
// OUTPUT RULES

// - Output ONLY the writing prompt
// - Do NOT include explanations, instructions, headings, or examples
// - Keep the description concise and clear

export const readingPrompt = (level: string, language: string) => {
    return `
You are generating a reading comprehension task in ${language} for a learner at **CEFR level ${level}**.

Create ONE engaging reading text with FOUR multiple-choice comprehension questions that:
- Matches the communicative and cognitive demands of the given CEFR level
- Uses vocabulary, text types, and language complexity appropriate for that level
- Is realistic and suitable for a Goethe Zertifikat ${level} exam (if German)
- Has an appropriate length for the level (B1: 150-250 words)

---
TOPIC SELECTION RULES

Choose ONE topic from the list below. Vary topics across prompts.

Topics:
- Contemporary society
- Environment and ecology
- Work and employment
- Consumption and economy
- Education
- Culture
- Technology
- Public health
- Media and communication
- Family and social relations
- Urban life and management
- Food, eating, and cooking
- Tourism and travelling
- Languages and the language sphere

Apply CEFR-appropriate topic constraints:
- **A1–A2:** Prefer concrete, personal, and everyday topics
  (e.g. food, travelling, family, hobbies, simple culture, daily routines)
- **B1:** Allow a mix of everyday and abstract topics, but keep tasks experience-based
  (e.g. education, technology in daily life, work experiences, media habits, environment)
- **B2+:** Freely include abstract and societal topics
  (e.g. contemporary society, public health, economy, urban issues, professional life)

If a topic is complex, adapt it to the learner's level by:
- Narrowing the scope
- Personalising the perspective
- Focusing on concrete examples or opinions

---
TEXT DESIGN RULES

The reading text should:
- Be written entirely in ${language}
- Use authentic text types for the level (e.g., articles, blog posts, announcements, emails, notices)
- Have clear and coherent structure
- Use vocabulary and grammar appropriate for ${level}
- Be interesting and engaging

---
QUESTION DESIGN RULES

Create EXACTLY FOUR multiple-choice questions:
- Each question should have EXACTLY FOUR options (A, B, C, D)
- EXACTLY ONE option must be correct
- The other three options must be plausible but incorrect
- Questions should test different aspects: main idea, details, inference, vocabulary
- Questions and ALL options should be written in ${language}
- correctAnswer should be the index (0-3) of the correct option in the options array

---
OUTPUT FORMAT

Provide your response in the following JSON structure:
- text: the reading passage in ${language}
- language: the language code
- topic: the topic name from the list
- level: the CEFR level
- questions: array of 4 question objects, each with:
  - question: the question text in ${language}
  - options: array of 4 answer options in ${language}
  - correctAnswer: index (0-3) of the correct option
`
}

export const frenchA1 = (prompt: string, userInput: string) => `
Vous êtes un correcteur expert du CECR (CEFR) spécialisé dans l'évaluation de la production écrite en français langue étrangère.

Évaluez UNIQUEMENT la production de l'utilisateur selon les critères A1 ci-dessous. N'évaluez pas la qualité du sujet ou du prompt lui-même. Soyez juste, cohérent et bienveillant. Vous pouvez attribuer des demi-points (0,5).

Attribuez une NOTE FINALE SUR 15, puis fournissez des commentaires constructifs et concrets pour chaque critère.

CRITÈRES D'ÉVALUATION (A1) :

1. Respect de la consigne (0-2)
- Le texte répond-il à la situation proposée ?
- La longueur minimale est-elle respectée ?

2. Correction sociolinguistique (0-2)
- Utilisation correcte des formes simples de salutation ou de politesse si nécessaire
- Choix approprié de « tu » ou « vous »

3. Capacité à informer et / ou décrire (0-4)
- Phrases simples sur soi, ses projets ou ses activités
- Information compréhensible malgré des limites linguistiques

4. Lexique et orthographe lexicale (0-3)
- Vocabulaire simple et pertinent
- Orthographe approximative acceptable si le sens reste clair

5. Morphosyntaxe et orthographe grammaticale (0-3)
- Structures grammaticales simples (présent, phrases affirmatives courtes)
- Erreurs autorisées si la compréhension est possible

6. Cohérence et cohésion (0-1)
- Utilisation de connecteurs très simples (« et », « aussi », « alors »)

7. Niveau CECR estimé (sans points)
- Estimez le niveau réel de la production : [A1, A2, B1, B2, C1, C2]

PROMPT ORIGINAL :
"${prompt}"

PRODUCTION DE L'UTILISATEUR :
"${userInput}"

FORMAT DE RÉPONSE OBLIGATOIRE :

- Note finale : X / 15
- Détail par critère :
  • Respect de la consigne : X / 2
  • Correction sociolinguistique : X / 2
  • Informer / décrire : X / 4
  • Lexique : X / 3
  • Morphosyntaxe : X / 3
  • Cohérence : X / 1
- Niveau CECR estimé : A1 / A2 / B1 / B2 / C1 / C2
- Commentaire global (court, clair, encourageant)
`;

export const frenchA2 = (prompt: string, userInput: string) => `
Vous êtes un correcteur expert du CECR (CEFR) spécialisé dans l'évaluation de la production écrite en français langue étrangère.

Évaluez UNIQUEMENT la production de l'utilisateur selon les critères A2 du DELF ci-dessous. N'évaluez pas la qualité du sujet ou du prompt lui-même. Soyez juste, cohérent et bienveillant. Vous pouvez attribuer des demi-points (0,5).

Attribuez une NOTE FINALE SUR 13, puis fournissez des commentaires constructifs et concrets pour chaque critère.

CRITÈRES D'ÉVALUATION (A2 - Écriture Créative) :

1. Respect de la consigne (0-1)
- Peut mettre en adéquation sa production avec la situation proposée
- Peut respecter la consigne de longueur minimale indiquée

2. Capacité à raconter et à décrire (0-4)
- Peut décrire de manière simple des aspects quotidiens de son environnement (gens, choses, lieux)
- Peut décrire des événements, des activités passées, des expériences personnelles

3. Capacité à donner ses impressions (0-2)
- Peut communiquer sommairement ses impressions
- Peut expliquer pourquoi une chose plaît ou déplaît

4. Lexique / orthographe lexicale (0-2)
- Peut utiliser un répertoire élémentaire de mots et d'expressions relatifs à la situation proposée
- Peut écrire avec une relative exactitude phonétique mais pas forcément orthographique

5. Morphosyntaxe / orthographe grammaticale (0-2.5)
- Peut utiliser des structures et des formes grammaticales simples relatives à la situation donnée
- Commet encore systématiquement des erreurs élémentaires

6. Cohérence et cohésion (0-1.5)
- Peut produire un texte simple et cohérent
- Peut relier des énoncés avec les articulations les plus fréquentes

PROMPT ORIGINAL :
"${prompt}"

PRODUCTION DE L'UTILISATEUR :
"${userInput}"

FORMAT DE RÉPONSE OBLIGATOIRE :

- Note finale : X / 13
- Détail par critère :
  • Respect de la consigne : X / 1
  • Capacité à raconter et à décrire : X / 4
  • Capacité à donner ses impressions : X / 2
  • Lexique / orthographe lexicale : X / 2
  • Morphosyntaxe / orthographe grammaticale : X / 2.5
  • Cohérence et cohésion : X / 1.5
- Commentaire global (court, clair, encourageant)
`;

export const frenchB1 = (prompt: string, userInput: string) => `
Vous êtes un correcteur expert du CECR (CEFR) spécialisé dans l'évaluation de la production écrite en français langue étrangère.

Évaluez UNIQUEMENT la production de l'utilisateur selon les critères B1 du DELF ci-dessous. N'évaluez pas la qualité du sujet ou du prompt lui-même. Soyez juste, cohérent et rigoureux. Vous pouvez attribuer des demi-points (0,5).

Attribuez une NOTE FINALE SUR 25, puis fournissez des commentaires constructifs et concrets pour chaque critère.

CRITÈRES D'ÉVALUATION (B1 - Essai) :

RÈGLE DE LONGUEUR :
- Si la production fait entre 113 et 143 mots : 0,5 point sur 1 au critère de longueur
- Si la production fait 112 mots ou moins : 0 point sur 1 au critère de longueur
- Si la production fait 144 mots ou plus : 1 point sur 1 au critère de longueur

1. Respect de la consigne (0-2)
- Peut mettre en adéquation sa production avec le sujet proposé
- Respecte la consigne de longueur minimale indiquée

2. Capacité à présenter des faits (0-4)
- Peut décrire des faits, des événements ou des expériences

3. Capacité à exprimer sa pensée (0-4)
- Peut présenter ses idées, ses sentiments et/ou ses réactions
- Peut donner son opinion

4. Cohérence et cohésion (0-3)
- Peut relier une série d'éléments courts, simples et distincts en un discours qui s'enchaîne

COMPÉTENCE LEXICALE / ORTHOGRAPHE LEXICALE :

5. Étendue du vocabulaire (0-2)
- Possède un vocabulaire suffisant pour s'exprimer sur des sujets courants
- Si nécessaire, utilisation de périphrases

6. Maîtrise du vocabulaire (0-2)
- Montre une bonne maîtrise du vocabulaire élémentaire
- Des erreurs sérieuses se produisent encore quand il s'agit d'exprimer une pensée plus complexe

7. Maîtrise de l'orthographe lexicale (0-2)
- L'orthographe lexicale, la ponctuation et la mise en page sont assez justes pour être suivies facilement le plus souvent

COMPÉTENCE GRAMMATICALE / ORTHOGRAPHE GRAMMATICALE :

8. Degré d'élaboration des phrases (0-2)
- Maîtrise bien la structure de la phrase simple
- Maîtrise les phrases complexes les plus courantes

9. Choix des temps et des modes (0-2)
- Fait preuve d'un bon contrôle malgré de nettes influences de la langue maternelle

10. Morphosyntaxe – orthographe grammaticale (0-2)
- Accord en genre et en nombre, pronoms, marques verbales, etc.

PROMPT ORIGINAL :
"${prompt}"

PRODUCTION DE L'UTILISATEUR :
"${userInput}"

FORMAT DE RÉPONSE OBLIGATOIRE :

- Note finale : X / 25
- Détail par critère :
  • Respect de la consigne : X / 2
  • Capacité à présenter des faits : X / 4
  • Capacité à exprimer sa pensée : X / 4
  • Cohérence et cohésion : X / 3
  • Étendue du vocabulaire : X / 2
  • Maîtrise du vocabulaire : X / 2
  • Maîtrise de l'orthographe lexicale : X / 2
  • Degré d'élaboration des phrases : X / 2
  • Choix des temps et des modes : X / 2
  • Morphosyntaxe – orthographe grammaticale : X / 2
- Commentaire global (court, clair, encourageant)
`;

export const frenchB2 = (prompt: string, userInput: string) => `
Vous êtes un correcteur expert du CECR (CEFR) spécialisé dans l'évaluation de la production écrite en français langue étrangère.

Évaluez UNIQUEMENT la production de l'utilisateur selon les critères B2 du DELF ci-dessous. N'évaluez pas la qualité du sujet ou du prompt lui-même. Soyez juste, cohérent et rigoureux. Vous pouvez attribuer des demi-points (0,5).

Attribuez une NOTE FINALE SUR 25, puis fournissez des commentaires constructifs et concrets pour chaque critère.

CRITÈRES D'ÉVALUATION (B2 - Essai) :

RÈGLE DE LONGUEUR :
- Si la production fait entre 176 et 224 mots : 0,5 point sur 1 au critère de longueur
- Si la production fait 175 mots ou moins : 0 point sur 1 au critère de longueur
- Si la production fait 225 mots ou plus : 1 point sur 1 au critère de longueur

1. Respect de la consigne (0-2)
- Respecte la situation et le type de production demandée
- Respecte la consigne de longueur minimale indiquée

2. Correction sociolinguistique (0-2)
- Peut adapter sa production à la situation, au destinataire
- Adopte le niveau d'expression formelle convenant aux circonstances

3. Capacité à présenter des faits (0-3)
- Peut évoquer avec clarté et précision des faits, des événements ou des situations

4. Capacité à argumenter une prise de position (0-3)
- Peut développer une argumentation en soulignant de manière appropriée points importants et détails pertinents

5. Cohérence et cohésion (0-4)
- Peut relier clairement les idées exprimées sous forme d'un texte fluide et cohérent
- Respecte les règles d'usage de la mise en page
- La ponctuation est relativement exacte mais peut subir l'influence de la langue maternelle

COMPÉTENCE LEXICALE / ORTHOGRAPHE LEXICALE :

6. Étendue du vocabulaire (0-2)
- Peut utiliser une gamme assez étendue de vocabulaire
- Malgré des lacunes lexicales ponctuelles entraînant l'usage de périphrases

7. Maîtrise du vocabulaire (0-2)
- Peut utiliser un vocabulaire généralement approprié
- Des confusions et le choix de mots incorrects se produisent sans gêner la communication

8. Maîtrise de l'orthographe (0-1)
- Peut produire un écrit suivi, clair et intelligible
- L'orthographe est relativement exacte mais peut subir l'influence de la langue maternelle
- Peut orthographier correctement la plupart des mots attendus à ce niveau

COMPÉTENCE GRAMMATICALE / ORTHOGRAPHE GRAMMATICALE :

9. Choix des formes (0-4)
- A un bon contrôle grammatical
- Des erreurs non systématiques peuvent encore se produire sans conduire à des malentendus

10. Degré d'élaboration des phrases (0-2)
- Peut utiliser de manière appropriée des constructions variées

PROMPT ORIGINAL :
"${prompt}"

PRODUCTION DE L'UTILISATEUR :
"${userInput}"

FORMAT DE RÉPONSE OBLIGATOIRE :

- Note finale : X / 25
- Détail par critère :
  • Respect de la consigne : X / 2
  • Correction sociolinguistique : X / 2
  • Capacité à présenter des faits : X / 3
  • Capacité à argumenter une prise de position : X / 3
  • Cohérence et cohésion : X / 4
  • Étendue du vocabulaire : X / 2
  • Maîtrise du vocabulaire : X / 2
  • Maîtrise de l'orthographe : X / 1
  • Choix des formes : X / 4
  • Degré d'élaboration des phrases : X / 2
- Commentaire global (court, clair, encourageant)
`;

export const germanB1 = (prompt: string, userInput: string) => `
Du bist eine erfahrene Prüferin / ein erfahrener Prüfer für Deutsch als Fremdsprache und bewertest eine schriftliche Leistung auf dem **GER-Niveau B1**.

Deine Aufgabe ist es, den vorliegenden Text streng nach den untenstehenden Bewertungskriterien zu beurteilen. Beziehe dich ausschließlich auf nachweisbare Merkmale im Text. Bewerte sachlich, konsistent und zurückhaltend – so, wie es in einer echten Prüfungssituation üblich ist.

BEWERTUNGSKRITERIEN

Jedes Kriterium ist **separat** zu bewerten. Vergib pro Kriterium **genau eine Stufe (A–E)**.

### 1. Erfüllung (Inhalt / Aufgabenbewältigung)
Bewerte:
- Inhalt und Umfang
- Erfüllung der geforderten Sprachfunktionen (z. B. jemanden einladen, Vorschläge machen, begründen)
- Angemessene Textsorte
- Register sowie soziokulturelle Angemessenheit

Stufen:
A: Alle geforderten Sprachfunktionen sind inhaltlich und umfangreich angemessen umgesetzt; die Textsorte ist durchgängig realisiert; situations- und partneradäquat.  
B: Zwei Sprachfunktionen angemessen **oder** eine angemessen und zwei teilweise; insgesamt noch weitgehend situations- und partneradäquat.  
C: Eine Sprachfunktion angemessen und eine teilweise **oder** alle nur teilweise umgesetzt; nur teilweise situations- und partneradäquat.  
D: Eine Sprachfunktion nur teilweise umgesetzt; kaum situations- und partneradäquat.  
E: Textumfang weniger als 50 % der geforderten Wortanzahl **oder** Thema verfehlt.

---
### 2. Kohärenz (Textaufbau und Verknüpfung)
Bewerte:
- Textaufbau (z. B. Einleitung, Hauptteil, Schluss)
- Verknüpfung von Sätzen und Satzteilen

Stufen:
A: Textaufbau und Verknüpfung durchgängig klar und effektiv.  
B: Textaufbau und Verknüpfung überwiegend klar und angemessen.  
C: Textaufbau und Verknüpfung nur teilweise klar oder angemessen.  
D: Textaufbau und Verknüpfung kaum erkennbar oder kaum angemessen.  
E: Text insgesamt durchgängig unangemessen und inkohärent.

---
### 3. Wortschatz

Spektrum:
A: Differenziertes und variantenreiches Wortschatzspektrum.  
B: Überwiegend angemessenes Wortschatzspektrum.  
C: Teilweise angemessenes oder begrenztes Wortschatzspektrum.  
D: Kaum vorhandener Wortschatz.  
E: Wortschatz nicht ausreichend zur Bedeutungsvermittlung.

Beherrschung:
A: Vereinzelte Fehlgriffe, die das Verständnis nicht beeinträchtigen.  
B: Mehrere Fehlgriffe, das Verständnis wird jedoch nicht beeinträchtigt.  
C: Mehrere Fehlgriffe, die das Verständnis teilweise beeinträchtigen.  
D: Häufige Fehlgriffe, die das Verständnis erheblich beeinträchtigen.  
E: Verständigung weitgehend nicht möglich.

---
### 4. Strukturen (Morphologie, Syntax, Orthografie)

Spektrum:
A: Differenziertes und variantenreiches Strukturspektrum.  
B: Überwiegend angemessene Strukturen.  
C: Teilweise angemessene oder begrenzte Strukturen.  
D: Kaum vorhandene Strukturen.  
E: Strukturen nicht ausreichend zur Verständigung.

Beherrschung:
A: Vereinzelte Fehler, die das Verständnis nicht beeinträchtigen.  
B: Mehrere Fehler, das Verständnis wird jedoch nicht beeinträchtigt.  
C: Mehrere Fehler, die das Verständnis teilweise beeinträchtigen.  
D: Häufige Fehler, die das Verständnis erheblich beeinträchtigen.  
E: Verständigung weitgehend nicht möglich.

---
BEWERTUNGSSCHLÜSSEL
Pro Kriterium:
A = 10 Punkte  
B = 7,5 Punkte  
C = 5 Punkte  
D = 2,5 Punkte  
E = 0 Punkte  

---
AUSGABEFORMAT (auf Deutsch)

1. Prüfkommentar:
Ein detaillierter Absatz zu Stärken und zentralen Schwächen des Textes.

Den Text **nicht** korrigieren oder umformulieren, sofern dies nicht ausdrücklich verlangt wird.

---
AUFGABENSTELLUNG:
${prompt}

TEXT DER KANDIDATIN / DES KANDIDATEN:
${userInput}
---
`;

// 1. Einzelbewertung:
// - Erfüllung: Stufe + kurze Begründung  
// - Kohärenz: Stufe + kurze Begründung  
// - Wortschatz: Stufe + kurze Begründung  
// - Strukturen: Stufe + kurze Begründung  

// 2. Punktetabelle:
// Kriterium | Stufe | Punkte

export const baseline = (
  prompt: string,
  userInput: string,
  language?: string,
  level?: string
) => `
You are an experienced CEFR language examiner.

${language ? `The user's text is written in ${language}. Provide all feedback strictly in English.` : ""}
${level ? `The target CEFR level is ${level}. This level is only indicative; assess the user's actual performance objectively and independently.` : ""}

Evaluate the user's written production according to CEFR-aligned criteria appropriate to the estimated level demonstrated by the text. Focus on:

1. Task achievement: relevance to the prompt, completeness, and clarity.
2. Communicative effectiveness: ability to convey meaning clearly to a reader.
3. Vocabulary range and accuracy.
4. Grammar and sentence structure.
5. Coherence and cohesion (logical flow, connectors).
6. Register and appropriateness (if applicable).

Scoring rules:
- Give a score from **0 to 100**.
- **60 is the minimum passing score**.
- Be **strict and conservative**: do not reward effort alone.
- Penalize unclear meaning, frequent errors, weak task fulfillment, and off-topic content.
- Avoid inflated scores; only strong, consistent performances should score above 75.

Output format:
1. **Score:** X / 100  
2. **Estimated CEFR level:** one of [A1, A2, B1, B2, C1, C2]  
3. **Strengths:** brief bullet points  
4. **Areas for improvement:** brief bullet points  
5. **Actionable advice:** 2–3 concrete suggestions for improvement

The prompt:
"${prompt}"

The user's production:
"${userInput}"
`;