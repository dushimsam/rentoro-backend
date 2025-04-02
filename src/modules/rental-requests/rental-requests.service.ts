import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { RentalRequest, RentalRequestStatus } from './entities/rental-request.entity';
import { CreateRentalRequestDto } from './dto/create-rental-request.dto';
import { UpdateRentalRequestDto } from './dto/update-rental-request.dto';
import { CarsService } from '../cars/cars.service';
import { differenceInDays } from 'date-fns';

@Injectable()
export class RentalRequestsService {
  constructor(
    @InjectRepository(RentalRequest)
    private rentalRequestsRepository: Repository<RentalRequest>,
    @Inject(forwardRef(() => CarsService))
    private carsService: CarsService,
  ) {}

  async create(createRentalRequestDto: CreateRentalRequestDto, userId: string): Promise<RentalRequest> {
    const { carId, startDate, endDate } = createRentalRequestDto;
    
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);
    
    if (startDateTime >= endDateTime) {
      throw new BadRequestException('Start date must be before end date');
    }
    
    if (startDateTime <= new Date()) {
      throw new BadRequestException('Start date must be in the future');
    }
    
    const car = await this.carsService.findOne(carId);
    
    if (!car.isAvailable || !car.isValidated) {
      throw new BadRequestException('Car is not available for rental');
    }
    
    // Check for overlapping rental periods
    const existingRequests = await this.rentalRequestsRepository.find({
      where: {
        carId,
        status: RentalRequestStatus.APPROVED,
        startDate: Between(startDateTime, endDateTime),
      },
    });
    
    if (existingRequests.length > 0) {
      throw new BadRequestException('Car is already booked during this period');
    }
    
    // Calculate total cost based on daily rate and number of days
    const rentalDays = Math.max(1, differenceInDays(endDateTime, startDateTime));
    const totalCost = rentalDays * Number(car.dailyRate);
    
    const rentalRequest = this.rentalRequestsRepository.create({
      carId,
      clientId: userId,
      startDate: startDateTime,
      endDate: endDateTime,
      totalCost,
      status: RentalRequestStatus.PENDING,
    });
    
    return this.rentalRequestsRepository.save(rentalRequest);
  }

  async findAll(userId: string): Promise<RentalRequest[]> {
    return this.rentalRequestsRepository.find({
      where: { clientId: userId },
      relations: ['car'],
    });
  }

  async findOne(id: string, userId: string): Promise<RentalRequest> {
    const request = await this.rentalRequestsRepository.findOne({
      where: { id },
      relations: ['car'],
    });
    
    if (!request) {
      throw new NotFoundException(`Rental request with ID ${id} not found`);
    }
    
    return request;
  }

  async update(id: string, updateRentalRequestDto: UpdateRentalRequestDto, userId: string): Promise<RentalRequest> {
    const request = await this.findOne(id, userId);
    
    if (request.status !== RentalRequestStatus.PENDING) {
      throw new BadRequestException('Can only update pending rental requests');
    }
    
    const { startDate, endDate } = updateRentalRequestDto;
    
    if (startDate) {
      request.startDate = new Date(startDate);
    }
    
    if (endDate) {
      request.endDate = new Date(endDate);
    }
    
    if (request.startDate >= request.endDate) {
      throw new BadRequestException('Start date must be before end date');
    }
    
    if (request.startDate <= new Date()) {
      throw new BadRequestException('Start date must be in the future');
    }
    
    // Recalculate total cost
    const car = await this.carsService.findOne(request.carId);
    const rentalDays = Math.max(1, differenceInDays(request.endDate, request.startDate));
    request.totalCost = rentalDays * Number(car.dailyRate);
    request.status = updateRentalRequestDto.status || RentalRequestStatus.APPROVED;
    
    return this.rentalRequestsRepository.save(request);
  }

  async remove(id: string, userId: string): Promise<void> {
    const request = await this.findOne(id, userId);
    
    if (request.status !== RentalRequestStatus.PENDING) {
      throw new BadRequestException('Can only cancel pending rental requests');
    }
    
    request.status = RentalRequestStatus.CANCELLED;
    await this.rentalRequestsRepository.save(request);
  }

  async findRequestsByCar(carId: string, userId: string): Promise<RentalRequest[]> {
    const car = await this.carsService.findOne(carId);
    
    if (car.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to view these rental requests');
    }
    
    return this.rentalRequestsRepository.find({
      where: { carId },
      relations: ['client'],
    });
  }

}
