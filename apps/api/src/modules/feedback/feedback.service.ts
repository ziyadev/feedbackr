import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { FeedbackRepository } from '../database/repositories/feedback.repository';
import { WorkspaceMemberRepository } from '../database/repositories/workspace-member.repository';
import { FeedbackModel, PaginatedFeedbackModel } from './models/feedback.model';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import {
  FeedbackPaginationDto,
  GetAllFeedbacksFilterDto,
  GetAllFeedbacksFilterOrderBy,
  GetAllFeedbacksFilterOrderByKeys,
} from './dto/get-all-feedbacks-filter.dto';
import { CursorService } from '@/common/modules/cursor/cursor.service';
import { FeedbackMapper } from './mapper/feedback.mapper';
import { OrderByType } from '@/common/dto/enum-filter.dto';

const DEFAULT_ORDER_BY: GetAllFeedbacksFilterOrderBy = {
  key: GetAllFeedbacksFilterOrderByKeys.CREATED_AT,
  type: OrderByType.DESC,
};

@Injectable()
export class FeedbackService {
  private logger = new Logger(FeedbackService.name);
  constructor(
    private readonly feedbackRepository: FeedbackRepository,
    private cursorService: CursorService,
    private readonly workspaceMemberRepository: WorkspaceMemberRepository
  ) {}

  async handleGetAllFeedbacks(
    workspaceId: string,
    filter: GetAllFeedbacksFilterDto,
    pagination: FeedbackPaginationDto | null,
    orderBy: GetAllFeedbacksFilterOrderBy | null
  ): Promise<PaginatedFeedbackModel> {
    const where = {
      workspaceId,
      ...filter,
    };
    const { cursor } = pagination ?? {};
    const take = pagination?.take || 10;
    const { key, type } = orderBy ?? DEFAULT_ORDER_BY;
    const takePlusOne = take + 1;
    const list = await this.feedbackRepository.findMany({
      where,
      take: takePlusOne,
      orderBy: {
        [key]: type,
      },
      ...this.cursorService.createCursorObject(cursor),
    });
    const totalCount =
      list.length > 0 ? await this.feedbackRepository.count({ where }) : 0;

    return this.cursorService.createPaginationResponse(
      list,
      take,
      totalCount,
      FeedbackMapper.toModel
    );
  }

  async handleCreateFeedback(input: CreateFeedbackDto): Promise<FeedbackModel> {
    const { workspaceId, rating, type, pageUrl, country } = input;
    const comment = input.comment.replace(/\s+/g, ' ').trim();
    if (!comment) throw new BadRequestException('Comment must not be empty');
    const feedback = await this.feedbackRepository.create({
      data: {
        workspaceId,
        comment,
        rating,
        type,
        pageUrl,
        country: country || 'unknown',
        metadata: JSON.stringify({}),
        userMetadata: JSON.stringify({}),
      },
    });
    return FeedbackMapper.toModel(feedback);
  }

  async handleUpdateFeedback(
    workspaceId: string,
    id: string,
    input: UpdateFeedbackDto
  ): Promise<FeedbackModel> {
    const existing = await this.feedbackRepository.findFirst({
      where: { id, workspaceId },
    });
    if (!existing) throw new NotFoundException('Feedback not found');
    const { status, priority, assignedToId } = input;
    if (assignedToId) {
      const member = await this.workspaceMemberRepository.findFirst({
        where: { id: assignedToId, workspaceId },
      });
      if (!member) throw new NotFoundException('Assignee not found');
    }
    const feedback = await this.feedbackRepository.update({
      where: { id },
      data: { status, priority, assignedToId },
    });
    return FeedbackMapper.toModel(feedback);
  }
}
