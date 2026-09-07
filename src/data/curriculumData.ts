export interface CurriculumChapter {
  id: string;
  name: string;
  topics: string[];
}

export const ACADEMIC_BOARDS = [
  'CBSE',
  'ICSE',
  'State Board',
  'IB',
  'Cambridge',
] as const;

export const ACADEMIC_CLASSES = [
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12',
] as const;

export const ACADEMIC_SUBJECTS = [
  'Physics',
  'Mathematics',
  'Chemistry',
  'Biology',
  'English',
  'Computer Science',
  'Social Science',
] as const;

export const CURRICULUM_CHAPTERS: Record<string, CurriculumChapter[]> = {
  Physics: [
    {
      id: 'phy-ch-1',
      name: 'Electricity & Electromagnetic Induction',
      topics: [
        "Ohm's Law & Resistance",
        "Kirchhoff's Laws (KVL & KCL)",
        "Faraday's Law of Induction",
        "Magnetic Flux & Lenz's Law",
        'AC Circuits & Transformers',
      ],
    },
    {
      id: 'phy-ch-2',
      name: 'Light Reflection & Wave Optics',
      topics: [
        'Spherical Mirrors & Lens Formula',
        "Snell's Law & Refraction",
        'Huygens Principle & Wavefronts',
        "Young's Double Slit Interference",
        'Diffraction & Polarization',
      ],
    },
    {
      id: 'phy-ch-3',
      name: 'Quantum Physics & Dual Nature',
      topics: [
        'Photoelectric Effect & Work Function',
        "Einstein's Photoelectric Equation",
        'de Broglie Matter Waves',
        'Bohr Atomic Model & Spectra',
      ],
    },
    {
      id: 'phy-ch-4',
      name: 'Thermodynamics & Kinetic Theory',
      topics: [
        'First Law of Thermodynamics',
        'Heat Engines & Carnot Cycle',
        'Second Law & Entropy',
        'Kinetic Theory of Ideal Gases',
      ],
    },
    {
      id: 'phy-ch-5',
      name: 'Mechanics & Laws of Motion',
      topics: [
        "Newton's Laws of Motion",
        'Friction & Circular Motion',
        'Work, Energy & Conservation Principles',
        'Rotational Dynamics & Moment of Inertia',
      ],
    },
  ],
  Mathematics: [
    {
      id: 'math-ch-1',
      name: 'Quadratic Equations & Polynomials',
      topics: [
        'Roots of Quadratic Equations',
        'Quadratic Formula & Discriminant',
        'Factorization & Completing Square',
        'Nature of Roots & Vieta Relations',
      ],
    },
    {
      id: 'math-ch-2',
      name: 'Arithmetic Progressions (AP)',
      topics: [
        'nth Term of an AP',
        'Sum of First n Terms',
        'Common Difference & Sequence Properties',
        'Real-world Word Problems',
      ],
    },
    {
      id: 'math-ch-3',
      name: 'Coordinate Geometry & Straight Lines',
      topics: [
        'Distance Formula & Section Formula',
        'Slope & Equations of Straight Lines',
        'Area of Triangle in Cartesian Plane',
        'Parallel & Perpendicular Lines',
      ],
    },
    {
      id: 'math-ch-4',
      name: 'Trigonometry & Heights/Distances',
      topics: [
        'Trigonometric Ratios & Standard Angles',
        'Fundamental Trigonometric Identities',
        'Heights & Distances (Elevation/Depression)',
        'Compound & Double Angle Formulas',
      ],
    },
    {
      id: 'math-ch-5',
      name: 'Calculus: Derivatives & Limits',
      topics: [
        'Limits & Continuity',
        'Derivatives & Chain Rule',
        'Implicit Differentiation',
        'Tangents, Normals & Rate of Change',
        'Maxima & Minima Optimization',
      ],
    },
    {
      id: 'math-ch-6',
      name: 'Statistics & Probability',
      topics: [
        'Mean, Median & Mode of Grouped Data',
        'Theoretical & Experimental Probability',
        'Conditional Probability & Bayes Theorem',
      ],
    },
  ],
  Chemistry: [
    {
      id: 'chem-ch-1',
      name: 'Chemical Reactions & Stoichiometry',
      topics: [
        'Balancing Chemical Equations',
        'Types of Chemical Reactions',
        'Mole Concept & Molar Calculations',
        'Limiting Reagents & Yield',
      ],
    },
    {
      id: 'chem-ch-2',
      name: 'Periodic Classification of Elements',
      topics: [
        'Modern Periodic Table Trends',
        'Atomic Radii & Ionic Radii',
        'Ionization Enthalpy & Electron Gain',
        'Electronegativity & Valence Trends',
      ],
    },
    {
      id: 'chem-ch-3',
      name: 'Carbon & Its Organic Compounds',
      topics: [
        'Tetravalency & Catenation',
        'Functional Groups & IUPAC Nomenclature',
        'Alkanes, Alkenes & Alkynes',
        'Esterification & Saponification',
      ],
    },
    {
      id: 'chem-ch-4',
      name: 'Acids, Bases & Salts',
      topics: [
        'pH Scale & Indicators',
        'Neutralization Reactions',
        'Salts: Preparation & Industrial Uses',
      ],
    },
  ],
  Biology: [
    {
      id: 'bio-ch-1',
      name: 'Life Processes & Cellular Respiration',
      topics: [
        'Nutrition in Plants & Animals',
        'Aerobic vs Anaerobic Respiration',
        'Human Circulatory & Excretory System',
      ],
    },
    {
      id: 'bio-ch-2',
      name: 'Genetics, Heredity & Evolution',
      topics: [
        "Mendel's Laws of Inheritance",
        'DNA Structure & Replication',
        'Sex Determination & Genetic Disorders',
      ],
    },
    {
      id: 'bio-ch-3',
      name: 'Ecology & Environmental Biology',
      topics: [
        'Ecosystems & Trophic Levels',
        'Biogeochemical Cycles',
        'Biodiversity & Conservation',
      ],
    },
  ],
  English: [
    {
      id: 'eng-ch-1',
      name: 'Prose — Analytical Literature & Essays',
      topics: [
        'Textual Reading Comprehension',
        'Theme & Character Analysis',
        'Critical Inference & Argumentation',
      ],
    },
    {
      id: 'eng-ch-2',
      name: 'Grammar — Advanced Tenses & Clauses',
      topics: [
        'Subject-Verb Agreement',
        'Active & Passive Voice',
        'Direct & Indirect Speech',
        'Relative & Conditional Clauses',
      ],
    },
    {
      id: 'eng-ch-3',
      name: 'Writing Skills & Composition',
      topics: [
        'Formal Letters & Notices',
        'Analytical Paragraph Writing',
        'Report Writing & Articles',
      ],
    },
  ],
  'Computer Science': [
    {
      id: 'cs-ch-1',
      name: 'Python Data Structures & Collections',
      topics: [
        'Lists, Tuples & Slicing Operations',
        'Dictionaries & Sets',
        'List Comprehensions & Lambdas',
        'String Manipulation & Regex',
      ],
    },
    {
      id: 'cs-ch-2',
      name: 'Object-Oriented Programming (OOP)',
      topics: [
        'Classes, Instances & Attributes',
        'Constructors & Special Methods',
        'Inheritance & Polymorphism',
        'Encapsulation & Abstraction',
      ],
    },
    {
      id: 'cs-ch-3',
      name: 'Relational Databases & SQL Queries',
      topics: [
        'DDL & DML Commands',
        'SELECT, WHERE, ORDER BY & LIMIT',
        'Aggregate Functions & GROUP BY',
        'INNER & OUTER JOIN Queries',
      ],
    },
  ],
  'Social Science': [
    {
      id: 'sst-ch-1',
      name: 'Democratic Politics & Governance',
      topics: [
        'Power Sharing & Federalism',
        'Constitutional Framework & Rights',
        'Electoral Politics & Political Parties',
      ],
    },
    {
      id: 'sst-ch-2',
      name: 'Economic Development & Resources',
      topics: [
        'Sectors of the Indian Economy',
        'Money & Credit Systems',
        'Sustainable Development & Agriculture',
      ],
    },
  ],
};

export function getChaptersForSubject(subject?: string): CurriculumChapter[] {
  if (!subject) {
    // Return all chapters combined if no subject is specified
    return Object.values(CURRICULUM_CHAPTERS).flat();
  }
  return CURRICULUM_CHAPTERS[subject] || [];
}

export function getTopicsForChapter(chapterName?: string, subject?: string): string[] {
  if (!chapterName) {
    if (subject && CURRICULUM_CHAPTERS[subject]) {
      return CURRICULUM_CHAPTERS[subject].flatMap((ch) => ch.topics);
    }
    return Object.values(CURRICULUM_CHAPTERS).flatMap((chapters) =>
      chapters.flatMap((ch) => ch.topics)
    );
  }
  const chapters = subject ? CURRICULUM_CHAPTERS[subject] || [] : Object.values(CURRICULUM_CHAPTERS).flat();
  const matched = chapters.find((ch) => ch.name.toLowerCase() === chapterName.toLowerCase());
  return matched ? matched.topics : [];
}
