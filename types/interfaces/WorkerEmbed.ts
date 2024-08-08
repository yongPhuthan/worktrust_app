import { Schema } from 'mongoose';
import { WorkerStatus } from 'types/enums';

interface IWorkerEmbed {
  id: string;
  name: string;
  mainSkill: string;
  workerStatus: WorkerStatus;
  image: string;
}

const workerEmbedSchema = new Schema<IWorkerEmbed>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  mainSkill: { type: String, required: true },
  workerStatus: { type: String, enum: WorkerStatus, required: true },
  image: { type: String, required: true },
});

export { IWorkerEmbed,workerEmbedSchema  };