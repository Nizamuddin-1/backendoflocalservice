import { Counter } from '../models/Counter';
import { AppError } from '../middleware/errorHandler';

let memoryCounter = 0;

export async function generateBookingRef(): Promise<string> {
  try {
    const year = new Date().getFullYear();
    const counter = await Counter.findByIdAndUpdate(
      'bookingRef',
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const num = String(counter.seq).padStart(4, '0');
    return `LF-${year}-${num}`;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to generate booking ref', 500);
  }
}

export async function generateRequestNo(): Promise<string> {
  try {
    const counter = await Counter.findByIdAndUpdate(
      'requestNo',
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    return `BK-${String(counter.seq).padStart(4, '0')}`;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to generate request number', 500);
  }
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
