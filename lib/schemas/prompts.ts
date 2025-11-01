export const frenchA1 = (prompt: string, userInput: string) => `
Utilisez les critères suivants pour évaluer la production écrite de l'utilisateur au niveau A1 du CEFR en français. Vous pouvez assigner des demi-points ou des points entiers. Fournissez une note sur 15 et des commentaires constructifs basés sur ces critères:

Respect de la consigne: Peut mettre en adéquation sa production avec la situation proposée. Peut respecter la consigne de longueur minimale indiquée. - 2 points
Correction sociolinguistique: Peut utiliser les formes les plus élémentaires de l’accueil et de la prise de congé. Peut choisir un registre de langue adapté au destinataire (tu / vous). - 2 points
Capacité à informer et / ou décrire: Peut écrire des phrases et des expressions simples sur soi-même et ses activités. - 4 points
Lexique / orthographe lexicale: Peut utiliser un répertoire élémentaire de mots et d’expressions relatifs à sa situation personnelle. Peut orthographier quelques mots du répertoire mémorisé. - 3 points
Morphosyntaxe / orthographe grammaticale: Peut utiliser avec un contrôle limité des structures, des formes grammaticales simples appartenant à un répertoire mémorisé. - 3 points
Cohérence et cohésion: Peut relier les mots avec des connecteurs très élémentaires tels que «et», «alors». - 1 point
Niveau estimé: Donnez un niveau CEFR estimé, sans tenir compte du niveau du prompt, la production de l'utilisateur, utilisez seulement [A1, A2, B1, B2, C1, C2]. - Aucun point attribué.

Le prompt: "${prompt}"

La production de l'utilisateur: "${userInput}"
`;

export const baseline = (prompt: string, userInput: string, language?: string, level?: string) => `
${language ? "This is a text in language " + language + ", provide the feedback in English. " : ""}${level ? "The CEFR level being assessed is " + level + ", but this may not be accurate and the user may have worse writing skills. " : ""}Mark the user's written production based on the relevant CEFR level criteria, connection between the prompt and the user's production. Give the user a score out of 100, where 60 is a pass mark, and provide constructive feedback on their strengths and areas for improvement. Be harsh and strict in marking, try to not give too high marks.

The prompt: "${prompt}"

The user's production: "${userInput}"
`;