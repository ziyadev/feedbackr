import { Args, ID, Mutation, Resolver, Query } from '@nestjs/graphql';
import { FeedbackModel, PaginatedFeedbackModel } from './models/feedback.model';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { FeedbackService } from './feedback.service';
import { Workspace } from '@/common/decorators/workspace.decorator';
import { WorkspaceSessionData } from '@/common/config/sessoin.config';
import {
  FeedbackPaginationDto,
  GetAllFeedbacksFilterDto,
  GetAllFeedbacksFilterOrderBy,
} from './dto/get-all-feedbacks-filter.dto';
import { WorkspaceAuth } from '../auth/decorator/workspace.decorator';
import { Auth } from '../auth/decorator/auth.decorator';
import { WorkspaceMemberRole } from '../workspace/model/workspace-member.model';

@Auth()
@WorkspaceAuth({
  roles: [
    WorkspaceMemberRole.ADMIN,
    WorkspaceMemberRole.EDITOR,
    WorkspaceMemberRole.VIEWER,
  ],
})
@Resolver(() => FeedbackModel)
export class FeedbackResolver {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Query(() => PaginatedFeedbackModel)
  getFeedbacks(
    @Workspace() workspace: WorkspaceSessionData,
    @Args('filter', { nullable: true }) filter: GetAllFeedbacksFilterDto,
    @Args('pagination', { nullable: true }) pagination: FeedbackPaginationDto,
    @Args('orderBy', { nullable: true }) orderBy: GetAllFeedbacksFilterOrderBy
  ) {
    return this.feedbackService.handleGetAllFeedbacks(
      workspace.id,
      filter,
      pagination,
      orderBy
    );
  }

  @WorkspaceAuth({
    roles: [WorkspaceMemberRole.ADMIN, WorkspaceMemberRole.EDITOR],
  })
  @Mutation(() => FeedbackModel)
  updateFeedback(
    @Workspace() workspace: WorkspaceSessionData,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateFeedbackDto
  ) {
    return this.feedbackService.handleUpdateFeedback(workspace.id, id, input);
  }
}
