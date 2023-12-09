import { IsMongoId } from 'class-validator';

class ParamsWithMongoId {
  @IsMongoId()
  id: string;
}

export default ParamsWithMongoId;
