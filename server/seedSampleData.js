const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Resource = require('./models/Resource');
const Request = require('./models/Request');
const Review = require('./models/Review');

dotenv.config();

const sampleUsers = [
  {
    name: 'Rameshwar Patil',
    email: 'rameshwar.patil@example.com',
    password: 'Password123',
    phone: '+91 98220 11223',
    village: 'Baramati',
    district: 'Pune',
    state: 'Maharashtra',
    landholdingSize: '4.5 Acres',
    farmingType: 'Sugarcane & Vegetables',
    role: 'farmer'
  },
  {
    name: 'Santosh Deshmukh',
    email: 'santosh.deshmukh@example.com',
    password: 'Password123',
    phone: '+91 98230 44556',
    village: 'Saswad',
    district: 'Pune',
    state: 'Maharashtra',
    landholdingSize: '2.0 Acres',
    farmingType: 'Paddy & Wheat',
    role: 'farmer'
  },
  {
    name: 'Sunita Shinde',
    email: 'sunita.shinde@example.com',
    password: 'Password123',
    phone: '+91 98225 77889',
    village: 'Shirur',
    district: 'Pune',
    state: 'Maharashtra',
    landholdingSize: '3.0 Acres',
    farmingType: 'Horticulture & Pomegranate',
    role: 'farmer'
  },
  {
    name: 'AgriShare Admin',
    email: 'admin@agrishare.com',
    password: 'Admin@AgriShare2026',
    phone: '+91 98765 43210',
    village: 'Pune City',
    district: 'Pune',
    state: 'Maharashtra',
    landholdingSize: 'Admin',
    farmingType: 'System Moderation',
    role: 'admin'
  }
];

const seedData = async () => {
  try {
    const connUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agrishare';
    await mongoose.connect(connUri);
    console.log('[Seed Sample] Connected to MongoDB');

    // Clear existing data for fresh seed if desired
    await User.deleteMany({});
    await Resource.deleteMany({});
    await Request.deleteMany({});
    await Review.deleteMany({});

    console.log('[Seed Sample] Cleared old collections');

    const createdUsers = [];
    for (const u of sampleUsers) {
      const user = new User(u);
      await user.save();
      createdUsers.push(user);
    }
    console.log(`[Seed Sample] Seeded ${createdUsers.length} users`);

    const farmer1 = createdUsers[0];
    const farmer2 = createdUsers[1];
    const farmer3 = createdUsers[2];

    const sampleResources = [
      {
        resourceName: 'Mahindra 575 DI 45HP Tractor',
        category: 'Tractors',
        description: 'Heavy-duty 45HP tractor in excellent condition with trolley and dual-clutch plough attachments. Ideal for deep tilling and land preparation.',
        imageUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
        ownerId: farmer1._id,
        village: farmer1.village,
        district: farmer1.district,
        sharingType: 'Nominal Rental',
        price: 650, // Rs 650/day
        barterRequirements: '',
        availableFrom: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        availableTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'Available',
        approvalStatus: 'Approved'
      },
      {
        resourceName: 'Multi-Crop High Capacity Rotavator (6 Feet)',
        category: 'Cultivators',
        description: '6-feet wide rotary tiller suited for fine pulverization and seedbed preparation. Low diesel consumption and very smooth blade rotation.',
        imageUrl: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',
        ownerId: farmer1._id,
        village: farmer1.village,
        district: farmer1.district,
        sharingType: 'Barter Exchange',
        price: 0,
        barterRequirements: 'Need 2 days of paddy thresher usage or 3 bags of organic vermicompost in exchange',
        availableFrom: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        availableTo: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        status: 'Available',
        approvalStatus: 'Approved'
      },
      {
        resourceName: 'Solar Powered 5HP Submersible Irrigation Pump',
        category: 'Irrigation Equipment',
        description: 'Solar-powered agricultural water pump with flexible HDPE pipes (100 meters). Open for neighbouring farmers suffering from low electricity voltage.',
        imageUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80',
        ownerId: farmer2._id,
        village: farmer2.village,
        district: farmer2.district,
        sharingType: 'Free Sharing',
        price: 0,
        barterRequirements: '',
        availableFrom: new Date(Date.now()),
        availableTo: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        status: 'Available',
        approvalStatus: 'Approved'
      },
      {
        resourceName: 'Battery Operated Knapsack Agricultural Sprayer',
        category: 'Sprayers',
        description: '16-litre rechargeable electric sprayer with dual brass nozzles. Lightweight, easy to carry, and delivers even pesticide/fertilizer mist.',
        imageUrl: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=800&q=80',
        ownerId: farmer3._id,
        village: farmer3.village,
        district: farmer3.district,
        sharingType: 'Free Sharing',
        price: 0,
        barterRequirements: '',
        availableFrom: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        availableTo: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        status: 'Available',
        approvalStatus: 'Approved'
      },
      {
        resourceName: 'Certified Organic Wheat Seed Reserves (Sharbat Variety)',
        category: 'Seeds',
        description: '80kg of treated, graded organic wheat seeds with high germination rate (92%+). Kept in moisture-proof bags.',
        imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
        ownerId: farmer2._id,
        village: farmer2.village,
        district: farmer2.district,
        sharingType: 'Barter Exchange',
        price: 0,
        barterRequirements: 'Willing to exchange for 50kg soybean seeds or gram pulse seeds',
        availableFrom: new Date(Date.now()),
        availableTo: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        status: 'Available',
        approvalStatus: 'Approved'
      },
      {
        resourceName: 'Automatic Seed Cum Fertilizer Drill (9 Tynes)',
        category: 'Seed Drills',
        description: 'Accurate spacing mechanism for uniform sowing and direct fertilizer delivery. Saves seed wastage and manual labor significantly.',
        imageUrl: 'https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?auto=format&fit=crop&w=800&q=80',
        ownerId: farmer3._id,
        village: farmer3.village,
        district: farmer3.district,
        sharingType: 'Nominal Rental',
        price: 350, // Rs 350/day
        barterRequirements: '',
        availableFrom: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        availableTo: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        status: 'Available',
        approvalStatus: 'Approved'
      }
    ];

    const createdResources = await Resource.insertMany(sampleResources);
    console.log(`[Seed Sample] Seeded ${createdResources.length} agricultural resources`);

    // Create a sample request and review
    const req1 = await Request.create({
      resourceId: createdResources[0]._id,
      ownerId: farmer1._id,
      borrowerId: farmer2._id,
      startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      message: 'Namaste Rameshwarji, I need the tractor for 2 days to prepare field for sowing.',
      status: 'Approved'
    });

    const rev1 = await Review.create({
      resourceId: createdResources[0]._id,
      reviewerId: farmer2._id,
      rating: 5,
      comment: 'Very helpful brother! The tractor was maintained well with full diesel tank. Saved me Rs 3,000 compared to market rental.'
    });

    console.log('[Seed Sample] Sample request and review created!');
    console.log('[Seed Sample] Demo seeding complete successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Sample Error]:', error);
    process.exit(1);
  }
};

seedData();
