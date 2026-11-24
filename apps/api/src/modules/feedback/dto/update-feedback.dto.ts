import { Field, ID, InputType } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator';
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

  // workspace member id; null unassigns, omitted leaves unchanged
  @Field(() => ID, { nullable: true })
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsString()
  assignedToId?: string | null;
}
