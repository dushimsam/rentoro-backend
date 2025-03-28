import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Car } from '../cars/entities/car.entity';
import { RentalRequest } from '../rental-requests/entities/rental-request.entity';
import { Payment } from '../payments/entities/payment.entity';
import { ValidationDecisionDto } from './dto/validation-decision.dto';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Car)
    private carsRepository: Repository<Car>,
    @InjectRepository(RentalRequest)
    private rentalRequestsRepository: Repository<RentalRequest>,
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
  ) {}

  private checkAdminAccess(user: User): void {
    if (!user.hasRole(Role.ADMIN)) {
      throw new ForbiddenException('Admin access required');
    }
  }

  async findAllUsers(currentUser: User): Promise<User[]> {
    this.checkAdminAccess(currentUser);
    return this.usersRepository.find({
      select: ['id', 'email', 'firstName', 'lastName', 'isEmailVerified', 'roles', 'isActive', 'createdAt', 'updatedAt'],
    });
  }

  async findAllCars(currentUser: User): Promise<Car[]> {
    this.checkAdminAccess(currentUser);
    return this.carsRepository.find({
      relations: ['owner'],
    });
  }

  async findPendingValidations(currentUser: User): Promise<Car[]> {
    this.checkAdminAccess(currentUser);
    return this.carsRepository.find({
      where: { isValidated: false },
      relations: ['owner'],
    });
  }

  async findCarValidationDetails(carId: string, currentUser: User): Promise<Car> {
    this.checkAdminAccess(currentUser);
    
    const car = await this.carsRepository.findOne({
      where: { id: carId },
      relations: ['owner'],
    });
    
    if (!car) {
      throw new NotFoundException(`Car with ID ${carId} not found`);
    }
    
    return car;
  }

  async submitValidationDecision(
    carId: string, 
    validationDecisionDto: ValidationDecisionDto, 
    currentUser: User
  ): Promise<Car> {
    this.checkAdminAccess(currentUser);
    
    const car = await this.findCarValidationDetails(carId, currentUser);
    
    car.isValidated = validationDecisionDto.approved;
    
    // Here you might want to store validation notes in a separate table
    // or add a notes field to the car entity
    
    return this.carsRepository.save(car);
  }

  async findAllRentalRequests(currentUser: User): Promise<RentalRequest[]> {
    this.checkAdminAccess(currentUser);
    return this.rentalRequestsRepository.find({
      relations: ['car', 'client'],
    });
  }

  async findAllPayments(currentUser: User): Promise<Payment[]> {
    this.checkAdminAccess(currentUser);
    return this.paymentsRepository.find({
      relations: ['user', 'rentalRequest', 'rentalRequest.car'],
    });
  }

  async makeAdmin(userId: string, currentUser: User): Promise<User> {
    // this.checkAdminAccess(currentUser);
    
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    
    user.roles.push(Role.ADMIN);
    
    return this.usersRepository.save(user);
  }
}
