import { Schema } from 'mongoose';
import { WorkerStatus } from 'types/enums';
import { IServiceImage, serviceImageSchema } from './ServicesEmbed';

interface IWorkerEmbed {
  id: string;
  name: string;
  mainSkill: string;
  workerStatus: WorkerStatus;
  image: IServiceImage;
}

const workerEmbedSchema = new Schema<IWorkerEmbed>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  mainSkill: { type: String, required: true },
  workerStatus: { type: String, enum: WorkerStatus, required: true },
  image: { type: serviceImageSchema, required: true },
});

export { IWorkerEmbed,workerEmbedSchema  };