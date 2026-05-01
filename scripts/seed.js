const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const { connectToMongoDB } = require('../config/db');

const User = require('../models/user.model');
const CentreFormation = require('../models/centreFormation.model');
const Formation = require('../models/formation.model');
const Categorie = require('../models/categorie.model');
const Skill = require('../models/skill.model');
const Inscription = require('../models/inscription.model');
const Paiement = require('../models/paiement.model');
const Avis = require('../models/avis.model');
const Favori = require('../models/favori.model');
const Notification = require('../models/notification.model');
const Report = require('../models/report.model');
const Lecon = require('../models/lecon.model');
const LeconContent = require('../models/leconContent.model');

const seedData = async () => {
    try {
        await connectToMongoDB();
        console.log('--- Cleaning up database ---');
        const models = [User, CentreFormation, Formation, Categorie, Skill, Inscription, Paiement, Avis, Favori, Notification, Report, Lecon, LeconContent];
        for (const model of models) {
            await model.deleteMany({});
        }
        console.log('Database cleared!');

        // 1. Skills (For Recommendation System)
        console.log('Seeding Skills...');
        const skillsData = [
            { name: 'JavaScript', category: 'Programming' },
            { name: 'React', category: 'Frontend' },
            { name: 'Node.js', category: 'Backend' },
            { name: 'Python', category: 'Data Science' },
            { name: 'TensorFlow', category: 'AI' },
            { name: 'Cyber Security', category: 'Security' },
            { name: 'Figma', category: 'Design' },
            { name: 'AWS', category: 'Cloud' },
            { name: 'Docker', category: 'DevOps' },
            { name: 'Digital Marketing', category: 'Marketing' }
        ];
        const skills = [];
        for (const s of skillsData) {
            skills.push(await Skill.create(s));
        }

        // 2. Categories
        console.log('Seeding Categories...');
        const categoriesData = [
            { nom: 'Development', description: 'Software and web development.' },
            { nom: 'Data & AI', description: 'Data analysis and artificial intelligence.' },
            { nom: 'Design', description: 'UI/UX and graphic design.' },
            { nom: 'Business & Marketing', description: 'Management and digital marketing.' }
        ];
        const categories = [];
        for (const cat of categoriesData) {
            categories.push(await Categorie.create({ ...cat, image: faker.image.url() }));
        }

        // 3. Core Users
        console.log('Seeding Core Users...');
        await User.create({ nom: 'Admin', email: 'admin@test.com', password: 'Password123', role: 'admin' });
        const resp = await User.create({ nom: 'Nasser', prenom: 'Rayen', email: 'responsable@test.com', password: 'Password123', role: 'responsableCF' });

        // 4. Formateurs (Trainers)
        console.log('Seeding Formateurs...');
        const formateurs = [];
        const trainerProfiles = [
            { nom: 'Zouari', prenom: 'Ahmed', email: 'ahmed@formateur.com', specialite: 'Fullstack Dev', skills: [skills[0]._id, skills[1]._id, skills[2]._id] },
            { nom: 'Trabelsi', prenom: 'Sonia', email: 'sonia@formateur.com', specialite: 'Data Scientist', skills: [skills[3]._id, skills[4]._id] },
            { nom: 'Ben Ali', prenom: 'Mehdi', email: 'mehdi@formateur.com', specialite: 'Cloud Expert', skills: [skills[7]._id, skills[8]._id] }
        ];
        for (const t of trainerProfiles) {
            formateurs.push(await User.create({
                ...t,
                password: 'Password123',
                role: 'formateur',
                experience: faker.number.int({ min: 3, max: 15 }),
                statut: 'actif'
            }));
        }

        // 5. Centre
        const centre = await CentreFormation.create({
            nom: 'Elite Tech Academy',
            adresse: 'Tunis, Tunisia',
            description: 'Premium training for the next generation of engineers.',
            responsableId: resp._id,
            status: 'approved'
        });

        // 6. Realistic Formations (For Recommendation)
        console.log('Seeding High-Quality Formations...');
        const formationsData = [
            {
                titre: 'MERN Stack Developer Bootcamp',
                description: 'Master React, Node, Express and MongoDB in this intensive bootcamp. Perfect for career switchers.',
                prix: 1800,
                categorieId: categories[0]._id,
                requiredSkills: [skills[0]._id, skills[1]._id, skills[2]._id],
                formateurIds: [formateurs[0]._id]
            },
            {
                titre: 'Deep Learning with Python & TensorFlow',
                description: 'Build neural networks from scratch and explore computer vision and NLP.',
                prix: 2500,
                categorieId: categories[1]._id,
                requiredSkills: [skills[3]._id, skills[4]._id],
                formateurIds: [formateurs[1]._id]
            },
            {
                titre: 'Cloud Computing & AWS Architecture',
                description: 'Learn how to design scalable and resilient systems on Amazon Web Services.',
                prix: 2200,
                categorieId: categories[0]._id,
                requiredSkills: [skills[7]._id, skills[8]._id],
                formateurIds: [formateurs[2]._id]
            }
        ];

        const formations = [];
        for (const f of formationsData) {
            formations.push(await Formation.create({
                ...f,
                centreId: centre._id,
                duree: 60,
                image: faker.image.url()
            }));
        }

        // 7. Apprenants & Interactions
        console.log('Seeding Apprenants & Interactions...');
        for (let i = 0; i < 10; i++) {
            const app = await User.create({
                nom: faker.person.lastName(),
                prenom: faker.person.firstName(),
                email: `student${i}@test.com`,
                password: 'Password123',
                role: 'apprenant',
                skills: [skills[Math.floor(Math.random() * skills.length)]._id] // Students have starting skills
            });

            // Random Enrollment
            const f = formations[Math.floor(Math.random() * formations.length)];
            await Inscription.create({ apprenantId: app._id, formationId: f._id, statut: 'acceptee' });
            await Avis.create({ apprenantId: app._id, formationId: f._id, note: 5, commentaire: 'Excellent content!' });
        }

        console.log('\n--- SEEDING COMPLETE ---');
        console.log('Trainers assigned. Skills linked for recommendation.');
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

seedData();
