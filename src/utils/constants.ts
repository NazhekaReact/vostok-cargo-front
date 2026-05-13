export const MOCK_USER = {
  id: '5056024242',
  name: 'Didar',
  rating: 4.5,
  company: { name: 'Dake Company Limited', email: 'dake@mail.ru' }
};

export const MOCK_VEHICLES = [
  { _id: 'v1', brand: 'HYUNDAI', plateNumber: '000DID01', type: 'TRUCK_20T', capacity: { weight: 20000, volume: 10 }, currentDriver: { _id: 'd1', name: 'ChilDrake' } },
  { _id: 'v2', brand: 'Volvo FH', plateNumber: 'A 777 AA 777', type: 'TRUCK_20T', capacity: { weight: 20000, volume: 82 }, currentDriver: null }
];

export const MOCK_DRIVERS = [
  { _id: 'd1', name: 'ChilDrake', telegramId: '706284378', status: 'BUSY' }
];

export const MOCK_ORDERS = [
  {
    _id: 'o1', status: 'IN_TRANSIT',
    route: { from: { city: 'Астана' }, to: { city: 'Астана' } },
    cargoDetails: { description: 'песок', weight: 20, volume: 13 },
    pricing: { customerOffer: 20000 },
    createdAt: '2026-03-14T10:00:00Z',
    executor: {
      logistician: { name: 'Didar' },
      vehicle: { brand: 'HYUNDAI', plateNumber: '000DID01' },
      driver: { name: 'ChilDrake' }
    }
  },
  {
    _id: 'o2', status: 'NEGOTIATION',
    route: { from: { city: 'Астана' }, to: { city: 'Астана' } },
    cargoDetails: { description: 'песок', weight: 20, volume: 13 },
    pricing: { customerOffer: 20000 },
    createdAt: '2026-03-14T10:00:00Z',
    bids: [
      { _id: 'b1', amount: 25000, comment: 'бензин подорожал', logistician: { name: 'Didar' } }
    ]
  },
  {
    _id: 'o3', status: 'PUBLISHED',
    route: { from: { city: 'Астана' }, to: { city: 'Астана' } },
    cargoDetails: { description: 'песок', weight: 20, volume: 13 },
    pricing: { customerOffer: 20000 },
    createdAt: '2026-03-14T10:00:00Z'
  },
  {
    _id: 'o4', status: 'DELIVERED',
    route: { from: { city: 'Алматы' }, to: { city: 'Астана' } },
    cargoDetails: { description: 'ТНП', weight: 10, volume: 30 },
    pricing: { customerOffer: 15000 },
    createdAt: '2026-03-14T10:00:00Z'
  }
];
