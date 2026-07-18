import mongoose from 'mongoose';
import User from '../models/User.js';
import Property from '../models/Property.js';
import Review from '../models/Review.js';

// Pool of 15 high-quality, hotlinkable Unsplash interior/exterior photos representing rooms and vacation homes
const IMAGE_POOL = [
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80', // Luxury Villa
  'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80', // Beachfront view
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80', // Modern living room
  'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?auto=format&fit=crop&w=800&q=80', // Forest Cabin
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80', // Cozy bedroom
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80', // Modern exterior
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80', // Luxury lobby/resort
  'https://images.unsplash.com/photo-1488462237308-ecaa28b729d7?auto=format&fit=crop&w=800&q=80', // Treehouse structure
  'https://images.unsplash.com/photo-1475855581690-80accde3ae2b?auto=format&fit=crop&w=800&q=80', // Hillside cottage
  'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80', // Resort pool deck
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80', // Apartment interior
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80', // Classic bedroom
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80', // Luxury house front
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80', // Minimalist studio room
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'  // Mountain view estate
];

const CITIES = [
  { name: 'Goa', state: 'Goa', lat: 15.2993, lng: 74.1240, suffix: 'Beach' },
  { name: 'Munnar', state: 'Kerala', lat: 10.0889, lng: 77.0595, suffix: 'Hill' },
  { name: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946, suffix: 'Central' },
  { name: 'Manali', state: 'Himachal Pradesh', lat: 32.2396, lng: 77.1887, suffix: 'Valley' },
  { name: 'Mumbai', state: 'Maharashtra', lat: 18.9750, lng: 72.8258, suffix: 'Coastal' },
  { name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873, suffix: 'Heritage' },
  { name: 'Udaipur', state: 'Rajasthan', lat: 24.5854, lng: 73.7125, suffix: 'Lakefront' },
  { name: 'Srinagar', state: 'Jammu & Kashmir', lat: 34.0837, lng: 74.7973, suffix: 'Dal Lake' },
  { name: 'Ooty', state: 'Tamil Nadu', lat: 11.4102, lng: 76.6950, suffix: 'Hilltop' },
  { name: 'Kochi', state: 'Kerala', lat: 9.9312, lng: 76.2673, suffix: 'Fort' },
  { name: 'New Delhi', state: 'Delhi', lat: 28.6139, lng: 77.2090, suffix: 'Connaught' },
  { name: 'Shimla', state: 'Himachal Pradesh', lat: 31.1048, lng: 77.1734, suffix: 'Ridge' },
  { name: 'Rishikesh', state: 'Uttarakhand', lat: 30.0869, lng: 78.2676, suffix: 'Ganges View' },
  { name: 'Pondicherry', state: 'Puducherry', lat: 11.9416, lng: 79.8083, suffix: 'French Quarter' },
  { name: 'Darjeeling', state: 'West Bengal', lat: 27.0410, lng: 88.2627, suffix: 'Himalayan' }
];

const seedDatabase = async () => {
  try {
    const propertyCount = await Property.countDocuments();
    
    // Check if we need to seed the full 45 catalog
    if (propertyCount < 40) {
      console.log('Database has less than 40 properties. Seeding full 45-listing catalog...');

      // Clear existing records to prevent duplication
      await Property.deleteMany({});
      await Review.deleteMany({});

      // Fetch or create Host User
      let host = await User.findOne({ email: 'host@airbnbai.com' });
      if (!host) {
        host = await User.create({
          name: 'John Host',
          email: 'host@airbnbai.com',
          password: 'password123',
          role: 'host',
          isVerified: true,
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        });
      }

      // Fetch or create Guest User
      let guest = await User.findOne({ email: 'guest@airbnbai.com' });
      if (!guest) {
        guest = await User.create({
          name: 'Sarah Guest',
          email: 'guest@airbnbai.com',
          password: 'password123',
          role: 'guest',
          isVerified: true,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        });
      }

      const generatedProperties = [];

      // Generate 3 properties for each of the 15 cities (15 * 3 = 45 properties)
      CITIES.forEach((cityObj, cityIndex) => {
        
        // 1. Budget Stay: Apartment or House
        const p1Type = (cityIndex % 2 === 0) ? 'Apartment' : 'House';
        const p1Price = Math.floor(2000 + (cityIndex * 150) % 2500);
        const imgIndex1 = (cityIndex * 3) % IMAGE_POOL.length;
        const imgIndex2 = (cityIndex * 3 + 1) % IMAGE_POOL.length;

        generatedProperties.push({
          host: host._id,
          title: `Cozy ${p1Type} near ${cityObj.suffix}, ${cityObj.name}`,
          description: `Enjoy a clean and welcoming experience at our beautiful ${p1Type} in ${cityObj.name}. Centrally located, this listing is walking distance to local transport hubs, popular restaurants, and landmarks. Perfect for budget-conscious families or solo travelers looking to explore the city.`,
          price: p1Price,
          location: {
            street: `${cityObj.suffix} Road`,
            city: cityObj.name,
            state: cityObj.state,
            country: 'India',
            zip: `${400000 + cityIndex * 1234}`,
            coordinates: { lat: cityObj.lat + 0.005, lng: cityObj.lng - 0.005 }
          },
          amenities: ['Wi-Fi', 'AC', 'Kitchen', 'Free Parking'],
          propertyType: p1Type,
          images: [IMAGE_POOL[imgIndex1], IMAGE_POOL[imgIndex2]],
          isApproved: true,
          ratings: { average: parseFloat((4.2 + (cityIndex % 8) * 0.1).toFixed(1)), count: 1 }
        });

        // 2. Luxury Stay: Villa or Mansion
        const p2Type = (cityIndex % 3 === 0) ? 'Mansions' : 'Villa';
        const p2Price = Math.floor(8000 + (cityIndex * 350) % 8000);
        const imgIndex3 = (cityIndex * 3 + 2) % IMAGE_POOL.length;
        const imgIndex4 = (cityIndex * 3 + 3) % IMAGE_POOL.length;

        generatedProperties.push({
          host: host._id,
          title: `Luxury ${p2Type} with Panoramic Views, ${cityObj.name}`,
          description: `Indulge in a premium holiday experience at this architectural ${p2Type} in ${cityObj.name}. Features high glass walls, marble finishes, and a private pool area. Located in a scenic and highly secure residential block, offering maximum privacy and stunning vistas.`,
          price: p2Price,
          location: {
            street: `VVIP Enclave Road`,
            city: cityObj.name,
            state: cityObj.state,
            country: 'India',
            zip: `${400000 + cityIndex * 1234 + 1}`,
            coordinates: { lat: cityObj.lat - 0.005, lng: cityObj.lng + 0.005 }
          },
          amenities: ['Wi-Fi', 'Pool', 'AC', 'Kitchen', 'Gym', 'Free Parking'],
          propertyType: p2Type,
          images: [IMAGE_POOL[imgIndex3], IMAGE_POOL[imgIndex4]],
          isApproved: true,
          ratings: { average: parseFloat((4.6 + (cityIndex % 5) * 0.1).toFixed(1)), count: 1 }
        });

        // 3. Unique Stay: Cabin, Cottage, or Treehouse
        const p3Type = (cityIndex % 3 === 0) ? 'Treehouse' : (cityIndex % 3 === 1 ? 'Cabin' : 'Cottage');
        const p3Price = Math.floor(3500 + (cityIndex * 220) % 3500);
        const imgIndex5 = (cityIndex * 3 + 4) % IMAGE_POOL.length;
        const imgIndex6 = (cityIndex * 3 + 5) % IMAGE_POOL.length;

        generatedProperties.push({
          host: host._id,
          title: `Scenic Wood ${p3Type} Nature Retreat, ${cityObj.name}`,
          description: `Escape the hustle and bustle in our cozy wood-themed ${p3Type} in ${cityObj.name}. Surrounded by mature forests and mountain trails, this stay provides a rustic getaway without sacrificing modern comforts like fast Wi-Fi and hot showers.`,
          price: p3Price,
          location: {
            street: `Forest Reserve Road`,
            city: cityObj.name,
            state: cityObj.state,
            country: 'India',
            zip: `${400000 + cityIndex * 1234 + 2}`,
            coordinates: { lat: cityObj.lat + 0.008, lng: cityObj.lng + 0.008 }
          },
          amenities: ['Wi-Fi', 'Kitchen', 'Pet-Friendly', 'Free Parking'],
          propertyType: p3Type,
          images: [IMAGE_POOL[imgIndex5], IMAGE_POOL[imgIndex6]],
          isApproved: true,
          ratings: { average: parseFloat((4.4 + (cityIndex % 6) * 0.1).toFixed(1)), count: 1 }
        });
      });

      const seededProperties = await Property.insertMany(generatedProperties);
      console.log(`Successfully generated and seeded ${seededProperties.length} properties across India.`);

      // Seed reviews
      for (const prop of seededProperties) {
        await Review.create({
          property: prop._id,
          guest: guest._id,
          rating: Math.floor(prop.ratings.average),
          comment: `Had an absolutely fantastic time staying here in ${prop.location.city}! The listing matches descriptions perfectly. It was clean, spacious, and very comfortable. Host John was highly communicative. Will definitely return!`,
        });
      }
      console.log('Seeded initial reviews for all 45 listings.');
    }
  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/airbnbai');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Trigger Database Seeding check
    await seedDatabase();
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
  }
};

export default connectDB;
