import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ReportsService } from './reports.service';

@ApiTags('relatorios')
@Controller('relatorios')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('top-clientes')
  @ApiOperation({ 
    summary: 'Lista os clientes que mais gastaram ordenados por valor total',
    description: 'Retorna uma lista paginada dos clientes com maiores gastos, com filtros opcionais de período e valor mínimo'
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Número de clientes a retornar (1-100)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número da página' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Data inicial (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Data final (YYYY-MM-DD)' })
  @ApiQuery({ name: 'minAmount', required: false, type: Number, description: 'Valor mínimo gasto' })
  @ApiResponse({ status: 200, description: 'Lista de top clientes retornada com sucesso' })
  @ApiResponse({ status: 400, description: 'Parâmetros inválidos' })
  async getTopClients(@Query() query: any) {
    return this.reportsService.getTopClients(query);
  }

  @Get('resumo-vendas')
  @ApiOperation({ 
    summary: 'Retorna um resumo das vendas',
    description: 'Retorna estatísticas gerais de vendas com filtros opcionais de período'
  })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Data inicial (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Data final (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Resumo de vendas retornado com sucesso' })
  @ApiResponse({ status: 400, description: 'Parâmetros inválidos' })
  async getSalesSummary(@Query() query: any) {
    const { startDate, endDate } = query;
    return this.reportsService.getSalesSummary(startDate, endDate);
  }
}
