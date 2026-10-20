/** Curated German noun forms and example sentences. Null means no usual plural in this sense. */
export interface VocabularyNote {
  article: 'der' | 'die' | 'das';
  plural: string | null;
  example: string;
}

export const vocabularyNotes: Readonly<Record<string, VocabularyNote>> = {
  feuer: { article: 'das', plural: 'Feuer', example: 'Das Feuer wärmt uns am Abend.' },
  wasser: { article: 'das', plural: null, example: 'Ich trinke ein Glas Wasser.' },
  erde: { article: 'die', plural: null, example: 'Die Samen liegen in der feuchten Erde.' },
  luft: { article: 'die', plural: null, example: 'Nach dem Regen ist die Luft frisch.' },
  dampf: { article: 'der', plural: 'Dämpfe', example: 'Aus dem heißen Topf steigt Dampf auf.' },
  stein: { article: 'der', plural: 'Steine', example: 'Am Wegrand liegt ein runder Stein.' },
  wind: { article: 'der', plural: 'Winde', example: 'Der Wind bewegt die Blätter.' },
  wolke: { article: 'die', plural: 'Wolken', example: 'Eine dunkle Wolke zieht über den Berg.' },
  berg: { article: 'der', plural: 'Berge', example: 'Der Weg führt auf einen hohen Berg.' },
  fluss: { article: 'der', plural: 'Flüsse', example: 'Durch Graz fließt die Mur.' },
  pflanze: { article: 'die', plural: 'Pflanzen', example: 'Die Pflanze braucht Licht und Wasser.' },
  baum: { article: 'der', plural: 'Bäume', example: 'Im Garten wächst ein alter Baum.' },
  blume: { article: 'die', plural: 'Blumen', example: 'Im Frühling blühen viele Blumen.' },
  fisch: { article: 'der', plural: 'Fische', example: 'Ein Fisch schwimmt im klaren Wasser.' },
  vogel: { article: 'der', plural: 'Vögel', example: 'Ein Vogel sitzt auf dem Ast.' },
  biene: { article: 'die', plural: 'Bienen', example: 'Die Biene sammelt Nektar.' },
  ei: { article: 'das', plural: 'Eier', example: 'Das Huhn legt ein Ei.' },
  brot: { article: 'das', plural: 'Brote', example: 'In der Bäckerei duftet es nach frischem Brot.' },
  kuchen: { article: 'der', plural: 'Kuchen', example: 'Zum Kuchen gibt es Schlagobers.' },
  haus: { article: 'das', plural: 'Häuser', example: 'Unser Haus steht in einer ruhigen Straße.' },
  buch: { article: 'das', plural: 'Bücher', example: 'Ich lese am Abend ein Buch.' },
  schule: { article: 'die', plural: 'Schulen', example: 'Die Schule beginnt am Montag.' },
  stadt: { article: 'die', plural: 'Städte', example: 'Graz ist eine Stadt in Österreich.' },
  energie: { article: 'die', plural: 'Energien', example: 'Die Sonne liefert Energie für die Pflanzen.' },
};
