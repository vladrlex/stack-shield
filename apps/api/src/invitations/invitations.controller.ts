import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('invitations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  @Roles('ADMIN') 
  async create(@Body() dto: CreateInvitationDto, @Req() req: any) {
    const adminId = req.user.id || req.user.sub; 
    return this.invitationsService.createInvitation(dto, adminId);
  }
}