// pages/api/events.ts

import { NextApiRequest, NextApiResponse } from 'next';

const events = [
  {
    date: '2024-03-20',
    title: 'Workshop: Website Ontwikkeling',
    description: 'Leer hoe je een website maakt.',
    time: '10:00',
    location: 'Kantoor 101',
  },
  {
    date: '2024-03-21',
    title: 'Bijeenkomst: Vrijwilligers',
    description: 'Bespreek toekomstige projecten en activiteiten.',
    time: '14:00',
    location: 'Vergaderruimte A',
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(events);
}
