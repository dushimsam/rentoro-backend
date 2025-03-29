import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('cars')
export class Car {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  make: string;

  @Column()
  model: string;

  @Column()
  year: number;

  @Column({ name: 'license_plate' })
  licensePlate: string;

  @Column()
  color: string;

  @Column({ name: 'daily_rate', type: 'decimal', precision: 10, scale: 2 })
  dailyRate: number;

  @Column()
  location: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;

  @Column({ name: 'is_validated', default: false })
  isValidated: boolean;
  
  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ name: 'owner_id' })
  ownerId: string;

  @Column({ name: 'image_urls', type: 'json', nullable: true, default: '[]' })
  imageUrls: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
