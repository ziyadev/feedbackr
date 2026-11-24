import { Field, ID, InputType } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { FeedbackPriority, FeedbackStatus } from '../models/feedback.model';

@InputType()
export class UpdateFeedbackDto {
  @Field(() => FeedbackStatus, { nullable: true })
  @IsOptional()
  @IsEnum(FeedbackStatus)
  status?: FeedbackStatus;

  @Field(() => FeedbackPriority, { nullable: true })
  @IsOptional()
  @IsEnum(FeedbackPriority)
  priority?: FeedbackPriority;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  assignedToId?: string;
}
