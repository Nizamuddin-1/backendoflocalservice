import mongoose, { Schema, Document } from 'mongoose';

export interface IServiceCatalogVariation {
  label: string;
  desc: string;
  duration: string;
  defaultPrice: number;
  mcIcon: string;
}

export interface IServiceCatalog extends Document {
  categoryId: mongoose.Types.ObjectId;
  name: string;
  categoryLabel: string;
  description: string;
  defaultPrice: number;
  defaultEta: string;
  mcIcon: string;
  variations: IServiceCatalogVariation[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const serviceCatalogVariationSchema = new Schema<IServiceCatalogVariation>(
  {
    label: { type: String, required: true },
    desc: { type: String, required: true },
    duration: { type: String, required: true },
    defaultPrice: { type: Number, required: true },
    mcIcon: { type: String, required: true },
  },
  { _id: false }
);

const serviceCatalogSchema = new Schema<IServiceCatalog>(
  {
    categoryId: { type: Schema.Types.ObjectId, ref: 'ServiceCategory', required: true },
    name: { type: String, required: true, trim: true },
    categoryLabel: { type: String, required: true },
    description: { type: String, required: true },
    defaultPrice: { type: Number, required: true },
    defaultEta: { type: String, required: true },
    mcIcon: { type: String, required: true },
    variations: [serviceCatalogVariationSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

serviceCatalogSchema.index({ categoryId: 1, name: 1 }, { unique: true });
serviceCatalogSchema.index({ name: 'text', description: 'text' });
serviceCatalogSchema.index({ categoryLabel: 1 });

export const ServiceCatalog = mongoose.model<IServiceCatalog>('ServiceCatalog', serviceCatalogSchema);
