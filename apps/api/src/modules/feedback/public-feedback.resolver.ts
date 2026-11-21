import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { FeedbackModel } from './models/feedback.model';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

// Intentionally NOT guarded by @Auth/@WorkspaceAuth: the feedback form is public.
@Resolver(() => FeedbackModel)
export class PublicFeedbackResolver {
  constructor(private readonly feedbackService: FeedbackService) {}

  // Lets anonymous visitors submit the public feedback form for a given workspace.
  @Mutation(() => FeedbackModel)
  createFeedback(@Args('input') input: CreateFeedbackDto) {
    return this.feedbackService.handleCreateFeedback(input);
  }
}
