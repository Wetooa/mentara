import { Body, Controller, Get, Param, Patch, Post, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/core/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/core/guards/role.guard';
import { Roles } from 'src/auth/core/decorators/roles.decorator';
import { PackagesService } from './packages.service';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { CreatePackageSchema, CreatePackageDto } from './types/packages.dto';

@ApiTags('packages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Post('therapist')
  @UseGuards(RoleGuard)
  @Roles('therapist')
  async createPackage(
    @Request() req,
    @Body(new ZodValidationPipe(CreatePackageSchema)) data: CreatePackageDto
  ) {
    return this.packagesService.createPackage(req.user.id, data);
  }

  @Get('therapist')
  @UseGuards(RoleGuard)
  @Roles('therapist')
  async getMyPackages(@Request() req) {
    return this.packagesService.getTherapistPackages(req.user.id);
  }

  @Get('admin/pending')
  @UseGuards(RoleGuard)
  @Roles('admin')
  async getPendingPackages() {
    return this.packagesService.getPendingPackages();
  }

  @Patch('admin/:id/approve')
  @UseGuards(RoleGuard)
  @Roles('admin')
  async approvePackage(@Param('id') id: string) {
    return this.packagesService.approvePackage(id);
  }

  @Patch('admin/:id/reject')
  @UseGuards(RoleGuard)
  @Roles('admin')
  async rejectPackage(@Param('id') id: string) {
    return this.packagesService.rejectPackage(id);
  }
}
