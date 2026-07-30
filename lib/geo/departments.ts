/**
 * Référentiel des départements français.
 *
 * L'API annuaire ne fournit ni département ni région : ils se déduisent du
 * code postal, de façon déterministe. Aucun endpoint n'est donc nécessaire
 * côté LocalShark.
 */

const REGIONS = {
  ARA: 'Auvergne-Rhône-Alpes',
  BFC: 'Bourgogne-Franche-Comté',
  BRE: 'Bretagne',
  CVL: 'Centre-Val de Loire',
  COR: 'Corse',
  GES: 'Grand Est',
  HDF: 'Hauts-de-France',
  IDF: 'Île-de-France',
  NOR: 'Normandie',
  NAQ: 'Nouvelle-Aquitaine',
  OCC: 'Occitanie',
  PDL: 'Pays de la Loire',
  PAC: 'Provence-Alpes-Côte d’Azur',
  GUA: 'Guadeloupe',
  MAR: 'Martinique',
  GUY: 'Guyane',
  REU: 'La Réunion',
  MAY: 'Mayotte',
} as const

type RegionKey = keyof typeof REGIONS

const DEPARTMENTS: Record<string, readonly [string, RegionKey]> = {
  '01': ['Ain', 'ARA'],
  '02': ['Aisne', 'HDF'],
  '03': ['Allier', 'ARA'],
  '04': ['Alpes-de-Haute-Provence', 'PAC'],
  '05': ['Hautes-Alpes', 'PAC'],
  '06': ['Alpes-Maritimes', 'PAC'],
  '07': ['Ardèche', 'ARA'],
  '08': ['Ardennes', 'GES'],
  '09': ['Ariège', 'OCC'],
  '10': ['Aube', 'GES'],
  '11': ['Aude', 'OCC'],
  '12': ['Aveyron', 'OCC'],
  '13': ['Bouches-du-Rhône', 'PAC'],
  '14': ['Calvados', 'NOR'],
  '15': ['Cantal', 'ARA'],
  '16': ['Charente', 'NAQ'],
  '17': ['Charente-Maritime', 'NAQ'],
  '18': ['Cher', 'CVL'],
  '19': ['Corrèze', 'NAQ'],
  '21': ['Côte-d’Or', 'BFC'],
  '22': ['Côtes-d’Armor', 'BRE'],
  '23': ['Creuse', 'NAQ'],
  '24': ['Dordogne', 'NAQ'],
  '25': ['Doubs', 'BFC'],
  '26': ['Drôme', 'ARA'],
  '27': ['Eure', 'NOR'],
  '28': ['Eure-et-Loir', 'CVL'],
  '29': ['Finistère', 'BRE'],
  '2A': ['Corse-du-Sud', 'COR'],
  '2B': ['Haute-Corse', 'COR'],
  '30': ['Gard', 'OCC'],
  '31': ['Haute-Garonne', 'OCC'],
  '32': ['Gers', 'OCC'],
  '33': ['Gironde', 'NAQ'],
  '34': ['Hérault', 'OCC'],
  '35': ['Ille-et-Vilaine', 'BRE'],
  '36': ['Indre', 'CVL'],
  '37': ['Indre-et-Loire', 'CVL'],
  '38': ['Isère', 'ARA'],
  '39': ['Jura', 'BFC'],
  '40': ['Landes', 'NAQ'],
  '41': ['Loir-et-Cher', 'CVL'],
  '42': ['Loire', 'ARA'],
  '43': ['Haute-Loire', 'ARA'],
  '44': ['Loire-Atlantique', 'PDL'],
  '45': ['Loiret', 'CVL'],
  '46': ['Lot', 'OCC'],
  '47': ['Lot-et-Garonne', 'NAQ'],
  '48': ['Lozère', 'OCC'],
  '49': ['Maine-et-Loire', 'PDL'],
  '50': ['Manche', 'NOR'],
  '51': ['Marne', 'GES'],
  '52': ['Haute-Marne', 'GES'],
  '53': ['Mayenne', 'PDL'],
  '54': ['Meurthe-et-Moselle', 'GES'],
  '55': ['Meuse', 'GES'],
  '56': ['Morbihan', 'BRE'],
  '57': ['Moselle', 'GES'],
  '58': ['Nièvre', 'BFC'],
  '59': ['Nord', 'HDF'],
  '60': ['Oise', 'HDF'],
  '61': ['Orne', 'NOR'],
  '62': ['Pas-de-Calais', 'HDF'],
  '63': ['Puy-de-Dôme', 'ARA'],
  '64': ['Pyrénées-Atlantiques', 'NAQ'],
  '65': ['Hautes-Pyrénées', 'OCC'],
  '66': ['Pyrénées-Orientales', 'OCC'],
  '67': ['Bas-Rhin', 'GES'],
  '68': ['Haut-Rhin', 'GES'],
  '69': ['Rhône', 'ARA'],
  '70': ['Haute-Saône', 'BFC'],
  '71': ['Saône-et-Loire', 'BFC'],
  '72': ['Sarthe', 'PDL'],
  '73': ['Savoie', 'ARA'],
  '74': ['Haute-Savoie', 'ARA'],
  '75': ['Paris', 'IDF'],
  '76': ['Seine-Maritime', 'NOR'],
  '77': ['Seine-et-Marne', 'IDF'],
  '78': ['Yvelines', 'IDF'],
  '79': ['Deux-Sèvres', 'NAQ'],
  '80': ['Somme', 'HDF'],
  '81': ['Tarn', 'OCC'],
  '82': ['Tarn-et-Garonne', 'OCC'],
  '83': ['Var', 'PAC'],
  '84': ['Vaucluse', 'PAC'],
  '85': ['Vendée', 'PDL'],
  '86': ['Vienne', 'NAQ'],
  '87': ['Haute-Vienne', 'NAQ'],
  '88': ['Vosges', 'GES'],
  '89': ['Yonne', 'BFC'],
  '90': ['Territoire de Belfort', 'BFC'],
  '91': ['Essonne', 'IDF'],
  '92': ['Hauts-de-Seine', 'IDF'],
  '93': ['Seine-Saint-Denis', 'IDF'],
  '94': ['Val-de-Marne', 'IDF'],
  '95': ['Val-d’Oise', 'IDF'],
  '971': ['Guadeloupe', 'GUA'],
  '972': ['Martinique', 'MAR'],
  '973': ['Guyane', 'GUY'],
  '974': ['La Réunion', 'REU'],
  '976': ['Mayotte', 'MAY'],
}

export interface DepartmentInfo {
  code: string
  name: string
  region: string
}

/**
 * Département et région correspondant à un code postal français.
 * Retourne `null` si le code est absent ou non reconnu — c'est le cas des
 * zones desservies, que l'API renvoie sans code postal.
 */
export function departmentFromPostalCode(postalCode: string | null | undefined): DepartmentInfo | null {
  if (!postalCode) return null

  const digits = postalCode.replace(/\s/g, '')

  // L'outre-mer se distingue sur trois chiffres, la métropole sur deux.
  const code = digits.startsWith('97') || digits.startsWith('98') ? digits.slice(0, 3) : digits.slice(0, 2)

  // La Corse partage le préfixe « 20 » entre 2A et 2B.
  if (code === '20') {
    const entry = Number.parseInt(digits, 10) < 20200 ? DEPARTMENTS['2A'] : DEPARTMENTS['2B']
    const resolvedCode = Number.parseInt(digits, 10) < 20200 ? '2A' : '2B'
    return entry ? { code: resolvedCode, name: entry[0], region: REGIONS[entry[1]] } : null
  }

  const entry = DEPARTMENTS[code]
  return entry ? { code, name: entry[0], region: REGIONS[entry[1]] } : null
}
