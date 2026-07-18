import mongoose from 'mongoose';
import User from '../models/User.js';
import Property from '../models/Property.js';
import Review from '../models/Review.js';

// Expanded seeding engine covering 10 major Indian travel destinations
const seedDatabase = async () => {
  try {
    const propertyCount = await Property.countDocuments();
    // If the count is less than 10, clear and re-seed the full catalog of 10 destinations
    if (propertyCount < 10) {
      console.log('Seeding full catalog of 10 Indian destinations...');
      
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
        },
        {
          host: host._id,
          title: 'Marine Drive Sea-View Suite, Mumbai',
          description: 'Wake up to breathtaking panoramic views of the Arabian Sea in this high-rise apartment on Marine Drive, Mumbai. Features elegant glass walls, premium marble finishings, and close access to Nariman Point.',
          price: 9500,
          location: {
            street: 'Marine Drive Blvd',
            city: 'Mumbai',
            state: 'Maharashtra',
            country: 'India',
            zip: '400020',
            coordinates: { lat: 18.9433, lng: 72.8230 }
          },
          amenities: ['Wi-Fi', 'Gym', 'AC', 'Kitchen'],
          propertyType: 'Apartment',
          images: [
            'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'
          ],
          isApproved: true,
          ratings: { average: 4.8, count: 1 }
        },
        {
          host: host._id,
          title: 'Royal Haveli Heritage Suite, Jaipur',
          description: 'Immerse yourself in history at this beautifully restored 19th-century Haveli in Jaipur. Features traditional arches, courtyard swings, and royal Rajasthani hospitality. Located minutes from Hawa Mahal.',
          price: 7500,
          location: {
            street: 'Johri Bazaar Road',
            city: 'Jaipur',
            state: 'Rajasthan',
            country: 'India',
            zip: '302003',
            coordinates: { lat: 26.9124, lng: 75.7873 }
          },
          amenities: ['Wi-Fi', 'Pool', 'Kitchen', 'Free Parking', 'AC'],
          propertyType: 'House',
          images: [
            'https://images.unsplash.com/photo-1585983224974-084a8e065e76?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
          ],
          isApproved: true,
          ratings: { average: 4.9, count: 1 }
        },
        {
          host: host._id,
          title: 'Lakefront Palace Mansion, Udaipur',
          description: 'A luxurious lakefront mansion offering unparalleled vistas of Lake Pichola and the City Palace. Features white marble courtyards, private infinity pool, and dedicated butler service for a premium Rajasthani holiday.',
          price: 14000,
          location: {
            street: 'Pichola Lake Road',
            city: 'Udaipur',
            state: 'Rajasthan',
            country: 'India',
            zip: '313001',
            coordinates: { lat: 24.5712, lng: 73.6823 }
          },
          amenities: ['Wi-Fi', 'Pool', 'Gym', 'AC', 'Free Parking'],
          propertyType: 'Mansions',
          images: [
            'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
          ],
          isApproved: true,
          ratings: { average: 5.0, count: 1 }
        },
        {
          host: host._id,
          title: 'Luxury Dal Lake Houseboat, Srinagar',
          description: 'Stay on a classic, intricately carved cedar wood houseboat floating on the peaceful waters of Dal Lake, Srinagar. Experience Kashmiri hospitality, enjoy shikara rides, and view the snow-capped Zabarwan Range.',
          price: 5500,
          location: {
            street: 'Boulevard Road Gate 7',
            city: 'Srinagar',
            state: 'Jammu & Kashmir',
            country: 'India',
            zip: '190001',
            coordinates: { lat: 34.0837, lng: 74.7973 }
          },
          amenities: ['Wi-Fi', 'Kitchen', 'Pet-Friendly'],
          propertyType: 'Other',
          images: [
            'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80'
          ],
          isApproved: true,
          ratings: { average: 4.7, count: 1 }
        },
        {
          host: host._id,
          title: 'Tea Estate Colonial Bungalow, Ooty',
          description: 'A charming British-era colonial bungalow surrounded by sprawling tea plantations in Ooty. Features high wooden ceilings, working brick fireplaces, and scenic views of the Nilgiri hills. Excellent mountain escape.',
          price: 4200,
          location: {
            street: 'Dada Road',
            city: 'Ooty',
            state: 'Tamil Nadu',
            country: 'India',
            zip: '643001',
            coordinates: { lat: 11.4102, lng: 76.6950 }
          },
          amenities: ['Wi-Fi', 'Kitchen', 'Pet-Friendly', 'Free Parking'],
          propertyType: 'Cottage',
          images: [
            'https://images.unsplash.com/photo-1475855581690-80accde3ae2b?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?auto=format&fit=crop&w=800&q=80'
          ],
          isApproved: true,
          ratings: { average: 4.6, count: 1 }
        },
        {
          host: host._id,
          title: 'Historic Fort Heritage House, Kochi',
          description: 'Stay in a historic heritage home in Fort Kochi. Features traditional Portuguese-Dutch architecture, antique furnishings, and close proximity to the historic Chinese fishing nets and local spice markets.',
          price: 3800,
          location: {
            street: 'Princess Street',
            city: 'Kochi',
            state: 'Kerala',
            country: 'India',
            zip: '682001',
            coordinates: { lat: 9.9658, lng: 76.2421 }
          },
          amenities: ['Wi-Fi', 'AC', 'Kitchen'],
          propertyType: 'House',
          images: [
            'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'
          ],
          isApproved: true,
          ratings: { average: 4.8, count: 1 }
        }
      ];

      const seededProperties = await Property.insertMany(propertiesData);
      console.log(`Successfully seeded ${seededProperties.length} properties across India.`);

      // Seed initial reviews for these properties
      for (const prop of seededProperties) {
        await Review.create({
          property: prop._id,
          guest: guest._id,
          rating: Math.floor(prop.ratings.average),
          comment: `Absolutely loved our stay here in ${prop.location.city}! The place was exceptionally clean, matching descriptions perfectly. The host John was highly responsive. Will definitely book again.`,
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
