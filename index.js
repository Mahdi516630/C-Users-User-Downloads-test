const express = require('express');
const Amadeus = require('amadeus');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Amadeus client
const amadeus = new Amadeus({
  clientId: 'Adk9fylYn5gLVVRdFIzW3XqWcORiX34k',
  clientSecret: 'vB50iAf67g8lIpKA'
});

// Endpoint to get vacation packages
app.get('/vacation-packages', async (req, res) => {
  try {
    const { origin, destination, departureDate, returnDate } = req.query;

    if (!origin || !destination || !departureDate || !returnDate) {
      return res.status(400).json({ error: 'Missing required query parameters' });
    }

    // Fetch flight offers
    const flightOffers = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate,
      returnDate,
      adults: 1
    });

    // Fetch hotel offers
    const hotelOffers = await amadeus.shopping.hotelOffers.get({
      cityCode: destination,
      checkInDate: departureDate,
      checkOutDate: returnDate,
      adults: 1
    });

    // Combine flight and hotel offers into vacation packages
    const vacationPackages = flightOffers.data.map(flight => {
      return hotelOffers.data.map(hotel => {
        return {
          flight,
          hotel
        };
      });
    }).flat();

    res.json(vacationPackages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching vacation packages' });
  }
});

app.listen(port, () => {
  console.log(`Vacation package API is running on http://localhost:${port}`);
});
