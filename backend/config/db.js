import mongoose from 'mongoose';
import User from '../models/User.js';
import Property from '../models/Property.js';
import Review from '../models/Review.js';

// Auto-seeding logic for a clean, out-of-the-box demo
const seedDatabase = async () => {
  try {
    const propertyCount = await Property.countDocuments();
    if (propertyCount === 0) {
      console.log('Database is empty. Seeding mock listings for AirbnbAI demo...');

      // 1. Create a default Host User
      const host = await User.create({
        name: 'John Host',
        email: 'host@airbnbai.com',
        password: 'password123', // Will be hashed automatically by schema pre-save hook
        role: 'host',
        isVerified: true,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      });

      // 2. Create a default Guest User (to associate with initial review)
      const guest = await User.create({
        name: 'Sarah Guest',
        email: 'guest@airbnbai.com',
        password: 'password123',
        role: 'guest',
        isVerified: true,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      });

      // 3. Seed Properties
      const propertiesData = [
        {
          host: host._id,
          title: 'Spice Garden Villa, Munnar',
          description: 'Experience pure tranquility in this gorgeous villa nestled in the lush tea gardens of Munnar. Enjoy fresh breezes, scenic mountain vistas, and modern interior comforts. Perfect for families looking to reconnect with nature.',
          price: 6500,
          location: {
            street: 'Chithirapuram Road',
            city: 'Munnar',
            state: 'Kerala',
            country: 'India',
            zip: '685612',
            coordinates: { lat: 10.0889, lng: 77.0595 }
          },
          amenities: ['Wi-Fi', 'Pool', 'Kitchen', 'Free Parking', 'AC'],
          propertyType: 'Villa',
          images: [
            'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80'
          ],
          isApproved: true,
          ratings: { average: 4.8, count: 1 }
        },
        {
          host: host._id,
          title: 'Beachfront Cottage, Goa',
          description: 'A cozy beachfront cottage located directly on the golden sands of Calangute Beach, Goa. Wake up to the sound of ocean waves and enjoy panoramic sunset views from your private front patio. Includes quick beach access, and popular beach shacks nearby.',
          price: 4800,
          location: {
            street: 'Calangute Beach Road',
            city: 'Goa',
            state: 'Goa',
            country: 'India',
            zip: '403516',
            coordinates: { lat: 15.5494, lng: 73.7535 }
          },
          amenities: ['Wi-Fi', 'Kitchen', 'Pet-Friendly', 'AC'],
          propertyType: 'Cottage',
          images: [
            'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80'
          ],
          isApproved: true,
          ratings: { average: 4.9, count: 1 }
        },
        {
          host: host._id,
          title: 'Luxury Glass Penthouse, Bangalore',
          description: 'An architectural glass penthouse situated in the vibrant neighborhood of Indiranagar, Bangalore. High-speed Wi-Fi makes it an excellent match for remote tech workers. Walk to nearby microbreweries and fine dining centers.',
          price: 8500,
          location: {
            street: '100 Feet Road',
            city: 'Bangalore',
            state: 'Karnataka',
            country: 'India',
            zip: '560038',
            coordinates: { lat: 12.9716, lng: 77.5946 }
          },
          amenities: ['Wi-Fi', 'Gym', 'AC', 'Kitchen', 'Free Parking'],
          propertyType: 'Apartment',
          images: [
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'
          ],
          isApproved: true,
          ratings: { average: 4.7, count: 1 }
        },
        {
          host: host._id,
          title: 'Wooden Log Cabin, Manali',
          description: 'Escape the city heat in this warm wooden log cabin nestled in the snow-capped hills of Old Manali. Cozy up beside the fireplace, enjoy forest hiking trails, and stargaze from your private elevated balcony.',
          price: 3500,
          location: {
            street: 'Club House Road',
            city: 'Manali',
            state: 'Himachal Pradesh',
            country: 'India',
            zip: '175131',
            coordinates: { lat: 32.2396, lng: 77.1887 }
          },
          amenities: ['Wi-Fi', 'Kitchen', 'Pet-Friendly', 'Free Parking'],
          propertyType: 'Cabin',
          images: [
            'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80'
          ],
          isApproved: true,
          ratings: { average: 4.6, count: 1 }
        }
      ];

      const seededProperties = await Property.insertMany(propertiesData);
      console.log(`Seeded ${seededProperties.length} properties.`);

      // 4. Seed initial reviews for these properties
      for (const prop of seededProperties) {
        await Review.create({
          property: prop._id,
          guest: guest._id,
          rating: Math.floor(prop.ratings.average),
          comment: `Absolutely loved our stay here! The place was exceptionally clean, matching descriptions perfectly. The host John was highly responsive. Will definitely book again.`,
        });
      }
      console.log('Seeded initial guest reviews.');
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
