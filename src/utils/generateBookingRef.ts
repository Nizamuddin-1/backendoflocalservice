import { Counter } from '../models/Counter';

let memoryCounter = 0;

export async function generateBookingRef(): Promise<string> {
  const year = new Date().getFullYear();
  const counter = await Counter.findByIdAndUpdate(
    'bookingRef',
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const num = String(counter.seq).padStart(4, '0');
  return `LF-${year}-${num}`;
}

export async function generateRequestNo(): Promise<string> {
  const counter = await Counter.findByIdAndUpdate(
    'requestNo',
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `BK-${String(counter.seq).padStart(4, '0')}`;
}

export function generateBookingRefSync(): string {
  memoryCounter += 1;
  const year = new Date().getFullYear();
  const num = String(memoryCounter).padStart(4, '0');
  return `LF-${year}-${num}`;
}

export function generateRequestNoSync(): string {
  memoryCounter += 1;
  return `BK-${String(memoryCounter).padStart(4, '0')}`;
}
