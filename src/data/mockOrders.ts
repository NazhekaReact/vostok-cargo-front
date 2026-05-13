export const MOCK_ORDERS = [
  {
    _id: 'o1',
    status: 'IN_TRANSIT',
    route: { from: { city: 'Астана' }, to: { city: 'Астана' } },
    cargoDetails: { description: 'песок', weight: 20, volume: 13 },
    pricing: { customerOffer: 20000 },
    createdAt: '2026-03-14T10:00:00Z',
    executor: {
      logistician: { name: 'Didar' },
      vehicle: { brand: 'HYUNDAI', plateNumber: '000DID01' },
      driver: { name: 'ChilDrake' },
    },
  },
  {
    _id: 'o2',
    status: 'NEGOTIATION',
    route: { from: { city: 'Астана' }, to: { city: 'Астана' } },
    cargoDetails: { description: 'песок', weight: 20, volume: 13 },
    pricing: { customerOffer: 20000 },
    createdAt: '2026-03-14T10:00:00Z',
    bids: [
      {
        _id: 'b1',
        amount: 25000,
        comment: 'бензин подорожал',
        logistician: { name: 'Didar' },
      },
    ],
  },
  {
    _id: 'o3',
    status: 'PUBLISHED',
    route: { from: { city: 'Астана' }, to: { city: 'Астана' } },
    cargoDetails: { description: 'песок', weight: 20, volume: 13 },
    pricing: { customerOffer: 20000 },
    createdAt: '2026-03-14T10:00:00Z',
  },
  {
    _id: 'o4',
    status: 'DELIVERED',
    route: { from: { city: 'Алматы' }, to: { city: 'Астана' } },
    cargoDetails: { description: 'ТНП', weight: 10, volume: 30 },
    pricing: { customerOffer: 15000 },
    createdAt: '2026-03-14T10:00:00Z',
  },
];