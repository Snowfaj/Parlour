/**
 * Database Seed Script
 * Populates the database with default admin user and parlour services
 * Run: npm run seed
 */

require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const services = [
  // Hair Services
  { name: "Hair Wash & Blow Dry", description: "Deep cleanse with premium shampoo and professional blow dry finish.", price: 599, duration: 60, category: "hair" },
  { name: "Hair Cut & Style", description: "Expert haircut tailored to your face shape with a stylish finish.", price: 799, duration: 75, category: "hair" },
  { name: "Hair Coloring", description: "Full hair color treatment with premium ammonia-free colors.", price: 2499, duration: 120, category: "hair" },
  { name: "Keratin Treatment", description: "Smoothing keratin treatment for frizz-free, silky hair.", price: 4999, duration: 180, category: "hair" },

  // Facial Services
  { name: "Basic Facial", description: "Deep cleansing facial to revitalize and brighten your skin.", price: 799, duration: 60, category: "facial" },
  { name: "Anti-Aging Facial", description: "Advanced treatment to reduce fine lines and restore youthful glow.", price: 1999, duration: 90, category: "facial" },
  { name: "Gold Facial", description: "Luxurious 24K gold facial for radiant, glowing skin.", price: 2499, duration: 90, category: "facial" },
  { name: "Cleanup Facial", description: "Quick and effective skin cleanup for instant freshness.", price: 499, duration: 45, category: "facial" },

  // Bridal Services
  { name: "Bridal Makeup", description: "Complete bridal look with HD makeup, hairstyling, and draping.", price: 14999, duration: 240, category: "bridal" },
  { name: "Pre-Bridal Package", description: "Full pre-bridal care including skin, hair, and body treatments over 3 sessions.", price: 9999, duration: 360, category: "bridal" },
  { name: "Engagement Makeup", description: "Stunning engagement look with premium products and long-lasting finish.", price: 5999, duration: 120, category: "bridal" },

  // Nail Services
  { name: "Manicure", description: "Classic manicure with nail shaping, cuticle care, and polish.", price: 399, duration: 45, category: "nail" },
  { name: "Pedicure", description: "Relaxing pedicure with foot soak, scrub, massage, and polish.", price: 499, duration: 60, category: "nail" },
  { name: "Gel Nail Extensions", description: "Beautiful gel nail extensions with your choice of design.", price: 1499, duration: 90, category: "nail" },
  { name: "Nail Art Design", description: "Creative nail art with intricate patterns and premium gel colors.", price: 799, duration: 60, category: "nail" },

  // Spa Services
  { name: "Full Body Massage", description: "Relaxing full body Swedish massage with aromatic oils.", price: 2499, duration: 90, category: "spa" },
  { name: "De-Stress Massage", description: "Targeted back, shoulder, and neck massage to relieve tension.", price: 1499, duration: 60, category: "spa" },
  { name: "Body Polishing", description: "Exfoliating body scrub and moisturizing treatment for silky skin.", price: 2999, duration: 90, category: "spa" },

  // Makeup Services
  { name: "Party Makeup", description: "Glamorous party-ready makeup with professional-grade products.", price: 1999, duration: 90, category: "makeup" },
  { name: "Airbrush Makeup", description: "Flawless airbrush makeup for a long-lasting, photo-ready finish.", price: 3499, duration: 120, category: "makeup" },
  { name: "Eyebrow Threading", description: "Precise eyebrow shaping and threading for a defined look.", price: 99, duration: 15, category: "makeup" },
];

async function main() {
  console.log("🌸 Starting database seed...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("Admin@123", 12);
  const admin = await prisma.admin.upsert({
    where: { email: "admin@parlour.com" },
    update: {},
    create: {
      email: "admin@parlour.com",
      password: hashedPassword,
      name: "Parlour Admin",
    },
  });
  console.log(`✅ Admin created: ${admin.email} (password: Admin@123)`);

  // Create services
  let created = 0;
  for (const service of services) {
    await prisma.service.upsert({
      where: { id: service.name }, // use name as unique key for idempotency via catch
      update: {},
      create: service,
    }).catch(async () => {
      // If id lookup fails, just create
      await prisma.service.create({ data: service });
    });
    created++;
  }

  console.log(`✅ ${created} services seeded successfully`);
  console.log("🎉 Database seeding complete!");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
