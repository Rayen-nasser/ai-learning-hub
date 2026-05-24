import { describe, it, expect, vi, beforeEach } from 'vitest';

/* ─── Mocks (vi.hoisted to avoid hoisting issues) ─── */

const mockClient = vi.hoisted(() => ({
  get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn(),
  defaults: { baseURL: 'http://localhost:5000' },
}));
vi.mock('../services/client', () => ({ default: mockClient }));

/* ─── Service Imports ─── */

import authService from '../features/auth/services/auth';
import userService from '../features/auth/services/users';
import formationService from '../features/formations/services/formations';
import centreService from '../features/centres/services/centres';
import { formateurPaymentService } from '../features/responsableCF/services/formateurPayment';
import { leconService } from '../features/formateur/services/lecon';
import { contentService } from '../features/formateur/services/content';
import { formationService as formateurFormationService } from '../features/formateur/services/formation';
import { inscriptionService, paiementService, favoriService } from '../features/dashboard/services/dashboard';
import { avisService, leconService as publicLeconService, contentService as publicContentService } from '../features/formations/services/content';
import categorieService from '../features/formations/services/categories';
import profileService from '../features/profile/services/profile';
import { notificationService } from '../features/notifications/services/notifications';
import skillService from '../features/profile/services/skill';

/* ================================================================
   SERVICE LAYER TESTS
   ================================================================ */

describe('Service Layer - HTTP Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('authService', () => {
    it('register calls POST /users/register-with-image', () => {
      authService.register({ email: 'a@b.com' });
      expect(mockClient.post).toHaveBeenCalledWith('/users/register-with-image', { email: 'a@b.com' });
    });
    it('login calls POST /users/login', () => {
      authService.login({ email: 'a', password: 'p' });
      expect(mockClient.post).toHaveBeenCalledWith('/users/login', { email: 'a', password: 'p' });
    });
    it('logout calls POST /users/logout', () => {
      authService.logout();
      expect(mockClient.post).toHaveBeenCalledWith('/users/logout');
    });
    it('forgotPassword calls POST /users/forgot-password', () => {
      authService.forgotPassword({ email: 'a@b.com' });
      expect(mockClient.post).toHaveBeenCalledWith('/users/forgot-password', { email: 'a@b.com' });
    });
    it('resetPassword calls POST /users/reset-password', () => {
      authService.resetPassword({ token: 't', password: 'p' });
      expect(mockClient.post).toHaveBeenCalledWith('/users/reset-password', { token: 't', password: 'p' });
    });
  });

  describe('userService', () => {
    it('getAll calls GET /users', () => {
      userService.getAll();
      expect(mockClient.get).toHaveBeenCalledWith('/users');
    });
    it('getById calls GET /users/:id', () => {
      userService.getById('abc');
      expect(mockClient.get).toHaveBeenCalledWith('/users/abc');
    });
    it('update calls PUT /users/:id', () => {
      userService.update('abc', { nom: 'x' });
      expect(mockClient.put).toHaveBeenCalledWith('/users/abc', { nom: 'x' });
    });
    it('delete calls DELETE /users/:id', () => {
      userService.delete('abc');
      expect(mockClient.delete).toHaveBeenCalledWith('/users/abc');
    });
    it('block calls PUT /users/:id/block', () => {
      userService.block('abc');
      expect(mockClient.put).toHaveBeenCalledWith('/users/abc/block');
    });
    it('unblock calls PUT /users/:id/unblock', () => {
      userService.unblock('abc');
      expect(mockClient.put).toHaveBeenCalledWith('/users/abc/unblock');
    });
    it('changeRole calls PUT /users/:id/role', () => {
      userService.changeRole('abc', 'admin');
      expect(mockClient.put).toHaveBeenCalledWith('/users/abc/role', { role: 'admin' });
    });
  });

  describe('formationService (formations)', () => {
    it('getAll calls GET /formations with params', () => {
      formationService.getAll({ page: 1 });
      expect(mockClient.get).toHaveBeenCalledWith('/formations', { params: { page: 1 } });
    });
    it('getById calls GET /formations/:id', () => {
      formationService.getById('f1');
      expect(mockClient.get).toHaveBeenCalledWith('/formations/f1');
    });
    it('getByCentre calls GET /formations with centreId param', () => {
      formationService.getByCentre('c1');
      expect(mockClient.get).toHaveBeenCalledWith('/formations', { params: { centreId: 'c1' } });
    });
    it('getByCategorie calls GET /formations with categorieId param', () => {
      formationService.getByCategorie('cat1');
      expect(mockClient.get).toHaveBeenCalledWith('/formations', { params: { categorieId: 'cat1' } });
    });
    it('create calls POST /formations', () => {
      formationService.create({ titre: 'T' });
      expect(mockClient.post).toHaveBeenCalledWith('/formations', { titre: 'T' });
    });
    it('update calls PUT /formations/:id', () => {
      formationService.update('f1', { titre: 'U' });
      expect(mockClient.put).toHaveBeenCalledWith('/formations/f1', { titre: 'U' });
    });
    it('delete calls DELETE /formations/:id', () => {
      formationService.delete('f1');
      expect(mockClient.delete).toHaveBeenCalledWith('/formations/f1');
    });
  });

  describe('centreService', () => {
    it('getAll calls GET /centres', () => {
      centreService.getAll();
      expect(mockClient.get).toHaveBeenCalledWith('/centres');
    });
    it('getById calls GET /centres/:id', () => {
      centreService.getById('c1');
      expect(mockClient.get).toHaveBeenCalledWith('/centres/c1');
    });
    it('create calls POST /centres', () => {
      centreService.create({ nom: 'C' });
      expect(mockClient.post).toHaveBeenCalledWith('/centres', { nom: 'C' });
    });
    it('getMyCentres calls GET /centres/my-centres', () => {
      centreService.getMyCentres();
      expect(mockClient.get).toHaveBeenCalledWith('/centres/my-centres');
    });
    it('approve calls PATCH /centres/admin/approve/:id', () => {
      centreService.approve('c1');
      expect(mockClient.patch).toHaveBeenCalledWith('/centres/admin/approve/c1');
    });
    it('confirmPayment calls PATCH /centres/:id/confirm-payment', () => {
      centreService.confirmPayment('c1');
      expect(mockClient.patch).toHaveBeenCalledWith('/centres/c1/confirm-payment');
    });
  });

  describe('formateurPaymentService', () => {
    it('getFormateurs calls GET /formateur-paiements/formateurs', () => {
      formateurPaymentService.getFormateurs();
      expect(mockClient.get).toHaveBeenCalledWith('/formateur-paiements/formateurs');
    });
    it('getContrats calls GET /formateur-paiements/contrats', () => {
      formateurPaymentService.getContrats();
      expect(mockClient.get).toHaveBeenCalledWith('/formateur-paiements/contrats');
    });
    it('createContrat calls POST /formateur-paiements/contrats', () => {
      formateurPaymentService.createContrat({ formateurId: 'f1' });
      expect(mockClient.post).toHaveBeenCalledWith('/formateur-paiements/contrats', { formateurId: 'f1' });
    });
    it('updateContrat calls PUT /formateur-paiements/contrats/:id', () => {
      formateurPaymentService.updateContrat('c1', { mode: 'par_lecon' });
      expect(mockClient.put).toHaveBeenCalledWith('/formateur-paiements/contrats/c1', { mode: 'par_lecon' });
    });
    it('confirmContrat calls PUT /formateur-paiements/contrats/:id/confirm', () => {
      formateurPaymentService.confirmContrat('c1');
      expect(mockClient.put).toHaveBeenCalledWith('/formateur-paiements/contrats/c1/confirm');
    });
    it('assignFormation calls POST /formateur-paiements/contrats/:id/assign-formation', () => {
      formateurPaymentService.assignFormation('c1', 'f1');
      expect(mockClient.post).toHaveBeenCalledWith('/formateur-paiements/contrats/c1/assign-formation', { formationId: 'f1' });
    });
    it('getFormations calls GET /formateur-paiements/formations', () => {
      formateurPaymentService.getFormations();
      expect(mockClient.get).toHaveBeenCalledWith('/formateur-paiements/formations');
    });
    it('getPayments calls GET /formateur-paiements/payments with params', () => {
      formateurPaymentService.getPayments({ statut: 'en_attente' });
      expect(mockClient.get).toHaveBeenCalledWith('/formateur-paiements/payments', { params: { statut: 'en_attente' } });
    });
    it('payPayment calls PUT /formateur-paiements/payments/:id/pay', () => {
      formateurPaymentService.payPayment('p1', { montant: 100 });
      expect(mockClient.put).toHaveBeenCalledWith('/formateur-paiements/payments/p1/pay', { montant: 100 });
    });
  });

  describe('leconService (formateur)', () => {
    it('getAll calls GET /lecons with params', () => {
      leconService.getAll({ formationId: 'f1' });
      expect(mockClient.get).toHaveBeenCalledWith('/lecons', { params: { formationId: 'f1' } });
    });
    it('getById calls GET /lecons/:id', () => {
      leconService.getById('l1');
      expect(mockClient.get).toHaveBeenCalledWith('/lecons/l1');
    });
    it('create calls POST /lecons', () => {
      leconService.create({ titre: 'T' });
      expect(mockClient.post).toHaveBeenCalledWith('/lecons', { titre: 'T' });
    });
    it('update calls PUT /lecons/:id', () => {
      leconService.update('l1', { titre: 'U' });
      expect(mockClient.put).toHaveBeenCalledWith('/lecons/l1', { titre: 'U' });
    });
    it('delete calls DELETE /lecons/:id', () => {
      leconService.delete('l1');
      expect(mockClient.delete).toHaveBeenCalledWith('/lecons/l1');
    });
  });

  describe('contentService (formateur)', () => {
    it('getByLesson calls GET /contents/lesson/:leconId', () => {
      contentService.getByLesson('l1');
      expect(mockClient.get).toHaveBeenCalledWith('/contents/lesson/l1');
    });
    it('getById calls GET /contents/:id', () => {
      contentService.getById('c1');
      expect(mockClient.get).toHaveBeenCalledWith('/contents/c1');
    });
    it('create calls POST /contents', () => {
      contentService.create({ leconId: 'l1', type: 'video' });
      expect(mockClient.post).toHaveBeenCalledWith('/contents', { leconId: 'l1', type: 'video' });
    });
    it('update calls POST /contents/:id (note: uses POST not PUT)', () => {
      contentService.update('c1', { title: 'U' });
      expect(mockClient.post).toHaveBeenCalledWith('/contents/c1', { title: 'U' });
    });
    it('delete calls DELETE /contents/:id', () => {
      contentService.delete('c1');
      expect(mockClient.delete).toHaveBeenCalledWith('/contents/c1');
    });
  });

  describe('formationService (formateur)', () => {
    it('getMyAssignments calls GET /formations/my-assignments', () => {
      formateurFormationService.getMyAssignments();
      expect(mockClient.get).toHaveBeenCalledWith('/formations/my-assignments');
    });
    it('getById calls GET /formations/:id', () => {
      formateurFormationService.getById('f1');
      expect(mockClient.get).toHaveBeenCalledWith('/formations/f1');
    });
  });

  describe('inscriptionService', () => {
    it('getAll calls GET /inscriptions', () => {
      inscriptionService.getAll();
      expect(mockClient.get).toHaveBeenCalledWith('/inscriptions');
    });
    it('getMyInscriptions calls GET /inscriptions/me', () => {
      inscriptionService.getMyInscriptions();
      expect(mockClient.get).toHaveBeenCalledWith('/inscriptions/me');
    });
    it('create calls POST /inscriptions', () => {
      inscriptionService.create({ formationId: 'f1' });
      expect(mockClient.post).toHaveBeenCalledWith('/inscriptions', { formationId: 'f1' });
    });
    it('cancel calls PUT /inscriptions/cancel/:id', () => {
      inscriptionService.cancel('i1');
      expect(mockClient.put).toHaveBeenCalledWith('/inscriptions/cancel/i1');
    });
  });

  describe('paiementService', () => {
    it('getAll calls GET /paiements', () => {
      paiementService.getAll();
      expect(mockClient.get).toHaveBeenCalledWith('/paiements');
    });
    it('getMyPaiements calls GET /paiements/me', () => {
      paiementService.getMyPaiements();
      expect(mockClient.get).toHaveBeenCalledWith('/paiements/me');
    });
    it('create calls POST /paiements', () => {
      paiementService.create({ inscriptionId: 'i1' });
      expect(mockClient.post).toHaveBeenCalledWith('/paiements', { inscriptionId: 'i1' });
    });
    it('confirm calls PUT /paiements/:id/confirm', () => {
      paiementService.confirm('p1');
      expect(mockClient.put).toHaveBeenCalledWith('/paiements/p1/confirm');
    });
  });

  describe('favoriService', () => {
    it('getMyFavoris calls GET /favoris/me', () => {
      favoriService.getMyFavoris();
      expect(mockClient.get).toHaveBeenCalledWith('/favoris/me');
    });
    it('add calls POST /favoris', () => {
      favoriService.add({ cibleId: 'f1', typeCible: 'formation' });
      expect(mockClient.post).toHaveBeenCalledWith('/favoris', { cibleId: 'f1', typeCible: 'formation' });
    });
    it('remove calls DELETE /favoris/:id', () => {
      favoriService.remove('fav1');
      expect(mockClient.delete).toHaveBeenCalledWith('/favoris/fav1');
    });
  });

  describe('avisService', () => {
    it('create calls POST /avis', () => {
      avisService.create({ note: 5, formationId: 'f1' });
      expect(mockClient.post).toHaveBeenCalledWith('/avis', { note: 5, formationId: 'f1' });
    });
    it('getByFormation calls GET /avis/formation/:id', () => {
      avisService.getByFormation('f1');
      expect(mockClient.get).toHaveBeenCalledWith('/avis/formation/f1');
    });
  });

  describe('publicContentService (formations)', () => {
    it('submitTest calls POST /contents/:id/submit', () => {
      publicContentService.submitTest('c1', { answers: [] });
      expect(mockClient.post).toHaveBeenCalledWith('/contents/c1/submit', { answers: [] });
    });
  });

  describe('categorieService', () => {
    it('getAll calls GET /categories', () => {
      categorieService.getAll();
      expect(mockClient.get).toHaveBeenCalledWith('/categories');
    });
    it('create calls POST /categories', () => {
      categorieService.create({ nom: 'Dev' });
      expect(mockClient.post).toHaveBeenCalledWith('/categories', { nom: 'Dev' });
    });
  });

  describe('profileService', () => {
    it('getProfile calls GET /users/me', () => {
      profileService.getProfile();
      expect(mockClient.get).toHaveBeenCalledWith('/users/me');
    });
    it('changePassword calls POST /users/change-password', () => {
      profileService.changePassword({ current: 'old', new: 'new' });
      expect(mockClient.post).toHaveBeenCalledWith('/users/change-password', { current: 'old', new: 'new' });
    });
  });

  describe('notificationService', () => {
    it('getAll calls GET /notifications with params', () => {
      notificationService.getAll({ page: 1 });
      expect(mockClient.get).toHaveBeenCalledWith('/notifications', { params: { page: 1 } });
    });
    it('markAsRead calls PUT /notifications/read/:id', () => {
      notificationService.markAsRead('n1');
      expect(mockClient.put).toHaveBeenCalledWith('/notifications/read/n1');
    });
    it('markAllAsRead calls PUT /notifications/read-all', () => {
      notificationService.markAllAsRead();
      expect(mockClient.put).toHaveBeenCalledWith('/notifications/read-all');
    });
  });

  describe('skillService', () => {
    it('getAll calls GET /skills', () => {
      skillService.getAll();
      expect(mockClient.get).toHaveBeenCalledWith('/skills');
    });
    it('create calls POST /skills', () => {
      skillService.create({ nom: 'React' });
      expect(mockClient.post).toHaveBeenCalledWith('/skills', { nom: 'React' });
    });
  });
});
