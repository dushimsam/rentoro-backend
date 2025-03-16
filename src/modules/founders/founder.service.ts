import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Founder } from './entity/founder.entity';
import { FounderDTO } from './dto/founder.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { _400 } from 'src/common/constants/error-const';

@Injectable()
export class FounderService {
  constructor(
    @InjectRepository(Founder)
    private readonly founderRepository: Repository<Founder>,
  ) {}

  getHello(): string {
    return 'Hello From Rentoro founders!';
  }

  async loadFounders() {
    const founders: FounderDTO[] = [
      { name: 'Samuel Dushimimana', email: 'samueldush@gmail.com' },
      { name: 'Kevin Ntwari', email: 'kevinntwari@gmail.com' },
    ];

    const existingFounders = await this.founderRepository.find();
    if (existingFounders.length > 0) {
      throw new BadRequestException(_400.FOUNDERS_ALREADY_EXISTS);
    }

    const savedFounders = await this.founderRepository.save(
      founders.map((founder) => {
        const founderEntity = new Founder();
        founderEntity.fromDTO(founder);
        return founderEntity;
      }),
    );

    return savedFounders;
  }

  async getFounders() {
    return this.founderRepository.find();
  }
}
