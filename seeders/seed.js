// EventFlow seeder. Idempotent-safe — re-running is fine; pass --force to wipe first.
//
// Usage:
//   node seeders/seed.js          (interactive prompt before clearing)
//   node seeders/seed.js --force  (clear without prompting)

require('dotenv').config();

const readline = require('readline');
const mongoose = require('mongoose');

const connectDB = require('../config/database');
const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Enquiry = require('../models/Enquiry');

const force = process.argv.includes('--force');

const daysFromNow = (days, hour = 18, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d;
};

const SAMPLE_USERS = [
  { name: 'EventFlow Admin', email: 'admin@eventflow.local', password: 'Admin@1234', role: 'admin' },
  { name: 'Alex Rivera',     email: 'user1@eventflow.local', password: 'User@1234',  role: 'user'  },
  { name: 'Priya Naidoo',    email: 'user2@eventflow.local', password: 'User@1234',  role: 'user'  }
];

const SAMPLE_EVENTS = [
  {
    title: 'Africa Tech Summit 2026',
    description:
      'Two days of keynotes from leading African founders, AI engineers, and venture capitalists. Workshops, networking lounges and a hackathon track.',
    category: 'Conference',
    date: daysFromNow(20, 9, 0),
    location: 'Sandton Convention Centre, Johannesburg',
    capacity: 400,
    price: 1499.00,
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60'
  },
  {
    title: 'Hands-on React + Node Workshop',
    description:
      'A full-day, build-along workshop. Walk in with curiosity, leave with a deployed full-stack app. Beginners welcome — laptops required.',
    category: 'Workshop',
    date: daysFromNow(12, 9, 30),
    location: 'Belgium Campus iTversity, Pretoria',
    capacity: 30,
    price: 450.00,
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60'
  },
  {
    title: 'Soundwave Festival — Autumn Edition',
    description:
      'Three stages, twenty acts, food trucks, and South African craft beer. Doors open at 14:00, music until midnight.',
    category: 'Festival',
    date: daysFromNow(45, 14, 0),
    location: 'Riversands Farm Village, Fourways',
    capacity: 1500,
    price: 350.00,
    imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&auto=format&fit=crop&q=60'
  },
  {
    title: 'Executive Leadership Off-site',
    description:
      'Invitation-only off-site for senior leadership. Strategy sessions, fireside chats, and curated dining. Limited availability.',
    category: 'Private',
    date: daysFromNow(60, 8, 0),
    location: 'Boschendal Estate, Stellenbosch',
    capacity: 25,
    price: 6500.00,
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=60'
  },
  {
    title: 'UX Research Masterclass',
    description:
      'Learn how to plan, run, and synthesise user-research studies. Includes live participant interview demos and a take-home toolkit.',
    category: 'Workshop',
    date: daysFromNow(8, 10, 0),
    location: 'Workshop17, Cape Town',
    capacity: 40,
    price: 1200.00,
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=60'
  },
  {
    title: 'Cloud & DevOps Conference',
    description:
      'Practical talks on Kubernetes, observability, platform engineering, and cost-optimised cloud architecture. Vendor-neutral.',
    category: 'Conference',
    date: daysFromNow(35, 9, 0),
    location: 'CTICC, Cape Town',
    capacity: 600,
    price: 1899.00,
    imageUrl: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&auto=format&fit=crop&q=60'
  },
  {
    title: 'Startup Founder Networking Mixer',
    description:
      'Casual evening mixer for founders, operators, and investors. Light drinks, name-tags, intentional intros — no pitch deck required.',
    category: 'Other',
    date: daysFromNow(5, 18, 30),
    location: 'The MARC, Sandton',
    capacity: 80,
    price: 0,
    imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&auto=format&fit=crop&q=60'
  },
  {
    title: 'Indie Film Festival Opening Night',
    description:
      'Red-carpet opening night for the annual indie film festival. Premiere screening, director Q&A, and after-party access.',
    category: 'Festival',
    date: daysFromNow(70, 19, 0),
    location: 'The Labia, Cape Town',
    capacity: 220,
    price: 250.00,
    imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format&fit=crop&q=60'
  }
];

const SAMPLE_ENQUIRIES = [
  {
    name: 'Naledi Khumalo',
    email: 'naledi@example.com',
    subject: 'Group booking discount',
    message: 'Hi! Do you offer a discount for group bookings of 10+ people for the Africa Tech Summit?',
    status: 'new'
  },
  {
    name: 'Marcus Boucher',
    email: 'marcus@example.com',
    subject: 'Refund question',
    message: 'I need to cancel my UX Research Masterclass booking — what is your refund policy?',
    status: 'read'
  },
  {
    name: 'Lebo Mokoena',
    email: 'lebo@example.com',
    subject: 'Sponsorship enquiry',
    message: 'We would like to sponsor a stage at Soundwave Festival. Who can I speak to about that?',
    status: 'resolved'
  }
];

const confirm = (question) =>
  new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'y');
    });
  });

const run = async () => {
  await connectDB();

  const totals = {
    users: await User.countDocuments(),
    events: await Event.countDocuments(),
    bookings: await Booking.countDocuments(),
    enquiries: await Enquiry.countDocuments()
  };
  const hasData =
    totals.users > 0 || totals.events > 0 || totals.bookings > 0 || totals.enquiries > 0;

  if (hasData) {
    console.log('Existing data:', totals);
    let proceed = force;
    if (!force) {
      proceed = await confirm('This will DELETE all existing data. Continue? (y/N) ');
    }
    if (!proceed) {
      console.log('Aborted. No changes made.');
      await mongoose.disconnect();
      process.exit(0);
    }
    await Promise.all([
      User.deleteMany({}),
      Event.deleteMany({}),
      Booking.deleteMany({}),
      Enquiry.deleteMany({})
    ]);
    console.log('✓ Cleared existing collections.');
  }

  // Users — created one at a time so the pre-save bcrypt hook fires properly.
  const userDocs = [];
  for (const u of SAMPLE_USERS) {
    userDocs.push(await User.create(u));
  }
  console.log(`✓ Created ${userDocs.length} users.`);

  const admin = userDocs.find((u) => u.role === 'admin');
  const standardUsers = userDocs.filter((u) => u.role === 'user');

  // Events.
  const eventDocs = await Event.insertMany(
    SAMPLE_EVENTS.map((e) => ({ ...e, createdBy: admin._id }))
  );
  console.log(`✓ Created ${eventDocs.length} events.`);

  // Bookings — create realistic confirmed bookings and increment ticketsBooked accordingly.
  const bookingPlans = [
    { user: standardUsers[0], event: eventDocs[0], quantity: 2 },
    { user: standardUsers[0], event: eventDocs[1], quantity: 1 },
    { user: standardUsers[1], event: eventDocs[2], quantity: 4 },
    { user: standardUsers[1], event: eventDocs[5], quantity: 1 },
    { user: standardUsers[0], event: eventDocs[6], quantity: 3 }
  ];

  for (const plan of bookingPlans) {
    const totalPrice = plan.quantity * (plan.event.price || 0);
    await Booking.create({
      user: plan.user._id,
      event: plan.event._id,
      quantity: plan.quantity,
      totalPrice,
      status: 'confirmed'
    });
    await Event.findByIdAndUpdate(plan.event._id, {
      $inc: { ticketsBooked: plan.quantity }
    });
  }
  console.log(`✓ Created ${bookingPlans.length} bookings.`);

  // Enquiries.
  await Enquiry.insertMany(SAMPLE_ENQUIRIES);
  console.log(`✓ Created ${SAMPLE_ENQUIRIES.length} enquiries.`);

  console.log('\n──────────────── EventFlow seeded ────────────────');
  console.log('Admin login:  admin@eventflow.local / Admin@1234');
  console.log('User login 1: user1@eventflow.local / User@1234');
  console.log('User login 2: user2@eventflow.local / User@1234');
  console.log('───────────────────────────────────────────────────\n');

  await mongoose.disconnect();
  process.exit(0);
};

run().catch(async (err) => {
  console.error('Seed failed:', err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
