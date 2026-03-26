// FILE: client/js/data/name-generator.js — PART 3
// Period-accurate name generation per region for THE FATE OF HEINRICH

export const NAME_DATA = {
  // ═══════════════════════════════════════════════════════════════
  // NORMAN FRENCH (Starting region)
  // ═══════════════════════════════════════════════════════════════
  norman_french: {
    male_first: [
      'Guillaume', 'Robert', 'Richard', 'Henri', 'Thomas', 'Jean', 'Pierre', 'Michel',
      'Nicolas', 'Jacques', 'Raoul', 'Gautier', 'Renaud', 'Thibaut', 'Gilles', 'Arnaud',
      'Bertrand', 'Hugues', 'Godefroy', 'Eustache', 'Baudouin', 'Enguerrand', 'Foulques',
      'Dreux', 'Amaury', 'Girard', 'Hervé', 'Josselin', 'Mathieu', 'Olivier'
    ],
    female_first: [
      'Marie', 'Marguerite', 'Isabelle', 'Jeanne', 'Agnès', 'Alix', 'Mathilde', 'Adèle',
      'Blanche', 'Cécile', 'Clémence', 'Constance', 'Élisabeth', 'Emma', 'Ermengarde',
      'Geneviève', 'Guillemette', 'Héloise', 'Jacqueline', 'Madeleine', 'Pernelle',
      'Philippa', 'Richilde', 'Sibille', 'Tiphaine', 'Ysabel', 'Aveline', 'Beatrix'
    ],
    surnames: [
      'Renard', 'Leblanc', 'Dupont', 'Martin', 'Bernard', 'Moreau', 'Simon', 'Laurent',
      'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier',
      'Morel', 'Girard', 'André', 'Lefèvre', 'Mercier', 'Dupuis', 'Fontaine', 'Chevalier',
      'Robin', 'Moulin', 'Forêt', 'Rivière', 'Charpentier', 'Boucher', 'Boulanger',
      'Tisserand', 'Meunier', 'Vigneron', 'Pêcheur', 'Forgeron', 'Tailleur', 'Cordier'
    ],
    noble_surnames: [
      'de Beaumont', 'de Valois', 'de Montfort', 'de Tancarville', 'de Harcourt',
      'de Mauny', 'de Brézé', 'de Graville', 'de Ferrières', 'de Tilly', 'de Cailly',
      'de Vieuxpont', 'de Courcy', 'de Bohon', 'de Subligny'
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // PARISIAN FRENCH
  // ═══════════════════════════════════════════════════════════════
  parisian_french: {
    male_first: [
      'Charles', 'Louis', 'Philippe', 'François', 'Antoine', 'Claude', 'Étienne',
      'Germain', 'Honoré', 'Innocent', 'Julien', 'Laurent', 'Léon', 'Luc', 'Marc',
      'Martin', 'Mathieu', 'Maurice', 'Nicolas', 'Noël', 'Pascal', 'Patrice',
      'Rémi', 'Sébastien', 'Sylvain', 'Théodore', 'Timothée', 'Urbain', 'Valentin'
    ],
    female_first: [
      'Anne', 'Catherine', 'Charlotte', 'Christine', 'Claire', 'Colette', 'Denise',
      'Diane', 'Dominique', 'Éloise', 'Françoise', 'Gabrielle', 'Hortense', 'Inès',
      'Joséphine', 'Laure', 'Léonie', 'Louise', 'Lucie', 'Madeleine', 'Margot',
      'Marianne', 'Nathalie', 'Nicole', 'Odette', 'Pauline', 'Renée', 'Simone'
    ],
    surnames: [
      'Dupont', 'Martin', 'Bernard', 'Moreau', 'Thomas', 'Robert', 'Richard',
      'Petit', 'Durand', 'Leroy', 'Morin', 'Rousseau', 'Blanc', 'Garnier',
      'Faure', 'Girard', 'Bonnet', 'Fontaine', 'Mercier', 'Boyer', 'Perrin',
      'Renard', 'Morel', 'Clement', 'Gauthier', 'Muller', 'Lefevre', 'Robin'
    ],
    noble_surnames: [
      'de Bourbon', 'de Valois', 'de Montmorency', 'de Châtillon', 'de Coucy',
      'de Laval', 'de Retz', 'de Rohan', 'de Soissons', 'de Vendôme'
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // ENGLISH
  // ═══════════════════════════════════════════════════════════════
  english: {
    male_first: [
      'Henry', 'William', 'John', 'Thomas', 'Richard', 'Robert', 'Edward', 'Geoffrey',
      'Roger', 'Walter', 'Ralph', 'Hugh', 'Simon', 'Stephen', 'Philip', 'Nicholas',
      'Edmund', 'Gilbert', 'Reginald', 'Bartholomew', 'Lawrence', 'Matthew', 'Mark',
      'Luke', 'Peter', 'Paul', 'Andrew', 'James', 'Francis', 'Christopher'
    ],
    female_first: [
      'Margaret', 'Alice', 'Joan', 'Agnes', 'Elizabeth', 'Isabella', 'Matilda',
      'Eleanor', 'Catherine', 'Anne', 'Mary', 'Emma', 'Edith', 'Maud', 'Cecily',
      'Philippa', 'Constance', 'Beatrice', 'Juliana', 'Margery', 'Petronilla',
      'Sibyl', 'Avice', 'Denise', 'Felicia', 'Hawise', 'Lettice', 'Millicent'
    ],
    surnames: [
      'Smith', 'Baker', 'Miller', 'Fletcher', 'Cooper', 'Turner', 'Walker', 'Wright',
      'Taylor', 'Mason', 'Fisher', 'Hunter', 'Farmer', 'Shepherd', 'Thatcher',
      'Carpenter', 'Weaver', 'Dyer', 'Tanner', 'Butcher', 'Cook', 'Brewer',
      'Archer', 'Bowman', 'Knight', 'Squire', 'Page', 'Ward', 'Steward'
    ],
    noble_surnames: [
      'Beaufort', 'Lancaster', 'York', 'Stafford', 'Warwick', 'Salisbury',
      'Northumberland', 'Suffolk', 'Norfolk', 'Somerset', 'Gloucester', 'Exeter'
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // FLEMISH
  // ═══════════════════════════════════════════════════════════════
  flemish: {
    male_first: [
      'Jan', 'Pieter', 'Hendrik', 'Willem', 'Dirk', 'Gerrit', 'Cornelis', 'Adriaan',
      'Bartholomeus', 'Claes', 'Diederik', 'Egbert', 'Floris', 'Gijsbert', 'Harmen',
      'IJsbrand', 'Jacob', 'Klaas', 'Lambert', 'Maarten', 'Nicolaas', 'Otto',
      'Paulus', 'Quirijn', 'Reinier', 'Sander', 'Tijs', 'Ulrich', 'Volkert'
    ],
    female_first: [
      'Anna', 'Beatrix', 'Catharina', 'Dorothea', 'Elisabeth', 'Femke', 'Geertruida',
      'Hendrika', 'Ida', 'Johanna', 'Katelijne', 'Lijsbeth', 'Margaretha', 'Neeltje',
      'Odilia', 'Petronella', 'Quirina', 'Roos', 'Sara', 'Trijn', 'Ursula',
      'Veerle', 'Wilhelmina', 'Xandra', 'Yvonne', 'Zuster'
    ],
    surnames: [
      'van den Berg', 'de Vries', 'van Dijk', 'Bakker', 'Janssen', 'Visser',
      'Smit', 'Meijer', 'de Boer', 'Mulder', 'de Groot', 'Bos', 'Vos',
      'Peters', 'Hendriks', 'van Leeuwen', 'Dekker', 'Brouwer', 'de Wit',
      'Dijkstra', 'Peeters', 'de Jong', 'van der Berg', 'Willems', 'Jacobs'
    ],
    noble_surnames: [
      'van Artevelde', 'van der Woestijne', 'van Damme', 'van Eyck', 'van der Goes'
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // ITALIAN
  // ═══════════════════════════════════════════════════════════════
  italian: {
    male_first: [
      'Giovanni', 'Marco', 'Antonio', 'Francesco', 'Lorenzo', 'Cosimo', 'Piero',
      'Luca', 'Matteo', 'Niccolò', 'Filippo', 'Bartolomeo', 'Giacomo', 'Giulio',
      'Bernardo', 'Cristoforo', 'Domenico', 'Enrico', 'Federico', 'Galeazzo',
      'Iacopo', 'Leonardo', 'Michelangelo', 'Ottaviano', 'Paolo', 'Raffaele',
      'Sandro', 'Taddeo', 'Ugolino', 'Vespasiano'
    ],
    female_first: [
      'Maria', 'Caterina', 'Isabella', 'Lucrezia', 'Beatrice', 'Fiammetta',
      'Ginevra', 'Costanza', 'Bianca', 'Alessandra', 'Chiara', 'Dorotea',
      'Elena', 'Francesca', 'Giulia', 'Ippolita', 'Laura', 'Maddalena',
      'Nannina', 'Orsolina', 'Paola', 'Raffaella', 'Simonetta', 'Taddea'
    ],
    surnames: [
      'Medici', 'Visconti', 'Sforza', 'Gonzaga', 'Este', 'Malatesta', 'Montefeltro',
      'Colonna', 'Orsini', 'Farnese', 'Borgia', 'Pazzi', 'Strozzi', 'Albizzi',
      'Bardi', 'Peruzzi', 'Acciaiuoli', 'Capponi', 'Corsini', 'Davanzati',
      'Ferrari', 'Grimaldi', 'Morosini', 'Dandolo', 'Contarini', 'Foscari'
    ],
    noble_surnames: [
      'de\' Medici', 'Visconti', 'Sforza', 'Gonzaga', 'd\'Este', 'della Rovere'
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // GERMAN
  // ═══════════════════════════════════════════════════════════════
  german: {
    male_first: [
      'Heinrich', 'Friedrich', 'Wilhelm', 'Johann', 'Karl', 'Ludwig', 'Rudolf',
      'Albrecht', 'Bernhard', 'Conrad', 'Dietrich', 'Ernst', 'Franz', 'Georg',
      'Gottfried', 'Hans', 'Hartmann', 'Hermann', 'Kaspar', 'Klaus', 'Konrad',
      'Leopold', 'Lothar', 'Manfred', 'Nikolaus', 'Otto', 'Philipp', 'Reinhard',
      'Sigmund', 'Stefan', 'Ulrich', 'Walther', 'Werner', 'Wolfgang'
    ],
    female_first: [
      'Anna', 'Barbara', 'Dorothea', 'Elisabeth', 'Gertrude', 'Hildegard',
      'Irmgard', 'Johanna', 'Katharina', 'Kunigunde', 'Luitgard', 'Margarethe',
      'Mechthild', 'Ottilia', 'Petronella', 'Richardis', 'Sophia', 'Ursula',
      'Walburga', 'Walpurgis', 'Adelheid', 'Agnes', 'Bertha', 'Christina'
    ],
    surnames: [
      'Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner',
      'Becker', 'Schulz', 'Hoffmann', 'Schäfer', 'Koch', 'Bauer', 'Richter',
      'Klein', 'Wolf', 'Schröder', 'Neumann', 'Schwarz', 'Zimmermann',
      'Braun', 'Krüger', 'Hofmann', 'Hartmann', 'Lange', 'Schmitt', 'Werner'
    ],
    noble_surnames: [
      'von Habsburg', 'von Hohenzollern', 'von Wittelsbach', 'von Wettin',
      'von Luxemburg', 'von Nassau', 'von Württemberg', 'von Baden'
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // OCCITAN (Southern France)
  // ═══════════════════════════════════════════════════════════════
  occitan: {
    male_first: [
      'Guilhem', 'Raimon', 'Bertran', 'Arnaut', 'Peire', 'Folquet', 'Gaucelm',
      'Aimeric', 'Blacatz', 'Cadenet', 'Daude', 'Elias', 'Falquet', 'Giraut',
      'Hugues', 'Ivo', 'Jaufre', 'Lanfranc', 'Marcabru', 'Nat', 'Olivier',
      'Pons', 'Raimbaut', 'Sordel', 'Tibors', 'Uc', 'Vidal', 'Zorzi'
    ],
    female_first: [
      'Alamanda', 'Beatritz', 'Castelloza', 'Domna', 'Ermengarde', 'Felipa',
      'Garsenda', 'Helis', 'Iseut', 'Lombarda', 'Maria', 'Na Carenza',
      'Philippa', 'Raimon', 'Tibors', 'Uc', 'Vierna', 'Ysabella'
    ],
    surnames: [
      'de Ventadorn', 'de Bornelh', 'de Born', 'de Vaqueiras', 'de Miraval',
      'de Montanhagol', 'de Pons', 'de Riquier', 'de Rudel', 'de Vidal',
      'Fabre', 'Blanc', 'Roux', 'Brun', 'Gris', 'Noir', 'Vert'
    ],
    noble_surnames: [
      'de Toulouse', 'de Foix', 'de Comminges', 'de Béarn', 'de Armagnac'
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // ARABIC (for merchants, travelers, scholars)
  // ═══════════════════════════════════════════════════════════════
  arabic: {
    male_first: [
      'Ahmad', 'Ali', 'Hassan', 'Hussein', 'Ibrahim', 'Ismail', 'Khalid',
      'Mahmoud', 'Mohammed', 'Mustafa', 'Omar', 'Rashid', 'Salah', 'Tariq',
      'Umar', 'Yusuf', 'Zayd', 'Abdullah', 'Abdul-Rahman', 'Hamid'
    ],
    female_first: [
      'Aisha', 'Fatima', 'Khadija', 'Maryam', 'Nour', 'Rania', 'Safiya',
      'Zaynab', 'Amira', 'Hana', 'Layla', 'Nadia', 'Samira', 'Yasmin'
    ],
    surnames: [
      'al-Rashid', 'ibn Battuta', 'al-Masri', 'al-Andalusi', 'al-Maghribi',
      'ibn Khaldun', 'al-Biruni', 'al-Farabi', 'ibn Sina', 'al-Ghazali'
    ],
    noble_surnames: [
      'al-Nasir', 'al-Mansur', 'al-Muqtadir', 'al-Mutawakkil'
    ]
  }
};

// NPC title prefixes by class
export const TITLE_PREFIXES = {
  serf: ['', '', ''],
  free_peasant: ['', '', 'Goodman', 'Goodwife'],
  craftsman: ['Master', 'Mistress', ''],
  soldier: ['', 'Sergeant', ''],
  merchant: ['', 'Merchant', ''],
  knight: ['Sir', 'Dame', 'Lord', 'Lady'],
  baron: ['Lord', 'Lady', 'Baron', 'Baroness'],
  count: ['Count', 'Countess', 'Lord', 'Lady'],
  duke: ['Duke', 'Duchess', 'His Grace', 'Her Grace'],
  king: ['King', 'Queen', 'His Majesty', 'Her Majesty'],
  monk: ['Brother', 'Sister', 'Fra'],
  priest: ['Father', 'Père'],
  bishop: ['Bishop', 'My Lord Bishop'],
  archbishop: ['Archbishop', 'Your Grace'],
  cardinal: ['Cardinal', 'Your Eminence'],
  pope: ['Pope', 'His Holiness']
};

// Occupation-based epithets (added to names for flavor)
export const EPITHETS = {
  physical: [
    'the Strong', 'the Tall', 'the Short', 'the Fat', 'the Thin', 'the Red',
    'the Black', 'the White', 'the Fair', 'the Dark', 'the Scarred', 'the Lame'
  ],
  character: [
    'the Bold', 'the Brave', 'the Wise', 'the Cunning', 'the Cruel', 'the Kind',
    'the Pious', 'the Greedy', 'the Generous', 'the Proud', 'the Humble',
    'the Fearless', 'the Cautious', 'the Reckless', 'the Patient'
  ],
  achievement: [
    'the Conqueror', 'the Builder', 'the Merchant', 'the Scholar', 'the Warrior',
    'the Healer', 'the Peacemaker', 'the Troublemaker', 'the Wanderer'
  ],
  place: [
    'of Rouen', 'of Paris', 'of Caen', 'of Bayeux', 'of Dijon', 'of Bruges',
    'of London', 'of Florence', 'of Venice', 'of Rome', 'of the North',
    'of the South', 'of the Sea', 'of the Forest', 'of the Mountains'
  ]
};

/**
 * Generate a random name for an NPC
 * @param {string} culture - Cultural background
 * @param {string} gender - 'male' or 'female'
 * @param {string} class_tier - Social class
 * @param {boolean} include_epithet - Whether to add an epithet
 * @returns {Object} { first_name, surname, full_name, title }
 */
export function generateName(culture, gender, class_tier = 'free_peasant', include_epithet = false) {
  const cultureData = NAME_DATA[culture] || NAME_DATA.norman_french;
  
  const firstNames = gender === 'female' ? cultureData.female_first : cultureData.male_first;
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  
  // Choose surname based on class
  let surnamePool;
  if (['knight', 'baron', 'count', 'duke', 'king'].includes(class_tier)) {
    surnamePool = cultureData.noble_surnames || cultureData.surnames;
  } else {
    surnamePool = cultureData.surnames;
  }
  
  const surname = surnamePool[Math.floor(Math.random() * surnamePool.length)];
  
  // Get title
  const titles = TITLE_PREFIXES[class_tier] || [''];
  const title = titles[Math.floor(Math.random() * titles.length)];
  
  // Maybe add epithet
  let epithet = '';
  if (include_epithet && Math.random() < 0.3) {
    const epithetCategories = Object.values(EPITHETS);
    const category = epithetCategories[Math.floor(Math.random() * epithetCategories.length)];
    epithet = category[Math.floor(Math.random() * category.length)];
  }
  
  const fullName = [title, firstName, surname, epithet].filter(Boolean).join(' ');
  
  return {
    first_name: firstName,
    surname: surname,
    title: title,
    epithet: epithet,
    full_name: fullName,
    display_name: [title, firstName].filter(Boolean).join(' ')
  };
}

/**
 * Generate a place name
 * @param {string} type - Type of place (village, manor, tavern, etc.)
 * @param {string} culture - Cultural background
 * @returns {string} Place name
 */
export function generatePlaceName(type, culture = 'norman_french') {
  const prefixes = {
    village: ['Saint-', 'La ', 'Le ', 'Les ', 'Beau', 'Grand', 'Petit', 'Vieux', 'Neuf'],
    manor: ['', 'Château de ', 'Manoir de ', 'Domaine de '],
    tavern: ['The ', 'Le ', 'La ', 'À la ', 'Au '],
    farm: ['La Ferme de ', 'Le Domaine de ', 'Les Terres de ']
  };
  
  const suffixes = {
    village: ['ville', 'court', 'mont', 'val', 'bois', 'champ', 'fond', 'mare', 'mesnil'],
    manor: ['Beaumont', 'Valcourt', 'Grandmont', 'Bellevue', 'Hautmont', 'Clairval'],
    tavern: ['Crossed Swords', 'Golden Lion', 'Red Boar', 'White Horse', 'Black Bear', 'Green Man'],
    farm: ['Bois', 'Champ', 'Fond', 'Mare', 'Mesnil', 'Cour', 'Mont']
  };
  
  const prefix = (prefixes[type] || prefixes.village)[Math.floor(Math.random() * (prefixes[type] || prefixes.village).length)];
  const suffix = (suffixes[type] || suffixes.village)[Math.floor(Math.random() * (suffixes[type] || suffixes.village).length)];
  
  return prefix + suffix;
}

export default NAME_DATA;
// END FILE: client/js/data/name-generator.js
