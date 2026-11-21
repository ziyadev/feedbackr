import { Field, ID, InputType, Int } from '@nestjs/graphql';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { FeedbackType } from '../models/feedback.model';

@InputType()
export class CreateFeedbackDto {
  @Field(() => ID)
  @IsString()
  workspaceId: string;

  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  comment: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @Field(() => FeedbackType, { nullable: true })
  @IsOptional()
  @IsEnum(FeedbackType)
  type?: FeedbackType;

  @Field()
  @IsString()
  @IsUrl({ require_tld: false })
  @MaxLength(2048)
  pageUrl: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  country?: string;
}
