import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostingService } from './posting.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PostStatus } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../common/prisma.service';

@ApiTags('Posts')
@ApiBearerAuth()
@Controller('posts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postingService: PostingService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create post distribution' })
  async create(
    @Request() req: any,
    @Body() body: {
      adId: string;
      intervalMin?: number;
      intervalMax?: number;
      groupInterval?: number;
      usePriorityGroups?: boolean;
      selectedSessions?: string[];
    },
  ) {
    const { adId, ...config } = body;
    return this.postsService.createPost(adId, req.user.userId, config);
  }

  @Get()
  @ApiOperation({ summary: 'Get posts list' })
  async findAll(
    @Request() req: any,
    @Query('status') status?: PostStatus,
    @Query('adId') adId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.postsService.getUserPosts(req.user.userId, {
      status,
      adId,
      limit: limit ? parseInt(limit) : 50,
    });
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get overall post statistics' })
  async getStatistics(@Request() req: any) {
    return this.postsService.getStatistics(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get post status' })
  async getStatus(@Param('id') id: string) {
    return this.postsService.getStatus(id);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start distribution' })
  async start(@Param('id') id: string) {
    await this.postsService.startDistribution(id);
    return { message: 'Distribution started' };
  }

  @Post(':id/pause')
  @ApiOperation({ summary: 'Pause distribution' })
  async pause(@Param('id') id: string) {
    return this.postsService.pausePost(id);
  }

  @Post(':id/resume')
  @ApiOperation({ summary: 'Resume distribution' })
  async resume(@Param('id') id: string) {
    await this.postsService.resumePost(id);
    return { message: 'Distribution resumed' };
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel distribution' })
  async cancel(@Param('id') id: string) {
    return this.postsService.cancelPost(id);
  }

  @Post(':id/retry')
  @ApiOperation({ summary: 'Retry failed deliveries' })
  async retry(@Param('id') id: string) {
    await this.postsService.retryFailed(id);
    return { message: 'Retrying failed deliveries' };
  }

  @Post('start-posting/:adId')
  @ApiOperation({ summary: 'Start posting for ad (admin dashboard)' })
  async startPosting(@Request() req: any, @Param('adId') adId: string) {
    const ad = await this.prisma.ad.findUnique({ where: { id: adId } });
    if (!ad) {
      throw new Error("E'lon topilmadi");
    }

    const job = await this.postingService.startPosting(adId, ad.content, req.user.userId);
    return {
      jobId: job.id,
      status: job.status,
      totalGroups: job.totalGroups,
      message: 'Tarqatish boshlandi',
    };
  }

  @Post('stop-posting/:adId')
  @ApiOperation({ summary: 'Stop posting for ad' })
  async stopPosting(@Request() req: any, @Param('adId') adId: string) {
    const jobs = this.postingService.getUserJobs(req.user.userId);
    const job = jobs.find(j => j.adId === adId && j.status === 'running');
    if (!job) {
      throw new Error("Bu e'lon uchun faol tarqatish topilmadi");
    }

    this.postingService.stopJob(job.id);
    return {
      jobId: job.id,
      message: "Tarqatish to'xtatildi",
    };
  }

  @Get('posting-status/:adId')
  @ApiOperation({ summary: 'Get posting status for ad' })
  async getPostingStatus(@Request() req: any, @Param('adId') adId: string) {
    const jobs = this.postingService.getUserJobs(req.user.userId);
    const job = jobs.find(j => j.adId === adId);
    if (!job) {
      return { active: false, message: 'Faol tarqatish yo\'q' };
    }

    const stats = this.postingService.getJobStats(job.id);
    return {
      active: job.status === 'running',
      jobId: job.id,
      status: job.status,
      ...stats,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete post' })
  async remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }
}
