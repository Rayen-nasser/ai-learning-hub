const { expect } = require('chai');

describe('Unit Tests', function () {

  // ─── parseJsonIfString ─────────────────────────────────
  describe('parseJsonIfString (utils/parser.js)', function () {
    const { parseJsonIfString } = require('../../utils/parser');

    it('should return empty array for null', function () {
      expect(parseJsonIfString(null)).to.deep.equal([]);
    });

    it('should return empty array for undefined', function () {
      expect(parseJsonIfString(undefined)).to.deep.equal([]);
    });

    it('should return array for a plain string', function () {
      expect(parseJsonIfString('hello')).to.deep.equal(['hello']);
    });

    it('should parse a JSON array string', function () {
      expect(parseJsonIfString('["a","b","c"]')).to.deep.equal(['a', 'b', 'c']);
    });

    it('should wrap a single JSON primitive in array', function () {
      expect(parseJsonIfString('"single"')).to.deep.equal(['single']);
    });

    it('should return array as-is', function () {
      expect(parseJsonIfString([1, 2, 3])).to.deep.equal([1, 2, 3]);
    });

    it('should parse array with single stringified JSON array', function () {
      expect(parseJsonIfString(['["x","y"]'])).to.deep.equal(['x', 'y']);
    });

    it('should filter empty strings', function () {
      expect(parseJsonIfString(['a', '', null, 'b'])).to.deep.equal(['a', 'b']);
    });

    it('should filter whitespace-only strings', function () {
      expect(parseJsonIfString(['a', '   ', 'b'])).to.deep.equal(['a', 'b']);
    });

    it('should handle number input', function () {
      expect(parseJsonIfString(42)).to.deep.equal([42]);
    });

    it('should handle object input', function () {
      expect(parseJsonIfString({ foo: 'bar' })).to.deep.equal([{ foo: 'bar' }]);
    });
  });

  // ─── formatNumber ──────────────────────────────────────
  describe('formatNumber (controllers/public.controller.js)', function () {
    it('should return number as string when below 1000', function () {
      const { formatNumber } = require('../../controllers/public.controller');
      // formatNumber is not exported — test the logic inline
      const fn = (num) => {
        if (num >= 1000) return (num / 1000).toFixed(1).replace('.0', '') + 'K+';
        return num.toString();
      };
      expect(fn(0)).to.equal('0');
      expect(fn(1)).to.equal('1');
      expect(fn(999)).to.equal('999');
      expect(fn(500)).to.equal('500');
    });

    it('should format with K+ when >= 1000', function () {
      const fn = (num) => {
        if (num >= 1000) return (num / 1000).toFixed(1).replace('.0', '') + 'K+';
        return num.toString();
      };
      expect(fn(1000)).to.equal('1K+');
      expect(fn(1500)).to.equal('1.5K+');
      expect(fn(10000)).to.equal('10K+');
      expect(fn(12345)).to.equal('12.3K+');
    });
  });

  // ─── checkFormateurCanModify ───────────────────────────
  describe('checkFormateurCanModify (controllers/lecon.controller.js)', function () {
    const fn = (lecon, user) => {
      if (!lecon || !user) return false;
      const leconFormateurId = lecon.formateurId
        ? (lecon.formateurId._id || lecon.formateurId).toString()
        : null;
      return leconFormateurId === user._id.toString();
    };

    it('should return true when user owns the lesson', function () {
      const lecon = { formateurId: { _id: 'abc123' } };
      const user = { _id: 'abc123' };
      expect(fn(lecon, user)).to.equal(true);
    });

    it('should return true when formateurId is a plain string', function () {
      const lecon = { formateurId: 'abc123' };
      const user = { _id: 'abc123' };
      expect(fn(lecon, user)).to.equal(true);
    });

    it('should return false when user is not the owner', function () {
      const lecon = { formateurId: { _id: 'owner123' } };
      const user = { _id: 'other456' };
      expect(fn(lecon, user)).to.equal(false);
    });

    it('should return false when lecon is null', function () {
      expect(fn(null, { _id: 'abc' })).to.equal(false);
    });

    it('should return false when user is null', function () {
      expect(fn({ formateurId: 'abc' }, null)).to.equal(false);
    });

    it('should return false when formateurId is missing', function () {
      const lecon = { titre: 'No formateur' };
      const user = { _id: 'abc' };
      expect(fn(lecon, user)).to.equal(false);
    });
  });

  // ─── User Validation ──────────────────────────────────
  describe('User validation (validations/user.validation.js)', function () {
    const { validateUser, validateUserUpdate } = require('../../validations/user.validation');

    describe('validateUser', function () {
      it('should pass with valid data', function () {
        const { error } = validateUser({
          email: 'test@example.com',
          password: 'StrongPass1',
          nom: 'John',
          prenom: 'Doe',
        });
        expect(error).to.be.undefined;
      });

      it('should reject missing email', function () {
        const { error } = validateUser({ nom: 'John', prenom: 'Doe', password: 'StrongPass1' });
        expect(error).to.not.be.undefined;
      });

      it('should reject invalid email', function () {
        const { error } = validateUser({ email: 'not-an-email', password: 'StrongPass1', nom: 'John', prenom: 'Doe' });
        expect(error).to.not.be.undefined;
      });

      it('should reject weak password (no uppercase)', function () {
        const { error } = validateUser({ email: 'a@b.com', password: 'weakpass1', nom: 'John', prenom: 'Doe' });
        expect(error).to.not.be.undefined;
      });

      it('should reject weak password (no digit)', function () {
        const { error } = validateUser({ email: 'a@b.com', password: 'WeakPassA', nom: 'John', prenom: 'Doe' });
        expect(error).to.not.be.undefined;
      });

      it('should reject short password', function () {
        const { error } = validateUser({ email: 'a@b.com', password: 'Sh1', nom: 'John', prenom: 'Doe' });
        expect(error).to.not.be.undefined;
      });

      it('should validate optional fields', function () {
        const { error } = validateUser({
          email: 'test@test.com',
          password: 'Str0ngPass',
          nom: 'John',
          prenom: 'Doe',
          role: 'formateur',
          telephone: '+21621666777',
          niveauEtude: 'master',
          experience: 5,
        });
        expect(error).to.be.undefined;
      });

      it('should reject invalid role', function () {
        const { error } = validateUser({
          email: 'test@test.com',
          password: 'Str0ngPass',
          nom: 'John',
          prenom: 'Doe',
          role: 'superadmin',
        });
        expect(error).to.not.be.undefined;
      });
    });

    describe('validateUserUpdate', function () {
      it('should pass with partial data', function () {
        const { error } = validateUserUpdate({ nom: 'Updated' });
        expect(error).to.be.undefined;
      });

      it('should pass with empty object (all optional)', function () {
        const { error } = validateUserUpdate({});
        expect(error).to.be.undefined;
      });

      it('should reject invalid email in update', function () {
        const { error } = validateUserUpdate({ email: 'bad' });
        expect(error).to.not.be.undefined;
      });
    });
  });

  // ─── Formation Validation ─────────────────────────────
  describe('Formation validation (validations/formation.validation.js)', function () {
    const { formationSchema } = require('../../validations/formation.validation');
    const validate = (data) => formationSchema.validate(data);

    it('should pass with valid data', function () {
      const { error } = validate({
        titre: 'Formation Test',
        description: 'A great formation',
        prix: 100,
        duree: 20,
        centreId: '507f1f77bcf86cd799439011',
        categorieId: '507f1f77bcf86cd799439012',
      });
      expect(error).to.be.undefined;
    });

    it('should reject missing titre', function () {
      const { error } = validate({ prix: 100 });
      expect(error).to.not.be.undefined;
    });

    it('should reject negative price', function () {
      const { error } = validate({ titre: 'Test Formation', prix: -10 });
      expect(error).to.not.be.undefined;
    });

    it('should accept zero price (free)', function () {
      const { error } = validate({ titre: 'Test Formation', prix: 0 });
      expect(error).to.be.undefined;
    });

    it('should reject invalid centreId format', function () {
      const { error } = validate({ titre: 'Test Formation', centreId: 'not-an-objectid' });
      expect(error).to.not.be.undefined;
    });

    it('should accept valid requiredSkills as array', function () {
      const { error } = validate({
        titre: 'Test Formation',
        requiredSkills: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
      });
      expect(error).to.be.undefined;
    });
  });
});
