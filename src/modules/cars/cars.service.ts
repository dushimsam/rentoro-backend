import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Car } from './entities/car.entity';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { UpdateCarAvailabilityDto } from './dto/update-car-availability.dto';

@Injectable()
export class CarsService {
  constructor(
    @InjectRepository(Car)
    private carsRepository: Repository<Car>,
  ) {}

  async create(createCarDto: CreateCarDto, userId: string): Promise<Car> {
    const car = this.carsRepository.create({
      ...createCarDto,
      ownerId: userId,
    });
    return this.carsRepository.save(car);
  }

  async findAllCars(): Promise<Car[]> {
    return this.carsRepository.find();
  }

  async findAll(filters?: any): Promise<Car[]> {
    const queryBuilder = this.carsRepository
      .createQueryBuilder('car')
      .where('car.isValidated = :isValidated', { isValidated: true });

    if (filters) {
      if (filters.make) {
        queryBuilder.andWhere('car.make ILIKE :make', { make: `%${filters.make}%` });
      }
      if (filters.model) {
        queryBuilder.andWhere('car.model ILIKE :model', { model: `%${filters.model}%` });
      }
      if (filters.minYear) {
        queryBuilder.andWhere('car.year >= :minYear', { minYear: filters.minYear });
      }
      if (filters.maxYear) {
        queryBuilder.andWhere('car.year <= :maxYear', { maxYear: filters.maxYear });
      }
      if (filters.minDailyRate) {
        queryBuilder.andWhere('car.dailyRate >= :minDailyRate', { minDailyRate: filters.minDailyRate });
      }
      if (filters.maxDailyRate) {
        queryBuilder.andWhere('car.dailyRate <= :maxDailyRate', { maxDailyRate: filters.maxDailyRate });
      }
      if (filters.location) {
        queryBuilder.andWhere('car.location ILIKE :location', { location: `%${filters.location}%` });
      }
    }

    // Only show available cars by default
    queryBuilder.andWhere('car.isAvailable = :isAvailable', { isAvailable: true });

    return queryBuilder.getMany();
  }

  async findOwnerCars(userId: string): Promise<Car[]> {
    return this.carsRepository.find({
      where: { ownerId: userId },
    });
  }

  async findOne(id: string): Promise<Car> {
    const car = await this.carsRepository.findOne({
      where: { id },
      relations: ['owner']
    });

    if (!car) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }

    return car;
  }

  async update(id: string, updateCarDto: UpdateCarDto, userId: string): Promise<Car> {
    const car = await this.findOne(id);

    if (car.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to update this car');
    }

    Object.assign(car, updateCarDto);
    return this.carsRepository.save(car);
  }

  async updateAvailability(id: string, updateAvailabilityDto: UpdateCarAvailabilityDto, userId: string): Promise<Car> {
    const car = await this.findOne(id);

    if (car.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to update this car');
    }

    car.isAvailable = updateAvailabilityDto.isAvailable;
    return this.carsRepository.save(car);
  }

  async remove(id: string, userId: string): Promise<void> {
    const car = await this.findOne(id);

    if (car.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this car');
    }

    await this.carsRepository.remove(car);
  }

  async checkValidationStatus(id: string, userId: string): Promise<{ isValidated: boolean }> {
    const car = await this.findOne(id);

    if (car.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to check this car');
    }

    return { isValidated: car.isValidated };
  }
}
