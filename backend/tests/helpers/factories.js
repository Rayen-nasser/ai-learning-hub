const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../models/user.model');
const Formation = require('../../models/formation.model');
const Lecon = require('../../models/lecon.model');
const LeconContent = require('../../models/leconContent.model');
const CentreFormation = require('../../models/centreFormation.model');
const Inscription = require('../../models/inscription.model');
const Paiement = require('../../models/paiement.model');
const FormateurContrat = require('../../models/formateurContrat.model');
const PaiementFormateur = require('../../models/paiementFormateur.model');

const PLAINTEXT_PASSWORD = 'Password123!';

const createUser = async (overrides = {}) => {
  const data = {
    email: 'test@example.com',
    password: PLAINTEXT_PASSWORD,
    nom: 'Test',
    prenom: 'User',
    role: 'apprenant',
    ...overrides,
  };
  return User.create(data);
};

const createAdmin = async (overrides = {}) => createUser({ email: 'admin@test.com', role: 'admin', ...overrides });
const createFormateur = async (overrides = {}) => createUser({ email: 'formateur@test.com', role: 'formateur', ...overrides });
const createResponsableCF = async (overrides = {}) => createUser({ email: 'rcf@test.com', role: 'responsableCF', ...overrides });
const createApprenant = async (overrides = {}) => createUser({ email: 'apprenant@test.com', role: 'apprenant', ...overrides });

const createCentre = async (overrides = {}) => {
  const data = {
    nom: 'Test Centre',
    adresse: '123 Test St',
    status: 'approved',
    ...overrides,
  };
  return CentreFormation.create(data);
};

const createFormation = async (overrides = {}) => {
  const data = {
    titre: 'Test Formation',
    description: 'A test formation',
    prix: 100,
    ...overrides,
  };
  return Formation.create(data);
};

const createLecon = async (overrides = {}) => {
  const data = {
    titre: 'Test Lesson',
    description: 'A test lesson',
    estAccessible: false,
    formateurPaye: true,
    ...overrides,
  };
  return Lecon.create(data);
};

const createContent = async (overrides = {}) => {
  const data = {
    type: 'video',
    title: 'Test Content',
    order: 0,
    ...overrides,
  };
  return LeconContent.create(data);
};

const createInscription = async (overrides = {}) => {
  const data = {
    statut: 'en_attente',
    ...overrides,
  };
  return Inscription.create(data);
};

const createPaiement = async (overrides = {}) => {
  const data = {
    montant: 100,
    statut: 'en_attente',
    ...overrides,
  };
  return Paiement.create(data);
};

const createContract = async (overrides = {}) => {
  const data = {
    mode: 'par_lecon',
    prixParLecon: 50,
    statut: 'actif',
    ...overrides,
  };
  return FormateurContrat.create(data);
};

const createPaiementFormateur = async (overrides = {}) => {
  const data = {
    montant: 50,
    mode: 'par_lecon',
    statut: 'en_attente',
    ...overrides,
  };
  return PaiementFormateur.create(data);
};

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const authHeader = (user) => `Bearer ${generateToken(user)}`;

module.exports = {
  createUser, createAdmin, createFormateur, createResponsableCF, createApprenant,
  createCentre, createFormation, createLecon, createContent,
  createInscription, createPaiement, createContract, createPaiementFormateur,
  generateToken, authHeader,
};
