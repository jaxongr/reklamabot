import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';

const PLAN_DETAILS: Record<SubscriptionPlan, {
  name: string;
  price: number;
  currency: string;
  maxAds: number;
  maxSessions: number;
  maxGroups: number;
  minInterval: number;
  maxInterval: number;
  groupInterval: number;
  durationDays: number;
}> = {
  STARTER: {
    name: 'Starter',
    price: 50000,
    currency: 'UZS',
    maxAds: 5,
    maxSessions: 1,
    maxGroups: 50,
    minInterval: 600,
    maxInterval: 1800,
    groupInterval: 5,
    durationDays: 30,
  },
  BUSINESS: {
    name: 'Business',
    price: 150000,
    currency: 'UZS',
    maxAds: 20,
    maxSessions: 3,
    maxGroups: 200,
    minInterval: 300,
    maxInterval: 900,
    groupInterval: 3,
    durationDays: 30,
  },
  PREMIUM: {
    name: 'Premium',
    price: 300000,
    currency: 'UZS',
    maxAds: 50,
    maxSessions: 5,
    maxGroups: 500,
    minInterval: 180,
    maxInterval: 600,
    groupInterval: 2,
    durationDays: 30,
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 500000,
    currency: 'UZS',
    maxAds: -1,
    maxSessions: 10,
    maxGroups: -1,
    minInterval: 60,
    maxInterval: 300,
    groupInterval: 1,
    durationDays: 30,
  },
};

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, planType: SubscriptionPlan) {
    const existing = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (existing && existing.status === SubscriptionStatus.ACTIVE) {
      throw new BadRequestException('User already has an active subscription');
    }

    const plan = PLAN_DETAILS[planType];
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.durationDays);

    const subscription = await this.prisma.subscription.upsert({
      where: { userId },
      update: {
        planType,
        status: SubscriptionStatus.ACTIVE,
        startDate,
        endDate,
        maxAds: plan.maxAds,
        maxSessions: plan.maxSessions,
        maxGroups: plan.maxGroups,
        minInterval: plan.minInterval,
        maxInterval: plan.maxInterval,
        groupInterval: plan.groupInterval,
      },
      create: {
        userId,
        planType,
        status: SubscriptionStatus.ACTIVE,
        startDate,
        endDate,
        maxAds: plan.maxAds,
        maxSessions: plan.maxSessions,
        maxGroups: plan.maxGroups,
        minInterval: plan.minInterval,
        maxInterval: plan.maxInterval,
        groupInterval: plan.groupInterval,
      },
    });

    await this.prisma.subscriptionHistory.create({
      data: {
        userId,
        planType,
        status: SubscriptionStatus.ACTIVE,
        startDate,
        endDate,
        amount: plan.price,
        currency: plan.currency,
      },
    });

    this.logger.log(`Subscription created for user ${userId}: ${planType}`);
    return subscription;
  }

  async findByUser(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!subscription) {
      return null;
    }

    const plan = PLAN_DETAILS[subscription.planType];
    return {
      ...subscription,
      planDetails: plan,
    };
  }

  async upgrade(userId: string, newPlan: SubscriptionPlan) {
    const current = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!current) {
      throw new NotFoundException('No active subscription found');
    }

    const planOrder = [
      SubscriptionPlan.STARTER,
      SubscriptionPlan.BUSINESS,
      SubscriptionPlan.PREMIUM,
      SubscriptionPlan.ENTERPRISE,
    ];

    const currentIndex = planOrder.indexOf(current.planType);
    const newIndex = planOrder.indexOf(newPlan);

    if (newIndex <= currentIndex) {
      throw new BadRequestException('Can only upgrade to a higher plan');
    }

    const plan = PLAN_DETAILS[newPlan];
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.durationDays);

    const subscription = await this.prisma.subscription.update({
      where: { userId },
      data: {
        planType: newPlan,
        status: SubscriptionStatus.ACTIVE,
        endDate,
        maxAds: plan.maxAds,
        maxSessions: plan.maxSessions,
        maxGroups: plan.maxGroups,
        minInterval: plan.minInterval,
        maxInterval: plan.maxInterval,
        groupInterval: plan.groupInterval,
      },
    });

    await this.prisma.subscriptionHistory.create({
      data: {
        userId,
        planType: newPlan,
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date(),
        endDate,
        amount: plan.price,
        currency: plan.currency,
      },
    });

    this.logger.log(`Subscription upgraded for user ${userId}: ${current.planType} -> ${newPlan}`);
    return subscription;
  }

  async cancel(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      throw new NotFoundException('No subscription found');
    }

    const updated = await this.prisma.subscription.update({
      where: { userId },
      data: {
        status: SubscriptionStatus.CANCELLED,
        autoRenew: false,
      },
    });

    this.logger.log(`Subscription cancelled for user ${userId}`);
    return updated;
  }

  async renew(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      throw new NotFoundException('No subscription found');
    }

    const plan = PLAN_DETAILS[subscription.planType];
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.durationDays);

    const updated = await this.prisma.subscription.update({
      where: { userId },
      data: {
        status: SubscriptionStatus.ACTIVE,
        startDate,
        endDate,
      },
    });

    await this.prisma.subscriptionHistory.create({
      data: {
        userId,
        planType: subscription.planType,
        status: SubscriptionStatus.ACTIVE,
        startDate,
        endDate,
        amount: plan.price,
        currency: plan.currency,
      },
    });

    this.logger.log(`Subscription renewed for user ${userId}`);
    return updated;
  }

  async checkExpired() {
    const expired = await this.prisma.subscription.updateMany({
      where: {
        status: SubscriptionStatus.ACTIVE,
        endDate: { lte: new Date() },
      },
      data: { status: SubscriptionStatus.EXPIRED },
    });

    this.logger.log(`Expired ${expired.count} subscriptions`);
    return expired.count;
  }

  async getLimits(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription || subscription.status !== SubscriptionStatus.ACTIVE) {
      return PLAN_DETAILS.STARTER;
    }

    return {
      maxAds: subscription.maxAds,
      maxSessions: subscription.maxSessions,
      maxGroups: subscription.maxGroups,
      minInterval: subscription.minInterval,
      maxInterval: subscription.maxInterval,
      groupInterval: subscription.groupInterval,
    };
  }

  getPlanDetails(planType: SubscriptionPlan) {
    return PLAN_DETAILS[planType];
  }

  getAllPlans() {
    return Object.entries(PLAN_DETAILS).map(([key, value]) => ({
      type: key,
      ...value,
    }));
  }
}
